import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { getSocket } from '@/lib/socket'
import { C2S } from '@shared/events'
import { DICE_MAX, NIGHT_TURN_TIMEOUT_SECONDS } from '@shared/constants'
import StarField from '@/assets/backgrounds/StarField'
import Cheese from '@/assets/characters/Cheese'
import DiceCup from '@/assets/characters/DiceCup'
import CountdownRing from '@/components/animations/CountdownRing'
import RoundTable from './RoundTable'
import MouseSeat from './MouseSeat'
import { ThiefStealPanel, WitnessStealPanel, CheeseStealAnim } from './StealOverlay'
import { ViewDicePanel, DiceCupOpenAnim } from './ViewDiceOverlay'
import type { ClientNightState } from '@shared/types'

interface Props {
  night: ClientNightState
}

/* ── Layout constants ──────────────────────────
 * Maximized: fills the full mobile container width (430px).
 * Mice positioned by offsetting radially outward from their cup.
 */
const SCENE_SIZE = 450
const CENTER = SCENE_SIZE / 2
const TABLE_SIZE = 220
const CUP_RADIUS = 100
const CUP_MOUSE_GAP = 50
const MOUSE_SIZE = 66
const CUP_SIZE = 32
const CHEESE_SIZE = 58

function polarXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function seatAngle(index: number, total: number) {
  return (360 / total) * index
}

/* ── Component ───────────────────────────────── */

export default function NightScene({ night }: Props) {
  const [acted, setActed] = useState(false)
  const [ready, setReady] = useState(false)

  const {
    currentDice,
    seats,
    canSteal,
    hasStolen,
    canViewDice,
    viewedDice,
    cheeseStealVisible,
    stealerName,
    stealerId,
    awakePlayerIds,
    remainingSeconds,
    viewDiceAction,
  } = night

  const isThief = canSteal || hasStolen
  const stealHappened = hasStolen || cheeseStealVisible
  const cheeseOnTable = !stealHappened
  const wokeAlone = awakePlayerIds.length === 1

  const viewDicePlaying = !!viewDiceAction
  const viewDiceTargetIdx = viewDiceAction
    ? seats.find((s) => s.playerId === viewDiceAction.targetId)?.seatIndex ?? -1
    : -1

  // Thief seat position for directional steal animation
  const thiefSeatPos = useMemo(() => {
    if (!stealerId || seats.length === 0) return null
    const thiefSeat = seats.find((s) => s.playerId === stealerId)
    if (!thiefSeat) return null
    const angle = seatAngle(thiefSeat.seatIndex, seats.length)
    return polarXY(angle, CUP_RADIUS + CUP_MOUSE_GAP)
  }, [stealerId, seats])

  const seatPositions = useMemo(
    () =>
      seats.map((s) => {
        const angle = seatAngle(s.seatIndex, seats.length)
        const cup = polarXY(angle, CUP_RADIUS)
        const mouse = polarXY(angle, CUP_RADIUS + CUP_MOUSE_GAP)
        return { seat: s, cup, mouse }
      }),
    [seats],
  )

  function handleReady() {
    if (ready) return
    setReady(true)
    getSocket().emit(C2S.NIGHT_READY)
  }

  // Client-side countdown: server only sends remainingSeconds on state broadcasts,
  // so we decrement locally every second between broadcasts.
  const [localSeconds, setLocalSeconds] = useState(remainingSeconds)
  const lastServerVal = useRef(remainingSeconds)

  useEffect(() => {
    if (remainingSeconds !== lastServerVal.current) {
      lastServerVal.current = remainingSeconds
      setLocalSeconds(remainingSeconds)
    }
  }, [remainingSeconds])

  useEffect(() => {
    if (localSeconds <= 0) return undefined
    const tid = setInterval(() => setLocalSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(tid)
  }, [localSeconds])

  const needsAction = canSteal || (canViewDice && !viewedDice)
  const showReady = !needsAction && !ready

  return (
    <div className="relative flex flex-col items-center h-full overflow-hidden">
      <StarField />

      <div className="relative z-10 flex flex-col items-center w-full h-full">
        {/* ── Header bar ── */}
        <div className="flex items-center gap-3 pt-3 pb-1">
          <motion.h2
            className="text-base font-bold text-cheese-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            夜晚
          </motion.h2>
          <div className="flex gap-1">
            {Array.from({ length: DICE_MAX }, (_, i) => i + 1).map((d) => (
              <motion.div
                key={d}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  d === currentDice
                    ? 'bg-cheese-400 text-black'
                    : d < currentDice
                      ? 'bg-white/20 text-white/50'
                      : 'border border-white/15 text-white/25'
                }`}
                animate={d === currentDice ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {d}
              </motion.div>
            ))}
          </div>
          {localSeconds > 0 && (
            <CountdownRing seconds={localSeconds} total={NIGHT_TURN_TIMEOUT_SECONDS} size={36} />
          )}
        </div>

        {/* ── Scene area (table + seats + cups + cheese) ── */}
        <div
          className="relative flex-shrink-0 mx-auto"
          style={{ width: SCENE_SIZE, height: SCENE_SIZE }}
        >
          {/* Table */}
          <div
            className="absolute"
            style={{
              left: CENTER - TABLE_SIZE / 2,
              top: CENTER - TABLE_SIZE / 2,
            }}
          >
            <RoundTable size={TABLE_SIZE} />
          </div>

          {/* Center cheese with steal animation */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: CENTER,
              top: CENTER,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {stealHappened ? (
              <CheeseStealAnim
                playing={stealHappened}
                cheeseSize={CHEESE_SIZE}
                thiefX={thiefSeatPos ? thiefSeatPos.x - CENTER : 0}
                thiefY={thiefSeatPos ? thiefSeatPos.y - CENTER : -100}
              />
            ) : cheeseOnTable ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <Cheese size={CHEESE_SIZE} />
              </motion.div>
            ) : null}
          </div>

          {/* Dice cups on table + cup open animation */}
          {seatPositions.map(({ seat, cup }) => {
            const isTarget = viewDicePlaying && seat.seatIndex === viewDiceTargetIdx
            return (
              <div
                key={`cup-${seat.playerId}`}
                className="absolute pointer-events-none"
                style={{
                  left: cup.x,
                  top: cup.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {isTarget ? (
                  <DiceCupOpenAnim
                    targetSeatIndex={seat.seatIndex}
                    playing={true}
                    cupSize={CUP_SIZE}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 0.85, scale: 1 }}
                    transition={{ delay: seat.seatIndex * 0.05, duration: 0.3 }}
                  >
                    <DiceCup size={CUP_SIZE} />
                  </motion.div>
                )}
              </div>
            )
          })}

          {/* Mouse seats around table */}
          {seatPositions.map(({ seat, mouse }) => (
            <MouseSeat
              key={seat.playerId}
              seat={seat}
              x={mouse.x}
              y={mouse.y}
              mouseSize={MOUSE_SIZE}
            />
          ))}


        </div>

        {/* ── Action panel (below table) ── */}
        <div className="w-full max-w-[300px] flex flex-col items-center gap-2 px-4 pb-4">
          <AnimatePresence mode="wait">
            {/* Thief: steal button */}
            {isThief && (
              <motion.div key="thief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ThiefStealPanel
                  canSteal={canSteal}
                  hasStolen={hasStolen}
                  awakeCount={awakePlayerIds.length}
                />
              </motion.div>
            )}

            {/* Witness: sees steal */}
            {!isThief && cheeseStealVisible && (
              <motion.div key="witness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WitnessStealPanel stealerName={stealerName} />
              </motion.div>
            )}

            {/* Solo viewer: view dice */}
            {!isThief && !cheeseStealVisible && (canViewDice || viewedDice) && (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ViewDicePanel
                  canViewDice={canViewDice}
                  viewedDice={viewedDice}
                  seats={seats}
                  acted={acted}
                  onActed={() => setActed(true)}
                />
              </motion.div>
            )}

            {/* Woke alone, no ability */}
            {!isThief && !canViewDice && !viewedDice && !cheeseStealVisible && wokeAlone && (
              <motion.p key="alone" className="text-green-400/80 text-sm text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                你独自醒来了，四周安静无人。
              </motion.p>
            )}

            {/* Multiple awake, regular */}
            {!isThief && !canViewDice && !viewedDice && !cheeseStealVisible && !wokeAlone && (
              <motion.p key="together" className="text-white/60 text-sm text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                你和其他人一起醒来了，记住谁醒着。
              </motion.p>
            )}
          </AnimatePresence>

          {/* Ready button */}
          {showReady && (
            <motion.div className="w-full mt-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button onClick={handleReady} className="w-full" size="lg">
                继续
              </Button>
            </motion.div>
          )}

          {ready && (
            <motion.p className="text-white/40 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              等待其他人...
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
