# Ligon — grammar and examples

Added files:
- `grammar/ligon.g4` — initial ANTLR4 grammar covering calls, member access, assignments, blocks, and `if(...).run` blocks.
- `examples/canonical_examples.ligon` — a normalized set of examples derived from `examples.txt`.

Quick next steps (Windows / PowerShell):

1. Install ANTLR tool (if not installed). Download `antlr-4.X-complete.jar` and place it somewhere accessible.

2. Generate a parser in your target language (example: Python3):

```powershell
# generate Python3 parser into 'gen' directory
java -jar path\to\antlr-4.X-complete.jar -Dlanguage=Python3 -o gen C:\Users\mykdz\OneDrive\Desktop\Ligon\grammar\ligon.g4
```

3. Use generated parser to parse `examples/canonical_examples.ligon` and iterate on grammar.

If you'd like, I can:
- produce a small Python runner that uses the generated parser to parse examples, or
- convert this grammar to a nearley/peg.js grammar instead.
 
Interpreter/runtime
-------------------

I added `tools/ligon_interpreter.py`, a minimal interpreter and runtime that can
parse and run a small subset of Ligon (primarily for 2D preview) and
`requirements.txt` with `pygame` for the 2D renderer. Usage:

```powershell
# install dependencies
pip install -r requirements.txt

# run a Ligon file (example included)
python tools/ligon_interpreter.py examples/canonical_examples.ligon
```

The interpreter supports `ligon.initialize("2d")`, `window.create(...)`,
`window.color(...)`, `ligon.draw(...):{ ligon.draw.create.rect(...) }`, basic
assignments, and `if(...).run:{}`. It's a small bootstrap — we can expand the
AST, expression evaluator, and add asset loading or a proper 3D renderer next.

Standalone usage
----------------

To produce a standalone runtime executable you can use PyInstaller. A helper
script is available at `tools/package_standalone.py`. Example (PowerShell):

```powershell
pip install pyinstaller
python tools/package_standalone.py --onefile --output dist\ligon
```

The produced executable is platform-specific. Use CI or build on each target
platform to create Windows/Linux/macOS builds.
