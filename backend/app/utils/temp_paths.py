import os
import tempfile
from pathlib import Path


def temp_dir() -> Path:
    return Path(tempfile.gettempdir())


def make_temp_file(suffix: str = ".tmp") -> Path:
    fd, path = tempfile.mkstemp(suffix=suffix, dir=temp_dir())
    os.close(fd)
    return Path(path)


def cleanup_paths(*paths: Path) -> None:
    for path in paths:
        if path is None:
            continue
        try:
            if path.exists():
                path.unlink()
        except (OSError, FileNotFoundError):
            pass

