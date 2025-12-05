import { Favorite, ReadingHistory, Story, Chapter } from '../models/index.js';

const UserService = {
    // ==========================================================
    // 1. TỦ TRUYỆN (FAVORITES)
    // ==========================================================

    // Thêm/Xóa truyện khỏi tủ (Toggle)
    toggleFavorite: async (userId, storyId) => {
        try {
            const existing = await Favorite.findOne({
                where: { user_id: userId, story_id: storyId }
            });

            if (existing) {
                await existing.destroy(); // Có rồi thì xóa (Bỏ theo dõi)
                return { action: 'removed', message: 'Đã bỏ theo dõi truyện' };
            } else {
                await Favorite.create({ user_id: userId, story_id: storyId });
                return { action: 'added', message: 'Đã thêm vào tủ truyện' };
            }
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách tủ truyện
    getFavorites: async (userId) => {
        try {
            // Nhờ đã fix model index.js, giờ ta query trực tiếp rất dễ
            const favorites = await Favorite.findAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']], // Truyện mới tim lên đầu
                include: [
                    {
                        model: Story,
                        as: 'story', // Alias khớp với Favorite.belongsTo(Story)
                        attributes: ['id', 'title', 'slug', 'cover_image', 'type', 'status']
                    }
                ]
            });
            
            // Trả về danh sách truyện cho gọn (bỏ lớp vỏ Favorite bên ngoài)
            return favorites.map(item => item.story);
        } catch (error) {
            throw error;
        }
    },

    // ==========================================================
    // 2. LỊCH SỬ ĐỌC (HISTORY)
    // ==========================================================

    // Lưu lịch sử (Gọi khi user bấm vào đọc 1 chương)
    saveHistory: async (userId, storyId, chapterId) => {
        try {
            // Dùng upsert: Có thì update (đẩy lên đầu), chưa có thì tạo mới
            await ReadingHistory.upsert({
                user_id: userId,
                story_id: storyId,
                last_chapter_id: chapterId,
                updated_at: new Date() // Cập nhật thời gian
            });
            return true;
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách lịch sử
    getHistory: async (userId) => {
        try {
            // Nhờ đã fix model index.js, giờ query 1 lệnh là ra đủ Story + Chapter
            const history = await ReadingHistory.findAll({
                where: { user_id: userId },
                order: [['updated_at', 'DESC']], // Truyện mới đọc lên đầu
                include: [
                    {
                        model: Story,
                        as: 'story', // Alias khớp với ReadingHistory.belongsTo(Story)
                        attributes: ['id', 'title', 'slug', 'cover_image', 'type']
                    },
                    {
                        model: Chapter,
                        as: 'last_read_chapter', // Alias khớp với ReadingHistory.belongsTo(Chapter)
                        attributes: ['id', 'chapter_num', 'title']
                    }
                ]
            });
            
            return history;
        } catch (error) {
            throw error;
        }
    }
};

export default UserService;