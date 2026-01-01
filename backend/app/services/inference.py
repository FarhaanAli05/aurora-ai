import os
import sys
import argparse
from pathlib import Path
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
from transformers import AutoModelForImageSegmentation

from backend.app.utils.aurora_utils import replace_background
from backend.app.services import bg_providers

_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_MODEL = None
_UPSCALER_2X = None
_UPSCALER_4X = None
_FLUX_PIPELINE_FAST = None
_FLUX_PIPELINE_HQ = None
_FLUX_PIPELINE_FAST_CPU = None
_FLUX_PIPELINE_HQ_CPU = None

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
    
    project_root = Path(__file__).resolve().parents[2]
    model_path = project_root / "models" / "upscaling" / model_dir / model_file
    
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model weights not found at: {model_path}\n"
            f"Please ensure the model file exists in models/upscaling/{model_dir}/"
        )
    
    print(f"Loading {model_name} upscaler model ({scale}x) from {model_path}...")
    print("Using CPU-only inference (optimized for Hugging Face Spaces)")
    
    try:
        loader = ModelLoader()
        model = loader.load_from_file(str(model_path))
        
        model = model.to(torch.device("cpu"))
        model.eval()
        
        torch.use_deterministic_algorithms(True, warn_only=True)
        
        print(f"✓ {model_name} upscaler loaded successfully (CPU-only, {scale}x)")
        
        if scale == 2:
            _UPSCALER_2X = model
        else:
            _UPSCALER_4X = model
        
    except Exception as e:
        raise RuntimeError(
            f"Failed to load {scale}x upscaler model: {str(e)}\n"
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

def _load_flux_pipeline(quality: str = "fast", force_cpu: bool = False):
    global _FLUX_PIPELINE_FAST, _FLUX_PIPELINE_HQ, _FLUX_PIPELINE_FAST_CPU, _FLUX_PIPELINE_HQ_CPU
    
    use_cuda = torch.cuda.is_available() and not force_cpu
    device = torch.device("cuda" if use_cuda else "cpu")
    
    if quality == "fast":
        if force_cpu:
            if _FLUX_PIPELINE_FAST_CPU is not None:
                return _FLUX_PIPELINE_FAST_CPU
        else:
            if _FLUX_PIPELINE_FAST is not None:
                return _FLUX_PIPELINE_FAST
    elif quality == "hq":
        if force_cpu:
            if _FLUX_PIPELINE_HQ_CPU is not None:
                return _FLUX_PIPELINE_HQ_CPU
        else:
            if _FLUX_PIPELINE_HQ is not None:
                return _FLUX_PIPELINE_HQ
    else:
        raise ValueError(f"Quality must be 'fast' or 'hq'. Got: {quality}")
    
    try:
        from diffusers import FluxPipeline
    except ImportError:
        raise ImportError(
            "diffusers is not installed. Install it with: pip install diffusers accelerate"
        )
    
    model_id = "black-forest-labs/FLUX.1-dev" if quality == "fast" else "black-forest-labs/FLUX.2-dev"
    quality_name = "Fast" if quality == "fast" else "High Quality"
    
    dtype = torch.float16 if use_cuda else torch.float32
    
    print(f"Loading {quality_name} pipeline from {model_id}...")
    print(f"Device: {'GPU (CUDA)' if use_cuda else 'CPU'}, dtype: {dtype}")
    
    try:
        pipeline = FluxPipeline.from_pretrained(
            model_id,
            torch_dtype=dtype,
            device_map="auto" if use_cuda else None,
        )
        
        if not use_cuda:
            pipeline = pipeline.to(device)
        elif hasattr(pipeline, 'to'):
            pipeline = pipeline.to(device)
        
        pipeline.set_progress_bar_config(disable=True)
        
        print(f"✓ {quality_name} pipeline loaded successfully on {device}")
        
        if quality == "fast":
            if force_cpu:
                _FLUX_PIPELINE_FAST_CPU = pipeline
            else:
                _FLUX_PIPELINE_FAST = pipeline
        else:
            if force_cpu:
                _FLUX_PIPELINE_HQ_CPU = pipeline
            else:
                _FLUX_PIPELINE_HQ = pipeline
        
        return pipeline
        
    except RuntimeError as e:
        error_msg = str(e)
        if "out of memory" in error_msg.lower() or "CUDA out of memory" in error_msg:
            print(f"GPU OOM detected, falling back to CPU...")
            try:
                torch.cuda.empty_cache()
                device = torch.device("cpu")
                dtype = torch.float32
                
                pipeline = FluxPipeline.from_pretrained(
                    model_id,
                    torch_dtype=dtype,
                    device_map=None,
                )
                pipeline = pipeline.to(device)
                pipeline.set_progress_bar_config(disable=True)
                
                print(f"✓ {quality_name} pipeline loaded on CPU (GPU fallback)")
                
                if quality == "fast":
                    _FLUX_PIPELINE_FAST_CPU = pipeline
                else:
                    _FLUX_PIPELINE_HQ_CPU = pipeline
                
                return pipeline
            except Exception as fallback_error:
                raise RuntimeError(
                    "GPU is out of memory and CPU fallback also failed. "
                    "Please try again later or use a smaller model."
                ) from fallback_error
        elif "CUDA" in error_msg or "GPU" in error_msg:
            raise RuntimeError(
                "GPU is currently unavailable. "
                "Please try again later. On Hugging Face Spaces, the GPU queue may be busy."
            ) from e
        elif "timeout" in error_msg.lower() or "queue" in error_msg.lower():
            raise RuntimeError(
                "Background generation is taking longer than expected. "
                "The GPU queue may be busy. Please try again in a moment."
            ) from e
        else:
            raise RuntimeError(
                f"Failed to load FLUX pipeline: {error_msg}\n"
                "Please check your internet connection and try again."
            ) from e
    except Exception as e:
        error_msg = str(e)
        raise RuntimeError(
            f"Failed to load FLUX pipeline: {error_msg}\n"
            "Please check your internet connection and try again."
        ) from e

def generate_background(prompt: str, quality: str = "fast", provider_pref: str = "auto") -> tuple[Image.Image, dict]:
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    if quality not in ("fast", "hq"):
        raise ValueError(f"Quality must be 'fast' or 'hq'. Got: {quality}")

    return bg_providers.generate_background(prompt=prompt, quality=quality, provider_pref=provider_pref)


def _enhance_only(input_path: str, output_path: str, scale: int = 4) -> None:
    print(f"Loading image: {input_path}")
    try:
        image = Image.open(input_path)
    except Exception as e:
        raise RuntimeError(f"Failed to load image from {input_path}: {str(e)}") from e
    
    scale_name = "Balanced (2x)" if scale == 2 else "Strong (4x)"
    print(f"Enhancing image ({scale}x upscale, {scale_name})...")
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
                       help='Upscale image by 4x using AI enhancement')
    
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
