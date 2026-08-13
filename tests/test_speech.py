import os
import pytest
from app.core.config import settings

def test_multilingual_speech_synthesis(client):
    # Test for exactly the six officially supported languages
    supported_languages = ["en", "kn", "te", "hi", "ta", "ml"]
    
    # We will test using both 'mock' (default) and 'edge-tts' engines
    # temporarily override settings to use edge-tts for integration testing
    settings.TTS_PROVIDER = "edge-tts"

    for lang in supported_languages:
        response = client.post(
            "/api/v1/speech/synthesize",
            json={
                "text": f"This is a testing sentence for language {lang}.",
                "language": lang,
                "emotion": "NEUTRAL"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "audio_url" in data
        
        # Verify the file is generated on disk
        audio_url = data["audio_url"]
        filename = audio_url.split("/")[-1]
        file_path = os.path.join(settings.UPLOAD_DIR, "generated", filename)
        assert os.path.exists(file_path)
        assert os.path.getsize(file_path) > 0

    # Test an unsupported language (e.g. French 'fr'), which must fail
    unsupported_response = client.post(
        "/api/v1/speech/synthesize",
        json={
            "text": "Bonjour, ceci est un test.",
            "language": "fr",
            "emotion": "NEUTRAL"
        }
    )
    assert unsupported_response.status_code == 400
    assert "not supported" in unsupported_response.json()["detail"].lower()

    # Reset TTS settings provider
    settings.TTS_PROVIDER = "mock"
room = ""
