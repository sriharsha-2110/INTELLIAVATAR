# System Architecture & Design - IntelliAvatar

This document details the system design, components integration, and technological selections for the **IntelliAvatar** multilingual conversing digital-human platform.

---

## 1. High-Level Modular Design

IntelliAvatar is built using a clean separation between the frontend delivery, backend coordination, and machine learning adapters:

1. **Frontend Presentation Layer**:
   * built with React, Vite, TypeScript, and TailwindCSS.
   * Renders the interactive conversation lobby, upload centers, analytics dashboards, and tutoring modules.
2. **FastAPI Gateway**:
   * Serves as the central API gateway. Handles session state, user login/signup, document ingestion, and analytics logging.
   * Interfaces with the Model Registry to resolve and run active speech, animation, and dialogue adapters.
3. **Model Registry & Adapter Interface**:
   * Decouples the application code from machine learning weight paths or third-party cloud APIs.
   * Translates abstract pipeline calls to specific active adapters (`LivePortrait`, `Wav2Lip`, `EdgeTTS`, `Whisper`, `GPT-4o`).
4. **Relational Storage (PostgreSQL)**:
   * Persists tenant spaces (Organizations), User registry profiles, safety audits, message dialogue histories, and RAG document chunks.

---

## 2. Multi-Tenant Organization Isolation

To support enterprise customer-support cases, IntelliAvatar implements strict organization tenant boundaries:

* Database queries for user resources (Avatars, Conversations, Documents, Audit Logs) filter on `organization_id` derived from JWT claims.
* API key scopes are checked against the calling organization's permissions.
* Feedback and rating metrics are aggregate-scoped by organization.

---

## 3. Safe Document Ingestion Pipeline

To prevent prompt injection attacks or server code execution during document indexing (RAG):

1. **MIME type and magic-bytes check**: Restricts uploads strictly to PDF, TXT, DOCX, and PPTX formats.
2. **Local parsing validation**: Document text extraction occurs inside a safe python container parser.
3. **Structured formatting**: retrieved document context chunks are placed inside clearly demarcated delimiters in the LLM system prompt to prevent context leakage or instructions hijacking.
