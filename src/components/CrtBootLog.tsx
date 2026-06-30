import { useEffect, useState } from 'react'

const bootLines = [
  'NEURO.SYS BIOS  v3.14',
  '',
  '> DETECTING CORTEX............. OK',
  '> LOADING SYNAPTIC DRIVERS..... OK',
  '> MOUNTING /dev/brain.......... OK',
  '> CALIBRATING EEG ARRAY........ OK',
  '',
  'SYSTEM READY.',
  '> LAUNCHING PORTFOLIO_',
]

export default function CrtBootLog() {
  const [text, setText] = useState('')

  useEffect(() => {
    let line = 0
    let char = 0
    let timeout = 0
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      if (line >= bootLines.length) return

      const current = bootLines[line]
      const prefix = bootLines.slice(0, line).join('\n')
      const visible = current.slice(0, char)
      setText(`${prefix}${line > 0 ? '\n' : ''}${visible}`)

      if (char < current.length) {
        char = Math.min(current.length, char + 5)
        timeout = window.setTimeout(tick, 24)
      } else {
        line += 1
        char = 0
        timeout = window.setTimeout(tick, 55)
      }
    }

    timeout = window.setTimeout(tick, 120)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <pre className="crt-boot-log font-code-sm text-code-sm text-primary-fixed-dim crt-glow" aria-hidden="true">
      {text}
    </pre>
  )
}
