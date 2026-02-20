interface Props {
  size: number
}

export default function RoundTable({ size }: Props) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="rt-surface" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="60%" stopColor="#7A5C12" />
          <stop offset="100%" stopColor="#5C420D" />
        </radialGradient>
        <radialGradient id="rt-rim" cx="50%" cy="45%" r="52%">
          <stop offset="0%" stopColor="#6B4E10" />
          <stop offset="100%" stopColor="#4A350A" />
        </radialGradient>
      </defs>

      {/* Table shadow */}
      <ellipse cx="120" cy="125" rx="112" ry="110" fill="#000" opacity="0.12" />

      {/* Table rim */}
      <circle cx="120" cy="120" r="112" fill="url(#rt-rim)" />

      {/* Table surface */}
      <circle cx="120" cy="120" r="104" fill="url(#rt-surface)" />

      {/* Wood grain lines */}
      <path d="M35 110 Q80 104 120 107 Q160 110 205 105" stroke="#6B4E10" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M42 130 Q90 125 130 127 Q170 129 198 126" stroke="#6B4E10" strokeWidth="0.6" fill="none" opacity="0.25" />
      <path d="M48 90 Q95 85 135 88 Q175 91 192 87" stroke="#6B4E10" strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M50 150 Q90 147 130 149 Q170 151 190 148" stroke="#6B4E10" strokeWidth="0.5" fill="none" opacity="0.15" />

      {/* Table edge highlight */}
      <circle cx="120" cy="120" r="104" fill="none" stroke="#9B7918" strokeWidth="1.2" opacity="0.25" />
    </svg>
  )
}
