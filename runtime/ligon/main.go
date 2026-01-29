package main

import (
    "bufio"
    "fmt"
    "image"
    "image/color"
    "image/draw"
    "log"
    "math"
    "os"
    "regexp"
    "strconv"
    "strings"

    "github.com/hajimehoshi/ebiten/v2"
    "github.com/hajimehoshi/ebiten/v2/ebitenutil"
)

// Very small line-based parser/runtime for the core Ligon subset.
// Not a full language implementation — a bootstrap 2D runtime using Ebiten.

type Sprite struct {
    Img *ebiten.Image
    X, Y float64
    VX, VY float64
    Frames []*ebiten.Image
    FrameIdx int
}

type Runtime struct {
    Mode string
    Width, Height int
    BG color.RGBA
    Rects []image.Rectangle
    RectColor color.RGBA
    Sprites map[string]*Sprite
    Gravity float64
    keys map[ebiten.Key]bool
}

func NewRuntime() *Runtime {
    return &Runtime{
        Mode: "2d",
        Width: 800,
        Height: 600,
        BG: color.RGBA{0, 0, 0, 255},
        RectColor: color.RGBA{255, 255, 255, 255},
        Sprites: map[string]*Sprite{},
        Gravity: 0,
        keys: map[ebiten.Key]bool{},
    }
}

// Procedurally generate a green cat face image (64x64).
func makeGreenCat() *ebiten.Image {
    w, h := 128, 128
    img := image.NewRGBA(image.Rect(0,0,w,h))
    // fill transparent
    draw.Draw(img, img.Bounds(), &image.Uniform{color.RGBA{0,0,0,0}}, image.Point{}, draw.Src)

    // face: green oval
    cx, cy := float64(w)/2, float64(h)/2
    rx, ry := float64(w)*0.35, float64(h)*0.45
    for y:=0; y<h; y++ {
        for x:=0; x<w; x++ {
            dx := (float64(x)-cx)/rx
            dy := (float64(y)-cy)/ry
            if dx*dx+dy*dy <= 1.0 {
                img.Set(x,y, color.RGBA{34,177,76,255}) // green
            }
        }
    }

    // ears: green triangles
    // left ear
    for y:=0; y<h; y++ {
        for x:=0; x<w; x++ {
            if x > 14 && x < 54 && y > 4 && y < 44 {
                // simple triangle region
                if float64(y) < 60 - 0.6*float64(x) {
                    img.Set(x,y, color.RGBA{34,177,76,255})
                }
            }
        }
    }
    // right ear (mirrored)
    for y:=0; y<h; y++ {
        for x:=0; x<w; x++ {
            if x > 74 && x < 114 && y > 4 && y < 44 {
                if float64(y) < 0.6*float64(x) - 40 {
                    img.Set(x,y, color.RGBA{34,177,76,255})
                }
            }
        }
    }

    // eyes: green with black pupil
    drawCircle(img, 46, 56, 10, color.RGBA{0,255,0,255})
    drawCircle(img, 82, 56, 10, color.RGBA{0,255,0,255})
    drawCircle(img, 46, 56, 4, color.RGBA{0,0,0,255})
    drawCircle(img, 82, 56, 4, color.RGBA{0,0,0,255})

    // nose
    drawCircle(img, 64, 76, 6, color.RGBA{255,0,0,255})

    // return ebiten image
    return ebiten.NewImageFromImage(img)
}

func drawCircle(img *image.RGBA, cx, cy, r int, c color.RGBA) {
    for y:=cy-r; y<=cy+r; y++ {
        for x:=cx-r; x<=cx+r; x++ {
            dx := x-cx
            dy := y-cy
            if dx*dx+dy*dy <= r*r {
                if x>=0 && x<img.Rect.Dx() && y>=0 && y<img.Rect.Dy() {
                    img.Set(x,y,c)
                }
            }
        }
    }
}

func (rt *Runtime) Update() error {
    // update sprites: apply velocity and gravity
    for _, s := range rt.Sprites {
        s.VY += rt.Gravity/60.0
        s.X += s.VX/60.0
        s.Y += s.VY/60.0
        // simple frame advance
        if len(s.Frames) > 1 {
            s.FrameIdx = (s.FrameIdx + 1) % len(s.Frames)
            s.Img = s.Frames[s.FrameIdx]
        }
    }
    return nil
}

func (rt *Runtime) Draw(screen *ebiten.Image) {
    screen.Fill(rt.BG)
    // draw rects
    for _, r := range rt.Rects {
        ebitenutil.DrawRect(screen, float64(r.Min.X), float64(r.Min.Y), float64(r.Dx()), float64(r.Dy()), rt.RectColor)
    }
    // draw sprites
    for _, s := range rt.Sprites {
        if s.Img != nil {
            op := &ebiten.DrawImageOptions{}
            op.GeoM.Translate(s.X, s.Y)
            screen.DrawImage(s.Img, op)
        } else {
            ebitenutil.DrawRect(screen, s.X, s.Y, 16, 16, color.RGBA{200,200,200,255})
        }
    }
}

func (rt *Runtime) Layout(outsideWidth, outsideHeight int) (int, int) {
    return rt.Width, rt.Height
}

// Very small parser: handles a few call forms and blocks
func parseAndRun(path string, rt *Runtime) error {
    data, err := os.ReadFile(path)
    if err != nil { return err }
    lines := strings.Split(string(data), "\n")
    reCall := regexp.MustCompile(`^([\w\.\"/\\\-]+)\s*\((.*?)\)\s*[:;]?`)
    reBlockStart := regexp.MustCompile(`^([\w\.\"/\\\-]+)\s*\((.*?)\)\s*:\s*\{`)
    reAssign := regexp.MustCompile(`^([a-zA-Z_]\w*)\s*=\s*(.+?)\s*[:;]?$`)

    i := 0
    for i < len(lines) {
        line := strings.TrimSpace(lines[i])
        i++
        if line == "" { continue }
        // block
        if m := reBlockStart.FindStringSubmatch(line); m != nil {
            head := m[1]
            args := m[2]
            // find block end by braces
            depth := 0
            blockLines := []string{}
            // include current line's brace content
            for i-1 < len(lines) {
                l := lines[i-1]
                for _, ch := range l {
                    if ch == '{' { depth++ }
                    if ch == '}' { depth-- }
                }
                blockLines = append(blockLines, l)
                i++
                if depth == 0 { break }
            }
            // handle head
            runCall(head, args, blockLines, rt)
            continue
        }

        if m := reCall.FindStringSubmatch(line); m != nil {
            head := m[1]
            args := m[2]
            runCall(head, args, nil, rt)
            continue
        }

        if m := reAssign.FindStringSubmatch(line); m != nil {
            // assignments ignored in this runtime bootstrap
            continue
        }
    }
    return nil
}

func runCall(head, args string, block []string, rt *Runtime) {
    h := strings.TrimSpace(head)
    a := parseArgs(args)
    switch {
    case strings.HasPrefix(h, "ligon.initialize"):
        if len(a) > 0 {
            rt.Mode = fmt.Sprint(a[0])
        }
    case strings.HasPrefix(h, "window.create"):
        if len(a) >= 3 {
            name := fmt.Sprint(a[0])
            w := toInt(a[1], 800)
            h := toInt(a[2], 600)
            _ = name
            rt.Width = w
            rt.Height = h
        }
    case strings.HasPrefix(h, "window.color"):
        if len(a) >= 3 {
            r := toInt(a[0], 0)
            g := toInt(a[1], 0)
            b := toInt(a[2], 0)
            rt.BG = color.RGBA{uint8(r), uint8(g), uint8(b), 255}
        }
    case strings.HasPrefix(h, "ligon.draw"):
        // parse block inside for draw commands
        for _, bl := range block {
            bl = strings.TrimSpace(bl)
            if strings.HasPrefix(bl, "ligon.draw.color") {
                m := regexp.MustCompile(`\((.*?)\)`).FindStringSubmatch(bl)
                if len(m) >= 2 {
                    parts := parseArgs(m[1])
                    if len(parts) >= 3 {
                        r := toInt(parts[0],255)
                        g := toInt(parts[1],255)
                        b := toInt(parts[2],255)
                        rt.RectColor = color.RGBA{uint8(r), uint8(g), uint8(b),255}
                    }
                }
            }
            if strings.Contains(bl, "ligon.draw.create.rect") {
                m := regexp.MustCompile(`\((.*?)\)`).FindStringSubmatch(bl)
                if len(m) >= 2 {
                    parts := parseArgs(m[1])
                    if len(parts) >= 4 {
                        x := toInt(parts[0],10)
                        y := toInt(parts[1],10)
                        w := toInt(parts[2],10)
                        h := toInt(parts[3],10)
                        rt.Rects = append(rt.Rects, image.Rect(x,y,x+w,y+h))
                    }
                }
            }
        }
    case strings.HasPrefix(h, "ligon.sprite.create"):
        // ligon.sprite.create(name, "path", x, y) or (name, x, y) use generated cat
        if len(a) >= 3 {
            name := fmt.Sprint(a[0])
            var img *ebiten.Image
            if len(a) >= 4 {
                // path given - ignored in this bootstrap
                img = makeGreenCat()
            } else {
                img = makeGreenCat()
            }
            s := &Sprite{Img: img, X: float64(toInt(a[1],0)), Y: float64(toInt(a[2],0))}
            rt.Sprites[name] = s
        }
    case strings.HasPrefix(h, "physics.set_gravity"):
        if len(a) >= 1 {
            rt.Gravity = toFloat(a[0], 0)
        }
    }
}

func toInt(v interface{}, d int) int {
    switch t := v.(type) {
    case int:
        return t
    case float64:
        return int(t)
    case string:
        if iv, err := strconv.Atoi(t); err == nil { return iv }
    }
    return d
}

func toFloat(v interface{}, d float64) float64 {
    switch t := v.(type) {
    case int:
        return float64(t)
    case float64:
        return t
    case string:
        if fv, err := strconv.ParseFloat(t,64); err == nil { return fv }
    }
    return d
}

func parseArgs(s string) []interface{} {
    s = strings.TrimSpace(s)
    if s == "" { return nil }
    parts := []interface{}{}
    cur := ""
    inStr := false
    for i:=0;i<len(s);i++ {
        ch := s[i]
        if ch == '"' {
            inStr = !inStr
            cur += string(ch)
            continue
        }
        if ch == ',' && !inStr {
            parts = append(parts, parseLiteral(strings.TrimSpace(cur)))
            cur = ""
            continue
        }
        cur += string(ch)
    }
    if strings.TrimSpace(cur) != "" {
        parts = append(parts, parseLiteral(strings.TrimSpace(cur)))
    }
    return parts
}

func parseLiteral(tok string) interface{} {
    tok = strings.TrimSpace(tok)
    if tok == "" { return nil }
    if strings.HasPrefix(tok, "\"") && strings.HasSuffix(tok, "\"") {
        return tok[1:len(tok)-1]
    }
    if strings.Contains(tok, ".") {
        if f, err := strconv.ParseFloat(tok, 64); err == nil { return f }
    }
    if i, err := strconv.Atoi(tok); err == nil { return i }
    return tok
}

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: ligon <file.ligon>")
        os.Exit(2)
    }
    path := os.Args[1]
    rt := NewRuntime()
    if err := parseAndRun(path, rt); err != nil {
        log.Fatal(err)
    }

    ebiten.SetWindowSize(rt.Width, rt.Height)
    ebiten.SetWindowTitle("Ligon Runtime")
    game := rt
    if err := ebiten.RunGame(game); err != nil {
        log.Fatal(err)
    }
}
