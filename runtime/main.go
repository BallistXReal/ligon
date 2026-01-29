package main

import (
    "image"
    "image/color"
    "image/png"
    "io/ioutil"
    "log"
    "math"
    "os"
    "strings"

    "github.com/hajimehoshi/ebiten/v2"
    "github.com/hajimehoshi/ebiten/v2/ebitenutil"
)

type Rect struct{ X, Y, W, H int; C color.RGBA }

type Game struct {
    bg color.RGBA
    rects []Rect
    catImg *ebiten.Image
}

func drawCatSVGImage(w, h int) image.Image {
    img := image.NewRGBA(image.Rect(0,0,w,h))
    // green background transparent
    // draw green oval face
    cx, cy := w/2, h/2
    rx, ry := int(float64(w)*0.36), int(float64(h)*0.44)
    for y:=0;y<h;y++{
        for x:=0;x<w;x++{
            dx := float64(x-cx)
            dy := float64(y-cy)
            if (dx*dx)/float64(rx*rx)+(dy*dy)/float64(ry*ry) <= 1.0 {
                // face color
                img.Set(x,y,color.RGBA{G:200, R:34, B:34, A:255})
            }
        }
    }
    // ears as green triangles
    drawFilledTriangle(img, cx-rx, cy-ry/2, cx-rx/2, cy-ry-10, cx, cy-ry/2, color.RGBA{G:180, R:20, B:20, A:255})
    drawFilledTriangle(img, cx+rx, cy-ry/2, cx+rx/2, cy-ry-10, cx, cy-ry/2, color.RGBA{G:180, R:20, B:20, A:255})
    // eyes: green with black pupils
    drawFilledCircle(img, cx - rx/3, cy - ry/8, int(float64(rx)*0.18), color.RGBA{G:255, R:100, B:100, A:255})
    drawFilledCircle(img, cx + rx/3, cy - ry/8, int(float64(rx)*0.18), color.RGBA{G:255, R:100, B:100, A:255})
    drawFilledCircle(img, cx - rx/3, cy - ry/8, int(float64(rx)*0.07), color.Black)
    drawFilledCircle(img, cx + rx/3, cy - ry/8, int(float64(rx)*0.07), color.Black)
    return img
}

func drawFilledCircle(img *image.RGBA, cx, cy, r int, c color.Color) {
    for y:=cy-r; y<=cy+r; y++ {
        for x:=cx-r; x<=cx+r; x++ {
            dx := x-cx
            dy := y-cy
            if dx*dx+dy*dy <= r*r {
                img.Set(x,y,c)
            }
        }
    }
}

// simple triangle rasterizer (not optimized)
func drawFilledTriangle(img *image.RGBA, x1,y1,x2,y2,x3,y3 int, c color.Color) {
    // bounding box
    minx := min3(x1,x2,x3)
    maxx := max3(x1,x2,x3)
    miny := min3(y1,y2,y3)
    maxy := max3(y1,y2,y3)
    for y:=miny;y<=maxy;y++{
        for x:=minx;x<=maxx;x++{
            if pointInTri(float64(x),float64(y), float64(x1),float64(y1), float64(x2),float64(y2), float64(x3),float64(y3)) {
                img.Set(x,y,c)
            }
        }
    }
}

func pointInTri(px,py, ax,ay, bx,by, cx,cy float64) bool {
    v0x := cx-ax; v0y := cy-ay
    v1x := bx-ax; v1y := by-ay
    v2x := px-ax; v2y := py-ay

    dot00 := v0x*v0x + v0y*v0y
    dot01 := v0x*v1x + v0y*v1y
    dot02 := v0x*v2x + v0y*v2y
    dot11 := v1x*v1x + v1y*v1y
    dot12 := v1x*v2x + v1y*v2y

    invDenom := 1.0 / (dot00*dot11 - dot01*dot01 + 1e-12)
    u := (dot11*dot02 - dot01*dot12) * invDenom
    v := (dot00*dot12 - dot01*dot02) * invDenom
    return (u >= 0) && (v >= 0) && (u+v < 1)
}

func min3(a,b,c int) int { m := a; if b<m {m=b}; if c<m {m=c}; return m }
func max3(a,b,c int) int { m := a; if b>m {m=b}; if c>m {m=c}; return m }

func parseLigonText(t string) (bg color.RGBA, rects []Rect, w,h int) {
    bg = color.RGBA{R:0,G:0,B:0,A:255}
    w, h = 800, 600
    lines := strings.Split(t, "\n")
    for _, raw := range lines {
        line := strings.TrimSpace(raw)
        if strings.HasPrefix(line, "window.create") {
            // window.create("main", 800, 600):
            a := between(line, "(", ")")
            parts := splitArgs(a)
            if len(parts) >= 3 {
                wi := atoi(parts[1], 800)
                hi := atoi(parts[2], 600)
                w,h = wi,hi
            }
        }
        if strings.HasPrefix(line, "window.color") {
            a := between(line, "(", ")")
            parts := splitArgs(a)
            if len(parts) >= 3 {
                r := uint8(atoi(parts[0],255))
                g := uint8(atoi(parts[1],255))
                b := uint8(atoi(parts[2],255))
                bg = color.RGBA{R:r,G:g,B:b,A:255}
            }
        }
        if strings.Contains(line, "ligon.draw.create.rect") {
            a := between(line, "(", ")")
            parts := splitArgs(a)
            if len(parts) >= 4 {
                x := atoi(parts[0],10)
                y := atoi(parts[1],10)
                rw := atoi(parts[2],10)
                rh := atoi(parts[3],10)
                rects = append(rects, Rect{X:x,Y:y,W:rw,H:rh,C:color.RGBA{R:255,G:0,B:0,A:255}})
            }
        }
    }
    return
}

func atoi(s string, def int) int {
    s = strings.Trim(s, " \"')")
    v := def
    var f float64
    if _, err := fmt.Sscan(s, &f); err==nil {
        v = int(math.Round(f))
    }
    return v
}

func splitArgs(s string) []string {
    var out []string
    cur := ""
    inStr := false
    for _, ch := range s {
        if ch == '\'' || ch == '"' { inStr = !inStr; cur += string(ch); continue }
        if ch == ',' && !inStr { out = append(out, strings.TrimSpace(cur)); cur = ""; continue }
        cur += string(ch)
    }
    if strings.TrimSpace(cur) != "" { out = append(out, strings.TrimSpace(cur)) }
    return out
}

func between(s, a, b string) string {
    ai := strings.Index(s, a)
    bi := strings.LastIndex(s, b)
    if ai==-1 || bi==-1 || bi<=ai { return "" }
    return s[ai+1:bi]
}

func (g *Game) Update() error { return nil }

func (g *Game) Draw(screen *ebiten.Image) {
    screen.Fill(g.bg)
    for _, r := range g.rects {
        ebitenutil.DrawRect(screen, float64(r.X), float64(r.Y), float64(r.W), float64(r.H), r.C)
    }
    if g.catImg != nil {
        op := &ebiten.DrawImageOptions{}
        w, h := g.catImg.Size()
        op.GeoM.Translate(10, 10)
        screen.DrawImage(g.catImg, op)
    }
}

func (g *Game) Layout(outW, outH int) (int, int) { return outW, outH }

func main() {
    args := os.Args[1:]
    path := "examples/canonical_examples.ligon"
    if len(args) >= 1 { path = args[0] }
    b, err := ioutil.ReadFile(path)
    if err != nil { log.Fatal(err) }

    bg, rects, w, h := parseLigonText(string(b))

    // generate cat icon image
    catImg := drawCatSVGImage(128,128)
    // save a PNG copy into runtime/icons for reference
    os.MkdirAll("icons", 0755)
    f, _ := os.Create("icons/ligon_cat.png")
    png.Encode(f, catImg)
    f.Close()

    g := &Game{ bg: bg, rects: rects }
    // convert catImg to ebiten image
    eimg := ebiten.NewImageFromImage(catImg)
    g.catImg = eimg

    ebiten.SetWindowSize(w, h)
    ebiten.SetWindowTitle("Ligon Runtime")
    if err := ebiten.RunGame(g); err != nil { log.Fatal(err) }
}
