import type { Server, Socket } from 'socket.io';
import { Player } from './Player';
import { buildClientState } from './ViewBuilder';
import type { GameSettings, ChatMessage, NightAction, ClientResultState } from '../../../shared/types';
import { GamePhase, Role, Team } from '../../../shared/types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  DICE_MIN,
  DICE_MAX,
} from '../../../shared/constants';
import { TIMING } from '../config';
import { getRules, buildRoleDeck } from '../../../shared/rules';
import { S2C } from '../../../shared/events';
import { shuffle } from '../utils/shuffle';
import { log, warn } from '../utils/logger';
import { muteAllParticipants, unmuteAllParticipants, unmuteSpecificParticipants } from '../voice/roomController';

export class GameRoom {
  roomCode: string;
  players: Player[] = [];
  phase: GamePhase = GamePhase.LOBBY;
  settings: GameSettings;
  io: Server;

  thiefId: string | null = null;
  accompliceIds: string[] = [];
  accompliceSelecting = false;
  accompliceSelectCount = 0;
  accompliceRevealed = false;
  cheeseStolen = false;
  nightActions: NightAction[] = [];
  messages: ChatMessage[] = [];
  resultData: ClientResultState | null = null;

  nightTurnData: Map<string, {
    isYourTurn: boolean;
    canViewDice: boolean;
    canSteal: boolean;
    hasStolen: boolean;
    awakePlayerIds: string[];
    cheeseStealVisible: boolean;
    stealerName: string | null;
    viewedDice: { targetId: string; targetName: string; value: number } | null;
  }> = new Map();
  nightReadySet = new Set<string>();
  nightExpectedIds: string[] = [];
  nightTurnDeadline = 0;
  nightStealTimestamp: number | null = null;
  nightViewDiceAction: {
    viewerId: string; viewerName: string;
    targetId: string; targetName: string;
    value: number; timestamp: number;
  } | null = null;

  private dealingReadySet = new Set<string>();
  nightCurrentDice = 0;
  private nightTimer: ReturnType<typeof setTimeout> | null = null;
  private dayTimer: ReturnType<typeof setTimeout> | null = null;
  private voteTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(roomCode: string, io: Server) {
    this.roomCode = roomCode;
    this.io = io;
    this.settings = {
      useScapegoat: false,
      nightActionSeconds: TIMING.nightActionSeconds,
      accompliceSelectSeconds: TIMING.accompliceSelectSeconds,
      dayDiscussionSeconds: TIMING.dayDiscussionSeconds,
      votingSeconds: TIMING.votingSeconds,
    };
  }

  addPlayer(socket: Socket, name: string, avatarIndex: number): Player | null {
    if (this.players.length >= MAX_PLAYERS) return null;
    if (this.phase !== GamePhase.LOBBY) return null;

    const isHost = this.players.length === 0;
    const player = new Player(socket.id, name, avatarIndex, isHost);
    this.players.push(player);
    socket.join(this.roomCode);
    log('room', `${name} joined ${this.roomCode} (${this.players.length} players)`);
    return player;
  }

  removePlayer(playerId: string): void {
    const idx = this.players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    const removed = this.players[idx];
    this.players.splice(idx, 1);
    log('room', `${removed.name} left ${this.roomCode} (${this.players.length} players)`);

    if (removed.isHost && this.players.length > 0) {
      this.players[0].isHost = true;
    }
  }

  findPlayerById(id: string): Player | undefined {
    return this.players.find((p) => p.id === id);
  }

  findPlayerByToken(token: string): Player | undefined {
    return this.players.find((p) => p.sessionToken === token);
  }

  get playerCount(): number {
    return this.players.length;
  }

  updateSettings(settings: Partial<GameSettings>): void {
    if (this.phase !== GamePhase.LOBBY) return;
    Object.assign(this.settings, settings);
  }

  private emitToPlayer(playerId: string, event: string, data: unknown): void {
    const sock = this.io.sockets.sockets.get(playerId);
    if (sock) {
      sock.emit(event, data);
    } else {
      warn('emit', `Socket ${playerId} not found for ${event}`);
    }
  }

  private emitToAll(event: string, data: unknown): void {
    for (const p of this.players) {
      this.emitToPlayer(p.id, event, data);
    }
  }

  broadcastRoomUpdate(): void {
    for (const player of this.players) {
      const state = buildClientState(this, player.id);
      this.emitToPlayer(player.id, S2C.GAME_STATE, state);
    }
  }

  isEmpty(): boolean {
    return this.players.length === 0;
  }

  // -- DEALING PHASE --

  startGame(): void {
    const rules = getRules(this.playerCount);
    const deck = shuffle(buildRoleDeck(this.playerCount, this.settings.useScapegoat));

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].role = deck[i];
      this.players[i].diceValues = this.rollDice(rules.dicePerPlayer);
      if (deck[i] === Role.THIEF) {
        this.thiefId = this.players[i].id;
      }
    }

    this.phase = GamePhase.DEALING;
    this.dealingReadySet.clear();
    this.broadcastRoomUpdate();
    log('game', `Dealing in ${this.roomCode}, thief=${this.thiefId}`);

    this.nightTimer = setTimeout(() => {
      this.forceAllDealingReady();
    }, 30_000);
  }

  markDealingReady(playerId: string, chosenWakeDice: number | null): void {
    const player = this.findPlayerById(playerId);
    if (!player) {
      warn('dealing', `Player ${playerId} not found in room ${this.roomCode}`);
      return;
    }

    if (chosenWakeDice !== null) {
      player.chosenWakeDice = chosenWakeDice;
    }

    this.dealingReadySet.add(playerId);
    log('dealing', `${player.name} ready (${this.dealingReadySet.size}/${this.playerCount})`);

    if (this.dealingReadySet.size >= this.playerCount) {
      log('dealing', `All ready, starting night phase`);
      this.clearTimer('night');
      try {
        this.startNightPhase();
      } catch (err) {
        warn('dealing', `startNightPhase error: ${err}`);
      }
    }
  }

  private forceAllDealingReady(): void {
    for (const p of this.players) {
      if (!this.dealingReadySet.has(p.id)) {
        if (p.diceValues.length === 2 && p.role !== Role.THIEF && !p.chosenWakeDice) {
          p.chosenWakeDice = p.diceValues[0];
        }
        this.dealingReadySet.add(p.id);
      }
    }
    this.startNightPhase();
  }

  // -- NIGHT PHASE --

  private startNightPhase(): void {
    log('night', `Starting night phase in ${this.roomCode}`);
    this.phase = GamePhase.NIGHT;
    this.cheeseStolen = false;
    this.nightActions = [];
    this.nightCurrentDice = 0;
    this.nightTurnData.clear();
    this.nightReadySet.clear();
    this.nightExpectedIds = [];
    this.nightTurnDeadline = 0;
    this.nightStealTimestamp = null;
    this.nightViewDiceAction = null;
    muteAllParticipants(this.roomCode);
    this.broadcastRoomUpdate();
    log('night', `Broadcast done, delaying before first dice`);
    this.nightTimer = setTimeout(() => this.advanceNightDice(), 1500);
  }

  private advanceNightDice(): void {
    this.nightCurrentDice++;
    this.nightTurnData.clear();
    this.nightReadySet.clear();
    this.nightExpectedIds = [];
    this.nightTurnDeadline = 0;
    this.nightStealTimestamp = null;
    this.nightViewDiceAction = null;

    if (this.nightCurrentDice > DICE_MAX) {
      this.onNightComplete();
      return;
    }

    log('night', `Dice ${this.nightCurrentDice} in ${this.roomCode}`);
    const awake = this.getAwakePlayers(this.nightCurrentDice);

    if (awake.length === 0) {
      muteAllParticipants(this.roomCode);
      this.broadcastRoomUpdate();
      this.nightTimer = setTimeout(() => this.advanceNightDice(), TIMING.nightEmptyPauseMs);
      return;
    }

    this.processNightTurn(awake);
  }

  private getAwakePlayers(dice: number): Player[] {
    const rules = getRules(this.playerCount);
    return this.players.filter((p) => {
      if (p.role === Role.THIEF) {
        return rules.dicePerPlayer === 2
          ? p.diceValues.includes(dice)
          : p.diceValues[0] === dice;
      }
      if (rules.dicePerPlayer === 2) {
        return p.chosenWakeDice === dice;
      }
      return p.diceValues[0] === dice;
    });
  }

  private processNightTurn(awake: Player[]): void {
    const rules = getRules(this.playerCount);
    const thief = awake.find((p) => p.role === Role.THIEF);
    const others = awake.filter((p) => p.role !== Role.THIEF);
    const awakeIds = awake.map((p) => p.id);

    this.nightExpectedIds = awakeIds;
    this.nightReadySet.clear();

    unmuteSpecificParticipants(this.roomCode, awakeIds);

    if (thief) {
      const canStealNow = !this.cheeseStolen;

      this.nightTurnData.set(thief.id, {
        isYourTurn: true,
        canViewDice: false,
        canSteal: canStealNow,
        hasStolen: false,
        awakePlayerIds: awakeIds,
        cheeseStealVisible: false,
        stealerName: null,
        viewedDice: null,
      });

      for (const other of others) {
        this.nightTurnData.set(other.id, {
          isYourTurn: true,
          canViewDice: false,
          canSteal: false,
          hasStolen: false,
          awakePlayerIds: awakeIds,
          cheeseStealVisible: false,
          stealerName: null,
          viewedDice: null,
        });
      }

      log('night', `Dice ${this.nightCurrentDice}: thief + ${others.length} others (canSteal=${canStealNow})`);
      this.startNightTurnTimer();
      return;
    }

    if (awake.length === 1 && rules.sleepyCanViewDice) {
      const solo = awake[0];
      this.nightTurnData.set(solo.id, {
        isYourTurn: true,
        canViewDice: true,
        canSteal: false,
        hasStolen: false,
        awakePlayerIds: awakeIds,
        cheeseStealVisible: false,
        stealerName: null,
        viewedDice: null,
      });

      log('night', `Dice ${this.nightCurrentDice}: ${solo.name} alone, can view dice`);
      this.startNightTurnTimer();
      return;
    }

    for (const p of awake) {
      this.nightTurnData.set(p.id, {
        isYourTurn: true,
        canViewDice: false,
        canSteal: false,
        hasStolen: false,
        awakePlayerIds: awakeIds,
        cheeseStealVisible: false,
        stealerName: null,
        viewedDice: null,
      });
    }

    log('night', `Dice ${this.nightCurrentDice}: ${awake.length} awake together`);
    this.startNightTurnTimer();
  }

  private startNightTurnTimer(): void {
    this.nightTurnDeadline = Date.now() + TIMING.nightTurnTimeoutSeconds * 1000;
    this.broadcastRoomUpdate();
    this.clearTimer('night');
    this.nightTimer = setTimeout(() => {
      log('night', `Dice ${this.nightCurrentDice}: timeout`);
      this.forceStealIfNeeded();
      this.advanceNightDice();
    }, TIMING.nightTurnTimeoutSeconds * 1000);
  }

  private forceStealIfNeeded(): void {
    if (this.cheeseStolen) return;
    const thief = this.players.find((p) => p.role === Role.THIEF);
    if (!thief) return;
    const turnData = this.nightTurnData.get(thief.id);
    if (!turnData?.canSteal) return;
    log('night', `Force-stealing for ${thief.name}`);
    this.executeSteal(thief.id);
  }

  private checkNightAllReady(): void {
    for (const id of this.nightExpectedIds) {
      if (!this.nightReadySet.has(id)) return;
    }
    log('night', `Dice ${this.nightCurrentDice}: all ${this.nightExpectedIds.length} players ready, advancing`);
    this.clearTimer('night');
    this.advanceNightDice();
  }

  handleNightSteal(playerId: string): void {
    const player = this.findPlayerById(playerId);
    if (!player || player.role !== Role.THIEF) return;
    const turnData = this.nightTurnData.get(playerId);
    if (!turnData?.canSteal || turnData.hasStolen) return;
    log('night', `${player.name} manually steals cheese`);
    this.executeSteal(playerId);
    this.broadcastRoomUpdate();
  }

  private executeSteal(thiefId: string): void {
    this.cheeseStolen = true;
    this.nightStealTimestamp = Date.now();

    this.nightActions.push({
      diceValue: this.nightCurrentDice,
      playerId: thiefId,
      action: 'STEAL',
      targetId: null,
      resultValue: null,
    });

    const thiefData = this.nightTurnData.get(thiefId);
    if (thiefData) {
      thiefData.canSteal = false;
      thiefData.hasStolen = true;
    }

    const thief = this.findPlayerById(thiefId);
    const thiefName = thief?.name ?? 'unknown';

    for (const [id, data] of this.nightTurnData) {
      if (id === thiefId) continue;
      data.cheeseStealVisible = true;
      data.stealerName = thiefName;
      this.nightActions.push({
        diceValue: this.nightCurrentDice,
        playerId: id,
        action: 'WITNESS',
        targetId: thiefId,
        resultValue: null,
      });
    }
  }

  handleNightReady(playerId: string): void {
    if (!this.nightExpectedIds.includes(playerId)) return;
    if (this.nightReadySet.has(playerId)) return;
    this.nightReadySet.add(playerId);
    log('night', `${this.findPlayerById(playerId)?.name ?? playerId} ready (${this.nightReadySet.size}/${this.nightExpectedIds.length})`);
    this.checkNightAllReady();
  }

  handleNightAction(playerId: string, action: string, targetId: string | null): void {
    if (action === 'VIEW_DICE' && targetId) {
      const target = this.findPlayerById(targetId);
      const viewer = this.findPlayerById(playerId);
      if (!target || !viewer || targetId === playerId) return;

      const value = target.diceValues[0] ?? 0;
      this.nightActions.push({
        diceValue: this.nightCurrentDice,
        playerId,
        action: 'VIEW_DICE',
        targetId,
        resultValue: value,
      });

      const turnData = this.nightTurnData.get(playerId);
      if (turnData) {
        turnData.viewedDice = { targetId, targetName: target.name, value };
        turnData.canViewDice = false;
      }

      this.nightViewDiceAction = {
        viewerId: playerId,
        viewerName: viewer.name,
        targetId,
        targetName: target.name,
        value,
        timestamp: Date.now(),
      };

      log('night', `${viewer.name} viewed ${target.name}'s dice: ${value}`);
      this.broadcastRoomUpdate();
    } else if (action === 'SKIP') {
      this.nightActions.push({
        diceValue: this.nightCurrentDice,
        playerId,
        action: 'SKIP',
        targetId: null,
        resultValue: null,
      });
      this.handleNightReady(playerId);
    }
  }

  private onNightComplete(): void {
    const rules = getRules(this.playerCount);
    if (rules.hasAccomplicePhase) {
      this.startAccomplicePhase();
    } else if (rules.accompliceMethod === 'natural') {
      this.resolveNaturalAccomplice();
      this.startDayPhase();
    } else {
      this.startDayPhase();
    }
  }

  // -- ACCOMPLICE PHASE --

  private startAccomplicePhase(): void {
    const rules = getRules(this.playerCount);
    this.phase = GamePhase.ACCOMPLICE;
    this.accompliceSelecting = true;
    this.accompliceSelectCount = rules.accompliceCount;
    this.accompliceRevealed = false;
    muteAllParticipants(this.roomCode);

    // Selection data is now delivered via broadcastRoomUpdate → ViewBuilder
    this.broadcastRoomUpdate();

    this.nightTimer = setTimeout(() => {
      this.autoSelectAccomplice();
    }, this.settings.accompliceSelectSeconds * 1000);
  }

  handleAccompliceSelect(playerId: string, targetIds: string[]): void {
    if (this.phase !== GamePhase.ACCOMPLICE) return;
    if (playerId !== this.thiefId) return;
    if (this.accompliceIds.length > 0) return;
    const rules = getRules(this.playerCount);
    if (targetIds.length !== rules.accompliceCount) return;

    this.clearTimer('night');
    this.applyAccomplice(targetIds);
  }

  private autoSelectAccomplice(): void {
    if (this.phase !== GamePhase.ACCOMPLICE) return;
    if (this.accompliceIds.length > 0) return;
    const rules = getRules(this.playerCount);
    const candidates = this.players
      .filter((p) => p.id !== this.thiefId && p.role !== Role.SCAPEGOAT)
      .map((p) => p.id);
    const selected = shuffle(candidates).slice(0, rules.accompliceCount);
    this.applyAccomplice(selected);
  }

  private applyAccomplice(targetIds: string[]): void {
    if (this.accompliceIds.length > 0) return;

    this.accompliceIds = targetIds;
    this.accompliceSelecting = false;
    this.accompliceRevealed = true;

    for (const id of targetIds) {
      const p = this.findPlayerById(id);
      if (p) p.isAccomplice = true;
    }

    const accompliceNames = targetIds.map((id) => this.findPlayerById(id)?.name ?? '');
    log('game', `Accomplices in ${this.roomCode}: ${accompliceNames.join(', ')}`);

    // Reveal data is now delivered via broadcastRoomUpdate → ViewBuilder
    this.broadcastRoomUpdate();

    this.nightTimer = setTimeout(() => this.startDayPhase(), 5000);
  }

  private resolveNaturalAccomplice(): void {
    const thiefDice = this.findPlayerById(this.thiefId!)?.diceValues[0];
    if (!thiefDice) return;

    const witnesses = this.nightActions
      .filter((a) => a.diceValue === thiefDice && a.action === 'WITNESS')
      .map((a) => a.playerId);

    if (witnesses.length === 1) {
      this.accompliceIds = [witnesses[0]];
      const p = this.findPlayerById(witnesses[0]);
      if (p) p.isAccomplice = true;
    }
  }

  // -- DAY PHASE --

  private startDayPhase(): void {
    this.phase = GamePhase.DAY;
    this.messages = [];
    unmuteAllParticipants(this.roomCode);
    this.broadcastRoomUpdate();

    this.dayTimer = setTimeout(() => {
      this.startVotePhase();
    }, this.settings.dayDiscussionSeconds * 1000);
  }

  handleMessage(playerId: string, content: string): void {
    const player = this.findPlayerById(playerId);
    if (!player || !content.trim() || content.length > 200) return;

    const msg: ChatMessage = {
      id: `${Date.now()}-${playerId}`,
      playerId,
      playerName: player.name,
      content: content.trim(),
      timestamp: Date.now(),
    };

    this.messages.push(msg);
    this.emitToAll(S2C.DAY_NEW_MESSAGE, msg);
  }

  // -- VOTE PHASE --

  private startVotePhase(): void {
    this.clearTimer('day');
    this.phase = GamePhase.VOTING;
    muteAllParticipants(this.roomCode);

    for (const p of this.players) {
      p.hasVoted = false;
      p.votedFor = null;
      p.voteCount = 0;
    }

    this.broadcastRoomUpdate();

    this.voteTimer = setTimeout(() => {
      this.forceEndVoting();
    }, this.settings.votingSeconds * 1000);
  }

  handleVote(playerId: string, targetId: string): void {
    const voter = this.findPlayerById(playerId);
    const target = this.findPlayerById(targetId);
    if (!voter || !target || voter.hasVoted || targetId === playerId) {
      log('vote', `Rejected vote: voter=${!!voter} target=${!!target} alreadyVoted=${voter?.hasVoted} self=${targetId === playerId}`);
      return;
    }

    voter.hasVoted = true;
    voter.votedFor = targetId;

    const votedCount = this.players.filter((p) => p.hasVoted).length;
    log('vote', `${voter.name} voted for ${target.name} (${votedCount}/${this.playerCount})`);

    this.emitToAll(S2C.VOTE_UPDATE, {
      votedCount,
      totalCount: this.playerCount,
    });

    if (votedCount >= this.playerCount) {
      log('vote', `All voted, ending voting`);
      this.clearTimer('vote');
      this.endVoting();
    }
  }

  private forceEndVoting(): void {
    const nonVoters = this.players.filter((p) => !p.hasVoted);
    for (const p of nonVoters) {
      p.hasVoted = true;
    }
    log('vote', `Timeout: ${nonVoters.length} player(s) abstained`);
    this.endVoting();
  }

  private endVoting(): void {
    log('vote', `endVoting called`);
    for (const p of this.players) {
      if (p.votedFor) {
        const target = this.findPlayerById(p.votedFor);
        if (target) target.voteCount++;
      }
    }
    try {
      this.calculateResult();
    } catch (err) {
      warn('vote', `calculateResult error: ${err}`);
    }
  }

  // -- RESULT PHASE --

  private calculateResult(): void {
    this.phase = GamePhase.RESULT;

    let maxVotes = 0;
    for (const p of this.players) {
      if (p.voteCount > maxVotes) maxVotes = p.voteCount;
    }
    const topVoted = this.players.filter((p) => p.voteCount === maxVotes);

    let winnerTeam: typeof Team[keyof typeof Team] = Team.EVIL;
    let winnerLabel = '奶酪大盗胜利';

    if (maxVotes > 0) {
      for (const p of topVoted) {
        if (p.role === Role.SCAPEGOAT) {
          winnerTeam = Team.NEUTRAL;
          winnerLabel = '背锅鼠胜利';
          break;
        }
        if (p.role === Role.THIEF) {
          winnerTeam = Team.GOOD;
          winnerLabel = '贪睡鼠胜利';
          break;
        }
      }
    }

    this.resultData = {
      winnerTeam,
      winnerLabel,
      revealedPlayers: topVoted.map((p) => ({
        id: p.id, name: p.name, role: p.role, voteCount: p.voteCount,
      })),
      allPlayers: this.players.map((p) => ({
        id: p.id, name: p.name, role: p.role,
        diceValues: p.diceValues, isAccomplice: p.isAccomplice,
        votedFor: p.votedFor,
      })),
    };

    log('game', `Result in ${this.roomCode}: ${winnerLabel}`);
    unmuteAllParticipants(this.roomCode);
    this.broadcastRoomUpdate();
  }

  // -- RESET --

  resetForNewGame(): void {
    this.clearAllTimers();
    this.phase = GamePhase.LOBBY;
    this.thiefId = null;
    this.accompliceIds = [];
    this.accompliceSelecting = false;
    this.accompliceSelectCount = 0;
    this.accompliceRevealed = false;
    this.cheeseStolen = false;
    this.nightActions = [];
    this.messages = [];
    this.nightCurrentDice = 0;
    this.nightTurnData.clear();
    this.nightReadySet.clear();
    this.nightExpectedIds = [];
    this.nightTurnDeadline = 0;
    this.resultData = null;

    for (const p of this.players) {
      p.resetForNewGame();
    }
  }

  // -- HELPERS --

  private rollDice(count: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push(Math.floor(Math.random() * (DICE_MAX - DICE_MIN + 1)) + DICE_MIN);
    }
    return result;
  }

  private clearTimer(type: 'night' | 'day' | 'vote'): void {
    const ref = type === 'night' ? 'nightTimer' : type === 'day' ? 'dayTimer' : 'voteTimer';
    if (this[ref]) {
      clearTimeout(this[ref]!);
      this[ref] = null;
    }
  }

  private clearAllTimers(): void {
    this.clearTimer('night');
    this.clearTimer('day');
    this.clearTimer('vote');
  }
}
