import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SERVER_PORT, CORS_ORIGIN } from './config';
import { RoomManager } from './game/RoomManager';
import { registerRoomHandlers } from './socket/roomHandler';
import { registerGameHandlers } from './socket/gameHandler';
import { registerVoiceHandlers } from './socket/voiceHandler';
import { log } from './utils/logger';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager(io);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  log('socket', `connected: ${socket.id}`);
  registerRoomHandlers(socket, io, roomManager);
  registerGameHandlers(socket, io, roomManager);
  registerVoiceHandlers(socket, io, roomManager);
});

httpServer.listen(SERVER_PORT, () => {
  log('server', `running on http://localhost:${SERVER_PORT}`);
});
