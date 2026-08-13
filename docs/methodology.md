# Methodology - IntelliAvatar Pipeline Design

This document details the engineering and architectural methodology behind the end-to-end digital-human conversation pipeline.

---

## 1. Pipeline Execution Flow

The system operates as a single coordinated async execution loop:

```
[ User Audio Input ]
       │
       ▼
[ Speech-to-Text (ASR) ] ──► [ Language / Code-switching Detection ]
       │
       ▼
[ Context Assembler ] ◄──► [ RAG Knowledge Base / Vector Query ]
       │              ◄──► [ Long-term Memory retrieval ]
       ▼
[ Emotion Classifier ] (Analyzes input text sentiment)
       │
       ▼
[ LLM Dialogue Engine ] (Generates contextual, emotion-mapped response)
       │
       ▼
[ Text-to-Speech (TTS) ] (Synthesizes speech audio styled by emotion intensity)
       │
       ▼
[ Face Animator (LivePortrait) ] ──► [ Lip Synchronization (Wav2Lip) ]
                                            │
                                            ▼
                               [ Sync Audio-Video Stream Output ]
```

---

## 2. Component Decoupling & Interfaces

To achieve structural modularity, each layer exposes strict contracts defined in Python abstract base classes:

1. **ASREngine**: Handles audio file decoding and transcribes words using local Whisper or cloud engines, returning language confidence and code-switching tags.
2. **LLMProvider**: Interfaces with local Ollama or OpenAI models to generate standard text responses.
3. **TTSEngine**: Interfaces with gTTS or Microsoft Edge-TTS to synthesize speech audio files, modulating pitch, style, and speaking rate based on user sentiments.
4. **AvatarEngine**: Receives facial image files, validates quality, extracts implicitly mapped facial keypoints, and renders reanimated frames.
5. **LipSyncEngine**: Takes the synthesized speech audio track and facial animated frames to compute mouth-alignment coordinates and render the final talking MP4 files.
