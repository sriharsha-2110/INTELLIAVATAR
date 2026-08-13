import uuid
import os
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.core.config import settings
from app.core.database import get_db
from app.models.registry import registry

router = APIRouter(prefix="/speech", tags=["Speech Engine"])

class SpeechSynthesisRequest(BaseModel):
    text: str
    language: str
    voice_key: Optional[str] = "default"
    emotion: Optional[str] = "NEUTRAL"

@router.post("/synthesize")
def synthesize_speech(request: SpeechSynthesisRequest):
    # Validate languages
    allowed_languages = ["en", "kn", "te", "hi", "ta", "ml"]
    if request.language not in allowed_languages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Language '{request.language}' is not supported. Supported: {allowed_languages}"
        )

    # 1. Fetch active TTS provider (configured in settings)
    tts_provider = settings.TTS_PROVIDER
    try:
        tts_engine = registry.get_tts(tts_provider)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )

    # 2. Setup output path
    audio_filename = f"speech_{uuid.uuid4()}.wav"
    audio_output_path = os.path.join(settings.UPLOAD_DIR, "generated", audio_filename)

    # 3. Synthesize
    try:
        res = tts_engine.synthesize(
            text=request.text,
            language=request.language,
            voice_key=request.voice_key,
            emotion=request.emotion,
            output_path=audio_output_path
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis engine failed: {str(e)}"
        )

    return {
        "success": True,
        "audio_url": f"/uploads/generated/{audio_filename}",
        "metadata": res
    }
