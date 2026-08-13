# Deployment Guide - IntelliAvatar

This guide details running the IntelliAvatar platform locally, deploying via Docker Compose, and configuring GPU-driven talking-avatar weights.

---

## 1. Local Development Execution

### Backend Setup:
1. Ensure Python 3.10+ is installed.
2. Initialize virtual environment and install requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Initialize the database schema:
   ```bash
   python scripts/init_db.py
   ```
4. Run the FastAPI dev server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

### Frontend Setup:
1. Ensure Node.js 18+ is installed.
2. Navigate to `frontend` and install npm packages:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the lobby at `http://localhost:5173`.

---

## 2. Docker Compose Orchestration

To compile and launch the multi-service web stack:

1. Configure environment variables in `.env` (copy from `.env.example`).
2. Run the build and orchestration pipeline:
   ```bash
   docker-compose up --build
   ```
3. The gateway will run on `http://localhost:8000` (FastAPI Swagger at `/docs`) and the interface at `http://localhost:5173`.

---

## 3. Local Model Checkpoints Setup

To transition from the default `mock` engines to GPU-based CUDA execution:

1. Download model checkpoints:
   * **LivePortrait**: Download implicitly learned face keypoints checkpoints to `weights/liveportrait/`.
   * **Wav2Lip**: Place `wav2lip_gan.pth` in the `weights/` directory.
2. Configure `.env` settings to enable adapters:
   ```env
   AVATAR_ENGINE=liveportrait
   LIPSYNC_ENGINE=wav2lip
   DEVICE=cuda
   ```
3. Restart backend service. The engine registry will automatically bind the CUDA-optimized inference adapters.
