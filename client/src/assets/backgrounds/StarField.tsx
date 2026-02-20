export default function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient night sky */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0F0B2E 0%, #1E1B4B 40%, #2D1F6B 100%)',
        }}
      />

      {/* Moon */}
      <div className="absolute top-6 right-8">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="#FEF3C7" />
          <circle cx="30" cy="24" r="16" fill="#0F0B2E" opacity="0.15" />
          <circle cx="18" cy="18" r="3" fill="#E8D5B8" opacity="0.4" />
          <circle cx="28" cy="30" r="2" fill="#E8D5B8" opacity="0.3" />
          <circle cx="22" cy="26" r="1.5" fill="#E8D5B8" opacity="0.3" />
        </svg>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 30px 10px rgba(254, 243, 199, 0.15)',
          }}
        />
      </div>

      {/* Stars layer */}
      {STAR_POSITIONS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s[0]}%`,
            top: `${s[1]}%`,
            width: s[2],
            height: s[2],
            opacity: s[3],
            animation: `twinkle ${2 + s[4]}s ease-in-out ${s[4]}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

const STAR_POSITIONS: [number, number, number, number, number][] = [
  [5, 8, 2, 0.8, 0],
  [15, 5, 1.5, 0.6, 0.5],
  [25, 12, 2, 0.9, 1.2],
  [35, 3, 1, 0.5, 0.8],
  [45, 15, 2.5, 0.7, 1.5],
  [55, 7, 1.5, 0.8, 0.3],
  [65, 10, 2, 0.6, 2.0],
  [75, 4, 1, 0.9, 0.7],
  [85, 12, 2, 0.5, 1.8],
  [92, 6, 1.5, 0.7, 1.0],
  [10, 20, 1, 0.4, 2.2],
  [30, 22, 1.5, 0.6, 0.4],
  [50, 25, 1, 0.5, 1.6],
  [70, 18, 2, 0.7, 0.9],
  [88, 22, 1.5, 0.4, 1.3],
  [20, 30, 1, 0.3, 2.5],
  [60, 28, 1.5, 0.5, 0.2],
  [80, 32, 1, 0.4, 1.7],
  [40, 35, 2, 0.3, 0.6],
  [95, 15, 1, 0.6, 1.1],
]
