import { RoomServiceClient } from 'livekit-server-sdk';
import { isLiveKitConfigured } from './tokenService';
import { log, warn } from '../utils/logger';

const LIVEKIT_URL = process.env.LIVEKIT_URL ?? '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? '';

function toHttpUrl(url: string): string {
  return url.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
}

let cachedClient: RoomServiceClient | null = null;

function getClient(): RoomServiceClient | null {
  if (!isLiveKitConfigured()) return null;
  if (!cachedClient) {
    cachedClient = new RoomServiceClient(toHttpUrl(LIVEKIT_URL), LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  }
  return cachedClient;
}

function livekitRoomName(roomCode: string): string {
  return `game-${roomCode}`;
}

export async function muteAllParticipants(roomCode: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  const room = livekitRoomName(roomCode);
  try {
    const participants = await client.listParticipants(room);
    if (participants.length === 0) return;
    await Promise.allSettled(
      participants.map((p) =>
        client.updateParticipant(room, p.identity, undefined, {
          canPublish: false,
          canSubscribe: false,
        }),
      ),
    );
    log('voice', `Muted all in ${roomCode} (${participants.length} participants)`);
  } catch (err) {
    if (isRoomNotFound(err)) return;
    warn('voice', `muteAll failed for ${roomCode}: ${err}`);
  }
}

export async function unmuteAllParticipants(roomCode: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  const room = livekitRoomName(roomCode);
  try {
    const participants = await client.listParticipants(room);
    if (participants.length === 0) return;
    await Promise.allSettled(
      participants.map((p) =>
        client.updateParticipant(room, p.identity, undefined, {
          canPublish: true,
          canSubscribe: true,
        }),
      ),
    );
    log('voice', `Unmuted all in ${roomCode} (${participants.length} participants)`);
  } catch (err) {
    if (isRoomNotFound(err)) return;
    warn('voice', `unmuteAll failed for ${roomCode}: ${err}`);
  }
}

export async function unmuteSpecificParticipants(roomCode: string, allowedIdentities: string[]): Promise<void> {
  const client = getClient();
  if (!client) return;

  const room = livekitRoomName(roomCode);
  const allowed = new Set(allowedIdentities);
  try {
    const participants = await client.listParticipants(room);
    if (participants.length === 0) return;
    await Promise.allSettled(
      participants.map((p) => {
        const isAllowed = allowed.has(p.identity);
        return client.updateParticipant(room, p.identity, undefined, {
          canPublish: isAllowed,
          canSubscribe: isAllowed,
        });
      }),
    );
    log('voice', `Selective unmute in ${roomCode}: ${allowedIdentities.length} allowed`);
  } catch (err) {
    if (isRoomNotFound(err)) return;
    warn('voice', `unmuteSpecific failed for ${roomCode}: ${err}`);
  }
}

export async function deleteRoom(roomCode: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.deleteRoom(livekitRoomName(roomCode));
    log('voice', `Deleted LiveKit room for ${roomCode}`);
  } catch (err) {
    if (isRoomNotFound(err)) return;
    warn('voice', `deleteRoom failed for ${roomCode}: ${err}`);
  }
}

function isRoomNotFound(err: unknown): boolean {
  return String(err).includes('room does not exist');
}
