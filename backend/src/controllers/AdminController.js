import AdminService from '../services/AdminService.js';

const AdminController = {
    // --- TRUYỆN ---
    createStory: async (req, res) => {
        try {
            const data = await AdminService.createStory(req.body);
            return res.status(201).json({ status: 'success', data });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    updateStory: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await AdminService.updateStory(id, req.body);
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    deleteStory: async (req, res) => {
        try {
            const { id } = req.params;
            await AdminService.deleteStory(id);
            return res.status(200).json({ status: 'success', message: 'Đã xóa truyện' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // --- CHƯƠNG ---
    createChapter: async (req, res) => {
        try {
            const { storyId } = req.params;
            const data = await AdminService.createChapter(storyId, req.body);
            return res.status(201).json({ status: 'success', data });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // --- USER ---
    getUsers: async (req, res) => {
        try {
            const users = await AdminService.getAllUsers();
            return res.status(200).json({ status: 'success', data: users });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    banUser: async (req, res) => {
        try {
            const { id } = req.params;
            await AdminService.banUser(id);
            return res.status(200).json({ status: 'success', message: 'Đã khóa tài khoản user' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // --- THỂ LOẠI ---
    createCategory: async (req, res) => {
        try {
            const { name } = req.body;
            const cat = await AdminService.createCategory(name);
            return res.status(201).json({ status: 'success', data: cat });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },
    // --- TÀI CHÍNH & GIÁ ---
    
    // Nạp tiền cho User
    addCoins: async (req, res) => {
        try {
            const { userId, amount } = req.body;

            if (!userId || !amount) {
                return res.status(400).json({ status: 'error', message: 'Thiếu User ID hoặc số tiền' });
            }

            const newBalance = await AdminService.addCoinsToUser(userId, parseInt(amount));
            return res.status(200).json({ 
                status: 'success', 
                message: `Đã nạp ${amount} xu cho user. Số dư mới: ${newBalance}` 
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    // Set giá chương (Khóa chương)
    setChapterPrice: async (req, res) => {
        try {
            const { id } = req.params; // ID chương
            const { price } = req.body; // Giá tiền mới

            if (price < 0) {
                return res.status(400).json({ message: 'Giá tiền không được âm' });
            }

            const chapter = await AdminService.updateChapterPrice(id, price);
            
            const statusMsg = price > 0 ? 'Đã KHÓA chương (VIP)' : 'Đã MỞ chương (Free)';
            return res.status(200).json({ status: 'success', message: statusMsg, data: chapter });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    }
};

export default AdminController;