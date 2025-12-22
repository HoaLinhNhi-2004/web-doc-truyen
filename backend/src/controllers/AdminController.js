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
            console.log('[AdminController.updateStory] ID:', req.params.id);
            console.log('[AdminController.updateStory] Body:', req.body);
            
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            
            if (!id || isNaN(id)) {
                console.error('[AdminController.updateStory] ❌ ID không hợp lệ:', req.params.id);
                return res.status(400).json({ status: 'error', message: 'Story ID không hợp lệ' });
            }
            
            const data = await AdminService.updateStory(id, req.body);
            console.log('[AdminController.updateStory] ✅ Thành công');
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            console.error('[AdminController.updateStory] ❌ Lỗi:', error.message);
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
            console.log('[AdminController.createChapter] Params:', req.params);
            console.log('[AdminController.createChapter] Body:', req.body);
            
            const storyId = parseInt(req.params.storyId); // [FIX] Ép kiểu về số
            
            if (!storyId || isNaN(storyId)) {
                console.error('[AdminController.createChapter] ❌ StoryId không hợp lệ:', req.params.storyId);
                return res.status(400).json({ status: 'error', message: 'Story ID không hợp lệ' });
            }
            
            const data = await AdminService.createChapter(storyId, req.body);
            console.log('[AdminController.createChapter] ✅ Thành công, trả về:', data);
            return res.status(201).json({ status: 'success', data });
        } catch (error) {
            console.error('[AdminController.createChapter] ❌ Lỗi:', error.message);
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

    // [CẬP NHẬT QUAN TRỌNG] Xử lý Khóa/Mở khóa
    banUser: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            
            // Gọi hàm toggle bên Service, nhận về status mới ('active' hoặc 'banned')
            const newStatus = await AdminService.banUser(id);
            
            // Tạo thông báo phù hợp
            const message = newStatus === 'banned' 
                ? 'Đã KHÓA tài khoản thành công!' 
                : 'Đã MỞ KHÓA tài khoản thành công!';

            // Trả về new_status để frontend cập nhật icon màu sắc
            return res.status(200).json({ 
                status: 'success', 
                message: message,
                new_status: newStatus 
            });
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
    },

    // ============================================
    // 6. QUẢN LÝ GIAO DỊCH (MỚI)
    // ============================================
    getTransactions: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const result = await AdminService.getAllTransactions({ page, limit: 20 });
            return res.status(200).json({ 
                status: 'success', 
                data: result.transactions, 
                total: result.total 
            });
        } catch (e) {
            return res.status(500).json({ status: 'error', message: e.message });
        }
    },

    approveTrans: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            await AdminService.approveDeposit(id);
            return res.json({ status: 'success', message: 'Đã duyệt nạp tiền!' });
        } catch (e) {
            return res.status(400).json({ status: 'error', message: e.message });
        }
    },

    rejectTrans: async (req, res) => {
        try {
            const id = parseInt(req.params.id); // [FIX] Ép kiểu về số
            await AdminService.rejectDeposit(id);
            return res.json({ status: 'success', message: 'Đã từ chối giao dịch.' });
        } catch (e) {
            return res.status(400).json({ status: 'error', message: e.message });
        }
    }
};

export default AdminController;