import { v4 as uuidv4 } from 'uuid';
import type { ServerPlayer, ClientPlayer, Role } from '../../../shared/types';
import { GamePhase } from '../../../shared/types';

export class Player implements ServerPlayer {
  id: string;
  name: string;
  avatarIndex: number;
  role: Role = null!;
  diceValues: number[] = [];
  chosenWakeDice: number | null = null;
  isHost: boolean;
  isAccomplice = false;
  isConnected = true;
  hasVoted = false;
  votedFor: string | null = null;
  voteCount = 0;
  sessionToken: string;
  disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(id: string, name: string, avatarIndex: number, isHost: boolean) {
    this.id = id;
    this.name = name;
    this.avatarIndex = avatarIndex;
    this.isHost = isHost;
    this.sessionToken = uuidv4();
  }

  toClientView(viewerId: string, phase: GamePhase, viewedDiceTargets: Set<string>): ClientPlayer {
    const isSelf = this.id === viewerId;
    const isResultPhase = phase === GamePhase.RESULT;

    return {
      id: this.id,
      name: this.name,
      avatarIndex: this.avatarIndex,
      isHost: this.isHost,
      isConnected: this.isConnected,
      hasVoted: this.hasVoted,
      role: (isSelf || isResultPhase) ? this.role : null,
      diceValues: (isSelf || isResultPhase || viewedDiceTargets.has(this.id))
        ? this.diceValues
        : null,
      isAccomplice: isResultPhase ? this.isAccomplice : (isSelf ? this.isAccomplice : null),
      voteCount: isResultPhase ? this.voteCount : null,
      votedFor: isResultPhase ? this.votedFor : (isSelf ? this.votedFor : null),
    };
  }

  resetForNewGame(): void {
    this.role = null!;
    this.diceValues = [];
    this.chosenWakeDice = null;
    this.isAccomplice = false;
    this.hasVoted = false;
    this.votedFor = null;
    this.voteCount = 0;
  }
}
