import os
from io import BytesIO
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse, StreamingResponse

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
  </style>
</head>
<body>
  <h1>Aurora AI - Background Removal</h1>
  <form action="/process" method="post" enctype="multipart/form-data">
    <label>Main image (required)</label>
    <input type="file" name="image" accept="image/*" required />

    <label>Background image (optional)</label>
    <input type="file" name="background" accept="image/*" />

    <label>
      <input type="checkbox" name="no_postprocess" />
      Skip mask post-processing (thresholding + smoothing)
    </label>

    <button type="submit">Process</button>
  </form>
  <p>Response will be a PNG image download.</p>
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

    return StreamingResponse(
        BytesIO(image_bytes),
        media_type="image/png",
        headers={"Content-Disposition": f'inline; filename="{out_filename}"'},
    )