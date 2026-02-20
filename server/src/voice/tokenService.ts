import { AccessToken } from 'livekit-server-sdk';
import { GamePhase } from '../../../shared/types';
import { warn } from '../utils/logger';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? '';
const LIVEKIT_URL = process.env.LIVEKIT_URL ?? '';

const SPEAKABLE_PHASES = new Set<string>([
  GamePhase.LOBBY,
  GamePhase.NIGHT,
  GamePhase.DAY,
  GamePhase.RESULT,
]);

export function isLiveKitConfigured(): boolean {
  return LIVEKIT_API_KEY.length > 0
    && LIVEKIT_API_SECRET.length > 0
    && LIVEKIT_URL.length > 0;
}

export function getLiveKitUrl(): string {
  return LIVEKIT_URL;
}

export function canPublishInPhase(phase: string): boolean {
  return SPEAKABLE_PHASES.has(phase);
}

export async function createVoiceToken(
  roomCode: string,
  playerId: string,
  playerName: string,
  canPublish: boolean,
): Promise<string | null> {
  if (!isLiveKitConfigured()) {
    warn('voice', 'LiveKit not configured, skipping token generation');
    return null;
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: playerId,
    name: playerName,
    ttl: '24h',
  });

  token.addGrant({
    room: `game-${roomCode}`,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
  });

  return await token.toJwt();
}
