# Model: 4× BHI DAT2-Real (High-Detail Upscaling)

## Purpose
This model is used by **Aurora AI - Image Enhancement Studio** for **high-quality 4× image upscaling**.

It is optimized for **real-world images** and handles:
- Lens blur
- Realistic noise
- JPEG / WebP compression artifacts
- Web-scale photo degradation

This is the **highest-quality enhancement option**, intended for users who want maximum detail.

---

## Required Files
Only **one** of the following is required (preferred option listed first):

- `4xBHI_dat2_real.safetensors` ✅ (recommended)
- `4xBHI_dat2_real.pth` (legacy)

Other files (logs, training artifacts) are **not required**.

---

## Where to Place
models/upscaling/4xBHI_dat2_real/
├── 4xBHI_dat2_real.safetensors
└── README.md

yaml
Copy code

---

## Source
- **Author:** Philip Hofmann
- **Model Name:** 4xBHI_dat2_real
- **Network Type:** DAT2 (Transformer-based)
- **Training:** Real-ESRGAN OTF degradation pipeline on BHI dataset
- **Release Date:** December 2024

---

## License
Model license is defined by the original author (typically **CC-BY-4.0**).  
Verify license terms before redistribution or commercial use.

---

## Runtime Notes
- **CPU:** Very slow (1–2 minutes per image)
- **GPU / ZeroGPU:** Fast (seconds)
- **Memory Usage:** High
- **Deterministic:** Yes

⚠️ **Note:**  
This model strongly benefits from GPU acceleration.  
Aurora AI may use **Hugging Face ZeroGPU** automatically when available.

---

## Used By
- UI Mode: **“Strong (4×) Enhancement”**
- Backend Modes:
  - `enhance_4x`
  - `advanced_4x` (background removal + enhancement)