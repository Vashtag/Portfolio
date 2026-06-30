import { useEffect, useRef } from 'react'

type Point = { x: number; y: number }
type Node = Point & { phase: number; fire: number }
type Pulse = { a: number; b: number; t: number }
type Segment = ['M', number, number] | ['C', number, number, number, number, number, number] | ['Z']

// Lateral (left-hemisphere) view. Coordinate space 96 × 90, centred at (48, 44).
// Frontal pole is lower-left; occipital pole is right; temporal lobe hangs below.
const CEREBRUM: Segment[] = [
  ['M', 14, 55],
  ['C', 5, 47, 4, 29, 10, 17],    // frontal pole, bulbous curve
  ['C', 15, 5, 28, 2, 42, 2],     // superior frontal
  ['C', 57, 2, 69, 7, 77, 16],    // parietal superior
  ['C', 85, 23, 89, 35, 88, 47],  // occipital slope
  ['C', 87, 57, 81, 64, 71, 67],  // posterior inferior
  ['C', 61, 69, 50, 70, 44, 71],  // temporal-parietal junction
  ['C', 32, 73, 19, 69, 15, 62],  // temporal lobe
  ['C', 14, 59, 14, 57, 14, 55],
  ['Z'],
]
const CEREBELLUM: Segment[] = [
  ['M', 65, 62],
  ['C', 72, 59, 81, 61, 86, 67],
  ['C', 90, 73, 88, 81, 81, 83],
  ['C', 73, 86, 63, 81, 60, 74],
  ['C', 57, 68, 59, 63, 65, 62],
  ['Z'],
]
const STEM: Segment[] = [
  ['M', 58, 70],
  ['C', 57, 75, 57, 82, 59, 87],
  ['C', 60, 90, 64, 90, 65, 86],
  ['C', 66, 80, 65, 73, 64, 70],
]
// Lateral sulcus (Sylvian fissure) — the major horizontal landmark separating frontal/parietal from temporal
const FISSURE: Segment[] = [
  ['M', 16, 55],
  ['C', 28, 58, 46, 55, 58, 50],
  ['C', 65, 46, 72, 45, 78, 48],
]
const GYRI: Segment[][] = [
  // Superior frontal sulcus (long horizontal)
  [['M', 11, 21], ['C', 23, 14, 37, 12, 50, 13], ['C', 60, 14, 68, 11, 76, 19]],
  // Inferior frontal sulcus
  [['M', 11, 37], ['C', 22, 32, 34, 31, 46, 33], ['C', 55, 34, 60, 31, 66, 34]],
  // Precentral sulcus (just anterior to central sulcus)
  [['M', 46, 4], ['C', 49, 14, 51, 27, 51, 40], ['C', 51, 49, 50, 54, 48, 59]],
  // Central sulcus (Rolando) — primary motor/sensory boundary
  [['M', 54, 4], ['C', 57, 14, 59, 27, 60, 40], ['C', 60, 50, 59, 56, 57, 61]],
  // Postcentral sulcus
  [['M', 63, 6], ['C', 66, 16, 68, 29, 68, 42], ['C', 68, 52, 66, 59, 64, 64]],
  // Intraparietal sulcus (runs horizontally into parietal)
  [['M', 69, 14], ['C', 74, 24, 78, 36, 79, 48], ['C', 79, 55, 76, 62, 72, 65]],
  // Parieto-occipital sulcus
  [['M', 79, 19], ['C', 85, 30, 88, 43, 85, 55]],
  // Superior temporal sulcus (below Sylvian)
  [['M', 21, 62], ['C', 35, 65, 52, 63, 64, 58], ['C', 72, 54, 78, 54, 82, 57]],
  // Middle temporal sulcus / inferior temporal gyrus boundary
  [['M', 26, 68], ['C', 38, 71, 54, 69, 65, 63]],
  // Short frontal folds (inferior frontal branching)
  [['M', 10, 29], ['C', 18, 25, 24, 27, 27, 32]],
  [['M', 11, 47], ['C', 19, 44, 25, 44, 29, 49]],
  // Short prefrontal convolutions
  [['M', 9, 44], ['C', 15, 41, 19, 42, 22, 47]],
  // Occipital sulcus
  [['M', 84, 35], ['C', 88, 44, 87, 54, 83, 61]],
]

function rgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '')
  const n = Number.parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

export default function Brain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let scale = 1
    let ox = 0
    let oy = 0
    let cortex = new Path2D()
    let cerebellum = new Path2D()
    let stem = new Path2D()
    let nodes: Node[] = []
    let edges: Array<[number, number]> = []
    let pulses: Pulse[] = []
    let gyriCanvas: OffscreenCanvas | null = null
    let raf = 0

    const point = (x: number, y: number): Point => ({ x: ox + x * scale, y: oy + y * scale })
    const pathFrom = (segments: Segment[]) => {
      const path = new Path2D()
      segments.forEach((segment) => {
        if (segment[0] === 'M') {
          const p = point(segment[1], segment[2])
          path.moveTo(p.x, p.y)
        } else if (segment[0] === 'C') {
          const a = point(segment[1], segment[2])
          const b = point(segment[3], segment[4])
          const c = point(segment[5], segment[6])
          path.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y)
        } else {
          path.closePath()
        }
      })
      return path
    }
    const trace = (segments: Segment[]) => {
      ctx.beginPath()
      segments.forEach((segment) => {
        if (segment[0] === 'M') {
          const p = point(segment[1], segment[2])
          ctx.moveTo(p.x, p.y)
        } else if (segment[0] === 'C') {
          const a = point(segment[1], segment[2])
          const b = point(segment[3], segment[4])
          const c = point(segment[5], segment[6])
          ctx.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y)
        } else {
          ctx.closePath()
        }
      })
    }
    const sample = (segments: Segment[]) => {
      const pts: Point[] = []
      let current: Point | null = null
      segments.forEach((segment) => {
        if (segment[0] === 'M') {
          current = point(segment[1], segment[2])
          pts.push(current)
        } else if (segment[0] === 'C' && current) {
          const p0 = current
          const p1 = point(segment[1], segment[2])
          const p2 = point(segment[3], segment[4])
          const p3 = point(segment[5], segment[6])
          for (let t = 0.25; t <= 1; t += 0.25) {
            const u = 1 - t
            pts.push({
              x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
              y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
            })
          }
          current = p3
        }
      })
      return pts
    }
    const isFar = (x: number, y: number, distance: number) =>
      nodes.every((node) => Math.hypot(node.x - x, node.y - y) >= distance)

    const seed = () => {
      cortex = pathFrom(CEREBRUM)
      cerebellum = pathFrom(CEREBELLUM)
      stem = pathFrom(STEM)

      // Pre-render gyri to an offscreen canvas — blitted each frame instead of re-tracing
      const accent = '#4dffa0'
      gyriCanvas = new OffscreenCanvas(width, height)
      const gCtx = gyriCanvas.getContext('2d')!
      gCtx.save()
      gCtx.clip(cortex)
      gCtx.fillStyle = rgba(accent, 0.055)
      gCtx.fillRect(0, 0, width, height)
      gCtx.lineWidth = 1.3 * dpr
      gCtx.lineCap = 'round'
      gCtx.strokeStyle = rgba(accent, 0.24)
      gCtx.shadowColor = accent
      gCtx.shadowBlur = 4 * dpr
      GYRI.forEach((gyrus) => {
        gCtx.beginPath()
        gyrus.forEach((seg) => {
          if (seg[0] === 'M') { const p = point(seg[1], seg[2]); gCtx.moveTo(p.x, p.y) }
          else if (seg[0] === 'C') { const a = point(seg[1], seg[2]), b = point(seg[3], seg[4]), c = point(seg[5], seg[6]); gCtx.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y) }
        })
        gCtx.stroke()
      })
      gCtx.restore()

      nodes = []
      const gap = width * 0.045
      GYRI.flatMap(sample).forEach((p) => {
        if (ctx.isPointInPath(cortex, p.x, p.y) && isFar(p.x, p.y, gap)) {
          nodes.push({ ...p, phase: Math.random() * Math.PI * 2, fire: 0 })
        }
      })
      let tries = 0
      while (nodes.length < 48 && tries < 5000) {
        tries += 1
        const x = Math.random() * width
        const y = Math.random() * height
        if (ctx.isPointInPath(cortex, x, y) && isFar(x, y, gap)) {
          nodes.push({ x, y, phase: Math.random() * Math.PI * 2, fire: 0 })
        }
      }
      edges = []
      nodes.forEach((node, i) => {
        nodes
          .map((other, j) => ({ j, distance: Math.hypot(other.x - node.x, other.y - node.y) }))
          .filter(({ j }) => j !== i)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3)
          .forEach(({ j, distance }) => {
            if (i < j && distance < width * 0.17) edges.push([i, j])
          })
      })
      pulses = []
    }

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      width = Math.max(1, canvas.clientWidth * dpr)
      height = Math.max(1, canvas.clientHeight * dpr)
      canvas.width = width
      canvas.height = height
      scale = Math.min(width / 96, height / 90) * 0.90
      ox = width / 2 - 48 * scale
      oy = height / 2 - 44 * scale
      seed()
    }

    const fire = () => {
      if (!nodes.length) return
      const i = Math.floor(Math.random() * nodes.length)
      nodes[i].fire = 1
      edges.forEach(([a, b]) => {
        if (a === i) pulses.push({ a, b, t: 0 })
        if (b === i) pulses.push({ a: b, b: a, t: 0 })
      })
    }

    const loop = (time: number) => {
      const accent = '#4dffa0'
      ctx.clearRect(0, 0, width, height)

      // Blit pre-rendered gyri (avoids re-tracing 13 bezier paths every frame)
      if (gyriCanvas) ctx.drawImage(gyriCanvas, 0, 0)

      ctx.save()
      ctx.clip(cortex)

      // Batch all edges into a single path — one GPU flush instead of ~75
      ctx.lineWidth = 1 * dpr
      ctx.strokeStyle = rgba(accent, 0.14)
      ctx.beginPath()
      edges.forEach(([a, b]) => {
        ctx.moveTo(nodes[a].x, nodes[a].y)
        ctx.lineTo(nodes[b].x, nodes[b].y)
      })
      ctx.stroke()

      // Advance pulses, collect done indices
      const donePulses: number[] = []
      ctx.fillStyle = accent
      ctx.shadowColor = accent
      ctx.shadowBlur = 10 * dpr
      pulses.forEach((pulse, index) => {
        pulse.t += 0.045
        if (pulse.t >= 1) { nodes[pulse.b].fire = 1; donePulses.push(index); return }
        const a = nodes[pulse.a], b = nodes[pulse.b]
        ctx.beginPath()
        ctx.arc(a.x + (b.x - a.x) * pulse.t, a.y + (b.y - a.y) * pulse.t, 2.1 * dpr, 0, Math.PI * 2)
        ctx.fill()
      })
      // Remove done pulses back-to-front to keep indices valid
      for (let i = donePulses.length - 1; i >= 0; i--) pulses.splice(donePulses[i], 1)

      // Nodes: one pass without shadow (ambient), one pass with shadow (firing)
      ctx.shadowBlur = 0
      nodes.forEach((node) => { node.fire *= 0.94 })
      // Pass 1 — dim ambient nodes, no shadow
      nodes.forEach((node) => {
        if (node.fire >= 0.08) return
        const base = 0.5 + 0.5 * Math.sin(time * 0.002 + node.phase)
        ctx.fillStyle = rgba(accent, 0.3 + 0.45 * base)
        ctx.beginPath()
        ctx.arc(node.x, node.y, (1.25 + base) * dpr, 0, Math.PI * 2)
        ctx.fill()
      })
      // Pass 2 — firing nodes with glow (minimal shadowBlur state changes)
      ctx.shadowColor = accent
      nodes.forEach((node) => {
        if (node.fire < 0.08) return
        const base = 0.5 + 0.5 * Math.sin(time * 0.002 + node.phase)
        ctx.shadowBlur = (4 + node.fire * 10) * dpr
        ctx.fillStyle = rgba(accent, 0.3 + 0.45 * base + node.fire * 0.45)
        ctx.beginPath()
        ctx.arc(node.x, node.y, (1.25 + base + node.fire * 2.5) * dpr, 0, Math.PI * 2)
        ctx.fill()
      })

      // Fissure — single shadow set
      ctx.shadowBlur = 5 * dpr
      ctx.lineWidth = 2 * dpr
      ctx.strokeStyle = rgba(accent, 0.52)
      trace(FISSURE)
      ctx.stroke()
      ctx.restore()

      // Cerebellum stripes
      ctx.save()
      ctx.clip(cerebellum)
      ctx.shadowBlur = 0
      ctx.fillStyle = rgba(accent, 0.06)
      ctx.fillRect(0, 0, width, height)
      ctx.lineWidth = 1 * dpr
      ctx.strokeStyle = rgba(accent, 0.32)
      ctx.beginPath()
      for (let y = 64; y <= 80; y += 2) {
        for (let s = 0; s <= 12; s += 1) {
          const x = 62 + ((84 - 62) * s) / 12
          const p = point(x, y + Math.sin(s * 0.85 + y) * 0.5)
          s === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        }
      }
      ctx.stroke()
      ctx.restore()

      // Outlines — single shadowBlur for all three
      ctx.lineJoin = 'round'
      ctx.strokeStyle = accent
      ctx.shadowColor = accent
      ctx.shadowBlur = 14 * dpr
      ctx.lineWidth = 2.2 * dpr
      ctx.stroke(cortex)
      ctx.lineWidth = 1.8 * dpr
      ctx.stroke(cerebellum)
      ctx.stroke(stem)
      ctx.shadowBlur = 0

      if (Math.random() < 0.07) fire()
      raf = requestAnimationFrame(loop)
    }

    resize()
    raf = requestAnimationFrame(loop)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
