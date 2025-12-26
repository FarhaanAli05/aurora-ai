# Aurora AI Backend

FastAPI backend for Aurora AI image editing studio, providing ML inference services for image processing.

## Overview

The backend handles AI-powered image processing tasks including:
- Image enhancement (upscaling)
- Background removal
- Background generation (experimental)

## Tech Stack

- **FastAPI**: REST API framework
- **PyTorch**: ML inference
- **Uvicorn**: ASGI server

## Getting Started

### Installation

```bash
pip install -r requirements.txt
```

### Running the Server

From the project root:

```bash
uvicorn backend.app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### API Documentation

Once the server is running, interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
  ├── app/
  │   ├── main.py              # FastAPI application entry point
  │   ├── services/
  │   │   └── inference.py     # ML inference services
  │   └── utils/
  │       └── aurora_utils.py  # Utility functions
  ├── models/                  # ML model files
  │   ├── bg_removal/         # Background removal models
  │   └── upscaling/          # Image upscaling models
  ├── data/                    # Input/output data directories
  └── tmp/                     # Temporary file storage
```

## Models

ML models are stored in the `models/` directory. See individual model README files for specific model information:
- `models/bg_removal/birefnet/README.md`
- `models/upscaling/2xBHI_small_drct-xl/README.md`
- `models/upscaling/4xBHI_dat2_real/README.md`

