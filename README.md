# Aurora AI - Background Removal

Production-ready background removal using InSPYReNet.

## Setup

1. Clone the InSPYReNet repository:
```bash
git clone https://github.com/plemeri/InSPyReNet.git third_party/InSPyReNet
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download pretrained weights:
   - Visit the [InSPYReNet Model Zoo](https://github.com/plemeri/InSPyReNet#model-zoo)
   - Download the checkpoint (e.g., `InSPyReNet_SwinB.pth`)
   - Place it in `models/InSPyReNet_SwinB.pth`

## Usage

```bash
python src/inference.py data/input/photo.jpg data/output/photo.png
```

## Project Structure

```
aurora-ai/
├── data/
│   ├── input/          # Input images
│   └── output/         # Transparent PNG outputs
├── models/             # Model weights (.pth files)
├── third_party/
│   └── InSPyReNet/     # Cloned InSPYReNet repository
├── src/
│   ├── __init__.py
│   └── inference.py    # Main inference script
├── requirements.txt
└── README.md
```

## How It Works

1. **Load Image**: Reads input image and converts to RGB
2. **Preprocess**: Resizes to model input size (384x384) and normalizes
3. **Inference**: InSPYReNet generates foreground probability mask (0-1 per pixel)
4. **Post-process**: Converts mask to alpha channel
5. **Composite**: Combines original RGB + alpha --> transparent PNG

## References

- InSPYReNet Repository: https://github.com/plemeri/InSPyReNet
- Paper: Revisiting Image Pyramid Structure for High Resolution Salient Object Detection (ACCV 2022)

