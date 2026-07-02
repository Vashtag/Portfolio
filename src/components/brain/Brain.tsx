import { useEffect, useRef } from 'react'

type Point = { x: number; y: number }
type Node = Point & { phase: number; fire: number }
type Pulse = { a: number; b: number; t: number }
type Segment = ['M', number, number] | ['C', number, number, number, number, number, number] | ['Z']

// Lateral (left-hemisphere) view. Coordinate space 96 × 90, centred at (48, 44).
// Frontal pole is left; occipital pole is right; the temporal pole projects
// forward-and-down at the front-bottom — the signature of a real lateral view.
const CEREBRUM: Segment[] = [
  ['M', 9, 42],                    // frontal pole (frontmost point, left)
  ['C', 8, 31, 11, 19, 20, 12],    // rise up the convex frontal lobe
  ['C', 28, 6, 39, 4, 49, 4],      // superior frontal → vertex (crown)
  ['C', 60, 4, 70, 8, 78, 15],     // parietal crown sloping back
  ['C', 85, 21, 89, 30, 89, 39],   // up to occipital pole (backmost point)
  ['C', 89, 46, 86, 51, 80, 54],   // occipital pole rounding down
  ['C', 75, 56, 71, 56, 67, 58],   // dip into the preoccipital notch
  ['C', 58, 62, 48, 65, 39, 65],   // inferior temporal belly
  ['C', 30, 65, 22, 63, 17, 59],   // sweep forward toward temporal pole
  ['C', 13, 56, 12, 52, 14, 49],   // temporal pole (projects down-forward)
  ['C', 12, 47, 10, 46, 9, 42],    // pre-temporal notch, back to frontal pole
  ['Z'],
]
// Cerebellum — nestled below the occipital lobe, behind the brainstem
const CEREBELLUM: Segment[] = [
  ['M', 66, 60],
  ['C', 73, 57, 82, 59, 87, 66],
  ['C', 91, 72, 89, 80, 82, 83],
  ['C', 74, 85, 64, 81, 61, 73],
  ['C', 58, 67, 60, 61, 66, 60],
  ['Z'],
]
// Brainstem — descends forward of the cerebellum
const STEM: Segment[] = [
  ['M', 60, 63],
  ['C', 58, 70, 57, 78, 59, 85],
  ['C', 60, 89, 64, 89, 65, 84],
  ['C', 66, 77, 65, 69, 65, 64],
]
// Lateral sulcus (Sylvian fissure) — deep cleft separating the temporal lobe
// (below) from the frontal and parietal lobes (above)
const FISSURE: Segment[] = [
  ['M', 17, 51],
  ['C', 28, 54, 40, 53, 50, 49],
  ['C', 58, 46, 65, 45, 71, 47],
]
const GYRI: Segment[][] = [
  // Superior frontal sulcus
  [['M', 12, 22], ['C', 22, 16, 33, 14, 43, 15], ['C', 50, 15, 55, 13, 60, 15]],
  // Inferior frontal sulcus
  [['M', 12, 35], ['C', 21, 31, 30, 30, 39, 32], ['C', 44, 33, 48, 32, 52, 34]],
  // Precentral sulcus (anterior to the central sulcus; stops at the fissure)
  [['M', 44, 8], ['C', 46, 18, 47, 28, 46, 37], ['C', 46, 42, 45, 45, 44, 47]],
  // Central sulcus of Rolando — sinuous motor/sensory landmark
  [['M', 53, 6], ['C', 56, 16, 55, 26, 57, 34], ['C', 58, 40, 57, 44, 57, 47]],
  // Postcentral sulcus
  [['M', 62, 8], ['C', 65, 18, 67, 29, 66, 40], ['C', 66, 45, 65, 48, 64, 50]],
  // Intraparietal sulcus (horizontal, sweeps into the parietal lobe)
  [['M', 66, 30], ['C', 73, 32, 79, 35, 82, 41]],
  // Parieto-occipital sulcus
  [['M', 80, 22], ['C', 85, 31, 87, 42, 84, 52]],
  // Lateral occipital sulcus
  [['M', 82, 40], ['C', 86, 45, 86, 51, 83, 56]],
  // Superior temporal sulcus (parallels the Sylvian fissure below it)
  [['M', 20, 57], ['C', 33, 60, 47, 58, 58, 54], ['C', 64, 51, 69, 51, 73, 53]],
  // Middle temporal sulcus
  [['M', 24, 62], ['C', 36, 65, 50, 63, 60, 58]],
  // Short frontal convolution folds
  [['M', 11, 28], ['C', 18, 24, 25, 26, 29, 31]],
  [['M', 12, 43], ['C', 19, 40, 26, 41, 30, 46]],
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
    let staticCanvas: OffscreenCanvas | null = null
    let raf = 0
    let running = false

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
    const trace = (c: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, segments: Segment[]) => {
      c.beginPath()
      segments.forEach((segment) => {
        if (segment[0] === 'M') {
          const p = point(segment[1], segment[2])
          c.moveTo(p.x, p.y)
        } else if (segment[0] === 'C') {
          const a = point(segment[1], segment[2])
          const b = point(segment[3], segment[4])
          const cp = point(segment[5], segment[6])
          c.bezierCurveTo(a.x, a.y, b.x, b.y, cp.x, cp.y)
        } else {
          c.closePath()
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

      // Bake ALL static geometry — cortex fill, gyri, edges, fissure, cerebellum
      // stripes, and the glowing outlines — into one offscreen canvas. Per frame
      // this becomes a single drawImage; only nodes and pulses are drawn live.
      // (The outline strokes with 14dpr shadow blur were the most expensive
      // per-frame calls, and none of this geometry ever moves.)
      const accent = '#4dffa0'
      staticCanvas = new OffscreenCanvas(width, height)
      const s = staticCanvas.getContext('2d')!
      s.save()
      s.clip(cortex)
      s.fillStyle = rgba(accent, 0.055)
      s.fillRect(0, 0, width, height)
      s.lineWidth = 1.3 * dpr
      s.lineCap = 'round'
      s.strokeStyle = rgba(accent, 0.24)
      s.shadowColor = accent
      s.shadowBlur = 4 * dpr
      GYRI.forEach((gyrus) => {
        trace(s, gyrus)
        s.stroke()
      })
      s.shadowBlur = 0
      s.lineWidth = 1 * dpr
      s.strokeStyle = rgba(accent, 0.14)
      s.beginPath()
      edges.forEach(([a, b]) => {
        s.moveTo(nodes[a].x, nodes[a].y)
        s.lineTo(nodes[b].x, nodes[b].y)
      })
      s.stroke()
      s.lineWidth = 2 * dpr
      s.strokeStyle = rgba(accent, 0.52)
      s.shadowColor = accent
      s.shadowBlur = 5 * dpr
      trace(s, FISSURE)
      s.stroke()
      s.restore()

      s.save()
      s.clip(cerebellum)
      s.fillStyle = rgba(accent, 0.06)
      s.fillRect(0, 0, width, height)
      s.lineWidth = 1 * dpr
      s.strokeStyle = rgba(accent, 0.32)
      s.beginPath()
      for (let y = 62; y <= 82; y += 2) {
        for (let t = 0; t <= 12; t += 1) {
          const x = 60 + ((88 - 60) * t) / 12
          const p = point(x, y + Math.sin(t * 0.85 + y) * 0.5)
          t === 0 ? s.moveTo(p.x, p.y) : s.lineTo(p.x, p.y)
        }
      }
      s.stroke()
      s.restore()

      s.lineJoin = 'round'
      s.strokeStyle = accent
      s.shadowColor = accent
      s.shadowBlur = 14 * dpr
      s.lineWidth = 2.2 * dpr
      s.stroke(cortex)
      s.lineWidth = 1.8 * dpr
      s.stroke(cerebellum)
      s.stroke(stem)
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

      // All static geometry in one blit
      if (staticCanvas) ctx.drawImage(staticCanvas, 0, 0)

      // Pulses — shadow state set once for all of them
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
      for (let i = donePulses.length - 1; i >= 0; i--) pulses.splice(donePulses[i], 1)

      // Nodes: one pass without shadow (ambient), one pass with shadow (firing)
      ctx.shadowBlur = 0
      nodes.forEach((node) => { node.fire *= 0.94 })
      nodes.forEach((node) => {
        if (node.fire >= 0.08) return
        const base = 0.5 + 0.5 * Math.sin(time * 0.002 + node.phase)
        ctx.fillStyle = rgba(accent, 0.3 + 0.45 * base)
        ctx.beginPath()
        ctx.arc(node.x, node.y, (1.25 + base) * dpr, 0, Math.PI * 2)
        ctx.fill()
      })
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
      ctx.shadowBlur = 0

      if (Math.random() < 0.07) fire()
      if (running) raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    // Pause the animation entirely while the canvas is hidden (channel switched
    // away) — no reason to draw frames nobody can see.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (Math.floor(canvas.clientWidth * dpr) !== canvas.width) resize()
        start()
      } else {
        stop()
      }
    })
    io.observe(canvas)
    window.addEventListener('resize', resize)
    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
