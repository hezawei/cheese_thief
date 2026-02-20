import type { Socket, Server } from 'socket.io';
import { RoomManager } from '../game/RoomManager';
import { C2S, S2C } from '../../../shared/events';
import { createVoiceToken, getLiveKitUrl, canPublishInPhase, isLiveKitConfigured } from '../voice/tokenService';
import { log, error as logError } from '../utils/logger';

export function registerVoiceHandlers(socket: Socket, _io: Server, roomManager: RoomManager): void {
  socket.on(C2S.REQUEST_VOICE_TOKEN, async () => {
    try {
      if (!isLiveKitConfigured()) {
        socket.emit(S2C.VOICE_TOKEN, { token: null, url: null });
        return;
      }

      const roomCode = socket.data.roomCode as string | undefined;
      if (!roomCode) return;

      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const player = room.findPlayerById(socket.id);
      if (!player) return;

      const canPublish = canPublishInPhase(room.phase);
      const token = await createVoiceToken(roomCode, player.id, player.name, canPublish);

      log('voice', `Token issued for ${player.name} in ${roomCode} (canPublish=${canPublish})`);
      socket.emit(S2C.VOICE_TOKEN, { token, url: getLiveKitUrl() });
    } catch (err) {
      logError('voice', `Error generating token for ${socket.id}:`, err);
      socket.emit(S2C.VOICE_TOKEN, { token: null, url: null });
    }
  });
}
