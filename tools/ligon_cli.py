#!/usr/bin/env python3
"""Simple Ligon CLI build tool.

Usage examples:
  python tools/ligon_cli.py build path\to\project path\to\build
  python tools/ligon_cli.py --build path\to\project path\to\build

This tool bundles `.ligon` files and common asset types into a build folder
and emits a `manifest.json`. It is intentionally minimal — replace or
integrate with an actual compiler or packager later.
"""

import argparse
import json
import shutil
from pathlib import Path
import sys


ASSET_EXTS = {'.ligon', '.lua', '.py', '.json', '.png', '.jpg', '.jpeg', '.obj', '.fbx', '.wav', '.ogg'}


def detect_mode(files):
    # Simple heuristic: scan .ligon files for initialize("2d") or "3d"
    for f in files:
        if f.suffix.lower() == '.ligon':
            try:
                text = f.read_text(encoding='utf-8')
            except Exception:
                continue
            if 'initialize("2d")' in text or 'initialize(\"2d\")' in text:
                return '2d'
            if 'initialize("3d")' in text or 'initialize(\"3d\")' in text:
                return '3d'
    return 'unknown'


def collect_files(src: Path):
    all_files = [p for p in src.rglob('*') if p.is_file()]
    picked = []
    for p in all_files:
        if p.suffix.lower() in ASSET_EXTS:
            picked.append(p)
    return picked


def build_project(src: Path, out: Path, make_zip: bool = True):
    if not src.exists():
        print(f"Source path does not exist: {src}")
        return 2

    files = collect_files(src)
    mode = detect_mode(files)

    out.mkdir(parents=True, exist_ok=True)

    copied = []
    for f in files:
        rel = f.relative_to(src)
        dest = out / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(f, dest)
        copied.append(str(rel).replace('\\', '/'))

    manifest = {
        'project': str(src.resolve()),
        'files': copied,
        'mode': mode,
    }

    manifest_path = out / 'manifest.json'
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')

    if make_zip:
        zip_path = out.with_suffix('.zip')
        if zip_path.exists():
            zip_path.unlink()
        shutil.make_archive(str(out), 'zip', root_dir=out)
        print(f'Created archive: {zip_path}')

    print(f'Built {len(copied)} files to {out} (mode={mode})')
    print(f'Manifest: {manifest_path}')
    return 0


def main(argv=None):
    argv = argv or sys.argv[1:]
    parser = argparse.ArgumentParser(prog='ligon', description='Ligon CLI')
    parser.add_argument('--build', nargs=2, metavar=('SRC', 'OUT'), help='Build project: SRC OUT')

    subparsers = parser.add_subparsers(dest='cmd')
    pbuild = subparsers.add_parser('build', help='Build project')
    pbuild.add_argument('src')
    pbuild.add_argument('out')

    args = parser.parse_args(argv)

    if args.build:
        src, out = Path(args.build[0]), Path(args.build[1])
        return build_project(src, out)

    if args.cmd == 'build':
        return build_project(Path(args.src), Path(args.out))

    parser.print_help()
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
