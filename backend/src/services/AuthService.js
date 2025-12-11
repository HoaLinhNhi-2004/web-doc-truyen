import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js'; // Import model User
import dotenv from 'dotenv';

dotenv.config();

const AuthService = {
    // 1. Đăng ký
    register: async ({ username, email, password }) => {
        try {
            // Check xem email/username đã tồn tại chưa
            const existingUser = await User.findOne({ 
                where: { email } // (Có thể check thêm username nếu muốn)
            });
            
            if (existingUser) {
                return { error: 'Email này đã được sử dụng!' };
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Tạo user mới
            const newUser = await User.create({
                username,
                email,
                password_hash: passwordHash,
                role: 'member',
                coin_balance: 0,
                avatar_url: 'https://via.placeholder.com/150' // Ảnh mặc định
            });

            return { user: newUser };
        } catch (error) {
            throw error;
        }
    },

    // 2. Đăng nhập
    login: async ({ email, password }) => {
        try {
            // Tìm user theo email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return { error: 'Email không tồn tại!' };
            }

            // So sánh mật khẩu (Pass nhập vào vs Pass đã mã hóa trong DB)
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return { error: 'Mật khẩu không đúng!' };
            }

            // Tạo Token (Chứa ID và Role)
            const token = jwt.sign(
                { id: user.id, role: user.role, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Trả về info (bỏ password đi)
            const { password_hash, ...userInfo } = user.toJSON();

            return { token, user: userInfo };
        } catch (error) {
            throw error;
        }
    },

    // 3. Lấy thông tin bản thân (Me)
    getProfile: async (userId) => {
        try {
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password_hash'] } // Không bao giờ trả về password
            });
            return user;
        } catch (error) {
            throw error;
        }
    }
};

export default AuthService;