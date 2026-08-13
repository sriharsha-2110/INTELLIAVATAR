import io
from app.models.orm import KnowledgeBase

def test_rag_upload_and_query_flow(client, db):
    # 1. Register and login to get headers
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "researcher@lab.org",
            "password": "secure-passphrase",
            "organization_name": "RAG Research Group"
        }
    )
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "researcher@lab.org", "password": "secure-passphrase"}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Programmatically create a KnowledgeBase in DB
    # Fetch org membership details
    from app.models.orm import OrganizationMember
    member = db.query(OrganizationMember).first()
    kb = KnowledgeBase(
        name="Deep Learning Notes",
        description="CNN and neural networks textbooks notes.",
        organization_id=member.organization_id,
        embedding_model="mock-embedding"
    )
    db.add(kb)
    db.commit()
    kb_id = str(kb.id)

    # 3. Upload a text document to index
    text_content = (
        "A Convolutional Neural Network (CNN) is a deep learning architecture. "
        "It consists of convolutional layers, pooling layers, and fully connected layers. "
        "The pooling layers reduce the spatial resolution of the feature maps, "
        "which helps reduce computational complexity and parameters."
    )
    files = {
        "file": ("notes.txt", io.BytesIO(text_content.encode("utf-8")), "text/plain")
    }
    data = {
        "knowledge_base_id": kb_id
    }
    
    upload_res = client.post("/api/v1/rag/documents", data=data, files=files, headers=headers)
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["success"] is True
    assert upload_data["status"] == "READY"
    doc_id = upload_data["document_id"]

    # 4. List documents
    list_res = client.get(f"/api/v1/rag/documents?knowledge_base_id={kb_id}", headers=headers)
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) == 1
    assert docs[0]["name"] == "notes.txt"

    # 5. Query RAG vector database (uses mock keyword resolver)
    query_res = client.post(
        f"/api/v1/rag/query?knowledge_base_id={kb_id}&query=pooling layers",
        headers=headers
    )
    assert query_res.status_code == 200
    query_data = query_res.json()
    assert query_data["success"] is True
    assert len(query_data["results"]) > 0
    assert "pooling layers" in query_data["results"][0]["excerpt"].lower()

    # 6. Delete document
    delete_res = client.delete(f"/api/v1/rag/documents/{doc_id}", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json()["success"] is True
