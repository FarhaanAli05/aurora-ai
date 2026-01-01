# Aurora AI

Aurora AI is a modern, web-based AI image editing studio for background removal, image enhancement, and background replacement. The project is built with a clean separation between a Next.js frontend and a FastAPI-based ML inference backend.

## Overview

Aurora AI provides an intuitive, Canva-inspired interface for applying AI-powered image edits directly in the browser. All machine learning inference is handled by a dedicated backend, allowing the frontend to remain fast, responsive, and UI-focused.

The project is structured for clarity, extensibility, and production-style development, with frontend and backend concerns clearly separated.

## Features

- **Image Enhancement**
  - AI-powered upscaling
  - 2x (Fast) and 4x (High Quality) modes
- **Background Removal**
  - One-click background removal
  - Transparent PNG outputs
  - Enables downstream background replacement
- **Background Replacement**
  - Replace backgrounds using uploaded images
  - Automatically gated until a transparent image is available
- **AI Background Generation (Experimental)**
  - Prompt-based background generation
  - Integrated into the background replacement workflow

## Architecture

Aurora AI follows a clean, production-oriented frontend/backend split.

**Frontend**
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- Responsive, tool-driven UI with progressive disclosure

**Backend**
- **FastAPI** for REST APIs
- **PyTorch** for ML inference
- Modular inference pipeline for image processing tasks

**Models & Inference**
- **BiRefNet** for background removal
- **ESRGAN / DAT-based models** for image upscaling
- **Diffusion-based models** for AI background generation
- Automatic device detection (CPU / GPU where available)

## Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── app/         # API entry point and routing
│   ├── models/      # ML model integrations
│   └── data/        # Input/output image data
├── frontend/        # Next.js frontend application
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

The backend API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.
