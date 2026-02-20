interface Props {
  className?: string
  size?: number
}

export default function SleepyMouseAwake({ className = '', size = 120 }: Props) {
  return (
    <svg
      viewBox="0 0 240 260"
      width={size}
      height={(size * 260) / 240}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sma-body" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#E2CDB0" />
          <stop offset="60%" stopColor="#D4BC9A" />
          <stop offset="100%" stopColor="#B89E78" />
        </radialGradient>
        <radialGradient id="sma-belly" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#F5E6D0" />
          <stop offset="100%" stopColor="#E8D5B8" />
        </radialGradient>
        <radialGradient id="sma-head" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#E8D5B8" />
          <stop offset="50%" stopColor="#D4BC9A" />
          <stop offset="100%" stopColor="#C4A882" />
        </radialGradient>
        <linearGradient id="sma-cap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD66A" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <radialGradient id="sma-ear-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0B0BA" />
          <stop offset="100%" stopColor="#D48A96" />
        </radialGradient>
        <radialGradient id="sma-nose" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#F0ADB8" />
          <stop offset="100%" stopColor="#D08090" />
        </radialGradient>
        <radialGradient id="sma-pompom" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#FFFDF5" />
          <stop offset="100%" stopColor="#E8D5B8" />
        </radialGradient>
        <radialGradient id="sma-eye-white" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F0F5" />
        </radialGradient>
      </defs>

      {/* Tail */}
      <path d="M168 195 Q195 188 205 210 Q210 228 195 225 Q185 222 190 210 Q192 200 180 198" stroke="#C4A882" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="120" cy="170" rx="68" ry="62" fill="url(#sma-body)" />
      <ellipse cx="120" cy="195" rx="55" ry="25" fill="#B89E78" opacity="0.3" />
      <ellipse cx="120" cy="175" rx="40" ry="35" fill="url(#sma-belly)" />

      {/* Feet */}
      <ellipse cx="90" cy="228" rx="20" ry="10" fill="#C4A882" />
      <ellipse cx="90" cy="226" rx="17" ry="8" fill="#D4BC9A" />
      <ellipse cx="150" cy="228" rx="20" ry="10" fill="#C4A882" />
      <ellipse cx="150" cy="226" rx="17" ry="8" fill="#D4BC9A" />

      {/* Left arm */}
      <path d="M62 162 Q42 155 36 172 Q33 188 48 186" fill="#D4BC9A" />
      <path d="M64 164 Q48 158 42 172 Q40 182 50 181" fill="#E2CDB0" />

      {/* Teddy bear */}
      <circle cx="44" cy="190" r="11" fill="#A0845C" />
      <circle cx="44" cy="190" r="9" fill="#B0946C" />
      <circle cx="44" cy="182" r="8" fill="#A0845C" />
      <circle cx="44" cy="182" r="6.5" fill="#B0946C" />
      <circle cx="38" cy="177" r="4" fill="#A0845C" />
      <circle cx="50" cy="177" r="4" fill="#A0845C" />
      <ellipse cx="42" cy="181" rx="1.5" ry="2" fill="#4A3520" />
      <ellipse cx="47" cy="181" rx="1.5" ry="2" fill="#4A3520" />
      <ellipse cx="44.5" cy="184" rx="2" ry="1.5" fill="#6B4830" />
      <path d="M43 186 Q44.5 188 46 186" stroke="#4A3520" strokeWidth="0.8" fill="none" />
      <ellipse cx="44" cy="190" rx="4" ry="3.5" fill="#C4A880" />

      {/* Right arm */}
      <path d="M178 162 Q198 155 202 172 Q204 188 190 186" fill="#D4BC9A" />
      <path d="M176 164 Q192 158 196 172 Q198 182 188 181" fill="#E2CDB0" />

      {/* Head */}
      <circle cx="120" cy="100" r="50" fill="url(#sma-head)" />
      <ellipse cx="110" cy="65" rx="25" ry="10" fill="#E8D5B8" opacity="0.4" />

      {/* Ears */}
      <ellipse cx="78" cy="62" rx="22" ry="28" fill="#C4A882" />
      <ellipse cx="78" cy="62" rx="20" ry="26" fill="#D4BC9A" />
      <ellipse cx="78" cy="62" rx="14" ry="19" fill="url(#sma-ear-inner)" />
      <ellipse cx="162" cy="62" rx="22" ry="28" fill="#C4A882" />
      <ellipse cx="162" cy="62" rx="20" ry="26" fill="#D4BC9A" />
      <ellipse cx="162" cy="62" rx="14" ry="19" fill="url(#sma-ear-inner)" />

      {/* Sleep cap */}
      <path d="M68 90 Q75 55 120 30 Q165 55 172 90 L155 98 Q120 70 85 98 Z" fill="url(#sma-cap)" />
      <path d="M78 91 Q95 65 120 45 Q145 65 162 91" stroke="#F5E6D0" strokeWidth="7" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M73 93 Q93 60 120 38 Q147 60 167 93" stroke="#F5E6D0" strokeWidth="3.5" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M80 95 Q120 75 160 95" stroke="#16A34A" strokeWidth="2" fill="none" opacity="0.4" />

      {/* Cap tail */}
      <path d="M165 60 Q185 38 205 50 Q215 58 210 72 Q206 82 200 78" fill="url(#sma-cap)" />
      <path d="M168 62 Q185 45 200 55 Q208 62 205 72" stroke="#F5E6D0" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />

      {/* Pompom */}
      <circle cx="207" cy="76" r="14" fill="url(#sma-pompom)" />
      <circle cx="203" cy="72" r="5" fill="#fff" opacity="0.35" />

      {/* Cheek blush */}
      <ellipse cx="90" cy="108" rx="10" ry="6" fill="#E8A0A0" opacity="0.25" />
      <ellipse cx="150" cy="108" rx="10" ry="6" fill="#E8A0A0" opacity="0.25" />

      {/* Eyes - WIDE OPEN, alert */}
      {/* Left eye */}
      <ellipse cx="103" cy="96" rx="12" ry="13" fill="url(#sma-eye-white)" />
      <ellipse cx="103" cy="96" rx="11" ry="12" fill="#fff" stroke="#C4A882" strokeWidth="0.5" />
      <circle cx="103" cy="97" r="7" fill="#5C3D20" />
      <circle cx="103" cy="97" r="5" fill="#3D2510" />
      <circle cx="100" cy="94" r="2.5" fill="#fff" />
      <circle cx="106" cy="99" r="1.2" fill="#fff" opacity="0.5" />

      {/* Right eye */}
      <ellipse cx="137" cy="96" rx="12" ry="13" fill="url(#sma-eye-white)" />
      <ellipse cx="137" cy="96" rx="11" ry="12" fill="#fff" stroke="#C4A882" strokeWidth="0.5" />
      <circle cx="137" cy="97" r="7" fill="#5C3D20" />
      <circle cx="137" cy="97" r="5" fill="#3D2510" />
      <circle cx="134" cy="94" r="2.5" fill="#fff" />
      <circle cx="140" cy="99" r="1.2" fill="#fff" opacity="0.5" />

      {/* Brow lines - alert, slightly raised */}
      <path d="M93 83 Q103 79 113 83" stroke="#B89E78" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M127 83 Q137 79 147 83" stroke="#B89E78" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="120" cy="110" rx="5.5" ry="4" fill="url(#sma-nose)" />
      <ellipse cx="118.5" cy="109" rx="2" ry="1.2" fill="#fff" opacity="0.3" />

      {/* Mouth - slight smile, awake */}
      <path d="M113 117 Q120 121 127 117" stroke="#8B6040" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="92" y1="108" x2="62" y2="103" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.6" />
      <line x1="92" y1="113" x2="62" y2="115" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.6" />
      <line x1="90" y1="118" x2="60" y2="126" stroke="#D4BC9A" strokeWidth="1" opacity="0.4" />
      <line x1="148" y1="108" x2="178" y2="103" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.6" />
      <line x1="148" y1="113" x2="178" y2="115" stroke="#D4BC9A" strokeWidth="1.2" opacity="0.6" />
      <line x1="150" y1="118" x2="180" y2="126" stroke="#D4BC9A" strokeWidth="1" opacity="0.4" />

      {/* Fur texture */}
      <path d="M75 100 Q78 98 80 101" stroke="#C4A882" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M160 100 Q163 98 165 101" stroke="#C4A882" strokeWidth="0.8" fill="none" opacity="0.3" />
    </svg>
  )
}
