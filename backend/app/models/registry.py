from abc import ABC, abstractmethod
from typing import Dict, Any, Generator, Optional

# ==========================================
# 1. Avatar Engine Interface
# ==========================================
class AvatarEngine(ABC):
    @abstractmethod
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize weights, devices, paths, etc."""
        pass

    @abstractmethod
    def validate_input(self, image_bytes: bytes) -> Dict[str, Any]:
        """Validate input portrait size, cropping, safety consent limits."""
        pass

    @abstractmethod
    def generate_animation(self, driving_video_path: str, source_image_path: str, output_path: str) -> Dict[str, Any]:
        """Generate animated portrait video based on driving video."""
        pass

    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Return engine model name, version, status, resolution, and GPU memory usage."""
        pass


# ==========================================
# 2. Lip Sync Engine Interface
# ==========================================
class LipSyncEngine(ABC):
    @abstractmethod
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize weights, resolution, and GPU specs."""
        pass

    @abstractmethod
    def sync_audio_video(self, audio_path: str, video_path: str, output_path: str) -> Dict[str, Any]:
        """Align avatar lip movement dynamically with audio. Returns metrics."""
        pass

    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Return capabilities like resolution, FPS latency, and GPU status."""
        pass


# ==========================================
# 3. Speech Engines (ASR & TTS)
# ==========================================
class ASREngine(ABC):
    @abstractmethod
    def transcribe(self, audio_bytes: bytes, language: Optional[str] = None) -> Dict[str, Any]:
        """Transcribe user audio input. Return text, confidence, detected language, is_code_switched."""
        pass


class TTSEngine(ABC):
    @abstractmethod
    def synthesize(self, text: str, language: str, voice_key: str, emotion: str, output_path: str) -> Dict[str, Any]:
        """Synthesize response text to audio path modulated by language, voice, and emotion style."""
        pass


# ==========================================
# 4. LLM Provider Interface
# ==========================================
class LLMProvider(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, system_prompt: str, history: list) -> str:
        """Generate complete LLM text response."""
        pass

    @abstractmethod
    def stream_response(self, prompt: str, system_prompt: str, history: list) -> Generator[str, None, None]:
        """Stream chunks of response."""
        pass

    @abstractmethod
    def summarize(self, text: str) -> str:
        """Summarize text content."""
        pass

    @abstractmethod
    def classify_intent(self, text: str) -> Dict[str, Any]:
        """Classify user intent (general, RAG-only, quiz request) and extract variables."""
        pass


# ==========================================
# 5. Emotion Engine Interface
# ==========================================
class EmotionEngine(ABC):
    @abstractmethod
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """Extract emotion from text. Return emotion label, intensity, confidence."""
        pass

    @abstractmethod
    def analyze_audio(self, audio_bytes: bytes) -> Dict[str, Any]:
        """Extract acoustic-level emotion from audio tone."""
        pass


# ==========================================
# 6. Model Registry (Service Locator)
# ==========================================
class ModelRegistry:
    def __init__(self):
        self._avatars: Dict[str, AvatarEngine] = {}
        self._lipsyncs: Dict[str, LipSyncEngine] = {}
        self._asrs: Dict[str, ASREngine] = {}
        self._ttss: Dict[str, TTSEngine] = {}
        self._llms: Dict[str, LLMProvider] = {}
        self._emotions: Dict[str, EmotionEngine] = {}
        self._three_d_generators: Dict[str, Any] = {}

    def register_3d_generator(self, name: str, engine: Any) -> None:
        self._three_d_generators[name] = engine

    def get_3d_generator(self, name: str) -> Any:
        return self._three_d_generators.get(name)

    def register_avatar(self, name: str, engine: AvatarEngine) -> None:
        self._avatars[name] = engine

    def get_avatar(self, name: str) -> AvatarEngine:
        if name not in self._avatars:
            raise ValueError(f"Avatar Engine '{name}' is not configured.")
        return self._avatars[name]

    def register_lipsync(self, name: str, engine: LipSyncEngine) -> None:
        self._lipsyncs[name] = engine

    def get_lipsync(self, name: str) -> LipSyncEngine:
        if name not in self._lipsyncs:
            raise ValueError(f"Lip-Sync Engine '{name}' is not configured.")
        return self._lipsyncs[name]

    def register_asr(self, name: str, engine: ASREngine) -> None:
        self._asrs[name] = engine

    def get_asr(self, name: str) -> ASREngine:
        if name not in self._asrs:
            raise ValueError(f"ASR Engine '{name}' is not configured.")
        return self._asrs[name]

    def register_tts(self, name: str, engine: TTSEngine) -> None:
        self._ttss[name] = engine

    def get_tts(self, name: str) -> TTSEngine:
        if name not in self._ttss:
            raise ValueError(f"TTS Engine '{name}' is not configured.")
        return self._ttss[name]

    def register_llm(self, name: str, provider: LLMProvider) -> None:
        self._llms[name] = provider

    def get_llm(self, name: str) -> LLMProvider:
        if name not in self._llms:
            raise ValueError(f"LLM Provider '{name}' is not configured.")
        return self._llms[name]

    def register_emotion(self, name: str, engine: EmotionEngine) -> None:
        self._emotions[name] = engine

    def get_emotion(self, name: str) -> EmotionEngine:
        if name not in self._emotions:
            raise ValueError(f"Emotion Engine '{name}' is not configured.")
        return self._emotions[name]

# Global registry instance
registry = ModelRegistry()
