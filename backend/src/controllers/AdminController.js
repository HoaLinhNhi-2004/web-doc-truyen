import AdminService from '../services/AdminService.js';

const AdminController = {
    // ============================================
    // 1. QUẢN LÝ TRUYỆN
    // ============================================
    
    // API lấy danh sách truyện cho trang Admin
    getStories: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const keyword = req.query.keyword || '';
            
            const result = await AdminService.getAllAdminStories({ page, limit, keyword });
            
            return res.status(200).json({ 
                status: 'success', 
                data: result.stories,
                pagination: {
                    total: result.totalItems,
                    currentPage: page,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // API lấy chi tiết truyện theo ID
    getStoryById: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            const story = await AdminService.getStoryById(id);
            
            if (!story) {
                return res.status(404).json({ status: 'error', message: 'Không tìm thấy truyện' });
            }

            return res.status(200).json({ status: 'success', data: story });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

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
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            const data = await AdminService.updateStory(id, req.body);
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    deleteStory: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            await AdminService.deleteStory(id);
            return res.status(200).json({ status: 'success', message: 'Đã xóa truyện' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // ============================================
    // 2. QUẢN LÝ CHƯƠNG
    // ============================================
    createChapter: async (req, res) => {
        try {
            const storyId = parseInt(req.params.storyId); // [FIX] Ép kiểu về số
            const data = await AdminService.createChapter(storyId, req.body);
            return res.status(201).json({ status: 'success', data });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    updateChapter: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            const data = await AdminService.updateChapter(id, req.body);
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    deleteChapter: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            await AdminService.deleteChapter(id);
            return res.status(200).json({ status: 'success', message: 'Đã xóa chương' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // ============================================
    // 3. QUẢN LÝ USER
    // ============================================
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
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            await AdminService.banUser(id);
            return res.status(200).json({ status: 'success', message: 'Đã khóa tài khoản user' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // ============================================
    // 4. QUẢN LÝ THỂ LOẠI
    // ============================================
    createCategory: async (req, res) => {
        try {
            const { name } = req.body;
            const cat = await AdminService.createCategory(name);
            return res.status(201).json({ status: 'success', data: cat });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            const { name } = req.body;
            const data = await AdminService.updateCategory(id, name);
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            await AdminService.deleteCategory(id);
            return res.status(200).json({ status: 'success', message: 'Đã xóa thể loại' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // ============================================
    // 5. TÀI CHÍNH & GIÁ
    // ============================================
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
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    setChapterPrice: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            const { price } = req.body;
            if (price < 0) {
                return res.status(400).json({ message: 'Giá tiền không được âm' });
            }
            const chapter = await AdminService.updateChapterPrice(id, price);
            const statusMsg = price > 0 ? 'Đã KHÓA chương (VIP)' : 'Đã MỞ chương (Free)';
            return res.status(200).json({ status: 'success', message: statusMsg, data: chapter });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    }
};

export default AdminController;