import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index.js'; // Import Model để check DB

dotenv.config();

const authMiddleware = async (req, res, next) => {
    // 1. Lấy token từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Bạn chưa đăng nhập (Thiếu Token)' });
    }

    try {
        // 2. Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Truy vấn Database để lấy thông tin mới nhất
        // (Kiểm tra xem user còn tồn tại hay đã bị xóa/khóa)
        const user = await User.findByPk(decoded.id);

        if (!user) {
            // User trong token có ID, nhưng trong DB không tìm thấy (đã bị xóa)
            return res.status(401).json({ status: 'error', message: 'Tài khoản không tồn tại' });
        }

        // 4. [QUAN TRỌNG] Kiểm tra trạng thái Banned
        // Trả về 403 Forbidden để Frontend phân biệt với lỗi hết hạn token (401)
        if (user.status === 'banned') {
            return res.status(403).json({ 
                status: 'error', 
                code: 'USER_BANNED', // Mã lỗi đặc biệt để Frontend bắt
                message: 'Tài khoản của bạn đã bị KHÓA. Vui lòng liên hệ Admin.' 
            });
        }

        // 5. Nếu ổn, gắn user vào request để Controller dùng
        req.user = user; 
        next(); // Cho phép đi tiếp

    } catch (error) {
        // Bắt lỗi Token hết hạn hoặc sai chữ ký
        return res.status(401).json({ 
            status: 'error', 
            message: 'Token không hợp lệ hoặc đã hết hạn' 
        });
    }
};

export default authMiddleware;