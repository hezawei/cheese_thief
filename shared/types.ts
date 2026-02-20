export const GamePhase = {
  LOBBY: 'LOBBY',
  DEALING: 'DEALING',
  NIGHT: 'NIGHT',
  ACCOMPLICE: 'ACCOMPLICE',
  DAY: 'DAY',
  VOTING: 'VOTING',
  RESULT: 'RESULT',
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export const Role = {
  THIEF: 'THIEF',
  SLEEPY: 'SLEEPY',
  SCAPEGOAT: 'SCAPEGOAT',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Team = {
  GOOD: 'GOOD',
  EVIL: 'EVIL',
  NEUTRAL: 'NEUTRAL',
} as const;
export type Team = (typeof Team)[keyof typeof Team];

export interface ServerPlayer {
  id: string;
  name: string;
  avatarIndex: number;
  role: Role;
  diceValues: number[];
  chosenWakeDice: number | null;
  isHost: boolean;
  isAccomplice: boolean;
  isConnected: boolean;
  hasVoted: boolean;
  votedFor: string | null;
  voteCount: number;
  sessionToken: string;
}

export interface ClientPlayer {
  id: string;
  name: string;
  avatarIndex: number;
  isHost: boolean;
  isConnected: boolean;
  hasVoted: boolean;
  role: Role | null;
  diceValues: number[] | null;
  isAccomplice: boolean | null;
  voteCount: number | null;
  votedFor: string | null;
}

export interface ClientGameState {
  roomCode: string;
  phase: GamePhase;
  players: ClientPlayer[];
  settings: GameSettings;
  night: ClientNightState | null;
  accomplice: ClientAccompliceState | null;
  day: ClientDayState | null;
  vote: ClientVoteState | null;
  result: ClientResultState | null;
}

export interface GameSettings {
  useScapegoat: boolean;
  nightActionSeconds: number;
  accompliceSelectSeconds: number;
  dayDiscussionSeconds: number;
  votingSeconds: number;
}

export interface NightSeat {
  playerId: string;
  playerName: string;
  seatIndex: number;
  isAwake: boolean;
  isSelf: boolean;
}

export interface NightViewDiceAction {
  viewerId: string;
  viewerName: string;
  targetId: string;
  targetName: string;
  value: number;
  timestamp: number;
}

export interface ClientNightState {
  currentDice: number;
  isYourTurn: boolean;
  awakePlayerIds: string[];
  canViewDice: boolean;
  viewedDice: ViewedDiceInfo | null;
  cheeseStealVisible: boolean;
  stealerName: string | null;
  stealerId: string | null;
  remainingSeconds: number;
  canSteal: boolean;
  hasStolen: boolean;
  stealTimestamp: number | null;
  seats: NightSeat[];
  viewDiceAction: NightViewDiceAction | null;
}

export interface ViewedDiceInfo {
  targetId: string;
  targetName: string;
  value: number;
}

export interface ClientAccompliceState {
  isThiefSelecting: boolean;
  selectCount: number;
  candidates: { id: string; name: string }[];
  youAreAccomplice: boolean;
  knownThiefId: string | null;
  knownThiefName: string | null;
  knownAccompliceIds: string[];
  knownAccompliceNames: string[];
}

export interface ClientDayState {
  messages: ChatMessage[];
  remainingSeconds: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: number;
}

export interface ClientVoteState {
  remainingSeconds: number;
  votedCount: number;
  totalCount: number;
  yourVote: string | null;
}

export interface ClientResultState {
  winnerTeam: Team;
  winnerLabel: string;
  revealedPlayers: RevealedPlayer[];
  allPlayers: FullPlayerInfo[];
}

export interface RevealedPlayer {
  id: string;
  name: string;
  role: Role;
  voteCount: number;
}

export interface FullPlayerInfo {
  id: string;
  name: string;
  role: Role;
  diceValues: number[];
  isAccomplice: boolean;
  votedFor: string | null;
}

export interface NightAction {
  diceValue: number;
  playerId: string;
  action: 'VIEW_DICE' | 'SKIP' | 'STEAL' | 'WITNESS';
  targetId: string | null;
  resultValue: number | null;
}

export interface RoomInfo {
  roomCode: string;
  players: ClientPlayer[];
  settings: GameSettings;
  hostId: string;
}
