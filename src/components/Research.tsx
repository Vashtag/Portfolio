import Reveal from './Reveal'
import Icon from './Icon'
import { research, researchHeading, researchLocation, type ResearchCard } from '../content'

function Card({ card }: { card: ResearchCard }) {
  const isSecondary = card.accent === 'secondary'
  const iconColor = isSecondary ? 'text-secondary-fixed' : 'text-primary-fixed-dim'
  const hoverBorder = isSecondary ? 'hover:border-secondary-fixed' : 'hover:border-primary-fixed-dim'
  const bullet = isSecondary ? 'text-secondary-fixed' : 'text-primary-fixed-dim'

  // The teaching card gets the #teaching anchor used by the nav.
  const anchorId = card.list ? 'teaching' : undefined

  return (
    <div
      id={anchorId}
      className={`group ${isSecondary ? 'bg-surface-container-low ' : ''}border border-outline-variant p-6 ${hoverBorder} transition-all relative overflow-hidden scroll-mt-24`}
    >
      <div className="absolute top-0 right-0 p-2 font-code-sm text-code-sm text-outline">
        {card.ref}
      </div>
      <Icon name={card.icon} className={`${iconColor} mb-4 text-4xl`} />
      <h3 className="font-headline-md text-headline-md mb-2">{card.title}</h3>

      {card.body && <p className="text-on-surface-variant mb-6">{card.body}</p>}

      {card.list ? (
        <ul className="space-y-2 text-on-surface-variant">
          {card.list.map((line) => (
            <li key={line} className="flex items-center gap-2">
              <span className={`${bullet} font-bold`}>{'>'}</span> {line}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-wrap gap-2">
          {card.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-surface-container-high text-code-sm border border-outline-variant uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Research() {
  return (
    <Reveal
      id="research"
      className="py-20 px-margin-mobile md:px-margin-desktop border-b border-outline-variant scroll-mt-24"
    >
      <div className="flex justify-between items-end mb-12">
        <h2 className="font-headline-md text-headline-md text-primary-fixed-dim uppercase tracking-tighter">
          {researchHeading}
        </h2>
        <span className="font-code-sm text-code-sm text-outline hidden sm:block">
          {researchLocation}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {research.map((card) => (
          <Card key={card.ref} card={card} />
        ))}
      </div>
    </Reveal>
  )
}
