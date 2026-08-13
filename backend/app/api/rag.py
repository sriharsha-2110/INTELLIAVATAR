import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_user_org_member
from app.models.orm import Document, KnowledgeBase, OrganizationMember
from app.rag.pipeline import process_and_index_document, query_knowledge_base

router = APIRouter(prefix="/rag", tags=["Knowledge Grounds (RAG)"])

@router.post("/documents")
async def upload_document(
    knowledge_base_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    # 1. Enforce organization boundary (tenant isolation)
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == knowledge_base_id,
        KnowledgeBase.organization_id == org_member.organization_id
    ).first()
    
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found or unauthorized in this organization workspace."
        )

    # 2. Validate MIME type
    allowed_types = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format. Allowed formats: PDF, TXT, DOCX, PPTX."
        )

    doc_id = uuid.uuid4()
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    safe_filename = f"{doc_id}.{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, "documents", safe_filename)

    # Write file securely on disk
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write uploaded file to storage disk: {str(e)}"
        )

    file_size = os.path.getsize(file_path)

    # 3. Create Document DB entry
    doc = Document(
        id=doc_id,
        knowledge_base_id=kb.id,
        name=file.filename,
        file_path=file_path,
        file_size=file_size,
        status="PROCESSING"
    )
    db.add(doc)
    db.commit()

    # 4. Process and index the document text (simulated synchronously for sandboxed tests, async worker in production)
    indexing_res = process_and_index_document(db, str(doc_id))
    
    if not indexing_res["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Indexing failed: {indexing_res.get('error')}"
        )

    return {
        "success": True,
        "document_id": str(doc_id),
        "status": "READY",
        "message": "Document uploaded and indexed successfully into vector memory."
    }

@router.get("/documents")
def list_documents(
    knowledge_base_id: uuid.UUID,
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    # Verify Knowledge Base org scope
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == knowledge_base_id,
        KnowledgeBase.organization_id == org_member.organization_id
    ).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    docs = db.query(Document).filter(Document.knowledge_base_id == kb.id).all()
    return [
        {
            "id": str(d.id),
            "name": d.name,
            "file_size": d.file_size,
            "status": d.status,
            "error_message": d.error_message,
            "created_at": d.created_at.isoformat()
        } for d in docs
    ]

@router.delete("/documents/{document_id}")
def delete_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    # Check if doc belongs to organization via KnowledgeBase
    doc = db.query(Document).join(KnowledgeBase).filter(
        Document.id == document_id,
        KnowledgeBase.organization_id == org_member.organization_id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Clean up file from disk
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"success": True, "message": "Document deleted successfully"}

# Endpoint to query vector chunks
@router.post("/query")
def query_knowledge(
    knowledge_base_id: uuid.UUID,
    query: str,
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == knowledge_base_id,
        KnowledgeBase.organization_id == org_member.organization_id
    ).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    results = query_knowledge_base(db, str(kb.id), query)
    return {"success": True, "results": results}
