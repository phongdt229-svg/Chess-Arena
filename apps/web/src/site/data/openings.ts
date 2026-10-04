export interface Opening {
  id: string;
  name: string;
  eco: string;
  moves: string[]; // SAN, starting from the initial position
  style: string;
  summary: string;
  white: string;
  black: string;
}

export const OPENINGS: Opening[] = [
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez (Tây Ban Nha)',
    eco: 'C60',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
    style: 'Cổ điển, giàu ý tưởng',
    summary: 'Một trong những khai cuộc lâu đời nhất, Tượng trắng gây áp lực lên Mã đang bảo vệ Tốt e5.',
    white: 'Phát triển nhanh, nhập thành sớm rồi chuẩn bị c3 và d4 để chiếm trung tâm.',
    black: 'Giữ chắc Tốt e5, phát triển Mã và Tượng, nhập thành an toàn rồi phản công trung tâm.',
  },
  {
    id: 'italian',
    name: 'Ván Ý (Italian Game)',
    eco: 'C50',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4'],
    style: 'Dễ học, phát triển tự nhiên',
    summary: 'Hai Tượng cùng nhắm vào ô f7/f2. Rất hợp cho người mới vì các ý tưởng đơn giản và rõ ràng.',
    white: 'Chuẩn bị c3 rồi d4 để lập trung tâm vững, hoặc chơi chậm với d3.',
    black: 'Phát triển đối xứng, đáp trả d4 bằng exd4 và giữ thế cờ cân bằng.',
  },
  {
    id: 'sicilian',
    name: 'Phòng thủ Sicilia',
    eco: 'B20',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    style: 'Phản công sắc bén',
    summary: 'Cách đáp trả 1.e4 phổ biến nhất ở các giải cao. Đen chủ động phá thế cân bằng ngay từ đầu để tìm cơ hội thắng.',
    white: 'Thường tấn công Vua đen, dùng ưu thế không gian và phát triển.',
    black: 'Dùng cột c mở để phản công cánh Hậu, chấp nhận thế cờ phức tạp.',
  },
  {
    id: 'french',
    name: 'Phòng thủ Pháp',
    eco: 'C00',
    moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7'],
    style: 'Chắc chắn, cấu trúc Tốt',
    summary: 'Đen xây chuỗi Tốt chắc chắn và phản công vào trung tâm sau. Tượng ô trắng của Đen thường là quân khó phát triển.',
    white: 'Có nhiều không gian hơn, nhắm tấn công cánh Vua.',
    black: 'Phá chuỗi Tốt trung tâm bằng c5 và f6, tìm trò chơi ở cánh Hậu.',
  },
  {
    id: 'caro-kann',
    name: 'Phòng thủ Caro-Kann',
    eco: 'B10',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'],
    style: 'Vững như bàn thạch',
    summary: 'Giống phòng thủ Pháp nhưng Tượng ô trắng của Đen được đưa ra ngoài sớm. Cấu trúc Tốt lành mạnh, ít rủi ro.',
    white: 'Giữ ưu thế không gian, cố gắng tạo áp lực lên Mã và Tượng đen.',
    black: 'Đổi Tốt trung tâm, phát triển Tượng ra ngoài chuỗi Tốt rồi ổn định thế cờ.',
  },
  {
    id: 'scandinavian',
    name: 'Phòng thủ Scandinavia',
    eco: 'B01',
    moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6'],
    style: 'Thẳng thắn, dễ nhớ',
    summary: 'Đen chiếm lại Tốt ngay lập tức bằng Hậu. Hậu ra sớm nên Trắng được tempo phát triển nhưng thế cờ rất dễ chơi.',
    white: 'Vừa phát triển vừa đuổi Hậu đen, tận dụng nước đi dẫn trước.',
    black: 'Giữ Hậu an toàn, phát triển nhanh các quân còn lại.',
  },
  {
    id: 'queens-gambit',
    name: 'Gambit Hậu',
    eco: 'D06',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O'],
    style: 'Chiến lược, kiểm soát trung tâm',
    summary: 'Trắng đề nghị hy sinh Tốt c để kéo Tốt d của Đen khỏi trung tâm. Thực ra Trắng gần như luôn lấy lại được Tốt.',
    white: 'Tạo trung tâm Tốt d và e, phát triển Tượng và Mã theo kế hoạch.',
    black: 'Giữ Tốt d bằng e6, phát triển chắc chắn rồi hoạt động bằng c5 hoặc dxc4.',
  },
  {
    id: 'kings-indian',
    name: 'Phòng thủ Ấn Độ Vua',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O'],
    style: 'Siêu hiện đại, tấn công',
    summary: 'Đen để Trắng lập trung tâm lớn rồi tấn công lại nó từ xa. Tượng g7 là quân chủ lực.',
    white: 'Mở rộng không gian ở cánh Hậu bằng c5 hoặc tấn công trung tâm.',
    black: 'Phản công bằng e5 hoặc c5, nhiều ván kết thúc bằng đòn tấn công Vua.',
  },
  {
    id: 'english',
    name: 'Khai cuộc Anh',
    eco: 'A10',
    moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'd5', 'cxd5', 'Nxd5'],
    style: 'Linh hoạt, trì hoãn tính toán',
    summary: 'Trắng không vội chiếm trung tâm bằng Tốt mà kiểm soát nó từ cánh. Dễ chuyển sang nhiều hệ thống khác nhau.',
    white: 'Phát triển Tượng ra ô g2, kiểm soát ô d5 và giữ nhiều lựa chọn.',
    black: 'Có thể đáp trả như chơi với màu ngược lại của ván Sicilia.',
  },
  {
    id: 'london',
    name: 'Hệ thống London',
    eco: 'D02',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'c5', 'c3', 'Nc6'],
    style: 'Dễ chơi, ít lý thuyết',
    summary: 'Trắng triển khai cùng một thế trận bất kể Đen chơi gì. Rất hợp để học nhanh vì ít phải nhớ biến.',
    white: 'Đưa Tượng ô đen ra ngoài chuỗi Tốt trước khi chơi e3, rồi Nbd2 và Bd3.',
    black: 'Phản công bằng c5, Qb6 vào Tốt b2 hoặc cấu trúc Slav chắc chắn.',
  },
];

export function movetext(moves: string[]): string {
  return moves.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${m}` : m)).join(' ');
}
