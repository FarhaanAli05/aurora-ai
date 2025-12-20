import os
import sys
import argparse
from pathlib import Path
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
from transformers import AutoModelForImageSegmentation

from .aurora_utils import replace_background

_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_MODEL = None
_UPSCALER_2X = None
_UPSCALER_4X = None

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

def _load_upscaler_model(scale: int = 4):
    global _UPSCALER_2X, _UPSCALER_4X
    
    if scale == 2:
        if _UPSCALER_2X is not None:
            return _UPSCALER_2X
        model_name = "2xBHI_small_drct-xl"
        model_file = "model.pth"
        model_dir = "2xBHI_small_drct-xl"
    elif scale == 4:
        if _UPSCALER_4X is not None:
            return _UPSCALER_4X
        model_name = "4xBHI_dat2_real"
        model_file = "4xBHI_dat2_real.safetensors"
        model_dir = "4xBHI_dat2_real"
    else:
        raise ValueError(f"Only scale=2 or scale=4 are supported. Got scale={scale}")
    
    try:
        from spandrel import ModelLoader
    except ImportError:
        raise ImportError(
            "spandrel is not installed. Install it with: pip install spandrel"
        )
    
    project_root = Path(__file__).resolve().parents[1]
    model_path = project_root / "models" / "upscaling" / model_dir / model_file
    
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model weights not found at: {model_path}\n"
            f"Please ensure the model file exists in models/upscaling/{model_dir}/"
        )
    
    print(f"Loading {model_name} upscaler model ({scale}×) from {model_path}...")
    print("Using CPU-only inference (optimized for Hugging Face Spaces)")
    
    try:
        loader = ModelLoader()
        model = loader.load_from_file(str(model_path))
        
        model = model.to(torch.device("cpu"))
        model.eval()
        
        torch.use_deterministic_algorithms(True, warn_only=True)
        
        print(f"✓ {model_name} upscaler loaded successfully (CPU-only, {scale}×)")
        
        if scale == 2:
            _UPSCALER_2X = model
        else:
            _UPSCALER_4X = model
        
    except Exception as e:
        raise RuntimeError(
            f"Failed to load {scale}× upscaler model: {str(e)}\n"
            "Please check that the model file is valid and spandrel is properly installed."
        ) from e
    
    return model

def enhance_image(image: Image.Image, scale: int = 4) -> Image.Image:
    if scale not in (2, 4):
        raise ValueError(f"Only scale=2 or scale=4 are supported. Got scale={scale}")
    
    model = _load_upscaler_model(scale=scale)
    
    if image.mode == "RGBA":
        rgb_image = image.convert("RGB")
        alpha_channel = np.array(image.split()[3], dtype=np.float32) / 255.0
        
        rgb_tensor = transforms.ToTensor()(rgb_image).unsqueeze(0).to(torch.device("cpu"))
        
        with torch.no_grad():
            upscaled_rgb_tensor = model(rgb_tensor)
        
        upscaled_rgb = transforms.ToPILImage()(upscaled_rgb_tensor[0].clamp(0, 1))
        
        alpha_rgb = Image.merge("RGB", [
            Image.fromarray((alpha_channel * 255).astype(np.uint8)),
            Image.fromarray((alpha_channel * 255).astype(np.uint8)),
            Image.fromarray((alpha_channel * 255).astype(np.uint8))
        ])
        alpha_tensor = transforms.ToTensor()(alpha_rgb).unsqueeze(0).to(torch.device("cpu"))
        
        with torch.no_grad():
            upscaled_alpha_tensor = model(alpha_tensor)
        
        upscaled_alpha = transforms.ToPILImage()(upscaled_alpha_tensor[0].clamp(0, 1)).split()[0]
        
        upscaled_rgba = Image.merge("RGBA", [
            upscaled_rgb.split()[0],
            upscaled_rgb.split()[1],
            upscaled_rgb.split()[2],
            upscaled_alpha
        ])
        return upscaled_rgba
    else:
        rgb_image = image.convert("RGB")
        rgb_tensor = transforms.ToTensor()(rgb_image).unsqueeze(0).to(torch.device("cpu"))
        
        with torch.no_grad():
            upscaled_tensor = model(rgb_tensor)
        
        upscaled = transforms.ToPILImage()(upscaled_tensor[0].clamp(0, 1))
        return upscaled

def process_image(
    input_path: str,
    output_path: str,
    mode: str = "remove_background",
    background_path: str | None = None,
    model_path: str | None = None,
) -> None:
    if mode == "remove_background":
        _remove_background_only(input_path, output_path, model_path, background_path)
    elif mode == "enhance_2x":
        _enhance_only(input_path, output_path, scale=2)
    elif mode == "enhance_4x":
        _enhance_only(input_path, output_path, scale=4)
    elif mode == "advanced_2x":
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
            tmp_path = tmp_file.name
        
        _remove_background_only(input_path, tmp_path, model_path, background_path)
        
        _enhance_only(tmp_path, output_path, scale=2)
        
        try:
            os.unlink(tmp_path)
        except:
            pass
    elif mode == "advanced_4x":
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
            tmp_path = tmp_file.name
        
        _remove_background_only(input_path, tmp_path, model_path, background_path)
        
        _enhance_only(tmp_path, output_path, scale=4)
        
        try:
            os.unlink(tmp_path)
        except:
            pass
    else:
        raise ValueError(
            f"Unknown mode: {mode}. Must be 'remove_background', 'enhance_2x', "
            "'enhance_4x', 'advanced_2x', or 'advanced_4x'"
        )

def _remove_background_only(
    input_path: str,
    output_path: str,
    model_path: str | None = None,
    background_path: str | None = None,
) -> None:
    model, device, transform = get_model(model_path)
    
    print(f"Loading image: {input_path}")
    image = Image.open(input_path).convert("RGB")
    image_size = image.size
    
    input_tensor = transform(image).unsqueeze(0).to(device)
    
    print("Running background removal...")
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

def _enhance_only(input_path: str, output_path: str, scale: int = 4) -> None:
    print(f"Loading image: {input_path}")
    try:
        image = Image.open(input_path)
    except Exception as e:
        raise RuntimeError(f"Failed to load image from {input_path}: {str(e)}") from e
    
    scale_name = "Balanced (2×)" if scale == 2 else "Strong (4×)"
    print(f"Enhancing image ({scale}× upscale, {scale_name})...")
    try:
        enhanced = enhance_image(image, scale=scale)
    except Exception as e:
        raise RuntimeError(f"Failed to enhance image: {str(e)}") from e
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    enhanced.save(output_path, format="PNG")
    print(f"✓ Saved enhanced image to: {output_path}")

def remove_background(
    input_path: str,
    output_path: str,
    model_path: str | None = None,
    background_path: str | None = None,
    upscale: bool = False,
) -> None:
    if upscale:
        process_image(input_path, output_path, mode="advanced", background_path=background_path, model_path=model_path)
    else:
        _remove_background_only(input_path, output_path, model_path, background_path)

def main():
    parser = argparse.ArgumentParser(
        description='Aurora AI - Background Removal using BiRefNet',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python src/inference.py data/input/photo.jpg data/output/photo.png
  python src/inference.py data/input/photo.jpg data/output/photo.png --background bg.jpg
  python src/inference.py data/input/photo.jpg data/output/photo.png --upscale
  python src/inference.py data/input/photo.jpg data/output/photo.png --background bg.jpg --upscale
        """
    )
    
    parser.add_argument('input', help='Path to input image')
    parser.add_argument('output', help='Path to output image')
    parser.add_argument('--model', '-m', default=None, 
                       help='Path to model weights (ignored, uses Hugging Face model)')
    parser.add_argument('--background', '-b', default=None,
                       help='Path to background image for replacement')
    parser.add_argument('--upscale', '-u', action='store_true',
                       help='Upscale image by 4× using AI enhancement')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)
    
    remove_background(
        args.input, 
        args.output, 
        model_path=args.model,
        background_path=args.background,
        upscale=args.upscale,
    )

if __name__ == "__main__":
    main()