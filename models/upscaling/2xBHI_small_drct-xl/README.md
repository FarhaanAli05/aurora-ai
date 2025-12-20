# Model: 2× BHI Small DRCT-XL (Balanced Upscaling)

## Purpose
This model is used by **Aurora AI - Image Enhancement Studio** to perform **fast, balanced 2× image upscaling**.

It is designed to improve image clarity while preserving realism and minimizing artifacts, making it suitable for:
- Web images
- Product photos
- General photography
- Background-removed images before compositing

This is the **recommended default enhancement mode** when speed is preferred over maximum detail.

---

## Required Files
The following files must be present in this directory:

- `model.pth` — model weights
- `model.toml` — model configuration (Spandrel metadata)

---

## Where to Place
models/upscaling/2xBHI_small_drct-xl/
├── model.pth
├── model.toml
└── README.md

yaml
Copy code

---

## Source
- **Author:** Philip Hofmann
- **Model Family:** BHI (Better High-Quality Images)
- **Network Type:** DRCT-XL (Transformer-based)
- **Original Repository:** Community SISR releases by Philip Hofmann

---

## License
Model license is specified by the original author.  
Typically **CC-BY-4.0** or equivalent.  
Please verify the license from the original release before redistribution.

---

## Runtime Notes
- **CPU:** Fast (typically under ~10 seconds for standard images)
- **GPU / ZeroGPU:** Very fast
- **Memory Usage:** Moderate
- **Deterministic:** Yes

---

## Used By
- UI Mode: **“Balanced (2×) Enhancement”**
- Backend Modes:
  - `enhance_2x`
  - `advanced_2x` (background removal + enhancement)