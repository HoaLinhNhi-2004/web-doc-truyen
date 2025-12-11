import UserService from '../services/UserService.js';

const UserController = {
    // 1. Toggle Favorite
    toggleFavorite: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ token
            const { storyId } = req.body;

            if (!storyId) return res.status(400).json({ message: 'Thiếu storyId' });

            const result = await UserService.toggleFavorite(userId, storyId);
            return res.status(200).json({ status: 'success', ...result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    // 2. Lấy danh sách Favorite
    getFavorites: async (req, res) => {
        try {
            const userId = req.user.id;
            const data = await UserService.getFavorites(userId);
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    // 3. Lưu lịch sử
    saveHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { storyId, chapterId } = req.body;
            
            await UserService.saveHistory(userId, storyId, chapterId);
            return res.status(200).json({ status: 'success', message: 'Đã lưu lịch sử' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    // 4. Lấy danh sách lịch sử
    getHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const data = await UserService.getHistory(userId);
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    }
};

export default UserController;