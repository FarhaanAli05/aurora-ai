import sys
import os
import argparse
from pathlib import Path
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
inspyrenet_path = os.path.join(project_root, "third_party", "InSPyReNet")

src_path = os.path.dirname(os.path.abspath(__file__))
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from aurora_utils import postprocess_mask, replace_background

if not os.path.exists(inspyrenet_path):
    print(f"Error: InSPYReNet repository not found at: {inspyrenet_path}")
    print(
        f"Clone it with: git clone https://github.com/plemeri/InSPyReNet.git {inspyrenet_path}"
    )
    sys.exit(1)

if inspyrenet_path not in sys.path:
    sys.path.insert(0, inspyrenet_path)

try:
    from lib.InSPyReNet import InSPyReNet_SwinB
except ImportError as e:
    print("Error: Could not import InSPyReNet modules.")
    print(f"Import error: {str(e)}")
    print(f"Repository path: {inspyrenet_path}")
    print(f"Python path includes repo: {inspyrenet_path in sys.path}")
    import traceback

    traceback.print_exc()
    sys.exit(1)

_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_MODEL = None
_MODEL_PATH = None
_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((384, 384)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)

def get_model(model_path: str | None = None):
    global _MODEL, _MODEL_PATH

    if model_path is None:
        model_path = os.path.join(project_root, "models", "latest.pth")

    if not os.path.exists(model_path):
        print(f"Error: Model weights not found at {model_path}")
        print("Please download pretrained weights from:")
        print("https://github.com/plemeri/InSPyReNet#model-zoo")
        sys.exit(1)

    if _MODEL is not None and _MODEL_PATH == model_path:
        return _MODEL, _DEVICE, _TRANSFORM

    print(f"Using device: {_DEVICE}")
    print("Loading InSPYReNet model...")

    model = InSPyReNet_SwinB(depth=64, pretrained=False, base_size=[384, 384])
    model.load_state_dict(torch.load(model_path, map_location=_DEVICE), strict=True)
    model = model.to(_DEVICE)
    model.eval()

    _MODEL = model
    _MODEL_PATH = model_path

    return _MODEL, _DEVICE, _TRANSFORM

def remove_background(
    input_path: str,
    output_path: str,
    model_path: str | None = None,
    background_path: str | None = None,
    no_postprocess: bool = False,
) -> None:
    model, device, transform = get_model(model_path)

    print(f"Loading image: {input_path}")
    image = Image.open(input_path).convert("RGB")
    original_size = image.size

    input_tensor = transform(image).unsqueeze(0).to(device)

    print("Running inference...")
    with torch.no_grad():
        sample = {"image": input_tensor}
        output = model(sample)
        mask = output["pred"].squeeze().cpu().numpy()

    mask_pil = Image.fromarray((mask * 255).astype("uint8"), mode="L")
    mask_pil = mask_pil.resize(original_size, Image.BILINEAR)

    mask_array = np.array(mask_pil) / 255.0

    if not no_postprocess:
        print("Applying mask post-processing...")
        mask_array = postprocess_mask(mask_array, threshold=0.5, smooth_edges=True)

    alpha = (mask_array * 255).astype("uint8")
    image.putalpha(Image.fromarray(alpha, mode="L"))

    if background_path:
        if not os.path.exists(background_path):
            print(f"Error: Background image not found: {background_path}")
            sys.exit(1)
        print(f"Compositing with background: {background_path}")
        image = replace_background(image, background_path)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="PNG")

    if background_path:
        print(f"✓ Saved composite image to: {output_path}")
    else:
        print(f"✓ Saved transparent image to: {output_path}")

def main():
    parser = argparse.ArgumentParser(
        description='Aurora AI - Background Removal using InSPYReNet',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python src/inference.py data/input/photo.jpg data/output/photo.png
  python src/inference.py data/input/photo.jpg data/output/photo.png --background bg.jpg
  python src/inference.py data/input/photo.jpg data/output/photo.png --no-postprocess
  python src/inference.py data/input/photo.jpg data/output/photo.png --model models/custom.pth
        """
    )
    
    parser.add_argument('input', help='Path to input image')
    parser.add_argument('output', help='Path to output image')
    parser.add_argument('--model', '-m', default=None, 
                       help='Path to model weights (default: models/latest.pth)')
    parser.add_argument('--background', '-b', default=None,
                       help='Path to background image for replacement')
    parser.add_argument('--no-postprocess', action='store_true',
                       help='Skip mask post-processing (thresholding + edge smoothing)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)
    
    remove_background(
        args.input, 
        args.output, 
        model_path=args.model,
        background_path=args.background,
        no_postprocess=args.no_postprocess
    )

if __name__ == "__main__":
    main()