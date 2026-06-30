import { useEffect, useRef } from 'react'

type Point = { x: number; y: number }
type Node = Point & { phase: number; fire: number }
type Pulse = { a: number; b: number; t: number }
type Segment = ['M', number, number] | ['C', number, number, number, number, number, number] | ['Z']

// Lateral (left-hemisphere) view. Coordinate space 96 × 90, centred at (48, 44).
// Frontal pole is lower-left; occipital pole is right; temporal lobe hangs below.
const CEREBRUM: Segment[] = [
  ['M', 14, 54],
  ['C', 7, 44, 6, 28, 12, 17],   // frontal, rising
  ['C', 17, 6, 28, 3, 41, 3],    // frontal superior
  ['C', 53, 3, 64, 7, 72, 13],   // parietal superior
  ['C', 80, 19, 85, 29, 85, 41], // occipital slope
  ['C', 85, 52, 80, 58, 73, 61], // posterior
  ['C', 65, 64, 55, 65, 49, 67], // temporal-parietal junction
  ['C', 38, 70, 25, 67, 19, 61], // temporal lobe
  ['C', 16, 58, 14, 57, 14, 54], // back to frontal pole
  ['Z'],
]
const CEREBELLUM: Segment[] = [
  ['M', 64, 59],
  ['C', 70, 56, 79, 58, 84, 63],
  ['C', 88, 68, 87, 76, 80, 79],
  ['C', 72, 81, 62, 77, 59, 71],
  ['C', 57, 65, 58, 60, 64, 59],
  ['Z'],
]
const STEM: Segment[] = [
  ['M', 57, 68],
  ['C', 56, 73, 56, 80, 58, 85],
  ['C', 59, 88, 63, 88, 64, 84],
  ['C', 65, 78, 64, 71, 63, 68],
]
// Lateral sulcus (Sylvian fissure) — the major horizontal landmark
const FISSURE: Segment[] = [
  ['M', 18, 52],
  ['C', 30, 55, 45, 52, 55, 47],
  ['C', 62, 43, 68, 42, 75, 44],
]
const GYRI: Segment[][] = [
  // Superior frontal gyrus (arcs across the top)
  [['M', 15, 19], ['C', 25, 12, 38, 9, 50, 9], ['C', 61, 9, 71, 14, 77, 22]],
  // Upper-middle frontal
  [['M', 10, 29], ['C', 21, 23, 34, 21, 45, 22], ['C', 55, 23, 64, 20, 72, 26]],
  // Middle frontal gyrus (main horizontal fold)
  [['M', 9, 40], ['C', 19, 34, 31, 32, 43, 34], ['C', 53, 36, 60, 31, 67, 31], ['C', 75, 31, 81, 36, 83, 45]],
  // Inferior frontal gyrus
  [['M', 12, 47], ['C', 21, 43, 32, 42, 42, 44], ['C', 50, 46, 55, 43, 60, 43]],
  // Central sulcus — vertical landmark between frontal and parietal
  [['M', 53, 6], ['C', 56, 15, 58, 25, 59, 35], ['C', 60, 44, 59, 52, 58, 58]],
  // Parietal — superior
  [['M', 63, 9], ['C', 68, 18, 72, 29, 72, 40], ['C', 72, 48, 70, 55, 68, 59]],
  // Parieto-occipital fold
  [['M', 75, 17], ['C', 81, 26, 83, 37, 81, 47]],
  // Superior temporal gyrus (just below Sylvian)
  [['M', 20, 56], ['C', 33, 59, 47, 57, 58, 52], ['C', 66, 48, 73, 47, 77, 49]],
  // Middle temporal gyrus
  [['M', 26, 63], ['C', 38, 67, 51, 64, 61, 59], ['C', 68, 55, 73, 54, 76, 56]],
  // Short inferior-frontal folds (branching pattern)
  [['M', 15, 34], ['C', 22, 31, 27, 33, 30, 38]],
  [['M', 16, 24], ['C', 22, 20, 27, 22, 31, 27]],
  // Short postcentral
  [['M', 61, 8], ['C', 64, 15, 65, 23, 66, 32]],
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
      ctx.save()
      ctx.clip(cortex)
      ctx.fillStyle = rgba(accent, 0.055)
      ctx.fillRect(0, 0, width, height)
      ctx.lineWidth = 1.3 * dpr
      ctx.lineCap = 'round'
      ctx.strokeStyle = rgba(accent, 0.24)
      ctx.shadowColor = accent
      ctx.shadowBlur = 4 * dpr
      GYRI.forEach((gyrus) => {
        trace(gyrus)
        ctx.stroke()
      })
      ctx.shadowBlur = 0
      ctx.lineWidth = 1 * dpr
      ctx.strokeStyle = rgba(accent, 0.14)
      edges.forEach(([a, b]) => {
        ctx.beginPath()
        ctx.moveTo(nodes[a].x, nodes[a].y)
        ctx.lineTo(nodes[b].x, nodes[b].y)
        ctx.stroke()
      })
      pulses.forEach((pulse, index) => {
        pulse.t += 0.045
        const a = nodes[pulse.a]
        const b = nodes[pulse.b]
        const x = a.x + (b.x - a.x) * pulse.t
        const y = a.y + (b.y - a.y) * pulse.t
        ctx.fillStyle = accent
        ctx.shadowColor = accent
        ctx.shadowBlur = 10 * dpr
        ctx.beginPath()
        ctx.arc(x, y, 2.1 * dpr, 0, Math.PI * 2)
        ctx.fill()
        if (pulse.t >= 1) {
          b.fire = 1
          pulses.splice(index, 1)
        }
      })
      ctx.shadowBlur = 0
      nodes.forEach((node) => {
        node.fire *= 0.94
        const base = 0.5 + 0.5 * Math.sin(time * 0.002 + node.phase)
        const radius = (1.25 + base + node.fire * 2.5) * dpr
        ctx.fillStyle = rgba(accent, 0.3 + 0.45 * base + node.fire * 0.45)
        ctx.shadowColor = accent
        ctx.shadowBlur = (2 + node.fire * 12) * dpr
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.shadowBlur = 0
      ctx.lineWidth = 2 * dpr
      ctx.strokeStyle = rgba(accent, 0.52)
      ctx.shadowColor = accent
      ctx.shadowBlur = 5 * dpr
      trace(FISSURE)
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.clip(cerebellum)
      ctx.fillStyle = rgba(accent, 0.06)
      ctx.fillRect(0, 0, width, height)
      ctx.lineWidth = 1 * dpr
      ctx.strokeStyle = rgba(accent, 0.32)
      for (let y = 61; y <= 76; y += 2) {
        ctx.beginPath()
        for (let s = 0; s <= 12; s += 1) {
          const x = 61 + ((82 - 61) * s) / 12
          const p = point(x, y + Math.sin(s * 0.85 + y) * 0.5)
          s === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
      }
      ctx.restore()

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
