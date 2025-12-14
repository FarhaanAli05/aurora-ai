import sys
import os
from pathlib import Path
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
inspyrenet_path = os.path.join(project_root, 'third_party', 'InSPyReNet')

src_path = os.path.dirname(os.path.abspath(__file__))
if src_path not in sys.path:
    sys.path.insert(0, src_path)

if not os.path.exists(inspyrenet_path):
    print(f"Error: InSPYReNet repository not found at: {inspyrenet_path}")
    print(f"Clone it with: git clone https://github.com/plemeri/InSPyReNet.git {inspyrenet_path}")
    sys.exit(1)

sys.path.insert(0, inspyrenet_path)

try:
    from lib.InSPyReNet import InSPyReNet_SwinB
except ImportError as e:
    print(f"Error: Could not import InSPYReNet modules.")
    print(f"Import error: {str(e)}")
    print(f"Repository path: {inspyrenet_path}")
    print(f"Python path includes: {inspyrenet_path in sys.path}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

def remove_background(
    input_path: str, 
    output_path: str, 
    model_path: str = None,
) -> None:
    if model_path is None:
        model_path = os.path.join(project_root, 'models', 'latest.pth')
    
    if not os.path.exists(model_path):
        print(f"Error: Model weights not found at {model_path}")
        print("Please download pretrained weights from:")
        print("https://github.com/plemeri/InSPyReNet#model-zoo")
        sys.exit(1)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    print("Loading InSPYReNet model...")
    model = InSPyReNet_SwinB(depth=64, pretrained=False, base_size=[384, 384])
    model.load_state_dict(torch.load(model_path, map_location=device), strict=True)
    model = model.to(device)
    model.eval()
    
    transform = transforms.Compose([
        transforms.Resize((384, 384)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])
    
    print(f"Loading image: {input_path}")
    image = Image.open(input_path).convert('RGB')
    original_size = image.size
    
    input_tensor = transform(image).unsqueeze(0).to(device)
    
    print("Running inference...")
    with torch.no_grad():
        sample = {'image': input_tensor}
        output = model(sample)
        mask = output['pred'].squeeze().cpu().numpy()
    
    mask_pil = Image.fromarray((mask * 255).astype('uint8'), mode='L')
    mask_pil = mask_pil.resize(original_size, Image.BILINEAR)
    
    mask_array = np.array(mask_pil) / 255.0
    
    alpha = (mask_array * 255).astype('uint8')
    
    image.putalpha(Image.fromarray(alpha, mode='L'))
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format='PNG')
    print(f"✓ Saved transparent image to: {output_path}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python src/inference.py <input_image> <output_image> [model_path]")
        print("\nExample:")
        print("  python src/inference.py data/input/photo.jpg data/output/photo.png")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    model_path = sys.argv[3] if len(sys.argv) > 3 else None
    
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)
    
    remove_background(
        input_path, 
        output_path, 
        model_path
    )

if __name__ == "__main__":
    main()