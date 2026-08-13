import os
import time
import wave
import shutil
from typing import Dict, Any, Generator, Optional
from app.models.registry import AvatarEngine, LipSyncEngine, ASREngine, TTSEngine, LLMProvider, EmotionEngine
from app.core.config import settings

class MockAvatarEngine(AvatarEngine):
    def initialize(self, config: Dict[str, Any]) -> None:
        pass

    def validate_input(self, image_bytes: bytes) -> Dict[str, Any]:
        size_kb = len(image_bytes) / 1024
        if size_kb > settings.MAX_UPLOAD_SIZE_MB * 1024:
            return {"valid": False, "error": "Image file too large"}
        # Basic check for PNG/JPEG headers
        if not (image_bytes.startswith(b'\x89PNG\r\n\x1a\n') or image_bytes.startswith(b'\xff\xd8\xff')):
            return {"valid": False, "error": "Invalid image format. Only PNG or JPEG allowed."}
        return {
            "valid": True,
            "face_detected": True,
            "crop_coordinates": {"x": 50, "y": 50, "w": 200, "h": 200},
            "visual_quality": "High",
            "resolution": "512x512"
        }

    def generate_animation(self, driving_video_path: str, source_image_path: str, output_path: str) -> Dict[str, Any]:
        t0 = time.time()
        time.sleep(0.5)  # Simulate GPU processing
        # Create a dummy output video file
        with open(output_path, "wb") as f:
            f.write(b"MOCK_AVATAR_VIDEO_CONTENT")
        
        return {
            "success": True,
            "fps": 30.0,
            "latency_seconds": time.time() - t0,
            "visual_quality": "High",
            "frames_rendered": 90,
            "output_path": output_path
        }

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "model_name": "Mock LivePortrait Engine (CPU Fallback)",
            "version": "1.0",
            "device": "cpu",
            "supported_resolutions": ["512x512", "256x256"],
            "max_fps": 30.0
        }


class MockLipSyncEngine(LipSyncEngine):
    def initialize(self, config: Dict[str, Any]) -> None:
        pass

    def sync_audio_video(self, audio_path: str, video_path: str, output_path: str) -> Dict[str, Any]:
        t0 = time.time()
        time.sleep(0.4)  # Simulate GPU alignment
        # Copy video or write mock synced content
        with open(output_path, "wb") as f:
            f.write(b"MOCK_LIPSYNCED_VIDEO_CONTENT")
            
        return {
            "success": True,
            "lip_sync_score": 0.89,
            "latency_seconds": time.time() - t0,
            "fps": 30.0,
            "device_requirements": "cpu",
            "output_path": output_path
        }

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "model_name": "Mock Wav2Lip Engine",
            "resolution": "512x512",
            "max_fps": 30.0,
            "gpu_memory_mb": 0
        }


class MockASREngine(ASREngine):
    def transcribe(self, audio_bytes: bytes, language: Optional[str] = None) -> Dict[str, Any]:
        # Return mock text transcript based on selected language
        # Officially supported 6 languages
        lang_code = language or "en"
        transcripts = {
            "en": "Tell me about CNN models.",
            "kn": "CNN structure explain ಮಾಡಿ.",  # Code-switching example
            "te": "CNN మోడల్స్ గురించి చెప్పండి.",
            "hi": "CNN मॉडल के बारे में समझाएं।",
            "ta": "CNN மாதிரி பற்றி விளக்குங்கள்.",
            "ml": "CNN മോഡലുകളെക്കുറിച്ച് പറയുക."
        }
        
        return {
            "text": transcripts.get(lang_code, transcripts["en"]),
            "language": lang_code,
            "confidence": 0.98,
            "is_code_switched": lang_code == "kn"  # code-switching marked true for Kannada mock input
        }


class MockTTSEngine(TTSEngine):
    def synthesize(self, text: str, language: str, voice_key: str, emotion: str, output_path: str) -> Dict[str, Any]:
        t0 = time.time()
        # Programmatically write a tiny valid 1-second silent WAV file so audio player in front doesn't crash
        # WAV file header settings: mono, 8000Hz, 8-bit
        try:
            with wave.open(output_path, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(1)
                wav_file.setframerate(8000)
                # Write 8000 frames (1 second of silence)
                wav_file.writeframes(b'\x80' * 8000)
        except Exception:
            # Fallback to plain binary
            with open(output_path, "wb") as f:
                f.write(b"MOCK_AUDIO_DATA")
                
        return {
            "success": True,
            "output_path": output_path,
            "synthesis_latency": time.time() - t0,
            "audio_duration_seconds": 1.0,
            "character_count": len(text)
        }


class MockLLMProvider(LLMProvider):
    def generate_response(self, prompt: str, system_prompt: str, history: list) -> str:
        # Check tutor queries or code-switching queries
        if "CNN" in prompt or "explain" in prompt.lower():
            if "explain" in prompt.lower() and ("ಮಾಡ" in prompt or "ಕನ್ನಡ" in prompt or "explain ಮಾಡಿ" in prompt):
                return "CNN ಎಂದರೆ Convolutional Neural Network. ಇದು ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ವಿಷನ್‌ನಲ್ಲಿ ಬಳಸಲಾಗುವ ಒಂದು ಪ್ರಮುಖ ಡೀಪ್ ಲರ್ನಿಂಗ್ ತಂತ್ರಜ್ಞಾನವಾಗಿದೆ. ಇದರಲ್ಲಿ ಪ್ರಮುಖವಾಗಿ ೩ ಲೇಯರ್‌ಗಳಿವೆ: Convolutional, Pooling, ಮತ್ತು Fully Connected layers."
            return "A Convolutional Neural Network (CNN) is a type of deep learning model designed for processing structured grid data like images. It consists of convolutional layers, pooling layers, and fully connected dense layers."
        if "viva" in prompt.lower() or "exam" in prompt.lower():
            return "Welcome to the Deep Learning viva examination. Here is your first question: Explain the vanishing gradient problem and how ResNet residual connections solve it."
        if "quiz" in prompt.lower() or "question" in prompt.lower():
            return "Quiz Mode Active: Question 1: What does CNN stand for? A) Computer Network Node B) Convolutional Neural Network C) Central Neural Node."
        return "This is a modular mock LLM response. I am fully grounded in your custom configurations."

    def stream_response(self, prompt: str, system_prompt: str, history: list) -> Generator[str, None, None]:
        text = self.generate_response(prompt, system_prompt, history)
        # Yield word by word
        for word in text.split(" "):
            yield word + " "
            time.sleep(0.02)

    def summarize(self, text: str) -> str:
        return text[:100] + "..." if len(text) > 100 else text

    def classify_intent(self, text: str) -> Dict[str, Any]:
        intent = "general"
        if "viva" in text.lower():
            intent = "tutor_viva"
        elif "quiz" in text.lower() or "questions" in text.lower():
            intent = "tutor_quiz"
        elif "explain" in text.lower() or "teach" in text.lower():
            intent = "tutor_lecture"
        
        return {
            "intent": intent,
            "confidence": 0.95,
            "language": "en" if not ("ಮಾಡಿ" in text or "ಹೇಳಿ" in text) else "kn"
        }


class MockEmotionEngine(EmotionEngine):
    def analyze_text(self, text: str) -> Dict[str, Any]:
        # Simple heuristics
        lower_text = text.lower()
        emotion = "NEUTRAL"
        intensity = 0.5
        
        if any(w in lower_text for w in ["happy", "great", "awesome", "good", "nice"]):
            emotion = "HAPPY"
            intensity = 0.8
        elif any(w in lower_text for w in ["sad", "bad", "sorry", "difficult", "fail"]):
            emotion = "SAD"
            intensity = 0.7
        elif any(w in lower_text for w in ["angry", "hate", "worst", "annoyed"]):
            emotion = "ANGRY"
            intensity = 0.9
        elif any(w in lower_text for w in ["confused", "what", "how", "why", "structure"]):
            emotion = "CONFUSED"
            intensity = 0.6
        elif any(w in lower_text for w in ["exam", "viva", "test", "explain"]):
            emotion = "ENCOURAGING"
            intensity = 0.75
            
        return {
            "emotion": emotion,
            "intensity": intensity,
            "confidence": 0.95,
            "source": "text"
        }

    def analyze_audio(self, audio_bytes: bytes) -> Dict[str, Any]:
        return {
            "emotion": "NEUTRAL",
            "intensity": 0.5,
            "confidence": 0.8,
            "source": "audio"
        }
