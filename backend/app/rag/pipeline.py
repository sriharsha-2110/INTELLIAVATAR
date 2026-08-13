import os
import pypdf
from docx import Document as DocxDocument
from pptx import Presentation
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.orm import Document, DocumentChunk

def extract_text_from_file(file_path: str, mime_type: str) -> str:
    """Safe text extraction from PDF, DOCX, PPTX, or TXT formats."""
    text = ""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    if mime_type == "application/pdf":
        try:
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            raise RuntimeError(f"Error parsing PDF file: {str(e)}")

    elif mime_type == "text/plain":
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            raise RuntimeError(f"Error reading TXT file: {str(e)}")

    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            doc = DocxDocument(file_path)
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
        except Exception as e:
            raise RuntimeError(f"Error parsing Word DOCX: {str(e)}")

    elif mime_type == "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        try:
            prs = Presentation(file_path)
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text:
                        text += shape.text + "\n"
        except Exception as e:
            raise RuntimeError(f"Error parsing PowerPoint PPTX: {str(e)}")

    else:
        raise ValueError(f"MIME type '{mime_type}' is not supported for text extraction.")

    return text.strip()


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping character-level chunks."""
    if not text:
        return []
    
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end]
        chunks.append(chunk)
        
        # Advance by size - overlap
        if end == text_len:
            break
        start += (chunk_size - overlap)
        
    return chunks


def process_and_index_document(db: Session, doc_id: Any) -> Dict[str, Any]:
    """Chunk and index document details to database."""
    import uuid
    if isinstance(doc_id, str):
        doc_id = uuid.UUID(doc_id)
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return {"success": False, "error": "Document not found"}

    try:
        # 1. Update status to PROCESSING
        doc.status = "PROCESSING"
        db.commit()

        # 2. Extract text
        mime_type = "application/pdf"
        if doc.name.endswith(".txt"):
            mime_type = "text/plain"
        elif doc.name.endswith(".docx"):
            mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        elif doc.name.endswith(".pptx"):
            mime_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

        text = extract_text_from_file(doc.file_path, mime_type)
        if not text:
            raise ValueError("Document extracted text is empty.")

        # 3. Update status to INDEXING
        doc.status = "INDEXING"
        db.commit()

        # 4. Chunk text
        chunks = chunk_text(text)
        
        # 5. Insert chunks (mock embeddings or PGvector if available)
        # Note: Since SQLite has no Vector type, we'll store chunk indices & metadata, 
        # and support fallback RAG keyword search during test environments.
        for idx, chunk_content in enumerate(chunks):
            db_chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=idx,
                content=chunk_content,
                metadata_json={"doc_name": doc.name, "char_count": len(chunk_content)}
            )
            db.add(db_chunk)
            
        doc.status = "READY"
        db.commit()
        return {"success": True, "chunks_count": len(chunks)}

    except Exception as e:
        db.rollback()
        doc.status = "FAILED"
        doc.error_message = str(e)
        db.commit()
        return {"success": False, "error": str(e)}


def query_knowledge_base(db: Session, kb_id: Any, query: str, limit: int = 3) -> List[Dict[str, Any]]:
    """Retrieve relevant chunks from a knowledge base.
    Uses keyword matching as database-agnostic fallback (supporting SQLite and PG)."""
    import uuid
    if isinstance(kb_id, str):
        kb_id = uuid.UUID(kb_id)
    # Get all documents in knowledge base
    docs = db.query(Document).filter(Document.knowledge_base_id == kb_id, Document.status == "READY").all()
    if not docs:
        return []

    doc_ids = [d.id for d in docs]
    all_chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id.in_(doc_ids)).all()
    
    # Perform simple case-insensitive keyword similarity mapping
    scored_chunks = []
    query_words = set(query.lower().split())
    
    for chunk in all_chunks:
        chunk_content_lower = chunk.content.lower()
        score = sum(1 for word in query_words if word in chunk_content_lower)
        if score > 0:
            scored_chunks.append((score, chunk))
            
    # Sort by score descending
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    results = []
    
    for score, chunk in scored_chunks[:limit]:
        results.append({
            "document_name": chunk.metadata_json.get("doc_name", "Unknown Document"),
            "page": chunk.chunk_index + 1,  # page index representation
            "excerpt": chunk.content[:300] + "..." if len(chunk.content) > 300 else chunk.content
        })
        
    return results
