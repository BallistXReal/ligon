Ligon build tool
=================

This repo includes a minimal CLI at `tools/ligon_cli.py` that provides a
convenience build command for Ligon projects. It's intentionally simple and
meant as a starting point for a proper compiler/packager.

Usage (PowerShell / CMD):

```powershell
# build using subcommand
python tools/ligon_cli.py build C:\path\to\project C:\path\to\out\build

# or use the legacy flag form
python tools/ligon_cli.py --build C:\path\to\project C:\path\to\out\build
```

Output:
- copies `.ligon` and common asset files into the build folder
- writes `manifest.json` with file list and detected mode (`2d`, `3d`, or `unknown`)
- produces `build.zip` (same name as the build folder, with `.zip`)

Notes & next steps:
- Integrate the ANTLR-generated parser to validate `.ligon` files during build.
- Add platform targets (Windows, Linux, Web) and optional compilation steps.
- Add asset processing (texture compression, model conversion) and dependency graphs.

Standalone packaging
--------------------

You can produce a standalone executable (one file) using PyInstaller. A helper
script is provided at `tools/package_standalone.py` which invokes PyInstaller on
the interpreter. Example:

```powershell
# install pyinstaller in the same environment
pip install pyinstaller

# produce a one-file executable (platform-specific)
python tools/package_standalone.py --onefile --output dist\ligon
```

The created executable will be platform-specific. Test on target platforms or
use CI (GitHub Actions) to create multi-platform releases.
