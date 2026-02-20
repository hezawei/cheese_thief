import type { Socket, Server } from 'socket.io';
import { RoomManager } from '../game/RoomManager';
import { C2S, S2C } from '../../../shared/events';
import { GamePhase } from '../../../shared/types';
import { MIN_PLAYERS, MAX_PLAYERS } from '../../../shared/constants';
import { log, error as logError } from '../utils/logger';

function safeOn(socket: Socket, event: string, handler: (...args: any[]) => void): void {
  socket.on(event, (...args: any[]) => {
    try {
      handler(...args);
    } catch (err) {
      logError('handler', `Error in ${event} from ${socket.id}:`, err);
      socket.emit(S2C.ERROR, { message: '服务器内部错误，请重试' });
    }
  });
}

export function registerGameHandlers(socket: Socket, io: Server, roomManager: RoomManager): void {
  safeOn(socket, C2S.START_GAME, () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    const player = room.findPlayerById(socket.id);
    if (!player?.isHost) {
      socket.emit(S2C.ERROR, { message: '只有房主可以开始游戏' });
      return;
    }

    if (room.phase !== GamePhase.LOBBY) {
      socket.emit(S2C.ERROR, { message: '游戏已经开始' });
      return;
    }

    if (room.playerCount < MIN_PLAYERS || room.playerCount > MAX_PLAYERS) {
      socket.emit(S2C.ERROR, { message: `需要 ${MIN_PLAYERS}-${MAX_PLAYERS} 个玩家` });
      return;
    }

    log('game', `Starting game in ${room.roomCode} with ${room.playerCount} players`);
    room.startGame();
  });

  safeOn(socket, C2S.DEALING_READY, (data?: { chosenWakeDice?: number }) => {
    log('game', `DEALING_READY from ${socket.id}, data=${JSON.stringify(data)}`);
    const room = getRoomForSocket(socket, roomManager);
    if (!room) {
      log('game', `No room found for socket ${socket.id}`);
      return;
    }
    if (room.phase !== GamePhase.DEALING) {
      log('game', `Room ${room.roomCode} phase is ${room.phase}, not DEALING`);
      return;
    }

    room.markDealingReady(socket.id, data?.chosenWakeDice ?? null);
  });

  safeOn(socket, C2S.NIGHT_ACTION, (data: { action: string; targetId?: string }) => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;
    if (room.phase !== GamePhase.NIGHT) return;

    room.handleNightAction(socket.id, data.action, data.targetId ?? null);
  });

  safeOn(socket, C2S.NIGHT_STEAL, () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;
    if (room.phase !== GamePhase.NIGHT) return;

    room.handleNightSteal(socket.id);
  });

  safeOn(socket, C2S.NIGHT_READY, () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;
    if (room.phase !== GamePhase.NIGHT) return;

    room.handleNightReady(socket.id);
  });

  safeOn(socket, C2S.ACCOMPLICE_SELECT, (data: { targetIds: string[] }) => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;
    if (room.phase !== GamePhase.ACCOMPLICE) return;

    room.handleAccompliceSelect(socket.id, data.targetIds);
  });

  safeOn(socket, C2S.SEND_MESSAGE, (data: { content: string }) => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;
    if (room.phase !== GamePhase.DAY) return;

    room.handleMessage(socket.id, data.content);
  });

  safeOn(socket, C2S.CAST_VOTE, (data: { targetId: string }) => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;
    if (room.phase !== GamePhase.VOTING) return;

    room.handleVote(socket.id, data.targetId);
  });

  safeOn(socket, C2S.BACK_TO_LOBBY, () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;
    if (room.phase !== GamePhase.RESULT) return;

    const player = room.findPlayerById(socket.id);
    if (!player?.isHost) return;

    room.resetForNewGame();
    room.broadcastRoomUpdate();
    log('game', `Room ${room.roomCode} back to lobby`);
  });
}

function getRoomForSocket(socket: Socket, roomManager: RoomManager) {
  const roomCode = socket.data.roomCode as string | undefined;
  if (!roomCode) return null;
  return roomManager.getRoom(roomCode) ?? null;
}
