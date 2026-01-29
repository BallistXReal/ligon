#!/usr/bin/env python3
"""Helper to build a standalone Ligon interpreter executable using PyInstaller.

Usage:
  python tools/package_standalone.py --output dist\ligon

This script is a convenience wrapper. It requires `pyinstaller` to be
installed in the current environment. It will produce a single-file
executable (`--onefile`) for the current platform.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def main(argv=None):
    argv = argv or sys.argv[1:]
    p = argparse.ArgumentParser()
    p.add_argument('--output', '-o', help='Output base name (folder will be created)', default='dist/ligon')
    p.add_argument('--onefile', action='store_true', help='Use PyInstaller --onefile')
    args = p.parse_args(argv)

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    cmd = [sys.executable, '-m', 'PyInstaller']
    if args.onefile:
        cmd += ['--onefile']
    # entrypoint is the interpreter
    entry = str(Path(__file__).parent / 'ligon_interpreter.py')
    cmd += ['--name', out.stem, entry]

    print('Running:', ' '.join(cmd))
    try:
        subprocess.check_call(cmd)
    except subprocess.CalledProcessError as e:
        print('PyInstaller failed:', e)
        return 2

    print('Standalone build completed. Check `dist` and `build` directories created by PyInstaller.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
