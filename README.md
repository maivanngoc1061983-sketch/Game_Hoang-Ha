# Ứng Dụng Trắc Nghiệm Đấu Trường AI Thời Gian Thực (Elimination Quiz)

Hệ thống trắc nghiệm đấu trường loại dần theo thời gian thực (8 câu hỏi chủ đề AI) với thuật toán giới hạn Quota: 50 -> 40 -> 30 -> 20 -> 10 -> 6 -> 3 -> 1 Quán quân. Sử dụng Node.js, Express và Socket.IO quản lý bộ nhớ trực tiếp trên RAM.

---

## Cấu trúc thư mục dự án

```text
ai-quiz-game/
├── package.json               # Cấu hình dự án và dependencies
├── server.js                  # Express + Socket.IO server chính
├── README.md                  # Hướng dẫn cài đặt và triển khai
├── data/
│   └── questions.json         # Danh sách 8 câu hỏi AI & quota
├── src/
│   ├── gameState.js           # Xử lý In-Memory RAM, tính thời gian ms & bộ lọc loại
│   └── socketHandlers.js      # Bộ lắng nghe và phát tín hiệu sự kiện Socket.IO
└── public/
    ├── index.html             # Màn hình thí sinh (Điện thoại)
    └── admin.html             # Bảng điều khiển MC / Quản trị
```

---

## Hướng dẫn 1: Chạy thử trên máy nội bộ (Local)

1. Mở Terminal tại thư mục dự án và cài đặt thư viện:
   ```bash
   npm install
   ```
2. Khởi động ứng dụng:
   ```bash
   npm start
   ```
3. Truy cập trình duyệt:
   - Thí sinh: `http://localhost:3000`
   - Quản trị viên (MC): `http://localhost:3000/admin.html`

---

## Hướng dẫn 2: Đưa mã nguồn lên GitHub

1. Khởi tạo kho lưu trữ Git và commit toàn bộ code:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao du an AI Quiz Game"
   ```
2. Đổi tên nhánh chính sang `main`:
   ```bash
   git branch -M main
   ```
3. Tạo một Repository mới trên [GitHub](https://github.com/new) (ví dụ: `ai-quiz-game`).
4. Kết nối và đẩy code lên GitHub:
   ```bash
   git remote add origin https://github.com/<tai-khoan-github-cua-ban>/ai-quiz-game.git
   git push -u origin main
   ```

---

## Hướng dẫn 3: Triển khai lên Cloud lấy link Public miễn phí

Do ứng dụng duy trì kết nối WebSocket liên tục (Stateful), cần triển khai lên nền tảng hỗ trợ tiến trình Node.js chạy liên tục.

### Cách A: Triển khai trên Render.com (Khuyến nghị - Miễn phí)

1. Đăng nhập [Render.com](https://render.com) bằng tài khoản GitHub.
2. Chọn **New +** -> **Web Service**.
3. Chọn repo `ai-quiz-game` vừa đẩy lên GitHub.
4. Cấu hình triển khai:
   - **Name:** `ai-quiz-game`
   - **Region:** Singapore (Độ trễ ping thấp nhất cho người chơi tại Việt Nam)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Chọn gói **Free**
5. Bấm **Create Web Service**. Render sẽ tự động build và cấp link dạng:
   `https://ai-quiz-game.onrender.com`
6. Sử dụng:
   - Thí sinh quét QR hoặc truy cập: `https://ai-quiz-game.onrender.com`
   - MC điều khiển: `https://ai-quiz-game.onrender.com/admin.html`

---

### Cách B: Triển khai trên Railway.app

1. Đăng nhập [Railway.app](https://railway.app) bằng tài khoản GitHub.
2. Bấm **New Project** -> **Deploy from GitHub repo** -> Chọn `ai-quiz-game`.
3. Sau khi triển khai xong, vào **Settings** -> mục **Networking** -> bấm **Generate Domain**.
4. Nhận đường link công khai dạng `https://ai-quiz-game-production.up.railway.app` để sử dụng ngay lập tức.
