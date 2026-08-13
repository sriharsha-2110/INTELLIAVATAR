import httpx
from typing import Dict, Any, Generator
from app.models.registry import LLMProvider

class OllamaLLMProvider(LLMProvider):
    def __init__(self, model_name: str = "llama3"):
        self.base_url = "http://localhost:11434/api"
        self.model_name = model_name

    def generate_response(self, prompt: str, system_prompt: str, history: list) -> str:
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": prompt})

        try:
            r = httpx.post(
                f"{self.base_url}/chat",
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "stream": False
                },
                timeout=30.0
            )
            r.raise_for_status()
            return r.json()["message"]["content"]
        except Exception as e:
            raise RuntimeError(f"Ollama local LLM call failed: {str(e)}. Make sure Ollama service is running on port 11434.")

    def stream_response(self, prompt: str, system_prompt: str, history: list) -> Generator[str, None, None]:
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": prompt})

        try:
            with httpx.stream(
                "POST",
                f"{self.base_url}/chat",
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "stream": True
                },
                timeout=30.0
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        import json
                        chunk = json.loads(line)
                        content = chunk.get("message", {}).get("content", "")
                        if content:
                            yield content
        except Exception as e:
            raise RuntimeError(f"Ollama local LLM stream failed: {str(e)}")

    def summarize(self, text: str) -> str:
        return self.generate_response(
            prompt=f"Summarize the following text:\n\n{text}",
            system_prompt="You are a precise summarizer.",
            history=[]
        )

    def classify_intent(self, text: str) -> Dict[str, Any]:
        # Local keyword classification fallback
        lower_text = text.lower()
        intent = "general"
        if "viva" in lower_text:
            intent = "tutor_viva"
        elif "quiz" in lower_text or "questions" in lower_text:
            intent = "tutor_quiz"
        elif "explain" in lower_text or "teach" in lower_text:
            intent = "tutor_lecture"

        return {
            "intent": intent,
            "confidence": 0.95,
            "language": "en" if not ("ಮಾಡಿ" in text or "ಹೇಳಿ" in text) else "kn"
        }
