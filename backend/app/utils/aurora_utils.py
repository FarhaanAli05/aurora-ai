import numpy as np
from PIL import Image
import cv2

def postprocess_mask(mask_array: np.ndarray, threshold: float = 0.5, smooth_edges: bool = True) -> np.ndarray:
    thresholded = np.where(mask_array >= threshold, mask_array, 0.0)
    
    if smooth_edges:
        mask_uint8 = (thresholded * 255).astype(np.uint8)
        smoothed = cv2.GaussianBlur(mask_uint8, (5, 5), 1.0)
        thresholded = smoothed.astype(np.float32) / 255.0
    
    return thresholded

def replace_background(foreground_rgba: Image.Image, background_path: str) -> Image.Image:
    background = Image.open(background_path).convert('RGB')
    
    background = background.resize(foreground_rgba.size, Image.LANCZOS)
    
    alpha = foreground_rgba.split()[3]
    
    fg_array = np.array(foreground_rgba)
    bg_array = np.array(background)
    alpha_array = np.array(alpha).astype(np.float32) / 255.0
    
    alpha_3d = alpha_array[:, :, np.newaxis]
    composite = (fg_array[:, :, :3] * alpha_3d + bg_array * (1 - alpha_3d)).astype(np.uint8)
    
    return Image.fromarray(composite, mode='RGB')