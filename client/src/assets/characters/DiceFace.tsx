interface Props {
  className?: string
  size?: number
  value: number
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
}

export default function DiceFace({ className = '', size = 60, value }: Props) {
  const dots = DOT_POSITIONS[value] ?? DOT_POSITIONS[1]

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`wood-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8D5B8" />
          <stop offset="50%" stopColor="#D4BC9A" />
          <stop offset="100%" stopColor="#C4A882" />
        </linearGradient>
      </defs>

      {/* Dice body - wooden feel */}
      <rect x="5" y="5" width="90" height="90" rx="14" fill={`url(#wood-${value})`} />

      {/* Wood grain lines */}
      <path d="M15 20 Q50 18 85 22" stroke="#C4A882" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M15 45 Q50 42 85 46" stroke="#C4A882" strokeWidth="0.6" fill="none" opacity="0.2" />
      <path d="M15 70 Q50 68 85 72" stroke="#C4A882" strokeWidth="0.8" fill="none" opacity="0.3" />

      {/* Subtle border */}
      <rect x="5" y="5" width="90" height="90" rx="14" fill="none" stroke="#A08060" strokeWidth="1.5" />

      {/* Dots - carved and filled dark */}
      {dots.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="9" fill="#3D2B1F" />
          <circle cx={cx} cy={cy} r="7.5" fill="#4A3520" />
          <circle cx={cx - 1.5} cy={cy - 1.5} r="2" fill="#5C4530" opacity="0.5" />
        </g>
      ))}

      {/* Top-left highlight */}
      <path d="M18 10 Q50 8 82 10" stroke="#FEF3C7" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
    </svg>
  )
}
