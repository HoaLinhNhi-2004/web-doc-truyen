import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    // 1. Lấy token từ header gửi lên
    // Header chuẩn: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy phần token sau chữ Bearer

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Bạn chưa đăng nhập (Thiếu Token)' });
    }

    // 2. Kiểm tra token có hợp lệ không
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ status: 'error', message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        // 3. Nếu ngon lành -> Gắn thông tin user vào request để dùng ở Controller
        req.user = user; 
        next(); // Cho phép đi tiếp
    });
};

export default authMiddleware;