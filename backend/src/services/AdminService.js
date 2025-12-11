import { Story, Chapter, ChapterContent, User, Category, StoryCategory, sequelize } from '../models/index.js';
import slugify from 'slugify';

const AdminService = {
    // ===========================
    // 1. QUẢN LÝ TRUYỆN
    // ===========================
    createStory: async (data) => {
        const t = await sequelize.transaction();
        try {
            const { title, type, author_name, cover_image, description, categories } = data;
            
            // Tự tạo slug từ tên truyện
            const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });

            // Tạo truyện
            const newStory = await Story.create({
                title, slug, type, author_name, cover_image, description, 
                status: 'ongoing',
                total_views: 0
            }, { transaction: t });

            // Gắn thể loại (Nếu có)
            if (categories && categories.length > 0) {
                // categories là mảng ID: [1, 2]
                const links = categories.map(catId => ({
                    story_id: newStory.id,
                    category_id: catId
                }));
                await StoryCategory.bulkCreate(links, { transaction: t });
            }

            await t.commit();
            return newStory;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    updateStory: async (id, data) => {
        try {
            // Chỉ cho phép update các trường an toàn
            const { title, status, cover_image, author_name, description } = data;
            await Story.update(
                { title, status, cover_image, author_name, description }, 
                { where: { id } }
            );
            return await Story.findByPk(id);
        } catch (error) {
            throw error;
        }
    },

    deleteStory: async (id) => {
        try {
            // Xóa truyện -> Cascade sẽ tự xóa Chapter, Comment, History liên quan
            const count = await Story.destroy({ where: { id } });
            return count;
        } catch (error) {
            throw error;
        }
    },

    // ===========================
    // 2. QUẢN LÝ CHƯƠNG
    // ===========================
    createChapter: async (storyId, data) => {
        const t = await sequelize.transaction();
        try {
            const { chapter_num, title, content_images, content_text, price } = data;

            // Tạo thông tin chương
            const newChapter = await Chapter.create({
                story_id: storyId,
                chapter_num,
                title,
                price: price || 0
            }, { transaction: t });

            // Tạo nội dung chi tiết
            await ChapterContent.create({
                chapter_id: newChapter.id,
                content_images: content_images || [], // Mảng link ảnh
                content_text: content_text || null
            }, { transaction: t });

            // Cập nhật ngày mới nhất cho truyện để nó nổi lên đầu trang chủ
            await Story.update({ updated_at: new Date() }, { where: { id: storyId }, transaction: t });

            await t.commit();
            return newChapter;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    // ===========================
    // 3. QUẢN LÝ USER
    // ===========================
    getAllUsers: async () => {
        try {
            return await User.findAll({
                attributes: { exclude: ['password_hash'] }, // Không lấy pass
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    },

    banUser: async (userId) => {
        try {
            // Chuyển status sang 'banned'
            await User.update({ status: 'banned' }, { where: { id: userId } });
            return true;
        } catch (error) {
            throw error;
        }
    },

    // ===========================
    // 4. QUẢN LÝ THỂ LOẠI
    // ===========================
    createCategory: async (name) => {
        try {
            const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
            const cat = await Category.create({ name, slug });
            return cat;
        } catch (error) {
            throw error;
        }
    },
    // ===========================
    // 5. CHỨC NĂNG TÀI CHÍNH & KHÓA CHƯƠNG (MỚI BỔ SUNG)
    // ===========================

    // A. Nạp tiền thủ công cho User (Admin nạp)
    addCoinsToUser: async (userId, amount) => {
        const t = await sequelize.transaction();
        try {
            // 1. Cộng tiền vào tài khoản User
            await User.increment('coin_balance', { 
                by: amount, 
                where: { id: userId }, 
                transaction: t 
            });

            // 2. Ghi lịch sử giao dịch để đối soát
            await Transaction.create({
                user_id: userId,
                amount: amount,
                type: 'deposit',
                description: `Admin nạp thủ công ${amount} xu`
            }, { transaction: t });

            await t.commit();
            
            // Trả về số dư mới nhất
            const user = await User.findByPk(userId);
            return user.coin_balance;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    // B. Khóa/Mở khóa chương (Set giá tiền)
    updateChapterPrice: async (chapterId, price) => {
        try {
            // Nếu price > 0 -> Khóa (VIP). Nếu price = 0 -> Mở (Free)
            await Chapter.update(
                { price: price }, 
                { where: { id: chapterId } }
            );
            return await Chapter.findByPk(chapterId);
        } catch (error) {
            throw error;
        }
    }




};

export default AdminService;