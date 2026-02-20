import type { GameRoom } from './GameRoom';
import type { Player } from './Player';
import type { ClientGameState, ClientPlayer, ClientAccompliceState, NightSeat } from '../../../shared/types';
import { GamePhase, Role } from '../../../shared/types';
import { getRules } from '../../../shared/rules';

export function buildClientState(room: GameRoom, viewerId: string): ClientGameState {
  const rules = room.players.length >= 4 ? getRules(room.players.length) : null;
  const viewer = room.findPlayerById(viewerId);

  const players: ClientPlayer[] = room.players.map((sp) =>
    buildClientPlayer(sp, viewerId, room, rules),
  );

  let night: ClientGameState['night'] = null;
  if (room.phase === GamePhase.NIGHT) {
    const turnData = room.nightTurnData.get(viewerId);
    const remaining = room.nightTurnDeadline > 0
      ? Math.max(0, Math.ceil((room.nightTurnDeadline - Date.now()) / 1000))
      : 0;

    const isAwake = turnData?.isYourTurn ?? false;
    const awakeIds = turnData?.awakePlayerIds ?? [];

    const seats: NightSeat[] = isAwake
      ? room.players.map((p, i) => ({
          playerId: p.id,
          playerName: p.name,
          seatIndex: i,
          isAwake: awakeIds.includes(p.id),
          isSelf: p.id === viewerId,
        }))
      : [];

    night = {
      currentDice: room.nightCurrentDice,
      isYourTurn: isAwake,
      awakePlayerIds: awakeIds,
      canViewDice: turnData?.canViewDice ?? false,
      viewedDice: turnData?.viewedDice ?? null,
      cheeseStealVisible: turnData?.cheeseStealVisible ?? false,
      stealerName: turnData?.stealerName ?? null,
      stealerId: room.cheeseStolen
        ? (room.players.find((p) => p.role === Role.THIEF)?.id ?? null)
        : null,
      remainingSeconds: remaining,
      canSteal: turnData?.canSteal ?? false,
      hasStolen: turnData?.hasStolen ?? false,
      stealTimestamp: room.nightStealTimestamp,
      seats,
      viewDiceAction: room.nightViewDiceAction,
    };
  }

  let accomplice: ClientAccompliceState | null = null;
  if (room.phase === GamePhase.ACCOMPLICE) {
    const isThief = viewer?.role === Role.THIEF;
    const isAccomplice = viewer?.isAccomplice ?? false;

    // Candidates are only visible to the thief during the selection phase
    const candidates = isThief && room.accompliceSelecting
      ? room.players
          .filter((p) => p.id !== room.thiefId && p.role !== Role.SCAPEGOAT)
          .map((p) => ({ id: p.id, name: p.name }))
      : [];

    // Reveal data for accomplices after selection
    let knownThiefId: string | null = null;
    let knownThiefName: string | null = null;
    let knownAccompliceIds: string[] = [];
    let knownAccompliceNames: string[] = [];

    if (room.accompliceRevealed && isAccomplice && rules) {
      if (rules.accompliceKnowsThief) {
        knownThiefId = room.thiefId;
        knownThiefName = room.findPlayerById(room.thiefId!)?.name ?? null;
      }
      if (rules.accomplicesKnowEachOther) {
        knownAccompliceIds = room.accompliceIds.filter((id) => id !== viewerId);
        knownAccompliceNames = knownAccompliceIds.map(
          (id) => room.findPlayerById(id)?.name ?? '',
        );
      }
    }

    accomplice = {
      isThiefSelecting: room.accompliceSelecting,
      selectCount: room.accompliceSelectCount,
      candidates,
      youAreAccomplice: room.accompliceRevealed && isAccomplice,
      knownThiefId,
      knownThiefName,
      knownAccompliceIds,
      knownAccompliceNames,
    };
  }

  return {
    roomCode: room.roomCode,
    phase: room.phase,
    players,
    settings: room.settings,
    night,
    accomplice,
    day: null,
    vote: null,
    result: room.resultData ?? null,
  };
}

function buildClientPlayer(
  sp: Player,
  viewerId: string,
  room: GameRoom,
  rules: ReturnType<typeof getRules> | null,
): ClientPlayer {
  const isSelf = sp.id === viewerId;
  const isResult = room.phase === GamePhase.RESULT;

  const viewer = room.findPlayerById(viewerId);
  const viewerIsThief = viewer?.role === Role.THIEF;
  const viewerIsAccomplice = viewer?.isAccomplice ?? false;

  let visibleRole: string | null = null;
  if (isSelf || isResult) {
    visibleRole = sp.role;
  }

  let visibleDice: number[] | null = null;
  if (isSelf || isResult) {
    visibleDice = sp.diceValues;
  }

  let visibleAccomplice: boolean | null = null;
  if (isResult) {
    visibleAccomplice = sp.isAccomplice;
  } else if (isSelf) {
    visibleAccomplice = sp.isAccomplice;
  } else if (viewerIsThief && rules?.thiefKnowsAccomplice) {
    visibleAccomplice = sp.isAccomplice;
  } else if (viewerIsAccomplice && rules?.accomplicesKnowEachOther && sp.isAccomplice) {
    visibleAccomplice = true;
  }

  return {
    id: sp.id,
    name: sp.name,
    avatarIndex: sp.avatarIndex,
    isHost: sp.isHost,
    isConnected: sp.isConnected,
    hasVoted: sp.hasVoted,
    role: visibleRole as ClientPlayer['role'],
    diceValues: visibleDice,
    isAccomplice: visibleAccomplice,
    voteCount: isResult ? sp.voteCount : null,
    votedFor: isResult ? sp.votedFor : (isSelf ? sp.votedFor : null),
  };
}
