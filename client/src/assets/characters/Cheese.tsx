interface Props {
  className?: string
  size?: number
}

export default function Cheese({ className = '', size = 120 }: Props) {
  return (
    <svg
      viewBox="0 0 220 200"
      width={size}
      height={(size * 200) / 220}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ch-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#E5A800" />
        </linearGradient>
        <linearGradient id="ch-left" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5C518" />
          <stop offset="100%" stopColor="#E5A800" />
        </linearGradient>
        <linearGradient id="ch-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A010" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="ch-rind" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E5A800" />
          <stop offset="100%" stopColor="#CC8800" />
        </linearGradient>
        <radialGradient id="ch-hole" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#CC9400" />
          <stop offset="100%" stopColor="#996E00" />
        </radialGradient>
        <radialGradient id="ch-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="110" cy="105" r="90" fill="url(#ch-glow)" />

      {/* Shadow */}
      <ellipse cx="110" cy="185" rx="75" ry="10" fill="#000" opacity="0.08" />

      {/* Left side face (lighter) */}
      <path d="M28 156 L110 30 L105 28 L22 150 L22 160 Z" fill="url(#ch-left)" />

      {/* Right side face (darker) */}
      <path d="M110 30 L192 156 L198 160 L198 150 L115 28 Z" fill="url(#ch-right)" />

      {/* Main front face */}
      <path d="M28 156 L110 30 L192 156 Z" fill="url(#ch-front)" />

      {/* Waxy rind - bottom edge */}
      <path d="M24 158 L28 156 L192 156 L196 158 L194 166 L26 166 Z" fill="url(#ch-rind)" />
      <path d="M28 158 L192 158" stroke="#CC8800" strokeWidth="0.5" opacity="0.4" />
      <path d="M30 162 L190 162" stroke="#B87800" strokeWidth="0.5" opacity="0.3" />

      {/* Holes with depth */}
      <ellipse cx="85" cy="112" rx="16" ry="14" fill="url(#ch-hole)" />
      <ellipse cx="85" cy="112" rx="14" ry="12" fill="#CC9400" opacity="0.6" />
      <ellipse cx="83" cy="110" rx="5" ry="4" fill="#FBBF24" opacity="0.2" />

      <ellipse cx="135" cy="128" rx="12" ry="11" fill="url(#ch-hole)" />
      <ellipse cx="135" cy="128" rx="10" ry="9" fill="#CC9400" opacity="0.6" />
      <ellipse cx="133" cy="126" rx="4" ry="3" fill="#FBBF24" opacity="0.2" />

      <ellipse cx="110" cy="85" rx="10" ry="9" fill="url(#ch-hole)" />
      <ellipse cx="110" cy="85" rx="8" ry="7" fill="#CC9400" opacity="0.6" />
      <ellipse cx="108" cy="83" rx="3" ry="2.5" fill="#FBBF24" opacity="0.2" />

      <ellipse cx="65" cy="138" rx="8" ry="7" fill="url(#ch-hole)" />
      <ellipse cx="65" cy="138" rx="6" ry="5" fill="#CC9400" opacity="0.5" />

      <ellipse cx="155" cy="145" rx="9" ry="7" fill="url(#ch-hole)" />
      <ellipse cx="155" cy="145" rx="7" ry="5.5" fill="#CC9400" opacity="0.5" />

      <circle cx="120" cy="60" r="5" fill="url(#ch-hole)" />
      <circle cx="120" cy="60" r="3.5" fill="#CC9400" opacity="0.5" />

      <circle cx="75" cy="80" r="4" fill="url(#ch-hole)" />
      <circle cx="160" cy="130" r="6" fill="url(#ch-hole)" />
      <circle cx="50" cy="145" r="3.5" fill="url(#ch-hole)" />

      {/* Surface texture */}
      <path d="M60 100 Q70 98 80 102" stroke="#E5A800" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M120 100 Q130 97 140 100" stroke="#E5A800" strokeWidth="0.6" fill="none" opacity="0.25" />
      <path d="M90 140 Q100 138 110 141" stroke="#E5A800" strokeWidth="0.6" fill="none" opacity="0.2" />

      {/* Bite mark on right corner */}
      <path d="M182 156 Q178 146 184 141 Q188 146 185 150 Q190 148 192 156 Z" fill="url(#ch-front)" />
      <path d="M183 152 Q180 148 184 144" stroke="#CC9400" strokeWidth="0.8" fill="none" opacity="0.4" />

      {/* Highlight shine */}
      <path d="M50 105 Q62 78 82 65" stroke="#FEF3C7" strokeWidth="3.5" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M45 115 Q55 95 65 85" stroke="#FEF3C7" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />

      {/* Aroma steam */}
      <path d="M90 22 Q87 12 92 6" stroke="#FBBF24" strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M110 16 Q107 6 112 0" stroke="#FBBF24" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />
      <path d="M130 22 Q127 12 132 6" stroke="#FBBF24" strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round" />
    </svg>
  )
}
