interface Props {
  className?: string
  size?: number
}

export default function ScapegoatMouse({ className = '', size = 120 }: Props) {
  return (
    <svg
      viewBox="0 0 240 260"
      width={size}
      height={(size * 260) / 240}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sg-body" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#E2CDB0" />
          <stop offset="60%" stopColor="#D4BC9A" />
          <stop offset="100%" stopColor="#B89E78" />
        </radialGradient>
        <radialGradient id="sg-head" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#E8D5B8" />
          <stop offset="50%" stopColor="#D4BC9A" />
          <stop offset="100%" stopColor="#C4A882" />
        </radialGradient>
        <linearGradient id="sg-smock" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B46EFD" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#8B3FD8" />
        </linearGradient>
        <radialGradient id="sg-ear-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0B0BA" />
          <stop offset="100%" stopColor="#D48A96" />
        </radialGradient>
        <radialGradient id="sg-nose" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#F0ADB8" />
          <stop offset="100%" stopColor="#D08090" />
        </radialGradient>
        <radialGradient id="sg-eye-white" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8E8F0" />
        </radialGradient>
      </defs>

      {/* Floating question marks */}
      <text x="28" y="50" fill="#A855F7" fontSize="28" fontWeight="bold" fontFamily="serif" opacity="0.8">?</text>
      <text x="190" y="38" fill="#C084FC" fontSize="22" fontWeight="bold" fontFamily="serif" opacity="0.65">?</text>
      <text x="55" y="28" fill="#A855F7" fontSize="16" fontWeight="bold" fontFamily="serif" opacity="0.45">?</text>
      <text x="175" y="18" fill="#C084FC" fontSize="12" fontWeight="bold" fontFamily="serif" opacity="0.3">?</text>

      {/* Tail - slightly frazzled */}
      <path d="M170 200 Q195 192 200 212 Q204 230 188 226 Q180 222 185 212 Q186 202 176 202" stroke="#C4A882" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="120" cy="170" rx="60" ry="56" fill="url(#sg-body)" />
      <ellipse cx="120" cy="195" rx="48" ry="22" fill="#B89E78" opacity="0.25" />
      <ellipse cx="120" cy="178" rx="35" ry="30" fill="#E8D5B8" opacity="0.6" />

      {/* Purple smock */}
      <path d="M68 148 Q62 142 58 165 Q55 195 78 210 L162 210 Q185 195 182 165 Q178 142 172 148 Q150 138 120 142 Q90 138 68 148 Z" fill="url(#sg-smock)" opacity="0.75" />
      {/* Patches - worn and patchy */}
      <rect x="82" y="168" width="14" height="12" rx="3" fill="#9333EA" opacity="0.4" transform="rotate(-5 89 174)" />
      <rect x="140" y="162" width="12" height="14" rx="3" fill="#7C3AED" opacity="0.35" transform="rotate(8 146 169)" />
      <path d="M105 185 L115 183 L113 195 L103 197 Z" fill="#8B5CF6" opacity="0.3" />
      {/* Stitching on patches */}
      <path d="M84 170 L94 170" stroke="#6D28D9" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
      <path d="M142 164 L150 164" stroke="#6D28D9" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />

      {/* Feet */}
      <ellipse cx="92" cy="228" rx="18" ry="9" fill="#C4A882" />
      <ellipse cx="92" cy="226" rx="15" ry="7" fill="#D4BC9A" />
      <ellipse cx="148" cy="228" rx="18" ry="9" fill="#C4A882" />
      <ellipse cx="148" cy="226" rx="15" ry="7" fill="#D4BC9A" />

      {/* Arms raised - "not me!" defensive gesture */}
      <path d="M65 152 Q38 128 28 140 Q20 155 42 158" fill="#D4BC9A" />
      <path d="M67 154 Q44 134 35 144 Q28 155 46 156" fill="#E2CDB0" />
      <path d="M175 152 Q202 128 212 140 Q220 155 198 158" fill="#D4BC9A" />
      <path d="M173 154 Q196 134 205 144 Q212 155 194 156" fill="#E2CDB0" />

      {/* Open palms - left */}
      <circle cx="28" cy="136" r="10" fill="#D4BC9A" />
      <circle cx="28" cy="136" r="8.5" fill="#E2CDB0" />
      <ellipse cx="22" cy="128" rx="3.5" ry="7" fill="#D4BC9A" transform="rotate(-10 22 128)" />
      <ellipse cx="27" cy="126" rx="3" ry="7" fill="#D4BC9A" transform="rotate(-3 27 126)" />
      <ellipse cx="32" cy="126" rx="3" ry="6.5" fill="#D4BC9A" transform="rotate(5 32 126)" />
      <ellipse cx="36" cy="128" rx="2.8" ry="6" fill="#D4BC9A" transform="rotate(12 36 128)" />

      {/* Open palms - right */}
      <circle cx="212" cy="136" r="10" fill="#D4BC9A" />
      <circle cx="212" cy="136" r="8.5" fill="#E2CDB0" />
      <ellipse cx="206" cy="128" rx="2.8" ry="6" fill="#D4BC9A" transform="rotate(-12 206 128)" />
      <ellipse cx="210" cy="126" rx="3" ry="6.5" fill="#D4BC9A" transform="rotate(-5 210 126)" />
      <ellipse cx="215" cy="126" rx="3" ry="7" fill="#D4BC9A" transform="rotate(3 215 126)" />
      <ellipse cx="220" cy="128" rx="3.5" ry="7" fill="#D4BC9A" transform="rotate(10 220 128)" />

      {/* Head */}
      <circle cx="120" cy="95" r="48" fill="url(#sg-head)" />

      {/* Messy fur tufts */}
      <path d="M92 52 Q88 38 96 42 Q100 45 94 53" fill="#C4A882" />
      <path d="M105 48 Q107 32 114 38 Q117 43 108 50" fill="#C4A882" />
      <path d="M118 50 Q124 36 128 44 Q127 50 120 51" fill="#C4A882" />
      <path d="M134 54 Q140 42 142 50 Q140 56 136 55" fill="#C4A882" />
      <path d="M82 56 Q76 46 82 48 Q86 50 82 57" fill="#B89E78" />

      {/* Ears - slightly droopy */}
      <ellipse cx="78" cy="60" rx="20" ry="26" fill="#C4A882" transform="rotate(-12 78 60)" />
      <ellipse cx="78" cy="60" rx="18" ry="24" fill="#D4BC9A" transform="rotate(-12 78 60)" />
      <ellipse cx="78" cy="60" rx="12" ry="17" fill="url(#sg-ear-inner)" transform="rotate(-12 78 60)" />
      <ellipse cx="162" cy="60" rx="20" ry="26" fill="#C4A882" transform="rotate(12 162 60)" />
      <ellipse cx="162" cy="60" rx="18" ry="24" fill="#D4BC9A" transform="rotate(12 162 60)" />
      <ellipse cx="162" cy="60" rx="12" ry="17" fill="url(#sg-ear-inner)" transform="rotate(12 162 60)" />

      {/* Cheek blush - embarrassed */}
      <ellipse cx="88" cy="108" rx="12" ry="7" fill="#E8A0A0" opacity="0.3" />
      <ellipse cx="152" cy="108" rx="12" ry="7" fill="#E8A0A0" opacity="0.3" />

      {/* Eyes - HUGE, teary, terrified */}
      {/* Left eye */}
      <ellipse cx="102" cy="90" rx="14" ry="16" fill="url(#sg-eye-white)" />
      <ellipse cx="102" cy="90" rx="13" ry="15" fill="#fff" stroke="#C4A882" strokeWidth="0.5" />
      <circle cx="102" cy="92" r="8" fill="#5C3D20" />
      <circle cx="102" cy="92" r="6" fill="#3D2510" />
      <circle cx="99" cy="89" r="3" fill="#fff" />
      <circle cx="105" cy="94" r="1.5" fill="#fff" opacity="0.5" />

      {/* Right eye */}
      <ellipse cx="138" cy="90" rx="14" ry="16" fill="url(#sg-eye-white)" />
      <ellipse cx="138" cy="90" rx="13" ry="15" fill="#fff" stroke="#C4A882" strokeWidth="0.5" />
      <circle cx="138" cy="92" r="8" fill="#5C3D20" />
      <circle cx="138" cy="92" r="6" fill="#3D2510" />
      <circle cx="135" cy="89" r="3" fill="#fff" />
      <circle cx="141" cy="94" r="1.5" fill="#fff" opacity="0.5" />

      {/* Tear tracks */}
      <path d="M90 100 Q87 110 90 118 Q91 120 92 116 Q93 108 91 100" fill="#B8D8E8" opacity="0.45" />
      <ellipse cx="90" cy="120" rx="2.5" ry="3.5" fill="#B8D8E8" opacity="0.35" />
      <path d="M150 100 Q153 110 150 118 Q149 120 148 116 Q147 108 149 100" fill="#B8D8E8" opacity="0.45" />
      <ellipse cx="150" cy="120" rx="2.5" ry="3.5" fill="#B8D8E8" opacity="0.35" />

      {/* Eyebrows - worried, angled up in center */}
      <path d="M88 72 Q100 64 114 72" stroke="#8B6840" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M126 72 Q138 64 150 72" stroke="#8B6840" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="120" cy="106" rx="5.5" ry="4" fill="url(#sg-nose)" />
      <ellipse cx="118.5" cy="105" rx="2" ry="1.2" fill="#fff" opacity="0.3" />

      {/* Mouth - open O shape, shocked/scared */}
      <ellipse cx="120" cy="118" rx="8" ry="10" fill="#4A2A15" />
      <ellipse cx="120" cy="117" rx="6" ry="7" fill="#6B3D25" />
      {/* Tongue hint */}
      <ellipse cx="120" cy="122" rx="4" ry="3" fill="#D08080" opacity="0.6" />

      {/* Whiskers - droopy */}
      <line x1="92" y1="106" x2="58" y2="102" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.5" />
      <line x1="92" y1="112" x2="58" y2="118" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.5" />
      <line x1="148" y1="106" x2="182" y2="102" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.5" />
      <line x1="148" y1="112" x2="182" y2="118" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.5" />

      {/* Fur texture */}
      <path d="M75 95 Q78 93 80 96" stroke="#C4A882" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M160 95 Q163 93 165 96" stroke="#C4A882" strokeWidth="0.8" fill="none" opacity="0.3" />
    </svg>
  )
}
