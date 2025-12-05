import AuthService from '../services/AuthService.js';

const AuthController = {
    // API Đăng ký
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Validate sơ bộ
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

    // API Đăng nhập
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const result = await AuthService.login({ email, password });

            if (result.error) {
                return res.status(401).json({ status: 'error', message: result.error });
            }

            return res.status(200).json({
                status: 'success',
                message: 'Đăng nhập thành công',
                token: result.token, // FE sẽ lưu cái này vào LocalStorage
                data: result.user
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
            const userId = req.user.id; 
            const user = await AuthService.getProfile(userId);

            if (!user) {
                return res.status(404).json({ status: 'error', message: 'Không tìm thấy user' });
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