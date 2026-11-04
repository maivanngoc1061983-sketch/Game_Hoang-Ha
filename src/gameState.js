const questions = require('../data/questions.json');

class GameEngine {
  constructor() {
    this.status = 'LOBBY'; // LOBBY | QUESTION_ACTIVE | REVEAL | GAME_OVER
    this.currentQuestionIdx = 0;
    this.questionStartTime = 0;
    this.durationMs = 30000;
    this.networkBufferMs = 1000;
    this.players = new Map(); // socketId -> Player
  }

  addPlayer(socketId, name) {
    this.players.set(socketId, {
      id: socketId,
      name: name && name.trim() ? name.trim() : `Thí sinh ${this.players.size + 1}`,
      isAlive: true,
      currentAnswer: null,
      totalResponseTimeMs: 0
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  startQuestion(index) {
    this.currentQuestionIdx = index;
    this.status = 'QUESTION_ACTIVE';
    this.questionStartTime = Date.now();

    for (const player of this.players.values()) {
      player.currentAnswer = null;
    }

    const q = questions[this.currentQuestionIdx];
    return {
      index: this.currentQuestionIdx + 1,
      totalQuestions: questions.length,
      quota: q.quota,
      text: q.text,
      options: q.options,
      durationMs: this.durationMs
    };
  }

  recordAnswer(socketId, selectedIndex) {
    if (this.status !== 'QUESTION_ACTIVE') return { success: false, reason: 'NOT_ACTIVE' };

    const player = this.players.get(socketId);
    if (!player) return { success: false, reason: 'NOT_FOUND' };
    if (!player.isAlive) return { success: false, reason: 'SPECTATOR' };
    if (player.currentAnswer !== null) return { success: false, reason: 'ALREADY_SUBMITTED' };

    const responseTimeMs = Date.now() - this.questionStartTime;
    if (responseTimeMs > this.durationMs + this.networkBufferMs) {
      return { success: false, reason: 'TIMEOUT' };
    }

    const q = questions[this.currentQuestionIdx];
    player.currentAnswer = {
      selectedIndex,
      responseTimeMs,
      isCorrect: selectedIndex === q.correct
    };

    return { success: true, responseTimeMs };
  }

  processElimination() {
    this.status = 'REVEAL';
    const q = questions[this.currentQuestionIdx];
    const correctPlayers = [];
    const newlyEliminatedIds = [];

    for (const [id, player] of this.players.entries()) {
      if (!player.isAlive) continue;

      const ans = player.currentAnswer;
      if (!ans || !ans.isCorrect) {
        player.isAlive = false;
        newlyEliminatedIds.push(id);
      } else {
        correctPlayers.push(player);
      }
    }

    // Ưu tiên thời gian trả lời thấp nhất (nhanh nhất)
    correctPlayers.sort((a, b) => a.currentAnswer.responseTimeMs - b.currentAnswer.responseTimeMs);

    // Cắt theo hạn mức quota của câu
    const survivors = correctPlayers.slice(0, q.quota);
    const quotaEliminated = correctPlayers.slice(q.quota);

    quotaEliminated.forEach(p => {
      p.isAlive = false;
      newlyEliminatedIds.push(p.id);
    });

    survivors.forEach(p => {
      p.totalResponseTimeMs += p.currentAnswer.responseTimeMs;
    });

    const isLast = (this.currentQuestionIdx === questions.length - 1);
    const winner = (isLast && survivors.length > 0) ? survivors[0] : null;
    if (isLast) this.status = 'GAME_OVER';

    return {
      questionIndex: this.currentQuestionIdx,
      correctIndex: q.correct,
      quota: q.quota,
      survivorsCount: survivors.length,
      survivors: survivors.map(p => ({
        id: p.id,
        name: p.name,
        timeMs: p.currentAnswer.responseTimeMs,
        totalTimeMs: p.totalResponseTimeMs
      })),
      newlyEliminatedIds,
      winner
    };
  }
}

module.exports = new GameEngine();
