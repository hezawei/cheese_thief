interface Props {
  seconds: number
  total: number
  size?: number
}

export default function CountdownRing({ seconds, total, size = 64 }: Props) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? seconds / total : 0
  const offset = circumference * (1 - progress)

  const color =
    seconds > 10 ? '#22C55E' : seconds > 5 ? '#FBBF24' : '#EF4444'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold"
        style={{ color }}
      >
        {seconds}
      </span>
    </div>
  )
}
