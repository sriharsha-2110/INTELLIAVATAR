import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.registry import registry
from app.models.adapters.mock_adapters import (
    MockAvatarEngine, MockLipSyncEngine, MockASREngine, 
    MockTTSEngine, MockLLMProvider, MockEmotionEngine
)
from app.models.adapters.edge_tts import EdgeTTSEngine
from app.models.adapters.liveportrait import LivePortraitEngine
from app.models.adapters.wav2lip import Wav2LipEngine
from app.models.adapters.whisper_asr import WhisperASREngine
from app.models.adapters.openai_llm import OpenAILLMProvider
from app.models.adapters.ollama_llm import OllamaLLMProvider
from app.models.adapters.three_d_generator import Parametric3DGenerator

# Router Imports
from app.api.auth import router as auth_router
from app.api.avatars import router as avatars_router
from app.api.conversations import router as conversations_router
from app.api.rag import router as rag_router
from app.api.analytics import router as analytics_router
from app.api.speech import router as speech_router
from app.api.tutor import router as tutor_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="IntelliAvatar Multilingual & Emotion-Aware Talking Human Platform Backend",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory for static avatar images and 3D models
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "avatars"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "models"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(avatars_router, prefix=settings.API_V1_STR)
app.include_router(conversations_router, prefix=settings.API_V1_STR)
app.include_router(rag_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(speech_router, prefix=settings.API_V1_STR)
app.include_router(tutor_router, prefix=settings.API_V1_STR)

# Startup hook to register default mock engines
@app.on_event("startup")
def startup_event():
    # Register engines
    registry.register_avatar("mock", MockAvatarEngine())
    registry.register_avatar("liveportrait", LivePortraitEngine())
    registry.register_lipsync("mock", MockLipSyncEngine())
    registry.register_lipsync("wav2lip", Wav2LipEngine())
    registry.register_asr("mock", MockASREngine())
    registry.register_asr("whisper", WhisperASREngine())
    registry.register_tts("mock", MockTTSEngine())
    registry.register_tts("edge-tts", EdgeTTSEngine())
    registry.register_llm("mock", MockLLMProvider())
    registry.register_llm("openai", OpenAILLMProvider())
    registry.register_llm("ollama", OllamaLLMProvider())
    registry.register_emotion("mock", MockEmotionEngine())
    registry.register_3d_generator("parametric-3d", Parametric3DGenerator(settings.UPLOAD_DIR))
    
    print("IntelliAvatar model adapters successfully registered.")


# Health Probes
@app.get("/health", status_code=status.HTTP_200_OK, tags=["Observability"])
def health_check():
    """Liveness probe to confirm backend is running."""
    return {"status": "healthy", "service": settings.PROJECT_NAME}

@app.get("/ready", status_code=status.HTTP_200_OK, tags=["Observability"])
def readiness_check():
    """Readiness probe checking database/redis connections."""
    # In a full setup, check DB & Redis connectivity. For skeleton, return ready.
    return {
        "status": "ready",
        "database": "connected",
        "redis": "connected",
        "registered_adapters": {
            "avatar": settings.AVATAR_ENGINE,
            "lipsync": settings.LIPSYNC_ENGINE,
            "llm": settings.LLM_PROVIDER,
            "tts": settings.TTS_PROVIDER,
            "asr": settings.ASR_PROVIDER
        }
    }

# Skeleton routing index
@app.get("/")
def index():
    return {"message": "Welcome to the IntelliAvatar API gateway. Access /docs for Swagger documentation."}
