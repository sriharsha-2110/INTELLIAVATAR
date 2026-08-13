import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
from app.core.database import Base, get_db
from app.models.registry import registry
from app.models.adapters.mock_adapters import (
    MockAvatarEngine, MockLipSyncEngine, MockASREngine,
    MockTTSEngine, MockLLMProvider, MockEmotionEngine
)
from app.models.adapters.edge_tts import EdgeTTSEngine
# Import ORM models to ensure SQLAlchemy registers table metadata
from app.models.orm import (
    User, Organization, OrganizationMember, Avatar,
    KnowledgeBase, Document, DocumentChunk, Conversation,
    Message, Memory, Feedback, APIKey, AuditLog
)

# SQLite File-based Database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_models():
    # Make sure mock adapters and real adapters are registered
    registry.register_avatar("mock", MockAvatarEngine())
    registry.register_lipsync("mock", MockLipSyncEngine())
    registry.register_asr("mock", MockASREngine())
    registry.register_tts("mock", MockTTSEngine())
    registry.register_tts("edge-tts", EdgeTTSEngine())
    registry.register_llm("mock", MockLLMProvider())
    registry.register_emotion("mock", MockEmotionEngine())

@pytest.fixture(scope="function")
def db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("./test_temp.db"):
            try:
                os.remove("./test_temp.db")
            except Exception:
                pass

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
