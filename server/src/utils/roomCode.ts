import { ROOM_CODE_LENGTH, ROOM_CODE_CHARSET } from '../../../shared/constants';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const idx = Math.floor(Math.random() * ROOM_CODE_CHARSET.length);
    code += ROOM_CODE_CHARSET[idx];
  }
  return code;
}
