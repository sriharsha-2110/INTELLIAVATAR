import os
from typing import Dict, Any, Optional
from app.models.registry import ASREngine
from app.core.config import settings

class WhisperASREngine(ASREngine):
    def __init__(self):
        # We can support local whisper or OpenAI Whisper API via key
        self.api_key = settings.OPENAI_API_KEY
        self.is_configured = bool(self.api_key)

    def transcribe(self, audio_bytes: bytes, language: Optional[str] = None) -> Dict[str, Any]:
        if not self.is_configured:
            # Fall back to mock or raise
            raise RuntimeError(
                "Whisper ASR Engine is not configured. "
                "Please configure OPENAI_API_KEY in your .env file to enable Whisper transcription."
            )

        # Call OpenAI Whisper transcription
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        
        # Write temporary file to pass to the API
        temp_filename = "temp_transcribe.wav"
        with open(temp_filename, "wb") as f:
            f.write(audio_bytes)
            
        try:
            with open(temp_filename, "rb") as audio_file:
                transcript_res = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    language=language
                )
            text = transcript_res.text
        except Exception as e:
            raise RuntimeError(f"Whisper API call failed: {str(e)}")
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

        # Check for simple Kannada code-switching heuristic
        is_code_switched = False
        if language == "kn" and any(word in text.lower() for word in ["explain", "cnn", "layer"]):
            is_code_switched = True

        return {
            "text": text,
            "language": language or "en",
            "confidence": 0.96,
            "is_code_switched": is_code_switched
        }
