interface Props {
  className?: string
  size?: number
}

export default function ThiefMouse({ className = '', size = 120 }: Props) {
  return (
    <svg
      viewBox="0 0 240 260"
      width={size}
      height={(size * 260) / 240}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="tm-body" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#7A7A7A" />
          <stop offset="60%" stopColor="#6B6B6B" />
          <stop offset="100%" stopColor="#505050" />
        </radialGradient>
        <radialGradient id="tm-head" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#808080" />
          <stop offset="50%" stopColor="#6B6B6B" />
          <stop offset="100%" stopColor="#555" />
        </radialGradient>
        <linearGradient id="tm-cape-outer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id="tm-cape-inner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="100%" stopColor="#450A0A" />
        </linearGradient>
        <linearGradient id="tm-mask" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
        <radialGradient id="tm-ear-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8A0AA" />
          <stop offset="100%" stopColor="#C07882" />
        </radialGradient>
        <radialGradient id="tm-nose" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </radialGradient>
      </defs>

      {/* Tail */}
      <path d="M62 200 Q38 190 32 208 Q28 225 45 220 Q55 215 50 205 Q48 195 58 198" stroke="#555" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Cape - flowing behind body */}
      <path d="M60 115 Q45 108 35 155 Q28 200 75 235 L165 235 Q210 200 205 155 Q195 108 180 115 Z" fill="url(#tm-cape-outer)" />
      <path d="M68 120 Q55 115 48 155 Q42 195 78 228 L162 228 Q198 195 192 155 Q185 115 172 120 Z" fill="url(#tm-cape-inner)" />
      {/* Cape folds/creases */}
      <path d="M55 150 Q60 180 75 220" stroke="#991B1B" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M185 150 Q180 180 165 220" stroke="#991B1B" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M120 120 Q118 170 115 225" stroke="#7F1D1D" strokeWidth="1" fill="none" opacity="0.3" />

      {/* Body - lean and agile */}
      <ellipse cx="120" cy="168" rx="48" ry="52" fill="url(#tm-body)" />
      <ellipse cx="120" cy="175" rx="30" ry="28" fill="#8A8A8A" opacity="0.5" />

      {/* Left arm - open gesture */}
      <path d="M72 155 Q50 145 44 162 Q40 178 55 176" fill="#6B6B6B" />
      <path d="M74 157 Q56 150 50 164 Q48 174 58 172" fill="#7A7A7A" />

      {/* Right arm holding cheese sack */}
      <path d="M168 155 Q190 145 196 162 Q200 178 185 176" fill="#6B6B6B" />
      <path d="M166 157 Q184 150 190 164 Q192 174 182 172" fill="#7A7A7A" />

      {/* Cheese sack */}
      <path d="M180 170 Q190 148 202 160 Q210 172 200 185 Q190 195 180 185 Z" fill="#C4A060" />
      <path d="M182 158 Q192 148 200 160" stroke="#A08040" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M185 168 Q190 162 196 168" stroke="#8A6830" strokeWidth="1" fill="none" opacity="0.4" />
      {/* Cheese poking out */}
      <path d="M195 152 L205 142 L210 155 Z" fill="#FBBF24" />
      <circle cx="202" cy="149" r="1.5" fill="#E5A800" />

      {/* Legs - tiptoeing */}
      <path d="M98 210 Q95 222 100 232 Q108 238 112 230 Q114 220 106 212" fill="#6B6B6B" />
      <path d="M142 210 Q139 222 144 232 Q152 238 156 230 Q158 220 148 212" fill="#6B6B6B" />
      <ellipse cx="106" cy="234" rx="13" ry="6" fill="#555" />
      <ellipse cx="106" cy="232" rx="11" ry="5" fill="#6B6B6B" />
      <ellipse cx="150" cy="234" rx="13" ry="6" fill="#555" />
      <ellipse cx="150" cy="232" rx="11" ry="5" fill="#6B6B6B" />

      {/* Cape collar - high, dramatic */}
      <path d="M75 115 Q120 100 165 115 Q162 130 120 122 Q78 130 75 115 Z" fill="url(#tm-mask)" />
      <path d="M80 118 Q120 106 160 118" stroke="#B91C1C" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Head */}
      <circle cx="120" cy="92" r="45" fill="url(#tm-head)" />
      <ellipse cx="110" cy="60" rx="22" ry="8" fill="#808080" opacity="0.3" />

      {/* Ears */}
      <ellipse cx="82" cy="56" rx="19" ry="24" fill="#5C5C5C" />
      <ellipse cx="82" cy="56" rx="17" ry="22" fill="#6B6B6B" />
      <ellipse cx="82" cy="56" rx="11" ry="16" fill="url(#tm-ear-inner)" />
      <ellipse cx="158" cy="56" rx="19" ry="24" fill="#5C5C5C" />
      <ellipse cx="158" cy="56" rx="17" ry="22" fill="#6B6B6B" />
      <ellipse cx="158" cy="56" rx="11" ry="16" fill="url(#tm-ear-inner)" />

      {/* Mask - Zorro style, detailed */}
      <path d="M78 80 Q120 68 162 80 L160 96 Q120 86 80 96 Z" fill="url(#tm-mask)" />
      {/* Mask eye holes */}
      <ellipse cx="102" cy="87" rx="12" ry="8" fill="#1a1a1a" />
      <ellipse cx="138" cy="87" rx="12" ry="8" fill="#1a1a1a" />
      {/* Mask tie ribbons */}
      <path d="M162 84 Q172 80 178 85 Q182 90 176 92" fill="url(#tm-mask)" />
      <path d="M162 88 Q170 85 175 88" stroke="#B91C1C" strokeWidth="1" fill="none" opacity="0.5" />

      {/* Eyes through mask - cunning, narrow */}
      <ellipse cx="102" cy="87" rx="9" ry="6" fill="#FFFDF5" />
      <ellipse cx="138" cy="87" rx="9" ry="6" fill="#FFFDF5" />
      <ellipse cx="104" cy="87.5" rx="5" ry="4.5" fill="#3D2510" />
      <ellipse cx="140" cy="87.5" rx="5" ry="4.5" fill="#3D2510" />
      <circle cx="102.5" cy="86.5" r="2" fill="#fff" />
      <circle cx="138.5" cy="86.5" r="2" fill="#fff" />
      <circle cx="106" cy="89" r="1" fill="#fff" opacity="0.4" />
      <circle cx="142" cy="89" r="1" fill="#fff" opacity="0.4" />

      {/* Raised eyebrow - right side up, left normal */}
      <path d="M128 74 Q138 67 152 72" stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M88 76 Q98 72 112 76" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Nose - dark, pointy */}
      <ellipse cx="120" cy="100" rx="5.5" ry="4" fill="url(#tm-nose)" />
      <ellipse cx="118.5" cy="99" rx="2" ry="1" fill="#666" opacity="0.4" />

      {/* Smirk - sly asymmetric grin */}
      <path d="M108 109 Q120 104 132 109 Q136 114 132 114 Q120 120 108 114 Q104 114 108 109" fill="#3D2510" />
      {/* Teeth row */}
      <path d="M110 111 Q120 107 130 111" stroke="#F5E6D0" strokeWidth="1.5" fill="none" />
      {/* Gold tooth */}
      <rect x="126" y="110" width="4" height="4" rx="1" fill="#FBBF24" />
      <rect x="127" y="110.5" width="1.5" height="1.5" rx="0.5" fill="#FEF3C7" opacity="0.5" />
      {/* Smirk line extending right */}
      <path d="M132 112 Q138 110 142 112" stroke="#555" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="98" y1="100" x2="65" y2="95" stroke="#8A8A8A" strokeWidth="1.2" opacity="0.5" />
      <line x1="98" y1="105" x2="65" y2="108" stroke="#8A8A8A" strokeWidth="1.2" opacity="0.5" />
      <line x1="142" y1="100" x2="175" y2="95" stroke="#8A8A8A" strokeWidth="1.2" opacity="0.5" />
      <line x1="142" y1="105" x2="175" y2="108" stroke="#8A8A8A" strokeWidth="1.2" opacity="0.5" />

      {/* Fur texture */}
      <path d="M80 92 Q82 90 84 93" stroke="#5C5C5C" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M156 92 Q158 90 160 93" stroke="#5C5C5C" strokeWidth="0.8" fill="none" opacity="0.3" />
    </svg>
  )
}
