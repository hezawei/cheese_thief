import SleepyMouse from '@/assets/characters/SleepyMouse'
import ThiefMouse from '@/assets/characters/ThiefMouse'
import ScapegoatMouse from '@/assets/characters/ScapegoatMouse'
import Cheese from '@/assets/characters/Cheese'
import DiceFace from '@/assets/characters/DiceFace'

const ITEMS = [
  { label: 'SleepyMouse', el: <SleepyMouse size={200} /> },
  { label: 'ThiefMouse', el: <ThiefMouse size={200} /> },
  { label: 'ScapegoatMouse', el: <ScapegoatMouse size={200} /> },
  { label: 'Cheese', el: <Cheese size={200} /> },
  { label: 'Dice 1', el: <DiceFace value={1} size={100} /> },
  { label: 'Dice 3', el: <DiceFace value={3} size={100} /> },
  { label: 'Dice 6', el: <DiceFace value={6} size={100} /> },
]

export default function SvgPreview() {
  return (
    <div style={{ background: '#451A03', minHeight: '100vh', padding: 24, overflow: 'auto' }}>
      <h1 style={{ color: '#FBBF24', fontSize: 24, marginBottom: 24, textAlign: 'center' }}>
        SVG Preview
      </h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        {ITEMS.map((item) => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{
              background: '#5C2D0E',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #78350F',
              display: 'inline-block',
            }}>
              {item.el}
            </div>
            <p style={{ color: '#FDE68A', marginTop: 8, fontSize: 14 }}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
