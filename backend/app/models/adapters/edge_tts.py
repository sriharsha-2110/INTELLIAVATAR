import asyncio
import os
from typing import Dict, Any, Optional
import edge_tts
from app.models.registry import TTSEngine

class EdgeTTSEngine(TTSEngine):
    def initialize(self, config: Dict[str, Any]) -> None:
        pass

    def synthesize(self, text: str, language: str, voice_key: str, emotion: str, output_path: str) -> Dict[str, Any]:
        # Supported voices for the 6 languages
        voice_map = {
            "en": "en-US-JennyNeural",
            "kn": "kn-IN-SapnaNeural",
            "te": "te-IN-ShrutiNeural",
            "hi": "hi-IN-SwaraNeural",
            "ta": "ta-IN-PallaviNeural",
            "ml": "ml-IN-SobhanaNeural"
        }
        
        # Choose voice
        voice = voice_key if "-" in voice_key else voice_map.get(language, "en-US-JennyNeural")
        
        # Emotional rate adjustments
        rate = "+0%"
        if emotion == "SAD":
            rate = "-15%"
        elif emotion == "EXCITED" or emotion == "HAPPY":
            rate = "+10%"
            
        async def _synthesize():
            communicate = edge_tts.Communicate(text, voice, rate=rate)
            await communicate.save(output_path)
            
        # Run async in synchronous context
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        if loop.is_running():
            # If loop is already running (e.g. in FastAPI server), run via thread runner
            from concurrent.futures import ThreadPoolExecutor
            with ThreadPoolExecutor() as executor:
                executor.submit(lambda: asyncio.run(_synthesize())).result()
        else:
            asyncio.run(_synthesize())

        return {
            "success": True,
            "output_path": output_path,
            "voice": voice,
            "rate": rate,
            "audio_duration_seconds": 2.5  # placeholder or read from file metadata
        }
