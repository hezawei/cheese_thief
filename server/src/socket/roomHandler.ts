import type { Socket, Server } from 'socket.io';
import { RoomManager } from '../game/RoomManager';
import { buildClientState } from '../game/ViewBuilder';
import { C2S, S2C } from '../../../shared/events';
import { RECONNECT_TIMEOUT_SECONDS } from '../../../shared/constants';
import { log, warn, error as logError } from '../utils/logger';

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

export function registerRoomHandlers(socket: Socket, io: Server, roomManager: RoomManager): void {
  safeOn(socket, C2S.CREATE_ROOM, (data: { name: string; avatarIndex: number }) => {
    const room = roomManager.createRoom();
    const player = room.addPlayer(socket, data.name, data.avatarIndex);
    if (!player) {
      socket.emit(S2C.ERROR, { message: '创建房间失败' });
      return;
    }

    socket.data.roomCode = room.roomCode;
    socket.data.playerId = player.id;

    socket.emit(S2C.ROOM_STATE, {
      roomCode: room.roomCode,
      playerId: player.id,
      sessionToken: player.sessionToken,
    });

    room.broadcastRoomUpdate();
  });

  safeOn(socket, C2S.JOIN_ROOM, (data: { roomCode: string; name: string; avatarIndex: number }) => {
    const code = data.roomCode.toUpperCase();
    const room = roomManager.getRoom(code);

    if (!room) {
      socket.emit(S2C.ERROR, { message: '房间不存在' });
      return;
    }

    const player = room.addPlayer(socket, data.name, data.avatarIndex);
    if (!player) {
      socket.emit(S2C.ERROR, { message: '房间已满或游戏已开始' });
      return;
    }

    socket.data.roomCode = room.roomCode;
    socket.data.playerId = player.id;

    socket.emit(S2C.ROOM_STATE, {
      roomCode: room.roomCode,
      playerId: player.id,
      sessionToken: player.sessionToken,
    });

    room.broadcastRoomUpdate();
  });

  safeOn(socket, C2S.LEAVE_ROOM, () => {
    handleLeave(socket, roomManager);
  });

  safeOn(socket, C2S.UPDATE_SETTINGS, (data: Record<string, unknown>) => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    const player = room.findPlayerById(socket.id);
    if (!player?.isHost) return;

    room.updateSettings(data);
    room.broadcastRoomUpdate();
  });

  safeOn(socket, C2S.RECONNECT, (data: { sessionToken: string; roomCode: string }) => {
    const room = roomManager.getRoom(data.roomCode.toUpperCase());
    if (!room) {
      socket.emit(S2C.ERROR, { message: '房间不存在' });
      return;
    }

    const player = room.findPlayerByToken(data.sessionToken);
    if (!player) {
      socket.emit(S2C.ERROR, { message: '会话已过期' });
      return;
    }

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }

    player.id = socket.id;
    player.isConnected = true;
    socket.data.roomCode = room.roomCode;
    socket.data.playerId = socket.id;
    socket.join(room.roomCode);

    log('reconnect', `${player.name} reconnected to ${room.roomCode}`);

    const state = buildClientState(room, socket.id);
    socket.emit(S2C.GAME_STATE, state);
    room.broadcastRoomUpdate();
  });

  socket.on('disconnect', () => {
    try {
      const roomCode = socket.data.roomCode as string | undefined;
      if (!roomCode) return;

      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const player = room.findPlayerById(socket.id);
      if (!player) return;

      player.isConnected = false;
      log('disconnect', `${player.name} disconnected from ${roomCode}`);

      io.to(roomCode).emit(S2C.PLAYER_DISCONNECTED, { playerId: player.id, name: player.name });

      player.disconnectTimer = setTimeout(() => {
        try {
          room.removePlayer(player.id);
          roomManager.cleanupIfEmpty(roomCode);
          room.broadcastRoomUpdate();
          warn('timeout', `${player.name} removed from ${roomCode} (timeout)`);
        } catch (err) {
          logError('timeout', `Error removing player ${player.name}:`, err);
        }
      }, RECONNECT_TIMEOUT_SECONDS * 1000);
    } catch (err) {
      logError('disconnect', `Error in disconnect handler for ${socket.id}:`, err);
    }
  });
}

function handleLeave(socket: Socket, roomManager: RoomManager): void {
  const roomCode = socket.data.roomCode as string | undefined;
  if (!roomCode) return;

  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  room.removePlayer(socket.id);
  socket.leave(roomCode);
  socket.data.roomCode = undefined;
  socket.data.playerId = undefined;

  roomManager.cleanupIfEmpty(roomCode);
  room.broadcastRoomUpdate();
}

function getRoomForSocket(socket: Socket, roomManager: RoomManager) {
  const roomCode = socket.data.roomCode as string | undefined;
  if (!roomCode) return null;
  return roomManager.getRoom(roomCode) ?? null;
}
