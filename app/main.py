import os
import base64
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse

from src import inference as aurora_inference

app = FastAPI(
    title="Aurora AI",
    description="Background removal and background replacement using InSPyReNet.",
    version="0.1.0",
)

@app.on_event("startup")
async def load_model_on_startup() -> None:
    aurora_inference.get_model(None)

HTML_FORM = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Aurora AI - Background Removal</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; }
    form { display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px; }
    label { font-weight: 600; }
    input[type="file"] { padding: 0.25rem 0; }
    button { padding: 0.5rem 1rem; border-radius: 4px; border: none; background: #2563eb; color: white; cursor: pointer; }
    button:hover { background: #1d4ed8; }
    #status { margin-top: 0.5rem; color: #555; font-size: 0.9rem; display: none; }
  </style>
  <script>
    function onSubmitForm() {
      const status = document.getElementById('status');
      if (status) status.style.display = 'block';
    }
  </script>
</head>
<body>
  <h1>Aurora AI - Background Removal</h1>
  <form action="/process" method="post" enctype="multipart/form-data" onsubmit="onSubmitForm()">
    <label>Main image (required)</label>
    <input type="file" name="image" accept="image/*" required />

    <label>Background image (optional)</label>
    <input type="file" name="background" accept="image/*" />

    <label>
      <input type="checkbox" name="no_postprocess" />
      Skip mask post-processing (thresholding + smoothing)
    </label>

    <button type="submit">Process</button>
    <div id="status">Processing… please wait.</div>
  </form>
  <p>The processed PNG will be shown inline with a download link.</p>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
async def index() -> HTMLResponse:
    return HTMLResponse(content=HTML_FORM)

@app.post("/process")
async def process_image(
    image: UploadFile = File(...),
    background: UploadFile | None = File(None),
    no_postprocess: bool = Form(False),
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
        if background is not None:
            bg_contents = await background.read()
            if bg_contents:
                bg_suffix = os.path.splitext(background.filename or "")[1] or ".png"
                with NamedTemporaryFile(dir=tmp_dir, suffix=bg_suffix, delete=False) as bg_file:
                    bg_path = Path(bg_file.name)
                    bg_file.write(bg_contents)

        with NamedTemporaryFile(dir=tmp_dir, suffix=".png", delete=False) as out_file:
            out_path = Path(out_file.name)

        aurora_inference.remove_background(
            input_path=str(in_path),
            output_path=str(out_path),
            model_path=None,
            background_path=str(bg_path) if bg_path is not None else None,
            no_postprocess=no_postprocess,
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

    except Exception:
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