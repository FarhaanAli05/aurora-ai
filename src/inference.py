import os
import sys
import argparse
from pathlib import Path
import torch
from PIL import Image
import torchvision.transforms as transforms
from transformers import AutoModelForImageSegmentation

from .aurora_utils import replace_background

_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_MODEL = None

_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((1024, 1024)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)

def get_model(model_path: str | None = None):
    """
    Load BiRefNet model from Hugging Face (matching not-lain's implementation).
    
    The model is loaded once and cached globally for reuse across requests.
    Model path parameter is ignored (BiRefNet uses Hugging Face model hub).
    
    Returns:
        tuple: (model, device, transform) for use in inference
    """
    global _MODEL
    
    if _MODEL is not None:
        return _MODEL, _DEVICE, _TRANSFORM
    
    print(f"Using device: {_DEVICE}")
    print("Loading BiRefNet model from Hugging Face...")
    
    _MODEL = AutoModelForImageSegmentation.from_pretrained(
        "ZhengPeng7/BiRefNet",
        trust_remote_code=True
    )
    _MODEL.to(_DEVICE)
    _MODEL.eval()
    
    print("✓ BiRefNet model loaded successfully")
    
    return _MODEL, _DEVICE, _TRANSFORM

def remove_background(
    input_path: str,
    output_path: str,
    model_path: str | None = None,
    background_path: str | None = None,
    no_postprocess: bool = False,
) -> None:
    """
    Remove background from an image using BiRefNet (matching not-lain's implementation).
    
    This function maintains the same signature as before for API compatibility.
    The model_path parameter is ignored (BiRefNet uses Hugging Face model hub).
    The no_postprocess parameter is ignored (BiRefNet doesn't use heuristic post-processing).
    
    Args:
        input_path: Path to input RGB image
        output_path: Path to save output PNG (RGBA if no background, RGB if background provided)
        model_path: Ignored (kept for API compatibility)
        background_path: Optional path to background image for compositing
        no_postprocess: Ignored (kept for API compatibility, BiRefNet preserves soft edges)
    """
    model, device, transform = get_model(model_path)
    
    print(f"Loading image: {input_path}")
    image = Image.open(input_path).convert("RGB")
    image_size = image.size
    
    input_tensor = transform(image).unsqueeze(0).to(device)
    
    print("Running inference...")
    with torch.no_grad():
        preds = model(input_tensor)[-1].sigmoid().cpu()
    
    pred = preds[0].squeeze()
    pred_pil = transforms.ToPILImage()(pred)
    
    mask = pred_pil.resize(image_size)
    
    image.putalpha(mask)
    
    if background_path:
        if not os.path.exists(background_path):
            print(f"Error: Background image not found: {background_path}")
            return
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
        description='Aurora AI - Background Removal using BiRefNet',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python src/inference.py data/input/photo.jpg data/output/photo.png
  python src/inference.py data/input/photo.jpg data/output/photo.png --background bg.jpg
  python src/inference.py data/input/photo.jpg data/output/photo.png --no-postprocess
  python src/inference.py data/input/photo.jpg data/output/photo.png --model (ignored, uses Hugging Face model)
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