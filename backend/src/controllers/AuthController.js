import AuthService from '../services/AuthService.js';
import { User } from '../models/index.js'; // [QUAN TRỌNG] Import User để check DB
import bcrypt from 'bcrypt'; // [QUAN TRỌNG] Để check pass
import jwt from 'jsonwebtoken'; // [QUAN TRỌNG] Để tạo token
import dotenv from 'dotenv';

dotenv.config();

const AuthController = {
    // API Đăng ký (Giữ nguyên dùng Service)
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ status: 'error', message: 'Vui lòng nhập đủ thông tin' });
            }

            const result = await AuthService.register({ username, email, password });

            if (result.error) {
                return res.status(400).json({ status: 'error', message: result.error });
            }

            return res.status(201).json({
                status: 'success',
                message: 'Đăng ký thành công! Hãy đăng nhập ngay.',
                data: result.user
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi Server' });
        }
    },

    // API Đăng nhập (ĐÃ SỬA: Check Ban trực tiếp)
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // 1. Tìm user trong Database
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return res.status(401).json({ status: 'error', message: 'Email không tồn tại' });
            }

            // ============================================================
            // 2. [QUAN TRỌNG] CHẶN NGAY NẾU BỊ BAN
            // ============================================================
            if (user.status === 'banned') {
                return res.status(403).json({ 
                    status: 'error', 
                    code: 'USER_BANNED',
                    message: 'Tài khoản này đã bị KHÓA. Bạn chỉ có thể truy cập với tư cách Khách.' 
                });
            }
            // ============================================================

            // 3. Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ status: 'error', message: 'Mật khẩu không đúng' });
            }

            // 4. Tạo Token (Chỉ khi active)
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            // Loại bỏ password trước khi trả về
            const { password_hash, ...userData } = user.toJSON();

            return res.status(200).json({
                status: 'success',
                message: 'Đăng nhập thành công',
                token: token,
                data: userData
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi Server' });
        }
    },

    // API Lấy thông tin User hiện tại
    getMe: async (req, res) => {
        try {
            // req.user lấy từ middleware xác thực
            // Middleware đã check ban rồi, nhưng check lại lần nữa cho chắc chắn
            const user = req.user; 
            
            if (!user) {
                return res.status(404).json({ status: 'error', message: 'Không tìm thấy user' });
            }

            if (user.status === 'banned') {
                 return res.status(403).json({ status: 'error', message: 'Tài khoản bị khóa' });
            }

            return res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi Server' });
        }
    }
};

export default AuthController;