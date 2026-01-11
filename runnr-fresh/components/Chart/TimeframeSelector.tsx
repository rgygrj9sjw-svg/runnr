'use client'

const timeframes = [
  { id: '1m', label: '1M' },
  { id: '5m', label: '5M' },
  { id: '15m', label: '15M' },
  { id: '1h', label: '1H' },
  { id: 'daily', label: '1D' },
  { id: 'weekly', label: '1W' },
  { id: 'monthly', label: '1MO' },
  { id: '3mo', label: '3MO' },
  { id: '6mo', label: '6MO' },
  { id: '1y', label: '1Y' },
  { id: '5y', label: '5Y' },
]

interface Props {
  selected: string
  onSelect: (tf: string) => void
}

export function TimeframeSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-runnr-darker border-b border-runnr-border">
      {timeframes.map((tf) => (
        <button
          key={tf.id}
          onClick={() => onSelect(tf.id)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            selected === tf.id
              ? 'bg-accent-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-runnr-hover'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
