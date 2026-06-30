import { useEffect, useRef } from 'react'

type Point = { x: number; y: number }
type Node = Point & { phase: number; fire: number }
type Pulse = { a: number; b: number; t: number }
type Segment = ['M', number, number] | ['C', number, number, number, number, number, number] | ['Z']

const CEREBRUM: Segment[] = [
  ['M', 10, 44],
  ['C', 8, 30, 17, 18, 30, 15],
  ['C', 42, 11, 55, 11, 66, 15],
  ['C', 76, 19, 85, 27, 86, 36],
  ['C', 87, 41, 84, 46, 77, 46],
  ['C', 70, 46, 64, 45, 60, 47],
  ['C', 52, 53, 42, 56, 32, 55],
  ['C', 22, 54, 13, 52, 11, 48],
  ['C', 10, 47, 10, 45, 10, 44],
  ['Z'],
]
const CEREBELLUM: Segment[] = [
  ['M', 61, 47],
  ['C', 67, 47, 75, 49, 79, 54],
  ['C', 82, 57, 81, 62, 75, 64],
  ['C', 68, 66, 60, 64, 57, 59],
  ['C', 55, 55, 56, 49, 61, 47],
  ['Z'],
]
const STEM: Segment[] = [
  ['M', 55, 56],
  ['C', 54, 61, 54, 67, 56, 73],
  ['C', 57, 76, 61, 76, 62, 72],
  ['C', 63, 66, 62, 60, 61, 56],
]
const FISSURE: Segment[] = [
  ['M', 16, 45],
  ['C', 26, 47, 38, 46, 48, 41],
  ['C', 54, 38, 59, 37, 64, 39],
]
const GYRI: Segment[][] = [
  [['M', 13, 38], ['C', 22, 33, 30, 36, 37, 31], ['C', 44, 27, 52, 30, 58, 25], ['C', 64, 21, 72, 24, 79, 29]],
  [['M', 14, 44], ['C', 24, 42, 31, 40, 39, 43], ['C', 47, 46, 53, 41, 61, 43], ['C', 67, 45, 73, 43, 82, 40]],
  [['M', 20, 29], ['C', 27, 25, 33, 28, 41, 23], ['C', 49, 19, 55, 23, 63, 19]],
  [['M', 23, 49], ['C', 31, 50, 37, 47, 45, 49], ['C', 51, 51, 59, 48, 67, 48]],
  [['M', 31, 20], ['C', 37, 16, 45, 18, 52, 15]],
  [['M', 16, 41], ['C', 20, 39, 25, 41, 29, 44]],
  [['M', 44, 33], ['C', 50, 30, 56, 33, 61, 30]],
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
      scale = Math.min(width / 92, height / 74) * 0.95
      ox = width / 2 - 47 * scale
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
      for (let y = 48; y <= 63; y += 2) {
        ctx.beginPath()
        for (let s = 0; s <= 12; s += 1) {
          const x = 55 + ((81 - 55) * s) / 12
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
