# Literature Survey - IntelliAvatar Research Foundation

This document surveys the foundational academic research and machine learning models integrated within the IntelliAvatar conversational digital-human platform.

---

## 1. Single-Image Portrait Animation

Reanimating a static portrait from a single image is a major computer vision research area.

* **SadTalker (CVPR 2023)**:
  * *Methodology*: Generates 3D motion coefficients (head pose, expression) from audio, then uses a 3D-aware neural renderer for talking head animation.
  * *Significance*: Solves natural head movement generation and expression synchronization, but has high computational latency.
* **LivePortrait (2024)**:
  * *Methodology*: Extends keypoint-based models (FOMM) to optimize animation speed and expression control using implicit keypoints.
  * *Significance*: Achieves real-time execution speeds (~10-15ms per frame on local GPU) with high visual fidelity.

---

## 2. Lip Synchronization

A aligning mouth movements to arbitrary speech audio.

* **Wav2Lip (ACM MM 2020)**:
  * *Methodology*: Uses a generator with an expert lip-sync discriminator trained on in-the-wild video databases.
  * *Significance*: Standard benchmark for mouth-alignment accuracy across arbitrary voices and languages, but suffers from low-resolution blurring.
* **MuseTalk (2024)**:
  * *Methodology*: Real-time latent-domain talking head generator.
  * *Significance*: Supports high-resolution outputs (up to 512x512) and low latency by operating within the latent space of a diffusion model.

---

## 3. Multilingual Speech Synthesis and Recognition

* **Whisper (OpenAI 2023)**:
  * *Methodology*: Encoder-decoder Transformer trained on 680,000 hours of multilingual, multitask supervised web data.
  * *Significance*: Robust transcription performance under background noise and automatic language identification.
* **SeamlessM4T (Meta 2023)**:
  * *Methodology*: Massively multilingual model supporting speech-to-speech, text-to-speech, and translation.
  * *Significance*: Supports complex code-switching inputs natively.
* **IndicVoices (2023)**:
  * *Methodology*: Large-scale dataset and model architecture targeted at Indian languages (Kannada, Telugu, Hindi, Tamil, Malayalam) capturing regional accents and code-switching patterns.

---

## 4. Conversational Intelligence & Memory

* **Retrieval-Augmented Generation (RAG)**:
  * *Methodology*: Grounding language models in custom vector databases to prevent hallucinations and provide citations.
* **Long-Term Memory Architectures**:
  * *Methodology*: Extracting episodic facts and preferences using LLM triggers and storing them in external key-value database schemas, maintaining context across multi-session dialogues.
