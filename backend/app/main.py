import os
import base64
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.services import inference as aurora_inference

app = FastAPI(
    title="Aurora AI",
    description="Image Enhancement Studio - Background removal and AI upscaling.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def load_model_on_startup() -> None:
    aurora_inference.get_model(None)

HTML_FORM = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Aurora AI - Image Enhancement Studio</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; }
    form { display: flex; flex-direction: column; gap: 1rem; max-width: 480px; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-weight: 600; }
    .helper { font-size: 0.875rem; color: #6b7280; margin-top: -0.25rem; }
    input[type="file"] { padding: 0.25rem 0; }
    .radio-group { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.25rem; }
    .radio-option { display: flex; align-items: flex-start; gap: 0.5rem; }
    .radio-option input[type="radio"] { margin-top: 0.125rem; }
    .radio-label { font-weight: normal; }
    .radio-desc { font-size: 0.875rem; color: #6b7280; margin-left: 1.5rem; }
    button { padding: 0.5rem 1rem; border-radius: 4px; border: none; background: #2563eb; color: white; cursor: pointer; font-weight: 600; }
    button:hover { background: #1d4ed8; }
    #status { margin-top: 0.5rem; color: #555; font-size: 0.9rem; display: none; }
    #background-group { display: none; }
  </style>
  <script>
    function onSubmitForm() {
      const status = document.getElementById('status');
      if (status) status.style.display = 'block';
    }
    function toggleBackgroundInput() {
      const mode = document.querySelector('input[name="mode"]:checked')?.value;
      const bgGroup = document.getElementById('background-group');
      if (mode === 'remove_background' || mode === 'advanced_2x' || mode === 'advanced_4x') {
        bgGroup.style.display = 'flex';
      } else {
        bgGroup.style.display = 'none';
      }
    }
    function toggleBackgroundType() {
      const bgType = document.querySelector('input[name="bg_type"]:checked')?.value;
      const uploadGroup = document.getElementById('bg-upload-group');
      const generateGroup = document.getElementById('bg-generate-group');
      if (bgType === 'upload') {
        uploadGroup.style.display = 'block';
        generateGroup.style.display = 'none';
      } else {
        uploadGroup.style.display = 'none';
        generateGroup.style.display = 'block';
      }
    }
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', toggleBackgroundInput);
      });
      document.querySelectorAll('input[name="bg_type"]').forEach(radio => {
        radio.addEventListener('change', toggleBackgroundType);
      });
      toggleBackgroundInput();
      toggleBackgroundType();
    });
  </script>
</head>
<body>
  <h1>Aurora AI - Image Enhancement Studio</h1>
  <form action="/process" method="post" enctype="multipart/form-data" onsubmit="onSubmitForm()">
    <div class="form-group">
      <label>Image (required)</label>
      <input type="file" name="image" accept="image/*" required />
    </div>

    <div class="form-group">
      <label>Enhancement Mode</label>
      <div class="radio-group">
        <div class="radio-option">
          <input type="radio" name="mode" value="remove_background" id="mode-remove" checked />
          <div>
            <label for="mode-remove" class="radio-label">Background Removal</label>
            <div class="radio-desc">Remove background, returns transparent PNG</div>
          </div>
        </div>
        <div class="radio-option">
          <input type="radio" name="mode" value="enhance_2x" id="mode-enhance-2x" />
          <div>
            <label for="mode-enhance-2x" class="radio-label">Image Enhancement - Balanced (2x)</label>
            <div class="radio-desc">Fast, low-artifact upscaling</div>
          </div>
        </div>
        <div class="radio-option">
          <input type="radio" name="mode" value="enhance_4x" id="mode-enhance-4x" />
          <div>
            <label for="mode-enhance-4x" class="radio-label">Image Enhancement - Strong (4x)</label>
            <div class="radio-desc">High-detail upscaling</div>
          </div>
        </div>
        <div class="radio-option">
          <input type="radio" name="mode" value="advanced_2x" id="mode-advanced-2x" />
          <div>
            <label for="mode-advanced-2x" class="radio-label">Advanced - Balanced (2x)</label>
            <div class="radio-desc">Remove background, then enhance (2x)</div>
          </div>
        </div>
        <div class="radio-option">
          <input type="radio" name="mode" value="advanced_4x" id="mode-advanced-4x" />
          <div>
            <label for="mode-advanced-4x" class="radio-label">Advanced - Strong (4x)</label>
            <div class="radio-desc">Remove background, then enhance (4x)</div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-group" id="background-group">
      <label>Background (optional)</label>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div>
          <input type="radio" name="bg_type" value="upload" id="bg-upload" checked />
          <label for="bg-upload" style="font-weight: normal; margin-left: 0.25rem;">Upload image</label>
        </div>
        <div>
          <input type="radio" name="bg_type" value="generate" id="bg-generate" />
          <label for="bg-generate" style="font-weight: normal; margin-left: 0.25rem;">Generate from prompt</label>
        </div>
      </div>
      
      <div id="bg-upload-group">
        <input type="file" name="background" accept="image/*" style="margin-top: 0.5rem;" />
        <div class="helper">Replace removed background with this image</div>
      </div>
      
      <div id="bg-generate-group" style="display: none; margin-top: 0.5rem;">
        <input type="text" name="bg_prompt" placeholder="e.g., sunset over mountains, abstract blue gradient" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" />
        <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">
          <div>
            <input type="radio" name="bg_quality" value="fast" id="bg-quality-fast" checked />
            <label for="bg-quality-fast" style="font-weight: normal; margin-left: 0.25rem;">Fast (Recommended)</label>
          </div>
          <div>
            <input type="radio" name="bg_quality" value="hq" id="bg-quality-hq" />
            <label for="bg-quality-hq" style="font-weight: normal; margin-left: 0.25rem;">High Quality (Slower)</label>
          </div>
        </div>
        <div class="helper">AI-generated background using FLUX models</div>
      </div>
    </div>

    <button type="submit">Process</button>
    <div id="status">Processing… please wait.</div>
  </form>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
async def index() -> HTMLResponse:
    return HTMLResponse(content=HTML_FORM)

@app.post("/process")
async def process_image(
    image: UploadFile = File(...),
    mode: str = Form("remove_background"),
    background: UploadFile | None = File(None),
    bg_type: str = Form("upload"),
    bg_prompt: str = Form(""),
    bg_quality: str = Form("fast"),
):
    try:
        project_root = Path(__file__).resolve().parents[1]
        tmp_dir = project_root / "tmp"
        tmp_dir.mkdir(parents=True, exist_ok=True)

        suffix = os.path.splitext(image.filename or "")[1] or ".png"
        with NamedTemporaryFile(dir=tmp_dir, suffix=suffix, delete=False) as in_file:
            in_path = Path(in_file.name)
            contents = await image.read()
            in_file.write(contents)

        bg_path: Path | None = None
        if bg_type == "upload" and background is not None:
            bg_contents = await background.read()
            if bg_contents:
                bg_suffix = os.path.splitext(background.filename or "")[1] or ".png"
                with NamedTemporaryFile(dir=tmp_dir, suffix=bg_suffix, delete=False) as bg_file:
                    bg_path = Path(bg_file.name)
                    bg_file.write(bg_contents)
        elif bg_type == "generate" and bg_prompt and bg_prompt.strip():
            try:
                generated_bg = aurora_inference.generate_background(
                    prompt=bg_prompt.strip(),
                    quality=bg_quality
                )
                with NamedTemporaryFile(dir=tmp_dir, suffix=".png", delete=False) as bg_file:
                    bg_path = Path(bg_file.name)
                    generated_bg.save(bg_path, format="PNG")
            except Exception as e:
                error_html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Aurora AI - Error</title>
  <style>
    body {{ font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; }}
    .card {{ max-width: 480px; padding: 1.5rem; border-radius: 6px; border: 1px solid #fecaca; background: #fef2f2; }}
    h1 {{ margin-top: 0; color: #b91c1c; }}
    p {{ margin: 0.5rem 0; }}
    .btn {{ display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; border-radius: 4px; border: none; background: #2563eb; color: white; text-decoration: none; }}
    .btn:hover {{ background: #1d4ed8; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>Background generation error</h1>
    <p>{str(e)}</p>
    <a class="btn" href="/">Back to form</a>
  </div>
</body>
</html>
"""
                return HTMLResponse(content=error_html, status_code=400)

        with NamedTemporaryFile(dir=tmp_dir, suffix=".png", delete=False) as out_file:
            out_path = Path(out_file.name)

        aurora_inference.process_image(
            input_path=str(in_path),
            output_path=str(out_path),
            mode=mode,
            background_path=str(bg_path) if bg_path is not None else None,
        )

        with out_path.open("rb") as f:
            image_bytes = f.read()

        base_name = os.path.splitext(image.filename or "output")[0]
        out_filename = f"{base_name}_aurora.png"

        b64_image = base64.b64encode(image_bytes).decode("ascii")
        data_url = f"data:image/png;base64,{b64_image}"

        result_html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Aurora AI - Result</title>
  <style>
    body {{ font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; }}
    .actions {{ margin-bottom: 1rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }}
    .btn {{ padding: 0.5rem 1rem; border-radius: 4px; border: none; background: #2563eb; color: white; cursor: pointer; text-decoration: none; }}
    .btn:hover {{ background: #1d4ed8; }}
    img {{ max-width: 100%; height: auto; border-radius: 4px; border: 1px solid #e5e7eb; }}
  </style>
</head>
<body>
  <h1>Aurora AI - Result</h1>
  <div class="actions">
    <a class="btn" href="/"">Process another image</a>
    <a class="btn" href="{data_url}" download="{out_filename}">Download PNG</a>
  </div>
  <div>
    <img src="{data_url}" alt="Processed result" />
  </div>
</body>
</html>
"""
        return HTMLResponse(content=result_html)

    except Exception as e:
        error_html = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Aurora AI - Error</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; }
    .card { max-width: 480px; padding: 1.5rem; border-radius: 6px; border: 1px solid #fecaca; background: #fef2f2; }
    h1 { margin-top: 0; color: #b91c1c; }
    p { margin: 0.5rem 0; }
    .btn { display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; border-radius: 4px; border: none; background: #2563eb; color: white; text-decoration: none; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Processing error</h1>
    <p>Failed to process image. Please try a different file or adjust your settings.</p>
    <a class="btn" href="/">Back to form</a>
  </div>
</body>
</html>
"""
        return HTMLResponse(content=error_html, status_code=400)
