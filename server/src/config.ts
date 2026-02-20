import {
  DEFAULT_NIGHT_ACTION_SECONDS,
  NIGHT_TURN_TIMEOUT_SECONDS,
  NIGHT_EMPTY_PAUSE_MS,
  DEFAULT_DAY_DISCUSSION_SECONDS,
  DEFAULT_VOTING_SECONDS,
  DEFAULT_DEALING_DELAY_SECONDS,
  RECONNECT_TIMEOUT_SECONDS,
} from '../../shared/constants';

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined) return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

export const SERVER_PORT = envInt('SERVER_PORT', 3001);

export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

/** All timing config — override via .env, fallback to shared/constants defaults */
export const TIMING = {
  nightActionSeconds: envInt('NIGHT_ACTION_SECONDS', DEFAULT_NIGHT_ACTION_SECONDS),
  nightTurnTimeoutSeconds: envInt('NIGHT_TURN_TIMEOUT_SECONDS', NIGHT_TURN_TIMEOUT_SECONDS),
  nightEmptyPauseMs: envInt('NIGHT_EMPTY_PAUSE_MS', NIGHT_EMPTY_PAUSE_MS),
  dayDiscussionSeconds: envInt('DAY_DISCUSSION_SECONDS', DEFAULT_DAY_DISCUSSION_SECONDS),
  votingSeconds: envInt('VOTING_SECONDS', DEFAULT_VOTING_SECONDS),
  dealingDelaySeconds: envInt('DEALING_DELAY_SECONDS', DEFAULT_DEALING_DELAY_SECONDS),
  reconnectTimeoutSeconds: envInt('RECONNECT_TIMEOUT_SECONDS', RECONNECT_TIMEOUT_SECONDS),
};
