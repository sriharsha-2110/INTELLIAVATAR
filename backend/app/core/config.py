import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "IntelliAvatar API"
    API_V1_STR: str = "/api/v1"
    
    # DB & Redis URL
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@localhost:5432/intelliavatar")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # Secrets
    JWT_SECRET: str = Field(default="super-secret-jwt-signing-key-change-in-production")
    JWT_EXPIRATION_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRATION_DAYS: int = 7
    
    # Model Configuration Selection
    AVATAR_ENGINE: str = "mock"
    LIPSYNC_ENGINE: str = "mock"
    LLM_PROVIDER: str = "mock"
    TTS_PROVIDER: str = "mock"
    ASR_PROVIDER: str = "mock"
    DEVICE: str = "cpu"
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 20
    MAX_TOKENS_PER_REQ: int = 2048
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    
    # Storage settings
    STORAGE_ENDPOINT: str = "http://localhost:9000"
    STORAGE_BUCKET: str = "intelliavatar"
    STORAGE_ACCESS_KEY: str = "minio_user"
    STORAGE_SECRET_KEY: str = "minio_password"

    # API Keys
    OPENAI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""

    # Feature Flags
    ENABLE_RAG: bool = True
    ENABLE_MEMORY: bool = True
    ENABLE_VISION: bool = False
    ENABLE_AVATAR_TO_AVATAR: bool = False
    ENABLE_SIGN_LANGUAGE: bool = False
    ENABLE_ENTERPRISE: bool = True
    ENABLE_ANALYTICS: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

# Create upload directories if they don't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "avatars"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "generated"), exist_ok=True)
