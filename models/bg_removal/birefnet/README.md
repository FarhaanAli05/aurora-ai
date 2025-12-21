# Model: BiRefNet (Background Removal)

## Purpose
This model is used by **Aurora AI - Image Enhancement Studio** for **AI-powered background removal**.

It generates a high-quality alpha matte, allowing:
- Transparent PNG output
- Background replacement
- Downstream image enhancement

BiRefNet provides strong edge accuracy and handles complex subjects such as hair and fine details.

---

## Required Files
- `latest.pth` - BiRefNet model weights

> The filename `latest.pth` is used intentionally and matches the upstream project.

---

## Where to Place

```
models/bg_removal/birefnet/
├── latest.pth
└── README.md
```

---

## Source
- **Model Name:** BiRefNet
- **Task:** Salient Object Detection / Background Removal
- **Original Repository:** BiRefNet (open-source research model)

---

## License
License is defined by the original BiRefNet repository.  
Verify usage rights before redistribution.

---

## Runtime Notes
- **CPU:** Slow to moderate
- **GPU / ZeroGPU:** Fast
- **Memory Usage:** Moderate
- **Output:** RGBA image with alpha channel

---

## Used By
- UI Mode: **“Remove Background”**
- Backend Modes:
  - `remove_background`
  - `advanced_2x`
  - `advanced_4x`