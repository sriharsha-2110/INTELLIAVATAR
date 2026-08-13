import sys
import os

# Append backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.core.database import engine, Base
# Import ORM models to ensure they register on metadata
from app.models.orm import User, Organization, OrganizationMember, Avatar, KnowledgeBase, Document, DocumentChunk, Conversation, Message, Memory

def init_database():
    print("Connecting to database and creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_database()
