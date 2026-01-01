import json
import os
import platform
import time
from pathlib import Path
from typing import Optional, Tuple, Dict, Any

from PIL import Image

OPENVINO_PROVIDER = "openvino"
LCM_PROVIDER = "lcm"

STATE_FILE = Path(__file__).resolve().parent / "bg_provider_state.json"


def _log_cpu_info() -> None:
    try:
        cpu = platform.processor() or "unknown"
        
        cpuinfo_path = Path("/proc/cpuinfo")
        if cpuinfo_path.exists():
            try:
                contents = cpuinfo_path.read_text(encoding="utf-8", errors="ignore")
                vendor_line = [line for line in contents.split("\n") if "vendor_id" in line.lower() or "model name" in line.lower()]
                if vendor_line:
                    cpu_details = " | ".join(vendor_line[:2])
                    print(f"Server CPU info: {cpu} ({cpu_details[:100]})")
                    return
            except Exception:
                pass
        
        print(f"Server CPU: {cpu}")
    except Exception:
        pass


def _openvino_importable() -> bool:
    try:
        from optimum.intel import OVStableDiffusionPipeline
        return True
    except ImportError as exc:
        missing_module = getattr(exc, 'name', 'optimum.intel')
        return False
    except Exception as exc:
        return False


class OpenVINOProvider:
    def __init__(self) -> None:
        self._pipeline = None

    def _load_pipeline(self):
        if self._pipeline is not None:
            return self._pipeline

        from optimum.intel import OVStableDiffusionPipeline

        model_id = "OpenVINO/LCM_Dreamshaper_v7-int8-ov"
        print(f"Loading OpenVINO pipeline from {model_id}...")

        pipeline = OVStableDiffusionPipeline.from_pretrained(
            model_id,
            compile=False,
            safety_checker=None,
        )
        pipeline.compile()
        if hasattr(pipeline, "set_progress_bar_config"):
            pipeline.set_progress_bar_config(disable=True)

        print("✓ OpenVINO pipeline loaded and compiled successfully")
        self._pipeline = pipeline
        return pipeline

    def generate(self, prompt: str) -> Image.Image:
        pipeline = self._load_pipeline()
        result = pipeline(
            prompt=prompt,
            num_inference_steps=4,
            guidance_scale=1.0,
        )
        return result.images[0]


class LCMProvider:
    def __init__(self) -> None:
        self._pipeline = None

    def _load_pipeline(self):
        if self._pipeline is not None:
            return self._pipeline

        import torch
        from diffusers import DiffusionPipeline

        model_id = "SimianLuo/LCM_Dreamshaper_v7"
        print(f"Loading LCM pipeline from {model_id} on CPU...")

        pipeline = DiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float32,
        )
        pipeline = pipeline.to("cpu")
        if hasattr(pipeline, "safety_checker"):
            pipeline.safety_checker = None
        if hasattr(pipeline, "set_progress_bar_config"):
            pipeline.set_progress_bar_config(disable=True)

        self._pipeline = pipeline
        return pipeline

    def generate(self, prompt: str) -> Image.Image:
        pipeline = self._load_pipeline()
        result = pipeline(
            prompt=prompt,
            num_inference_steps=4,
            guidance_scale=1.0,
        )
        return result.images[0]


_openvino_provider = OpenVINOProvider()
_lcm_provider = LCMProvider()


_log_cpu_info()


def generate_background(prompt: str, quality: str = "fast", provider_pref: str = "auto") -> Tuple[Image.Image, Dict[str, Any]]:
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    total_start = time.monotonic()
    
    provider_pref = provider_pref.lower() if provider_pref else "auto"
    if provider_pref not in ("auto", "openvino", "lcm"):
        provider_pref = "auto"
    
    if provider_pref == "lcm":
        print("Using provider: LCM (CPU) [forced]")
        lcm_start = time.monotonic()
        image = _lcm_provider.generate(prompt)
        lcm_elapsed = time.monotonic() - lcm_start
        total_elapsed = time.monotonic() - total_start
        print(f"✓ LCM generation successful ({lcm_elapsed:.2f}s)")
        
        return image, {
            "provider": LCM_PROVIDER,
            "elapsedSeconds": round(total_elapsed, 2),
            "message": "Using LCM (CPU)",
            "etaText": "Typically around 1 minute",
        }
    
    if provider_pref in ("openvino", "auto"):
        print(f"Trying OpenVINO... [{'forced' if provider_pref == 'openvino' else 'auto'}]")
        if not _openvino_importable():
            print("OpenVINO not installed in this environment (optimum.intel missing).")
            if provider_pref == "openvino":
                print("OpenVINO requested but not available. Falling back to LCM.")
            else:
                print("Falling back to LCM...")
        else:
            ov_start = time.monotonic()
            try:
                image = _openvino_provider.generate(prompt)
                elapsed = time.monotonic() - ov_start
                total_elapsed = time.monotonic() - total_start
                print(f"✓ OpenVINO generation successful ({elapsed:.2f}s)")
                
                return image, {
                    "provider": OPENVINO_PROVIDER,
                    "elapsedSeconds": round(total_elapsed, 2),
                    "message": "Using OpenVINO (Intel-optimized)",
                    "etaText": "Typically under 1 minute",
                }
            except Exception as exc:
                elapsed = time.monotonic() - ov_start
                error_type = type(exc).__name__
                error_msg = str(exc)
                print(f"OpenVINO failed: {error_type}: {error_msg} (after {elapsed:.2f}s)")
                if provider_pref == "openvino":
                    print("OpenVINO requested but failed. Falling back to LCM.")
                else:
                    print("Falling back to LCM...")

    print("Using provider: LCM (CPU)")
    lcm_start = time.monotonic()
    image = _lcm_provider.generate(prompt)
    lcm_elapsed = time.monotonic() - lcm_start
    total_elapsed = time.monotonic() - total_start
    print(f"✓ LCM generation successful ({lcm_elapsed:.2f}s)")
    
    return image, {
        "provider": LCM_PROVIDER,
        "elapsedSeconds": round(total_elapsed, 2),
        "message": "Using LCM (CPU)",
        "etaText": "Typically around 1 minute",
    }


def smoke_test_background_provider() -> dict:
    openvino_importable = _openvino_importable()
    
    return {
        "openvino_importable": openvino_importable,
        "default_provider": OPENVINO_PROVIDER if openvino_importable else LCM_PROVIDER,
    }
