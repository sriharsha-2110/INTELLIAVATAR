import os
from typing import Dict, Any, Generator
from app.models.registry import LLMProvider
from app.core.config import settings

class OpenAILLMProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.is_configured = bool(self.api_key)

    def generate_response(self, prompt: str, system_prompt: str, history: list) -> str:
        if not self.is_configured:
            raise RuntimeError(
                "OpenAI LLM Provider is not configured. "
                "Please set OPENAI_API_KEY in your .env file to enable OpenAI responses."
            )

        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        
        # Compile messages
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": prompt})
        
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"OpenAI GPT call failed: {str(e)}")

    def stream_response(self, prompt: str, system_prompt: str, history: list) -> Generator[str, None, None]:
        if not self.is_configured:
            raise RuntimeError("OpenAI LLM Provider is not configured.")

        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": prompt})

        try:
            stream = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise RuntimeError(f"OpenAI GPT stream call failed: {str(e)}")

    def summarize(self, text: str) -> str:
        # Quick fallback or API call
        if not self.is_configured:
            return text[:200]
        return self.generate_response(
            prompt=f"Summarize the following text:\n\n{text}",
            system_prompt="You are a precise summarizer.",
            history=[]
        )

    def classify_intent(self, text: str) -> Dict[str, Any]:
        # Simple local keyword classification as primary, API as fallback
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
