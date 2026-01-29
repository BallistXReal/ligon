#!/usr/bin/env python3
"""Minimal Ligon interpreter/runtime for 2D apps (pygame).

Supports a small subset derived from examples:
- ligon.initialize("2d"|"3d")
- window.create(name, width, height)
- window.color.set(r,g,b) or window.color(r,g,b)
- ligon.draw("name"):{ ... } blocks with `ligon.draw.create.rect(x,y,w,h)` and `ligon.draw.color(r,g,b)`
- render.model(path) (no-op for runtime, prints)
- assignments: `var = 123` or `var = "string"`
- if (expr).run:{ ... } with simple comparisons using variables

This is intentionally small and brittle — it's a bootstrap runtime you can
extend. To run 2D examples you need `pygame` installed (see requirements.txt).
"""

from pathlib import Path
import re
import argparse
import sys
import json

try:
    import pygame
except Exception:
    pygame = None


def strip_comments(text):
    return '\n'.join(line.split('//', 1)[0] for line in text.splitlines())


class Node:
    pass


class Assignment(Node):
    def __init__(self, name, expr):
        self.name = name
        self.expr = expr


class Call(Node):
    def __init__(self, target, args, block=None):
        self.target = target
        self.args = args
        self.block = block or []


class IfRun(Node):
    def __init__(self, condition, block):
        self.condition = condition
        self.block = block


def parse_args(s: str):
    # split by commas but ignore commas in strings
    args = []
    cur = ''
    in_str = False
    esc = False
    for ch in s:
        if ch == '"' and not esc:
            in_str = not in_str
            cur += ch
            continue
        if ch == ',' and not in_str:
            args.append(cur.strip())
            cur = ''
            continue
        if ch == '\\' and not esc:
            esc = True
            cur += ch
            continue
        esc = False
        cur += ch
    if cur.strip():
        args.append(cur.strip())
    return [parse_literal(a) for a in args]


def parse_literal(token: str):
    token = token.strip()
    if not token:
        return None
    if token.startswith('"') and token.endswith('"'):
        return token[1:-1]
    # number
    try:
        if '.' in token:
            return float(token)
        return int(token)
    except Exception:
        # variable reference
        return ('var', token)


def find_block(lines, start_idx, start_pos=None):
    # Return (content_lines, end_idx)
    # start_pos unused; we operate on line granularity
    brace_count = 0
    collected = []
    i = start_idx
    started = False
    while i < len(lines):
        line = lines[i]
        for ch in line:
            if ch == '{':
                brace_count += 1
                started = True
            elif ch == '}':
                brace_count -= 1
        if started:
            collected.append(line)
        if started and brace_count == 0:
            # drop the outermost braces
            inner = '\n'.join(collected)
            # remove first and last braces
            first = inner.find('{')
            last = inner.rfind('}')
            body = inner[first+1:last]
            return body.splitlines(), i
        i += 1
    raise SyntaxError('Unterminated block')


def parse_text(text):
    text = strip_comments(text)
    lines = text.splitlines()
    i = 0
    nodes = []
    while i < len(lines):
        line = lines[i].strip()
        i += 1
        if not line:
            continue

        # if.run block
        m = re.match(r'^if\s*\((.*?)\)\.run\s*:\s*\{', line)
        if m:
            cond = m.group(1).strip()
            body_lines, end_idx = find_block(lines, i-1)
            i = end_idx + 1
            nodes.append(IfRun(cond, parse_text('\n'.join(body_lines))))
            continue

        # call with block like ligon.draw("x"):{
        m = re.match(r'^([\w\.\"/\\\-]+)\s*\((.*?)\)\s*:\s*\{', line)
        if m:
            target = m.group(1).strip()
            args = parse_args(m.group(2)) if m.group(2).strip() else []
            body_lines, end_idx = find_block(lines, i-1)
            i = end_idx + 1
            nodes.append(Call(target, args, parse_text('\n'.join(body_lines))))
            continue

        # simple call without block
        m = re.match(r'^([\w\.\"/\\\-]+)\s*\((.*?)\)\s*[:;]?', line)
        if m:
            target = m.group(1).strip()
            args = parse_args(m.group(2)) if m.group(2).strip() else []
            nodes.append(Call(target, args))
            continue

        # assignment
        m = re.match(r'^([a-zA-Z_]\w*)\s*=\s*(.+?)\s*[:;]?$', line)
        if m:
            name = m.group(1)
            expr = parse_literal(m.group(2).strip())
            nodes.append(Assignment(name, expr))
            continue

        # service decl like ligon.getservice{example}
        m = re.match(r'^([\w\.]+)\s*\{\s*([\w]+)\s*\}\s*[:;]?', line)
        if m:
            target = m.group(1)
            arg = m.group(2)
            nodes.append(Call(target, [arg]))
            continue

        # fallback: ignore
    return nodes


class Runtime:
    def __init__(self):
        self.vars = {}
        self.mode = 'unknown'
        self.windows = {}
        self.main_window = None
        self.bg_color = (0, 0, 0)
        self.draw_color = (255, 255, 255)
        self.rects = []
        self.sprites = {}  # name -> {path, pos, vel, frames, frame_idx, image}
        self.physics = {'gravity': 0.0}
        self.key_state = {}

    def eval_arg(self, a):
        if isinstance(a, tuple) and a[0] == 'var':
            name = a[1]
            return self.vars.get(name, 0)
        return a

    def eval_expr_for_condition(self, expr: str):
        # Very small safe evaluator: allow variables and comparison operators
        try:
            # build locals mapping
            safe_locals = dict(self.vars)
            # replace var refs like player.health with dict lookups? simple approach: disallow dotted names
            return bool(eval(expr, { }, safe_locals))
        except Exception:
            # fallback
            return False

    def handle_call(self, call: Call):
        t = call.target
        # normalize string targets like "ligon.draw" or ligon.draw
        t = t.strip()
        # handlers
        if t.startswith('ligon.initialize') or t == 'ligon.initialize':
            if call.args:
                a0 = self.eval_arg(call.args[0])
                self.mode = str(a0)
        elif t.startswith('window.create'):
            if len(call.args) >= 3:
                name = self.eval_arg(call.args[0])
                w = int(self.eval_arg(call.args[1]))
                h = int(self.eval_arg(call.args[2]))
                self.windows[name] = {'w': w, 'h': h}
                if self.main_window is None:
                    self.main_window = name
        elif t.startswith('window.color.set') or t.startswith('window.color'):
            if len(call.args) >= 3:
                r = int(self.eval_arg(call.args[0]))
                g = int(self.eval_arg(call.args[1]))
                b = int(self.eval_arg(call.args[2]))
                self.bg_color = (r, g, b)
        elif t.startswith('ligon.draw'):
            # block contents will be processed; nothing to do here
            for node in call.block:
                self.execute_node(node)
        elif t.startswith('ligon.draw.create.rect'):
            if len(call.args) >= 4:
                x = int(self.eval_arg(call.args[0]))
                y = int(self.eval_arg(call.args[1]))
                w = int(self.eval_arg(call.args[2]))
                h = int(self.eval_arg(call.args[3]))
                self.rects.append({'rect': (x, y, w, h), 'color': self.draw_color})
        elif t.startswith('ligon.draw.create'):
            # allow ligon.draw.create.rect pattern caught earlier
            for node in call.block:
                self.execute_node(node)
        elif t.startswith('ligon.draw.color') or t.startswith('ligon.draw.color.set'):
            if len(call.args) >= 3:
                r = int(self.eval_arg(call.args[0]))
                g = int(self.eval_arg(call.args[1]))
                b = int(self.eval_arg(call.args[2]))
                self.draw_color = (r, g, b)
        elif t.startswith('render.model'):
            if call.args:
                print('Render model:', self.eval_arg(call.args[0]))
        elif t.startswith('ligon.getservice'):
            if call.args:
                print('Register service:', self.eval_arg(call.args[0]))
        elif t.startswith('ligon.sprite.create'):
            # ligon.sprite.create(name, "path", x, y)
            if len(call.args) >= 4:
                name = self.eval_arg(call.args[0])
                path = self.eval_arg(call.args[1])
                x = float(self.eval_arg(call.args[2]))
                y = float(self.eval_arg(call.args[3]))
                self.sprites[name] = {'path': path, 'pos': [x, y], 'vel': [0.0, 0.0], 'frames': [], 'frame_idx': 0, 'image': None}
        elif t.startswith('ligon.sprite.set_velocity'):
            # ligon.sprite.set_velocity(name, vx, vy)
            if len(call.args) >= 3:
                name = self.eval_arg(call.args[0])
                vx = float(self.eval_arg(call.args[1]))
                vy = float(self.eval_arg(call.args[2]))
                if name in self.sprites:
                    self.sprites[name]['vel'] = [vx, vy]
        elif t.startswith('ligon.sprite.animate'):
            # ligon.sprite.animate(name, "frame1.png", "frame2.png", ...)
            if len(call.args) >= 2:
                name = self.eval_arg(call.args[0])
                frames = [self.eval_arg(a) for a in call.args[1:]]
                if name in self.sprites:
                    self.sprites[name]['frames'] = frames
        elif t.startswith('physics.gravity') or t.startswith('physics.set_gravity'):
            if call.args:
                g = float(self.eval_arg(call.args[0]))
                self.physics['gravity'] = g
        elif t.startswith('input.map_key') or t.startswith('input.on_key'):
            # input.map_key("SPACE", "jump") will set var key_jump True when pressed
            if len(call.args) >= 2:
                keyname = str(self.eval_arg(call.args[0])).upper()
                varname = str(self.eval_arg(call.args[1]))
                self.key_state[keyname] = {'var': varname, 'pressed': False}
        else:
            # generic or unknown call
            pass

    def execute_node(self, node: Node):
        if isinstance(node, Assignment):
            val = node.expr
            if isinstance(val, tuple) and val[0] == 'var':
                self.vars[node.name] = self.vars.get(val[1], 0)
            else:
                self.vars[node.name] = val
        elif isinstance(node, Call):
            self.handle_call(node)
        elif isinstance(node, IfRun):
            if self.eval_expr_for_condition(node.condition):
                for n in node.block:
                    self.execute_node(n)

    def run(self, nodes):
        # execute AST
        for n in nodes:
            self.execute_node(n)

        # if 2d and pygame available, open window and draw
        if str(self.mode).lower().startswith('2') or self.mode == '2d' or self.mode == '"2d"':
            if pygame is None:
                print('pygame not installed. Install with: pip install -r requirements.txt')
                return 3
            if not self.main_window:
                # default window
                self.main_window = 'main'
                self.windows[self.main_window] = {'w': 800, 'h': 600}

            w = self.windows[self.main_window]['w']
            h = self.windows[self.main_window]['h']
            pygame.init()
            screen = pygame.display.set_mode((w, h))
            pygame.display.set_caption('Ligon - Preview')
            clock = pygame.time.Clock()
            running = True

            # load sprite images if any
            for name, s in self.sprites.items():
                try:
                    if s['frames']:
                        s['image'] = pygame.image.load(s['frames'][0]).convert_alpha()
                    elif s['path']:
                        s['image'] = pygame.image.load(s['path']).convert_alpha()
                except Exception:
                    s['image'] = None

            while running:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                # keyboard state
                pressed = pygame.key.get_pressed()
                # update key_state mapping
                for keyname, mapping in list(self.key_state.items()):
                    try:
                        k = getattr(pygame, 'K_' + keyname.lower())
                        is_pressed = bool(pressed[k])
                        self.vars[mapping['var']] = is_pressed
                    except Exception:
                        # unknown key name
                        pass

                # physics update: gravity and velocity
                for name, s in self.sprites.items():
                    vx, vy = s['vel']
                    # apply gravity to vy
                    vy += self.physics.get('gravity', 0.0) / 60.0
                    s['vel'][1] = vy
                    s['pos'][0] += vx / 60.0
                    s['pos'][1] += vy / 60.0

                screen.fill(self.bg_color)
                # draw rects
                for r in self.rects:
                    pygame.draw.rect(screen, r['color'], r['rect'])

                # draw sprites
                for name, s in self.sprites.items():
                    if s['image']:
                        img = s['image']
                        x, y = int(s['pos'][0]), int(s['pos'][1])
                        screen.blit(img, (x, y))
                    else:
                        # placeholder box
                        x, y = int(s['pos'][0]), int(s['pos'][1])
                        pygame.draw.rect(screen, (200, 200, 200), (x, y, 32, 32))

                pygame.display.flip()
                clock.tick(60)

            pygame.quit()
            return 0


def main(argv=None):
    argv = argv or sys.argv[1:]
    p = argparse.ArgumentParser(prog='ligon-run', description='Run a Ligon file (small subset)')
    p.add_argument('file', help='Path to .ligon file')
    args = p.parse_args(argv)

    path = Path(args.file)
    if not path.exists():
        print('File not found:', path)
        return 2

    text = path.read_text(encoding='utf-8')
    nodes = parse_text(text)
    rt = Runtime()
    return rt.run(nodes) or 0


if __name__ == '__main__':
    raise SystemExit(main())
