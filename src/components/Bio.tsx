import Reveal from './Reveal'
import { bio } from '../content'

export default function Bio() {
  return (
    <Reveal className="py-20 px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-12 items-center border-b border-outline-variant">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary-fixed-dim" />
          <h2 className="font-label-caps text-label-caps text-primary-fixed-dim">{bio.heading}</h2>
        </div>

        <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
          {bio.paragraph}
        </p>

        <div className="p-6 glass-panel border-l-4 border-primary-fixed-dim">
          <p className="font-code-sm text-code-sm text-on-surface italic">"{bio.quote}"</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {bio.stats.map((stat) => {
          const isPrimary = stat.accent === 'primary'
          const valueColor = isPrimary ? 'text-primary-fixed-dim' : 'text-secondary-fixed'
          const barColor = isPrimary ? 'bg-primary-fixed-dim' : 'bg-secondary-fixed'
          return (
            <div
              key={stat.id}
              className="p-4 border border-outline-variant aspect-square flex flex-col justify-between"
            >
              <div className="font-code-sm text-code-sm opacity-50">{stat.id}</div>
              <div className="text-center">
                <div className={`font-headline-lg ${valueColor}`}>{stat.value}</div>
                <div className="font-label-caps text-label-caps">{stat.label}</div>
              </div>
              <div className="h-1 bg-outline-variant w-full">
                <div className={`h-full ${barColor}`} style={{ width: `${stat.fill * 100}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </Reveal>
  )
}
