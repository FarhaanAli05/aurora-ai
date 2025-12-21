# Aurora AI - Image Enhancement Studio

Aurora AI is a modern, full-stack AI image editing studio featuring background removal, image enhancement, and experimental AI-generated backgrounds. The project is designed with production-quality architecture and a Canva/Pixlr-inspired user experience.

---

## Features

- **Image Enhancement**
  - AI-powered upscaling
  - 2x (Fast) and 4x (High Quality) modes

- **Background Removal**
  - One-click background removal
  - Produces transparent PNG outputs

- **Background Replacement**
  - Replace backgrounds using uploaded images
  - Enabled only when a transparent image is available

- **AI Background Generation (Experimental)**
  - Prompt-based background generation using FLUX models
  - Quality selector (Fast / High Quality)

---

## Architecture Overview

Aurora AI follows a clean, production-ready separation between frontend UI and backend inference.

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- Pixlr/Canva-inspired UI
- Progressive disclosure and tool dependency handling

### Backend
- **FastAPI** for REST endpoints
- **PyTorch** for ML inference
- **BiRefNet** for background removal
- **ESRGAN / DAT2** for AI upscaling (2x / 4x)
- **Hugging Face Diffusers** for FLUX-based background generation
- Automatic device detection (CPU / GPU / ZeroGPU)

---

## Deployment

- Designed for **Hugging Face Spaces**
- Compatible with:
  - CPU Spaces
  - ZeroGPU Spaces
- Graceful fallback when GPU is unavailable
- No model weights committed to the repository

---

## Development

### Backend
```bash
pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend-new/aurora-ai

npm install

npm run dev
```

### Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, PyTorch
- **ML Models**: BiRefNet, ESRGAN, DAT2, FLUX
- **Deployment**: Hugging Face Spaces