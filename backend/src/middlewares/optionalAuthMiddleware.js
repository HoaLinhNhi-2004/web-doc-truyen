import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index.js'; // [QUAN TRỌNG] Import User để check DB

dotenv.config();

const optionalAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // 1. Nếu không có header -> Là khách -> Next luôn
    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
        // 2. Giải mã Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. [MỚI] Truy vấn Database để kiểm tra trạng thái
        const user = await User.findByPk(decoded.id);

        // 4. Logic xử lý:
        // Chỉ coi là "Đã đăng nhập" nếu User tồn tại VÀ KHÔNG BỊ KHÓA (Active)
        if (user && user.status !== 'banned') {
            req.user = user; 
        } 
        
        // Lưu ý: Nếu user bị 'banned', ta KHÔNG gán req.user.
        // Controller sẽ hiểu req.user là undefined => Coi như Khách vãng lai.
        // Điều này giúp chặn họ xem nội dung VIP mà không cần báo lỗi 403 ở middleware này.

    } catch (err) {
        // Token lỗi, hết hạn, hoặc DB lỗi -> Bỏ qua, coi như khách
        // Không console.error để tránh rác log vì đây là optional
    }

    // Luôn cho qua vì đây là Optional
    next();
};

export default optionalAuthMiddleware;