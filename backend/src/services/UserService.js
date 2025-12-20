import { Favorite, ReadingHistory, Story, Chapter, User } from '../models/index.js';
import bcrypt from 'bcryptjs'; // 👈 Import thư viện mã hóa mật khẩu

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
    },

    // ==========================================================
    // 3. QUẢN LÝ TÀI KHOẢN (PROFILE) - MỚI THÊM
    // ==========================================================

    // Cập nhật thông tin cơ bản (Avatar, Tên)
    updateProfile: async (userId, { username, avatar_url }) => {
        try {
            const updateData = {};
            // Chỉ cập nhật những trường có dữ liệu gửi lên
            if (username) updateData.username = username;
            if (avatar_url) updateData.avatar_url = avatar_url;

            await User.update(updateData, { where: { id: userId } });
            
            // Trả về thông tin user mới nhất để Frontend cập nhật lại State
            return await User.findByPk(userId, { attributes: { exclude: ['password_hash'] } });
        } catch (error) {
            throw error;
        }
    },

    // Đổi mật khẩu
    changePassword: async (userId, oldPassword, newPassword) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User không tồn tại');

            // 1. Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
            if (!isMatch) return { status: 'error', message: 'Mật khẩu cũ không đúng' };

            // 2. Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);

            // 3. Lưu vào DB
            await User.update({ password_hash: passwordHash }, { where: { id: userId } });
            return { status: 'success', message: 'Đổi mật khẩu thành công' };
        } catch (error) {
            throw error;
        }
    }
};

export default UserService;