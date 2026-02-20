interface Props {
  className?: string
  size?: number
  opened?: boolean
}

export default function DiceCup({ className = '', size = 40, opened = false }: Props) {
  return (
    <svg
      viewBox="0 0 60 70"
      width={size}
      height={(size * 70) / 60}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dc-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8B090" />
          <stop offset="40%" stopColor="#A08060" />
          <stop offset="100%" stopColor="#7A5C3A" />
        </linearGradient>
        <linearGradient id="dc-rim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4BC9A" />
          <stop offset="100%" stopColor="#8B6F4E" />
        </linearGradient>
        <radialGradient id="dc-top" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#B89E78" />
          <stop offset="100%" stopColor="#8B6F4E" />
        </radialGradient>
      </defs>

      {opened ? (
        <>
          {/* Tilted cup - opened state */}
          <g transform="translate(10, -5) rotate(25, 30, 45)">
            {/* Cup body */}
            <path d="M15 20 L12 55 Q12 60 18 60 L42 60 Q48 60 48 55 L45 20 Z" fill="url(#dc-body)" />
            <path d="M15 20 L12 55 Q12 60 18 60 L42 60 Q48 60 48 55 L45 20 Z" fill="none" stroke="#6B4E30" strokeWidth="1" />
            {/* Rim */}
            <ellipse cx="30" cy="20" rx="16" ry="5" fill="url(#dc-rim)" />
            <ellipse cx="30" cy="20" rx="16" ry="5" fill="none" stroke="#6B4E30" strokeWidth="0.8" />
            {/* Wood grain */}
            <path d="M18 30 Q30 28 42 30" stroke="#6B4E30" strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M16 40 Q30 38 44 40" stroke="#6B4E30" strokeWidth="0.5" fill="none" opacity="0.25" />
          </g>
        </>
      ) : (
        <>
          {/* Upright cup - closed state */}
          {/* Shadow */}
          <ellipse cx="30" cy="64" rx="18" ry="4" fill="#000" opacity="0.15" />
          {/* Cup body - slightly tapered */}
          <path d="M14 15 L11 55 Q11 62 18 62 L42 62 Q49 62 49 55 L46 15 Z" fill="url(#dc-body)" />
          <path d="M14 15 L11 55 Q11 62 18 62 L42 62 Q49 62 49 55 L46 15 Z" fill="none" stroke="#6B4E30" strokeWidth="1" />
          {/* Top cap */}
          <ellipse cx="30" cy="15" rx="17" ry="6" fill="url(#dc-top)" />
          <ellipse cx="30" cy="15" rx="17" ry="6" fill="none" stroke="#6B4E30" strokeWidth="0.8" />
          {/* Handle knob on top */}
          <circle cx="30" cy="10" r="4" fill="url(#dc-rim)" />
          <circle cx="30" cy="10" r="4" fill="none" stroke="#6B4E30" strokeWidth="0.6" />
          <circle cx="29" cy="9" r="1.5" fill="#fff" opacity="0.2" />
          {/* Wood grain */}
          <path d="M17 28 Q30 26 43 28" stroke="#6B4E30" strokeWidth="0.5" fill="none" opacity="0.3" />
          <path d="M15 40 Q30 38 45 40" stroke="#6B4E30" strokeWidth="0.5" fill="none" opacity="0.25" />
          <path d="M13 52 Q30 50 47 52" stroke="#6B4E30" strokeWidth="0.5" fill="none" opacity="0.2" />
        </>
      )}
    </svg>
  )
}
