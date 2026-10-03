# Kế hoạch phát triển Game Cờ Vua 2D & 3D

> Tài liệu phân tích yêu cầu, thiết kế kiến trúc và lộ trình code cho một game cờ vua chạy trên web, hỗ trợ cả chế độ hiển thị 2D và 3D, dùng chung một lõi luật cờ.

---

## 1. Mục tiêu

- Xây dựng game cờ vua **đúng luật FIDE đầy đủ**, chơi được trên trình duyệt (desktop + mobile).
- Hai chế độ hiển thị **2D** (nhẹ, nhanh, rõ ràng) và **3D** (đẹp, xoay camera, hoạt ảnh), **chuyển đổi tức thì** giữa hai chế độ mà không mất trạng thái ván cờ.
- Chế độ chơi: 2 người cùng máy, chơi với máy (AI nhiều cấp độ), và (giai đoạn sau) chơi online.
- Kiến trúc tách biệt: **lõi luật cờ không phụ thuộc giao diện**, để 2D/3D chỉ là hai "lớp vẽ" khác nhau.

## 2. Phạm vi tính năng

| Mức ưu tiên | Tính năng |
|---|---|
| **MVP (bắt buộc)** | Bàn cờ 2D, đi quân đúng luật, gợi ý nước đi hợp lệ, phát hiện chiếu / chiếu hết / hòa, phong cấp, nhập thành, bắt tốt qua đường, undo/redo, lịch sử nước đi |
| **Cốt lõi** | Bàn cờ 3D, chuyển 2D ↔ 3D, chơi với AI (Stockfish), đồng hồ thi đấu, lật bàn cờ, âm thanh |
| **Mở rộng** | Import/Export PGN & FEN, phân tích ván cờ, bài tập (puzzle), chủ đề bàn cờ / bộ quân, lưu ván cục bộ |
| **Nâng cao** | Chơi online realtime, phòng chơi, xếp hạng Elo, xem lại ván, chat |

## 3. Phân tích luật cờ cần xử lý

Đây là phần dễ sai nhất, cần làm kỹ và test tự động:

- **Di chuyển cơ bản** của 6 loại quân: Vua, Hậu, Xe, Tượng, Mã, Tốt.
- **Tốt**: đi 1 ô, đi 2 ô từ hàng xuất phát, ăn chéo, **bắt tốt qua đường (en passant)** chỉ hợp lệ ngay nước kế tiếp, **phong cấp** (Hậu/Xe/Tượng/Mã).
- **Nhập thành** (cánh vua & cánh hậu): vua và xe chưa từng di chuyển, giữa không có quân, vua không đang bị chiếu, không đi qua hoặc dừng ở ô bị tấn công.
- **Nước đi hợp lệ** = nước đi giả hợp lệ (pseudo-legal) mà sau khi đi **vua mình không bị chiếu** (xử lý quân bị ghim).
- **Kết thúc ván**:
  - Chiếu hết (checkmate), hết nước đi (stalemate)
  - Luật 50 nước (không ăn quân, không đi tốt)
  - Lặp lại thế cờ 3 lần (cần hash thế cờ – Zobrist)
  - Không đủ quân để chiếu hết (K vs K, K+B vs K, K+N vs K, K+B vs K+B cùng màu ô)
  - Hết giờ, xin thua, thỏa thuận hòa

## 4. Lựa chọn công nghệ

### Phương án đề xuất (Web)

| Thành phần | Công nghệ | Lý do |
|---|---|---|
| Ngôn ngữ | **TypeScript** | Kiểu dữ liệu chặt chẽ, rất hợp mô hình hóa luật cờ |
| Build tool | **Vite** | Nhanh, cấu hình đơn giản |
| UI framework | **React** | Quản lý màn hình, menu, panel lịch sử |
| Render 2D | **SVG** hoặc **HTML/CSS Grid** (hoặc Canvas nếu cần hiệu ứng nhiều) | SVG sắc nét mọi độ phân giải, dễ kéo-thả |
| Render 3D | **Three.js** + **React Three Fiber** + **@react-three/drei** | Hệ sinh thái mạnh, có sẵn OrbitControls, loader GLTF |
| Quản lý state | **Zustand** | Nhẹ, dùng chung được giữa cây React 2D và 3D |
| Luật cờ | Tự viết (khuyến nghị để học) **hoặc** `chess.js` | `chess.js` giúp ra MVP nhanh; tự viết giúp kiểm soát hoàn toàn |
| AI | **Stockfish (WASM)** chạy trong **Web Worker** | Mạnh, miễn phí, không chặn UI |
| Online (giai đoạn sau) | **PHP 8.1+ + MySQL** (polling) + `p-chess/chess` | Dùng luôn hosting hiện có, server xác thực nước đi (xem mục 11) |
| Test | **Vitest** + **Playwright** | Unit test luật cờ + E2E giao diện |

### Ràng buộc hosting: Linux, không C#, không Node.js

Hosting chỉ cần **phục vụ file tĩnh** (Apache/Nginx). Node.js chỉ dùng **trên máy tính của bạn** để code và build, không cần trên hosting:

```
Máy dev (cài Node)            Hosting Linux (không Node)
──────────────────            ──────────────────────────
npm install
npm run build   ──► dist/ ──► upload qua FTP/SFTP/File Manager
                               vào public_html/ (hoặc /var/www/...)
```

- Thư mục `dist/` chỉ gồm HTML, JS, CSS, ảnh, model `.glb` và `stockfish.wasm`. Trình duyệt của người chơi chạy toàn bộ game: luật cờ, 2D/3D và cả AI.
- Có thể tự động deploy bằng **GitHub Actions**: build trên GitHub, rồi đẩy `dist/` lên hosting qua FTP/SFTP.

File `.htaccess` (đặt trong `dist/public/`, dùng cho Apache/shared hosting):

```apache
# MIME type cho Stockfish WASM
AddType application/wasm .wasm

# Điều hướng mọi đường dẫn về index.html (SPA)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]

# Cache file tĩnh lâu
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType application/wasm "access plus 1 year"
  ExpiresByType model/gltf-binary "access plus 1 year"
</IfModule>
```

> **Lưu ý:** Stockfish bản đa luồng cần header `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`, thường shared hosting không cho đặt. Vì vậy dùng **bản Stockfish đơn luồng (single-threaded / lite)**, chạy được mọi nơi và đủ mạnh cho game.

> **Chốt:** dùng Web + TypeScript, build trên máy cá nhân, upload file tĩnh lên hosting.

## 5. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────┐
│                       UI (React)                          │
│   Menu · Cài đặt · Lịch sử nước đi · Đồng hồ · Thông báo  │
└───────────────┬───────────────────────────┬──────────────┘
                │                           │
       ┌────────▼────────┐         ┌────────▼────────┐
       │  Renderer 2D    │         │  Renderer 3D    │
       │  (SVG/Canvas)   │         │  (Three.js/R3F) │
       └────────┬────────┘         └────────┬────────┘
                │   cùng đọc / gửi action   │
                └────────────┬──────────────┘
                     ┌───────▼────────┐
                     │  Game Store    │  (Zustand)
                     │  state + action│
                     └───────┬────────┘
          ┌──────────────────┼───────────────────┐
  ┌───────▼───────┐  ┌───────▼───────┐   ┌───────▼───────┐
  │  Chess Core   │  │  AI Service   │   │ Network Layer │
  │ (luật, thuần  │  │ (Stockfish    │   │ (PHP API +    │
  │  TS, không UI)│  │  Web Worker)  │   │  MySQL)       │
  └───────────────┘  └───────────────┘   └───────────────┘
```

**Nguyên tắc chính**

1. `chess-core` là **hàm thuần**, không biết gì về React, Three.js hay DOM → test dễ, tách bạch rõ ràng.
2. Renderer 2D và 3D **chỉ đọc state và phát ra action** (`selectSquare`, `makeMove`…). Không renderer nào tự chứa luật.
3. Chuyển 2D ↔ 3D chỉ là đổi component hiển thị; state nằm trong store nên giữ nguyên.

## 6. Thiết kế lõi luật cờ (Chess Core)

### 6.1. Biểu diễn bàn cờ

| Cách | Ưu điểm | Nhược điểm | Dùng khi |
|---|---|---|---|
| Mảng 8×8 | Dễ hiểu, dễ debug | Chậm hơn | **MVP, học tập** |
| Mảng 0x88 (128 ô) | Kiểm tra ra ngoài bàn rất nhanh | Khó đọc hơn | Muốn tối ưu vừa phải |
| Bitboard (64-bit) | Nhanh nhất | Phức tạp, JS cần BigInt | Tự viết AI mạnh |

→ Bắt đầu với **mảng 64 phần tử** (index 0 = a1 … 63 = h8), có thể nâng cấp sau.

### 6.2. Kiểu dữ liệu chính

```ts
type Color = 'w' | 'b';
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
interface Piece { type: PieceType; color: Color; }

type Square = number; // 0..63

interface CastlingRights { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean; }

interface Position {
  board: (Piece | null)[];      // 64 ô
  turn: Color;
  castling: CastlingRights;
  enPassant: Square | null;     // ô có thể bắt qua đường
  halfmoveClock: number;        // cho luật 50 nước
  fullmoveNumber: number;
}

interface Move {
  from: Square;
  to: Square;
  piece: PieceType;
  captured?: PieceType;
  promotion?: Exclude<PieceType, 'p' | 'k'>;
  flags: 'normal' | 'capture' | 'double' | 'enpassant' | 'castleK' | 'castleQ' | 'promotion';
  san?: string;                 // ký hiệu đại số, vd "Nxe5+"
}

type GameResult =
  | { status: 'ongoing' }
  | { status: 'checkmate'; winner: Color }
  | { status: 'draw'; reason: 'stalemate' | 'fifty-move' | 'threefold' | 'insufficient' | 'agreement' }
  | { status: 'timeout' | 'resign'; winner: Color };
```

### 6.3. API của lõi

```ts
parseFEN(fen: string): Position
toFEN(pos: Position): string
generateLegalMoves(pos: Position, from?: Square): Move[]
makeMove(pos: Position, move: Move): Position        // trả về Position mới (immutable)
isInCheck(pos: Position, color: Color): boolean
isSquareAttacked(pos: Position, sq: Square, by: Color): boolean
getResult(pos: Position, history: string[]): GameResult
moveToSAN(pos: Position, move: Move): string
parsePGN(pgn: string): { headers: Record<string,string>; moves: Move[] }
toPGN(game: GameState): string
zobristHash(pos: Position): bigint                    // phát hiện lặp 3 lần
```

### 6.4. Thuật toán sinh nước đi hợp lệ

1. Sinh **pseudo-legal moves** cho mọi quân của bên đang đi (quân trượt: Xe/Tượng/Hậu dùng vòng lặp theo hướng; Mã/Vua dùng bảng offset).
2. Thêm nước đặc biệt: nhập thành, en passant, phong cấp.
3. Với mỗi nước: thử đi → nếu vua mình bị tấn công thì **loại bỏ**.
4. Kết quả rỗng → kiểm tra `isInCheck` để phân biệt **chiếu hết** hay **hết nước (hòa)**.

### 6.5. Kiểm thử bằng Perft

Perft đếm số nút ở độ sâu N từ thế cờ chuẩn, là cách **chắc chắn nhất** để xác nhận bộ sinh nước đi đúng.

| Độ sâu | Thế cờ ban đầu (số nút đúng) |
|---|---|
| 1 | 20 |
| 2 | 400 |
| 3 | 8 902 |
| 4 | 197 281 |
| 5 | 4 865 609 |

Ngoài ra test với các thế cờ "Kiwipete" và các FEN chuyên kiểm tra nhập thành, en passant, phong cấp.

## 7. Game Store (quản lý trạng thái)

```ts
interface GameState {
  position: Position;
  history: Move[];
  positionHashes: string[];     // phục vụ lặp 3 lần
  redoStack: Move[];
  selected: Square | null;
  legalTargets: Square[];       // ô sáng lên khi chọn quân
  lastMove: Move | null;
  result: GameResult;
  pendingPromotion: { from: Square; to: Square } | null;
  orientation: Color;           // lật bàn
  viewMode: '2d' | '3d';
  mode: 'local' | 'ai' | 'online';
  aiLevel: number;              // 1..20
  clock: { w: number; b: number; increment: number; running: boolean };
}

// Actions
selectSquare(sq) · makeMove(move) · choosePromotion(type) · undo() · redo()
newGame(options) · loadFEN(fen) · loadPGN(pgn) · flipBoard() · setViewMode(mode)
resign() · offerDraw()
```

Luồng xử lý một lần nhấp ô:

```
Nhấp ô ─► có quân mình? ──có──► chọn quân, tính legalTargets
             │
             └─không─► ô nằm trong legalTargets? ──có──► là phong cấp? ──có──► mở hộp chọn quân
                                  │                           └─không─► makeMove → cập nhật result
                                  └─không──► bỏ chọn
```

## 8. Thiết kế Renderer 2D

- Bàn cờ: lưới 8×8 bằng SVG, tọa độ a–h / 1–8 ở viền.
- Quân cờ: bộ icon SVG (bộ "cburnett" giấy phép mở, hoặc tự vẽ).
- Tương tác: **nhấp-nhấp** và **kéo-thả** (Pointer Events, hỗ trợ cả cảm ứng).
- Hiệu ứng: tô sáng ô được chọn, chấm tròn cho nước hợp lệ, viền đỏ khi vua bị chiếu, tô màu nước đi cuối.
- Hoạt ảnh di chuyển quân bằng CSS transform (150–250ms).
- Responsive: bàn cờ dùng `aspect-ratio: 1`, co theo chiều nhỏ hơn của màn hình.
- Truy cập: mỗi ô có `aria-label` ("e4, Tốt trắng"), hỗ trợ điều khiển bằng bàn phím.

## 9. Thiết kế Renderer 3D

### 9.1. Cảnh (scene)

- **Bàn cờ**: 64 khối hộp mỏng hoặc 1 mặt phẳng có texture + khung gỗ bao quanh.
- **Quân cờ**: model **GLTF/GLB** (tạo bằng Blender hoặc lấy từ nguồn CC0), mỗi loại 1 mesh, dùng **InstancedMesh** hoặc tái sử dụng geometry để tối ưu.
- **Ánh sáng**: 1 DirectionalLight có bóng đổ + AmbientLight/HemisphereLight; dùng Environment map (HDRI) cho vật liệu PBR bóng bẩy.
- **Camera**: PerspectiveCamera + OrbitControls, giới hạn góc nghiêng (không chui dưới bàn), nút "về góc nhìn mặc định", tự xoay camera theo bên đang đi (tùy chọn).

### 9.2. Ánh xạ tọa độ

```ts
// ô (file 0..7, rank 0..7) → vị trí thế giới 3D, mỗi ô rộng 1 đơn vị, tâm bàn tại gốc
const toWorld = (sq: Square) => ({
  x: (sq % 8) - 3.5,
  y: 0,
  z: 3.5 - Math.floor(sq / 8),
});
```

### 9.3. Tương tác

- **Raycasting** khi nhấp chuột/chạm để xác định ô hoặc quân được chọn (R3F hỗ trợ sẵn `onClick`/`onPointerDown` trên mesh).
- Quân được chọn **nhấc lên** nhẹ; ô hợp lệ hiện marker phát sáng.
- Kéo-thả 3D: chiếu tia lên mặt phẳng bàn cờ để quân bám theo con trỏ.

### 9.4. Hoạt ảnh

- Di chuyển theo **đường cong parabol** (nhấc lên – trượt – hạ xuống), Mã nhảy cao hơn.
- Quân bị ăn: mờ dần/rơi khỏi bàn rồi xếp sang bên cạnh.
- Nhập thành: Vua và Xe di chuyển tuần tự.
- Dùng `useFrame` hoặc thư viện `@react-spring/three`.

### 9.5. Hiệu năng

- Mục tiêu **60 FPS** trên laptop tầm trung, **30+ FPS** trên mobile.
- Nén model bằng Draco/Meshopt, texture KTX2.
- Tùy chọn chất lượng: Thấp (tắt bóng, tắt HDRI) / Trung bình / Cao.
- Chỉ render lại khi có thay đổi (`frameloop="demand"` trong R3F) để tiết kiệm pin.
- Lazy-load toàn bộ module 3D → người chỉ dùng 2D không phải tải Three.js.

## 10. AI (chơi với máy)

- Chạy **Stockfish WASM trong Web Worker**, giao tiếp bằng giao thức **UCI**:
  ```
  uci → isready → position fen <FEN> → go movetime 1000 → bestmove e2e4
  ```
- Cấp độ: dùng `Skill Level` (0–20), `UCI_LimitStrength` + `UCI_Elo`, và giới hạn thời gian/độ sâu.
- Tính năng phụ: **gợi ý nước đi**, **thanh đánh giá thế cờ** (evaluation bar), phân tích sau ván.
- (Tùy chọn học tập) Tự viết AI đơn giản: Minimax + Alpha-Beta + đánh giá vật chất & bảng vị trí quân (piece-square tables), sắp xếp nước đi, iterative deepening.

## 11. Chơi online: PHP + MySQL (đã chốt)

Hosting có sẵn PHP + MySQL, nên server **xác thực mọi nước đi** bằng PHP, còn client (TypeScript) hỏi trạng thái định kỳ (polling). Cờ vua là game theo lượt nên độ trễ khoảng 1 giây vẫn chấp nhận được.

### 11.1. Yêu cầu hosting

- PHP **8.1+**, extension `pdo_mysql`, `json`, `mbstring`.
- MySQL **5.7+** hoặc MariaDB **10.3+**.
- Thư viện kiểm tra luật cờ phía server: **`p-chess/chess`** (bản PHP của chess.js). Chạy `composer install` **trên máy cá nhân**, rồi upload cả thư mục `vendor/` lên hosting (không cần Composer trên hosting).

### 11.2. Luồng hoạt động

```
Người chơi A                  PHP API (hosting)                Người chơi B
────────────                  ─────────────────                ────────────
create_room ───────────────► tạo phòng, trả roomId + token A
                                                    ◄───────── join_room(roomId) → token B
move(e2e4, token A) ───────► kiểm tra lượt + token + luật
                             lưu nước đi, cập nhật FEN, đồng hồ
                                                    ◄───────── state?since=0  (mỗi 1s)
                                                    ─────────► trả [e2e4], FEN, giờ
```

- Client **không tự tin vào chính mình**: sau mỗi nước đi, lấy FEN từ server làm trạng thái chuẩn.
- Polling thích ứng: 1 giây khi đang chờ đối thủ, 5 giây khi tab bị ẩn (`document.hidden`).

### 11.3. Schema MySQL

```sql
CREATE TABLE rooms (
  id            CHAR(8)      PRIMARY KEY,          -- mã phòng ngắn, vd "K7P2QX9A"
  white_token   CHAR(64)     NOT NULL,
  black_token   CHAR(64)     NULL,
  white_name    VARCHAR(50)  NULL,
  black_name    VARCHAR(50)  NULL,
  fen           VARCHAR(100) NOT NULL,
  status        ENUM('waiting','playing','finished') NOT NULL DEFAULT 'waiting',
  result        VARCHAR(20)  NULL,                 -- '1-0', '0-1', '1/2-1/2'
  end_reason    VARCHAR(30)  NULL,                 -- checkmate, timeout, resign...
  time_base_ms  INT          NOT NULL,             -- vd 300000 = 5 phút
  increment_ms  INT          NOT NULL DEFAULT 0,
  white_ms      INT          NOT NULL,
  black_ms      INT          NOT NULL,
  last_move_at  DATETIME(3)  NULL,
  draw_offer    ENUM('w','b') NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE moves (
  room_id   CHAR(8)     NOT NULL,
  ply       SMALLINT    NOT NULL,                  -- 1, 2, 3...
  uci       VARCHAR(5)  NOT NULL,                  -- e2e4, e7e8q
  san       VARCHAR(10) NOT NULL,
  fen_after VARCHAR(100) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (room_id, ply),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Mở rộng sau (tài khoản, xếp hạng): bảng `users(id, username, password_hash, elo)` và gắn `white_user_id`, `black_user_id` vào `rooms`.

### 11.4. API

| Endpoint | Phương thức | Đầu vào | Kết quả |
|---|---|---|---|
| `api/create_room.php` | POST | `name`, `color` (w/b/random), `time`, `increment` | `roomId`, `token`, `color` |
| `api/join_room.php` | POST | `roomId`, `name` | `token`, `color` |
| `api/state.php` | GET | `roomId`, `since` (số ply đã có) | các nước mới, `fen`, `status`, `white_ms`, `black_ms`, `turn`, `draw_offer` |
| `api/move.php` | POST | `roomId`, `token`, `uci` | `ok`, `san`, `fen`, kết quả nếu ván kết thúc |
| `api/resign.php` | POST | `roomId`, `token` | trạng thái kết thúc |
| `api/draw.php` | POST | `roomId`, `token`, `action` (offer/accept/decline) | trạng thái |

Mọi phản hồi trả về JSON dạng `{ "ok": true, "data": {...} }` hoặc `{ "ok": false, "error": "ILLEGAL_MOVE" }`.

### 11.5. Xử lý `move.php` (logic chính)

1. Kiểm tra `token` thuộc người chơi nào, có đúng lượt không, phòng có đang `playing` không.
2. Mở transaction, dùng `SELECT ... FOR UPDATE` khóa dòng phòng để tránh hai request cùng lúc.
3. Trừ thời gian: `ms_bên_đi -= now - last_move_at`. Nếu ≤ 0 → kết thúc **hết giờ**.
4. Nạp FEN vào `p-chess/chess`, thử nước `uci`. Không hợp lệ → trả lỗi.
5. Cộng `increment`, lưu dòng vào `moves`, cập nhật `fen`, `last_move_at`.
6. Kiểm tra chiếu hết / hòa (stalemate, 50 nước, lặp 3 lần, thiếu quân) → cập nhật `status`, `result`.
7. Commit và trả kết quả.

Hết giờ khi **không ai đi**: `state.php` cũng tính giờ còn lại của bên đang đi. Nếu ≤ 0 thì kết thúc ván ngay khi có người hỏi trạng thái.

### 11.6. Bảo mật

- Token ngẫu nhiên 64 ký tự (`bin2hex(random_bytes(32))`), client lưu trong `localStorage` để vào lại phòng khi tải lại trang.
- Dùng **PDO prepared statements** cho mọi truy vấn.
- Giới hạn tần suất request theo IP/token (vd tối đa 5 request/giây).
- File cấu hình DB (`config.php`) đặt **ngoài** `public_html` hoặc chặn truy cập bằng `.htaccess`.
- Dọn phòng cũ: phòng `waiting` quá 1 giờ, phòng `finished` quá 30 ngày (cron job của hosting hoặc dọn ngẫu nhiên khi có request).

### 11.7. Cấu trúc thư mục trên hosting

```
public_html/
├── index.html, assets/, stockfish/     # từ dist/ của frontend
├── .htaccess
└── api/
    ├── .htaccess                        # chặn truy cập trực tiếp lib/, vendor/
    ├── create_room.php
    ├── join_room.php
    ├── state.php
    ├── move.php
    ├── resign.php
    ├── draw.php
    ├── lib/
    │   ├── db.php                       # kết nối PDO
    │   ├── room.php                     # hàm dùng chung: lấy phòng, kiểm token, tính giờ
    │   └── response.php                 # trả JSON, xử lý lỗi
    └── vendor/                          # composer (p-chess/chess)
config/                                  # ngoài public_html
└── config.php                           # thông tin DB
```

## 12. Cấu trúc thư mục

```
chess-game/
├── packages/
│   └── chess-core/              # Luật cờ thuần TS (dùng cho cả client & server)
│       ├── src/
│       │   ├── types.ts
│       │   ├── board.ts         # khởi tạo, tiện ích ô
│       │   ├── fen.ts
│       │   ├── movegen.ts       # sinh nước đi
│       │   ├── attack.ts        # ô bị tấn công, chiếu
│       │   ├── makeMove.ts
│       │   ├── result.ts        # chiếu hết, hòa
│       │   ├── san.ts
│       │   ├── pgn.ts
│       │   └── zobrist.ts
│       └── tests/
│           ├── perft.test.ts
│           └── rules.test.ts
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── store/gameStore.ts
│   │   │   ├── ai/stockfishWorker.ts
│   │   │   ├── ai/engine.ts
│   │   │   ├── components/
│   │   │   │   ├── board2d/     # Board2D, Square, Piece2D, PromotionDialog
│   │   │   │   ├── board3d/     # Scene, Board3D, Piece3D, CameraRig, Lights
│   │   │   │   └── ui/          # MoveHistory, Clock, Controls, Settings, GameOverModal
│   │   │   ├── hooks/
│   │   │   ├── assets/          # svg quân cờ, model .glb, âm thanh
│   │   │   └── App.tsx
│   │   └── public/stockfish/
│   └── api/                     # (giai đoạn 5) PHP API + schema.sql (xem mục 11.7)
└── package.json                 # pnpm workspaces
```

## 13. Lộ trình triển khai

| Giai đoạn | Nội dung | Kết quả bàn giao | Ước lượng* |
|---|---|---|---|
| **0. Khởi tạo** | Monorepo, Vite + React + TS, ESLint/Prettier, Vitest, CI | Dự án chạy được, pipeline test | 1–2 ngày |
| **1. Chess Core** | Kiểu dữ liệu, FEN, sinh nước đi, makeMove, chiếu/chiếu hết/hòa, SAN, perft pass | Thư viện luật cờ đã test | 1–2 tuần |
| **2. Bàn cờ 2D (MVP)** | Store, Board2D, nhấp & kéo-thả, phong cấp, lịch sử, undo/redo, lật bàn, màn kết thúc ván | **Chơi 2 người hoàn chỉnh** | 1 tuần |
| **3. Bàn cờ 3D** | Scene, model quân, ánh xạ tọa độ, raycasting, hoạt ảnh, camera, nút chuyển 2D↔3D, tùy chọn chất lượng | Chế độ 3D dùng chung ván cờ | 1.5–2 tuần |
| **4. AI & tiện ích** | Stockfish Worker, cấp độ, gợi ý, thanh đánh giá, đồng hồ, âm thanh, PGN/FEN, lưu ván, chủ đề | Chơi với máy đầy đủ | 1 tuần |
| **5. Online** | Schema MySQL, API PHP, xác thực nước đi bằng `p-chess/chess`, đồng hồ server, polling, vào lại phòng | Chơi online 1–1 | 2–3 tuần |
| **6. Hoàn thiện** | Responsive/mobile, accessibility, tối ưu hiệu năng, E2E test, build và upload `dist/` lên hosting | Bản phát hành | 1 tuần |

\* Ước lượng cho 1 lập trình viên làm bán thời gian; giảm đáng kể nếu dùng `chess.js` thay vì tự viết lõi.

## 14. Checklist kiểm thử

- [ ] Perft đúng tới độ sâu 4–5 cho thế cờ ban đầu và Kiwipete
- [ ] Nhập thành bị chặn khi: vua bị chiếu, đi qua ô bị tấn công, xe/vua đã di chuyển, xe bị ăn
- [ ] En passant chỉ hợp lệ ngay nước kế tiếp; không hợp lệ nếu làm lộ vua
- [ ] Phong cấp đủ 4 lựa chọn, kể cả phong cấp kèm ăn quân
- [ ] Quân bị ghim không thể đi ra khỏi đường ghim
- [ ] Phát hiện đúng: chiếu hết, stalemate, 50 nước, lặp 3 lần, thiếu quân
- [ ] FEN/PGN: import → export cho ra kết quả tương đương
- [ ] Chuyển 2D ↔ 3D giữa ván không mất trạng thái, không lỗi khi đang chờ phong cấp
- [ ] AI không đưa ra nước đi bất hợp lệ; UI không bị đơ khi AI suy nghĩ
- [ ] 3D đạt FPS mục tiêu; thao tác cảm ứng hoạt động trên mobile

## 15. Rủi ro & cách giảm thiểu

| Rủi ro | Cách xử lý |
|---|---|
| Lỗi luật cờ khó phát hiện | Perft + bộ test thế cờ đặc biệt ngay từ giai đoạn 1 |
| 3D chậm trên máy yếu/mobile | Lazy-load, tùy chọn chất lượng, `frameloop="demand"`, nén model |
| Logic bị trùng lặp giữa 2D và 3D | Bắt buộc mọi luật nằm trong `chess-core` + store, renderer chỉ hiển thị |
| Stockfish WASM nặng (vài MB) | Chỉ tải khi chọn chế độ chơi với máy, dùng bản "lite" đơn luồng |
| Gian lận khi chơi online | PHP xác thực nước đi và tính giờ, client chỉ hiển thị |
| Luật cờ client (TS) và server (PHP) lệch nhau | Cả hai đều dựa trên chess.js/bản port; chạy chung bộ FEN test ở cả hai phía |
| Polling tốn tài nguyên shared hosting | Truy vấn nhẹ theo `since`, giãn chu kỳ khi tab ẩn, index đúng khóa |
| Bản quyền model/icon | Chỉ dùng tài nguyên CC0/giấy phép mở hoặc tự tạo |

## 16. Bước tiếp theo

1. Cài Node.js trên **máy tính cá nhân** để code và build.
2. Chốt tự viết lõi luật cờ hay dùng `chess.js`; kiểm tra phiên bản PHP của hosting (cần 8.1+).
3. Khởi tạo repo theo cấu trúc mục 12 và bắt đầu Giai đoạn 1.
