import { MIN_PLAYERS, MAX_PLAYERS } from './constants';
import { Role } from './types';

export interface PlayerCountRules {
  playerCount: number;
  dicePerPlayer: number;
  sleepyCanViewDice: boolean;
  hasAccomplicePhase: boolean;
  accompliceCount: number;
  accompliceMethod: 'none' | 'natural' | 'thief_select';
  thiefKnowsAccomplice: boolean;
  accompliceKnowsThief: boolean;
  accomplicesKnowEachOther: boolean;
  canUseScapegoat: boolean;
}

const RULES_BY_PLAYER_COUNT: Record<number, PlayerCountRules> = {
  4: {
    playerCount: 4,
    dicePerPlayer: 2,
    sleepyCanViewDice: false,
    hasAccomplicePhase: false,
    accompliceCount: 0,
    accompliceMethod: 'none',
    thiefKnowsAccomplice: false,
    accompliceKnowsThief: false,
    accomplicesKnowEachOther: false,
    canUseScapegoat: false,
  },
  5: {
    playerCount: 5,
    dicePerPlayer: 1,
    sleepyCanViewDice: true,
    hasAccomplicePhase: false,
    accompliceCount: 0,
    accompliceMethod: 'natural',
    thiefKnowsAccomplice: true,
    accompliceKnowsThief: true,
    accomplicesKnowEachOther: false,
    canUseScapegoat: false,
  },
  6: {
    playerCount: 6,
    dicePerPlayer: 1,
    sleepyCanViewDice: true,
    hasAccomplicePhase: true,
    accompliceCount: 1,
    accompliceMethod: 'thief_select',
    thiefKnowsAccomplice: true,
    accompliceKnowsThief: true,
    accomplicesKnowEachOther: false,
    canUseScapegoat: true,
  },
  7: {
    playerCount: 7,
    dicePerPlayer: 1,
    sleepyCanViewDice: true,
    hasAccomplicePhase: true,
    accompliceCount: 2,
    accompliceMethod: 'thief_select',
    thiefKnowsAccomplice: true,
    accompliceKnowsThief: false,
    accomplicesKnowEachOther: true,
    canUseScapegoat: true,
  },
  8: {
    playerCount: 8,
    dicePerPlayer: 1,
    sleepyCanViewDice: true,
    hasAccomplicePhase: true,
    accompliceCount: 2,
    accompliceMethod: 'thief_select',
    thiefKnowsAccomplice: true,
    accompliceKnowsThief: true,
    accomplicesKnowEachOther: true,
    canUseScapegoat: true,
  },
};

export function getRules(playerCount: number): PlayerCountRules {
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(
      `Player count must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}, got ${playerCount}`
    );
  }
  return RULES_BY_PLAYER_COUNT[playerCount];
}

export function buildRoleDeck(
  playerCount: number,
  useScapegoat: boolean
): Role[] {
  const rules = getRules(playerCount);
  const deck: Role[] = [Role.THIEF];

  if (useScapegoat && rules.canUseScapegoat) {
    deck.push(Role.SCAPEGOAT);
  }

  while (deck.length < playerCount) {
    deck.push(Role.SLEEPY);
  }

  return deck;
}
