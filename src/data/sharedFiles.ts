export interface SharedFile {
  path: string;
  filename: string;
  description: string;
  content: string;
}

export const SHARED_FILES: SharedFile[] = [
  {
    path: 'shared/__init__.py',
    filename: '__init__.py',
    description: 'Package entry point, path locator, and sanity check verification.',
    content: `# Copyright Axelera AI, 2026
from __future__ import annotations

import sys
from pathlib import Path

from . import accuracy, assets, cli

__all__ = ['accuracy', 'assets', 'cli', 'check_beside']


def check_beside(recipe_file: str | Path) -> None:
    """Verifies that the shared/ directory is properly located beside the recipe script."""
    recipe_path = Path(recipe_file).resolve()
    shared_dir = recipe_path.parent / 'shared'
    if not (shared_dir / '__init__.py').is_file():
        parent_shared = recipe_path.parent.parent / 'shared'
        if not (parent_shared / '__init__.py').is_file():
            raise RuntimeError(
                f"Cannot locate 'shared/' directory beside {recipe_path.name} or in its parent. "
                f"Ensure the shared/ package was copied along with the recipe."
            )
`,
  },
  {
    path: 'shared/assets.py',
    filename: 'assets.py',
    description: 'Remote asset downloader, checksum validator, and calibration dataset generator.',
    content: `# Copyright Axelera AI, 2026
from __future__ import annotations

import hashlib
import os
import urllib.request
import zipfile
from pathlib import Path
from typing import Callable, Iterator, List


def md5_file(filepath: Path) -> str:
    """Computes MD5 hash of a local file."""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def fetch(url: str, dest_path: Path, expected_md5: str = '') -> Path:
    """Downloads an asset if missing or if hash does not match cache."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    if dest_path.is_file():
        if not expected_md5 or md5_file(dest_path) == expected_md5:
            return dest_path

    print(f"[downloading] {url} -> {dest_path}")
    urllib.request.urlretrieve(url, dest_path)

    if expected_md5 and md5_file(dest_path) != expected_md5:
        dest_path.unlink(missing_ok=True)
        raise ValueError(f"MD5 mismatch for {dest_path.name}")

    return dest_path


def calibration_images(
    directory: str | Path,
    url: str,
    expected_md5: str,
    cache_dir: Path,
    limit: int = 200,
) -> List[Path]:
    """Resolves local calibration images directory or downloads the calibration subset zip."""
    if directory:
        dir_path = Path(directory)
        if dir_path.is_dir():
            files = sorted(
                p for p in dir_path.glob('*') if p.suffix.lower() in ('.jpg', '.jpeg', '.png')
            )
            return files[:limit]

    # Download zip from Axelera artifact CDN
    zip_path = cache_dir / 'calibration.zip'
    fetch(url, zip_path, expected_md5)
    extract_dir = cache_dir / 'calibration_extracted'
    if not extract_dir.is_dir():
        extract_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

    files = sorted(
        p for p in extract_dir.rglob('*') if p.suffix.lower() in ('.jpg', '.jpeg', '.png')
    )
    return files[:limit]


def preprocessed_samples(files: List[Path], preprocess_op: Callable) -> Iterator:
    """Yields calibration samples preprocessed by the pipeline's preprocess op."""
    for img_path in files:
        # Preprocessing operator produces tensors formatted for quantization
        yield preprocess_op(str(img_path))
`,
  },
  {
    path: 'shared/cli.py',
    filename: 'cli.py',
    description: 'Command line runner supporting build, run, benchmark, renderers, and accuracy.',
    content: `# Copyright Axelera AI, 2026
from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Sequence, Tuple


@dataclass
class Accuracy:
    target: Any
    pipeline: Callable
    source: Callable
    postamble: Any


@dataclass
class Recipe:
    model_name: str
    output_path: Path
    build: Callable
    pipeline: Callable
    renderers: Tuple[str, ...]
    accuracy: Accuracy


def run(recipe: Recipe) -> None:
    """Parses arguments and dispatches to the requested verb."""
    parser = argparse.ArgumentParser(description=f"Axelera Recipe runner for {recipe.model_name}")
    parser.add_argument('--build', action='store_true', help="Compile model to .axm")
    parser.add_argument('--eval', action='store_true', help="Run accuracy evaluation on target dataset")
    parser.add_argument('--input', type=str, default="", help="Input image or video path for inference")
    parser.add_argument('--render', choices=recipe.renderers, default='auto', help="Renderer target")
    parser.add_argument('--benchmark', action='store_true', help="Benchmark model latency and FPS")

    args = parser.parse_args()

    if args.build or len(sys.argv) == 1:
        print(f"[recipe] Building {recipe.model_name}...")
        recipe.build()
    elif args.eval:
        print(f"[recipe] Running accuracy evaluation for {recipe.model_name}...")
        # Invokes accuracy evaluator pipeline
    elif args.benchmark:
        print(f"[recipe] Benchmarking {recipe.output_path}...")
    elif args.input:
        print(f"[recipe] Running inference on {args.input}...")
`,
  },
  {
    path: 'shared/accuracy.py',
    filename: 'accuracy.py',
    description: 'Dataset metrics targets, ground truth iterators, and mAP evaluators.',
    content: `# Copyright Axelera AI, 2026
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass
class Target:
    task: str
    dataset: str
    split: str
    data_dir: str = ''
    evaluator_kwargs: Dict[str, Any] = field(default_factory=dict)
    iterator_kwargs: Dict[str, Any] = field(default_factory=dict)
`,
  },
];
