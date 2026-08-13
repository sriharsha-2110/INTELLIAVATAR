# IntelliAvatar: Conversational Digital-Human Platform

**IntelliAvatar** is a modular, multi-tenant digital-human conversational platform designed to animate static portrait photos into talking avatars based on multilingual speech and text inputs. It couples ASR transcription, intent/emotion extraction, RAG-grounded LLM response generation, styled speech synthesis, and face reanimation under a unified pipeline.

Tagline: **Create. Teach. Talk. Express. Deploy.**

---

## 1. System Features

* **Multi-Tenant Isolation**: Complete boundaries separating different tenant organizations.
* **Consent Auditing & Watermarking**: Safety-first photo uploads with explicit consent checkboxes and image processing filters.
* **Grounded RAG (Talk-to-PDF)**: Conversational capabilities grounded in custom PDF/TXT/DOCX/PPTX uploads to prevent hallucinations.
* **Official Multilingual Support**: Specifically validated for **English**, **Kannada**, **Telugu**, **Hindi**, **Tamil**, and **Malayalam**.
* **Emotion-Aware Synthesizer**: Extracting user emotions (10 core types) to dynamically alter the avatar expression and TTS speed.
* **AI Tutor Mode**: Adaptive viva examiners and quiz generators with beginner/intermediate/advanced presets.

---

## 2. Directory Structure

```
Final_year/
├── backend/
│   ├── app/
│   │   ├── api/          # Routers (auth, avatars, conversations, speech, RAG, tutor, analytics)
│   │   ├── core/         # Settings, database connection pools, security tokens
│   │   ├── models/       # Adapter Registry, adapters (LivePortrait, Wav2Lip, EdgeTTS, Whisper)
│   │   └── rag/          # Text parsers, overlapping chunkers, keyword retrievers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/              # React components (Studio, Dialogue, RAG Lab, AI Tutor, Analytics, Admin)
│   ├── Dockerfile
│   └── package.json
├── docs/                 # Methodology, survey, experiments, security, architecture guides
├── tests/                # Pytest integration tests
├── docker-compose.yml
└── README.md
```

---

## 3. Technology Stack

* **Backend**: FastAPI, SQLAlchemy, SQLite (Development) / PostgreSQL (Production)
* **Frontend**: React 18, Vite, TypeScript, TailwindCSS
* **Speech Recognition (ASR)**: OpenAI Whisper
* **Text-to-Speech (TTS)**: Microsoft Edge-TTS (multilingual support)
* **Portrait Animation**: LivePortrait (keypoint deformation)
* **Lip Synchronization**: Wav2Lip / MuseTalk

---

## 4. Academic Documentation

Refer to the `docs/` folder for comprehensive documentation:
* [Literature Survey](file:///c:/Users/sriha/Desktop/Final_year/docs/literature-survey.md): Review of foundational talking-head research.
* [Methodology Guide](file:///c:/Users/sriha/Desktop/Final_year/docs/methodology.md): End-to-end processing pipeline execution flow.
* [Architecture Blueprint](file:///c:/Users/sriha/Desktop/Final_year/docs/architecture.md): Database schemas and multi-tenant scoping logic.
* [Security & Compliance](file:///c:/Users/sriha/Desktop/Final_year/docs/security.md): Hashing, data validation, and input sanitization audits.
* [Experiments & Benchmarks](file:///c:/Users/sriha/Desktop/Final_year/docs/experiments.md): Inference speed (FPS), latency, and ablation analysis.
* [Deployment Guide](file:///c:/Users/sriha/Desktop/Final_year/docs/deployment.md): Steps to build and run with Docker.

---

## 5. Getting Started

### Local Setup
To run the backend locally:
```bash
pip install -r backend/requirements.txt
python scripts/init_db.py
uvicorn app.main:app --reload
```

To run the frontend locally:
```bash
cd frontend
npm install
npm run dev
```

### Docker Orchestration
To deploy the full multi-service application:
```bash
docker-compose up --build
```

---

## 6. Running Integration Tests

To run the validation test suite:
```bash
pytest tests
```
This tests all endpoints, including register/login, avatar lifecycle boundaries, speech synthesis (the 6 regional languages), RAG indexing/query, conversation pipelines (with Kannada code-switching inputs), and the tutoring evaluator.
