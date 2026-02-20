import type { Server } from 'socket.io';
import { GameRoom } from './GameRoom';
import { generateRoomCode } from '../utils/roomCode';
import { log } from '../utils/logger';

const MAX_CODE_ATTEMPTS = 100;

export class RoomManager {
  private rooms = new Map<string, GameRoom>();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  createRoom(): GameRoom {
    let code = '';
    let attempts = 0;
    do {
      code = generateRoomCode();
      attempts++;
      if (attempts > MAX_CODE_ATTEMPTS) {
        throw new Error('Failed to generate unique room code');
      }
    } while (this.rooms.has(code));

    const room = new GameRoom(code, this.io);
    this.rooms.set(code, room);
    log('manager', `Room ${code} created (total: ${this.rooms.size})`);
    return room;
  }

  getRoom(code: string): GameRoom | undefined {
    return this.rooms.get(code);
  }

  removeRoom(code: string): void {
    this.rooms.delete(code);
    log('manager', `Room ${code} removed (total: ${this.rooms.size})`);
  }

  cleanupIfEmpty(code: string): void {
    const room = this.rooms.get(code);
    if (room?.isEmpty()) {
      this.removeRoom(code);
    }
  }
}
