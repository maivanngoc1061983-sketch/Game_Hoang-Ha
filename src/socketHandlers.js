const engine = require('./gameState');

module.exports = function (io) {
  let timerId = null;

  function endRound() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    const result = engine.processElimination();

    // 1. Chuyển người chơi bị loại sang phòng spectators
    result.newlyEliminatedIds.forEach(id => {
      const s = io.sockets.sockets.get(id);
      if (s) {
        s.leave('active_players');
        s.join('spectators');
        s.emit('player:status_changed', {
          isAlive: false,
          message: 'Bạn đã dừng bước và chuyển sang Chế độ theo dõi.'
        });
      }
    });

    // 2. Gửi thông báo cho những người còn đi tiếp
    result.survivors.forEach(p => {
      io.to(p.id).emit('player:status_changed', {
        isAlive: true,
        message: 'Chúc mừng! Bạn đã lọt vào vòng trong.',
        timeMs: p.timeMs
      });
    });

    // 3. Công bố kết quả câu hỏi tới tất cả client
    io.emit('game:round_closed', {
      correctIndex: result.correctIndex,
      survivorsCount: result.survivorsCount,
      quota: result.quota,
      topSurvivors: result.survivors.slice(0, 10),
      winner: result.winner
    });
  }

  io.on('connection', (socket) => {
    socket.on('player:join', ({ name }) => {
      engine.addPlayer(socket.id, name);
      socket.join('active_players');
      socket.emit('player:joined', { id: socket.id, name, isAlive: true });
      io.emit('stats:players_count', { count: engine.players.size });
    });

    socket.on('player:submit_answer', ({ answerIndex }) => {
      const res = engine.recordAnswer(socket.id, answerIndex);
      if (res.success) {
        socket.emit('player:answer_recorded', { timeMs: res.responseTimeMs });
        io.emit('admin:answer_update', { playerId: socket.id });
      } else {
        socket.emit('player:answer_rejected', { reason: res.reason });
      }
    });

    socket.on('admin:start_question', ({ questionIndex }) => {
      const qData = engine.startQuestion(questionIndex);
      io.emit('game:question_started', qData);

      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        if (engine.status === 'QUESTION_ACTIVE') {
          endRound();
        }
      }, qData.durationMs);
    });

    socket.on('admin:trigger_elimination', () => {
      if (engine.status === 'QUESTION_ACTIVE') {
        endRound();
      }
    });

    socket.on('disconnect', () => {
      engine.removePlayer(socket.id);
      io.emit('stats:players_count', { count: engine.players.size });
    });
  });
};
