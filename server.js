const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Cấu hình phục vụ file tĩnh trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Gắn bộ điều khiển Socket.IO
require('./src/socketHandlers')(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` AI QUIZ SERVER DANG CHAY TAI PORT: ${PORT}`);
  console.log(` - Người chơi:  http://localhost:${PORT}`);
  console.log(` - Màn hình MC: http://localhost:${PORT}/admin.html`);
  console.log(`===============================================`);
});
