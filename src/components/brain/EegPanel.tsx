import { useEffect, useRef } from 'react'

const rows = [
  { name: 'Fp1', color: '#4dffa0', phase: 0.0, speed: 0.1, amp: 0.22 },
  { name: 'C3', color: '#5fe0ff', phase: 1.2, speed: 0.07, amp: 0.18 },
  { name: 'O2', color: '#ffc83d', phase: 2.4, speed: 0.13, amp: 0.16 },
  { name: 'T4', color: '#ff6ad5', phase: 3.6, speed: 0.09, amp: 0.2 },
]

export default function EegPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let cols = 0
    let tick = 0
    // Circular buffers (Float32Array + head pointer) — O(1) push vs O(n) shift
    let bufs: Float32Array[] = []
    let heads: number[] = []
    let raf = 0
    let running = false

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      width = Math.max(1, canvas.clientWidth * dpr)
      height = Math.max(1, canvas.clientHeight * dpr)
      canvas.width = width
      canvas.height = height
      cols = Math.max(2, Math.floor(width / (1.6 * dpr)))
      bufs = rows.map(() => new Float32Array(cols))
      heads = rows.map(() => 0)
    }

    const loop = () => {
      tick += 1
      ctx.clearRect(0, 0, width, height)

      // Grid lines — single batched path
      ctx.strokeStyle = 'rgba(120,255,180,0.065)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < width; x += 24 * dpr) { ctx.moveTo(x, 0); ctx.lineTo(x, height) }
      for (let y = 0; y < height; y += 24 * dpr) { ctx.moveTo(0, y); ctx.lineTo(width, y) }
      ctx.stroke()

      const rowHeight = height / rows.length
      ctx.lineWidth = 1.6 * dpr
      // Set font once outside the per-row loop
      ctx.font = `${11 * dpr}px monospace`

      rows.forEach((row, index) => {
        const centerY = rowHeight * (index + 0.5)
        let value =
          Math.sin(tick * row.speed + row.phase) * row.amp +
          Math.sin(tick * row.speed * 2.3 + 1) * row.amp * 0.45 +
          (Math.random() - 0.5) * row.amp * 0.5
        if (Math.random() < 0.012) value += (Math.random() < 0.5 ? 1 : -1) * row.amp * 2.6

        // O(1) circular buffer write
        bufs[index][heads[index]] = value
        heads[index] = (heads[index] + 1) % cols

        // Draw trace with shadow on, then turn shadow off once after all rows
        ctx.beginPath()
        ctx.strokeStyle = row.color
        ctx.shadowColor = row.color
        ctx.shadowBlur = 6 * dpr
        const head = heads[index]
        for (let i = 0; i < cols; i++) {
          const v = bufs[index][(head + i) % cols]
          const px = i * (width / cols)
          const py = centerY - v * rowHeight * 0.85
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.fillStyle = row.color
        ctx.fillText(row.name, 6 * dpr, centerY - rowHeight * 0.3)
      })

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
    // Draw only while visible. This also re-sizes on first reveal — the panel
    // mounts inside a hidden tab, so the initial resize() sees a 0-width canvas.
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
