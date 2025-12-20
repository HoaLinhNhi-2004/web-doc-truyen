import { 
    Story, Chapter, ChapterContent, User, Category, StoryCategory, 
    Transaction, sequelize, UnlockedChapter, ReadingHistory, Comment 
} from '../models/index.js'; 
import slugify from 'slugify';
import { Op } from 'sequelize';

const AdminService = {
    // ===========================
    // 1. QUẢN LÝ TRUYỆN
    // ===========================
    
    // Lấy danh sách truyện
    getAllAdminStories: async ({ page, limit, keyword }) => {
        try {
            const offset = (page - 1) * limit;
            const whereClause = keyword ? { title: { [Op.like]: `%${keyword}%` } } : {};
            
            const { count, rows } = await Story.findAndCountAll({
                where: whereClause,
                limit: limit,
                offset: offset,
                order: [['updated_at', 'DESC']],
                include: [{
                    model: Chapter,
                    as: 'chapters',
                    limit: 1,
                    order: [['chapter_num', 'DESC']],
                    attributes: ['chapter_num', 'title', 'created_at']
                }],
                distinct: true
            });

            return {
                stories: rows,
                totalItems: count,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            throw error;
        }
    },

    // [SIMPLIFIED] Lấy chi tiết truyện theo ID (Chỉ nhận ID)
    getStoryById: async (id) => {
        try {
            const story = await Story.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        through: { attributes: [] }
                    },
                    {
                        model: Chapter,
                        as: 'chapters',
                        attributes: ['id', 'chapter_num', 'title', 'created_at', 'views', 'price']
                    }
                ],
                order: [
                    [{ model: Chapter, as: 'chapters' }, 'chapter_num', 'DESC']
                ]
            });
            return story;
        } catch (error) {
            throw error;
        }
    },

    createStory: async (data) => {
        const t = await sequelize.transaction();
        try {
            const { title, type, author_name, cover_image, description, categories } = data;
            const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });

            const newStory = await Story.create({
                title, slug, type, author_name, cover_image, description, 
                status: 'ongoing',
                total_views: 0
            }, { transaction: t });

            if (categories && categories.length > 0) {
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

    // [SIMPLIFIED] Update truyện theo ID
    updateStory: async (id, data) => {
        const t = await sequelize.transaction();
        try {
            const { title, status, cover_image, author_name, description, type, categories } = data;
            
            // Update thông tin cơ bản
            await Story.update(
                { title, status, cover_image, author_name, description, type }, 
                { where: { id: id }, transaction: t }
            );

            // Update thể loại
            if (categories && Array.isArray(categories)) {
                await StoryCategory.destroy({ where: { story_id: id }, transaction: t });
                if (categories.length > 0) {
                    const links = categories.map(catId => ({
                        story_id: id,
                        category_id: catId
                    }));
                    await StoryCategory.bulkCreate(links, { transaction: t });
                }
            }

            await t.commit();
            return await Story.findByPk(id, { include: 'categories' });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    // [SIMPLIFIED] Xóa truyện theo ID
    deleteStory: async (id) => {
        try {
            const count = await Story.destroy({ where: { id: id } });
            return count;
        } catch (error) {
            throw error;
        }
    },

    // ===========================
    // 2. QUẢN LÝ CHƯƠNG
    // ===========================
    
    // [SIMPLIFIED] Tạo chương (Nhận storyId trực tiếp)
    createChapter: async (storyId, data) => {
        const t = await sequelize.transaction();
        try {
            const { chapter_num, title, content_images, content_text, price } = data;
            
            // Ép kiểu về int cho chắc chắn
            const safeStoryId = parseInt(storyId); 
            const safeImages = Array.isArray(content_images) ? content_images : [];

            const newChapter = await Chapter.create({
                story_id: safeStoryId,
                chapter_num,
                title,
                price: price || 0
            }, { transaction: t });

            await ChapterContent.create({
                chapter_id: newChapter.id,
                content_images: safeImages, 
                content_text: content_text || null
            }, { transaction: t });

            await Story.update({ updated_at: new Date() }, { where: { id: safeStoryId }, transaction: t });

            await t.commit();
            return newChapter;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    updateChapter: async (id, data) => {
        const t = await sequelize.transaction();
        try {
            const { chapter_num, title, content_images, content_text, price } = data;

            await Chapter.update(
                { chapter_num, title, price }, 
                { where: { id }, transaction: t }
            );

            const content = await ChapterContent.findByPk(id, { transaction: t });
            
            if (content) {
                await ChapterContent.update(
                    { content_images, content_text },
                    { where: { chapter_id: id }, transaction: t }
                );
            } else {
                await ChapterContent.create({
                    chapter_id: id,
                    content_images: content_images || [],
                    content_text: content_text || null
                }, { transaction: t });
            }

            await t.commit();
            return await Chapter.findByPk(id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    deleteChapter: async (id) => {
        const t = await sequelize.transaction();
        try {
            // Xóa dữ liệu liên quan trước khi xóa chương
            await ChapterContent.destroy({ where: { chapter_id: id }, transaction: t });
            await ReadingHistory.destroy({ where: { last_chapter_id: id }, transaction: t });
            await UnlockedChapter.destroy({ where: { chapter_id: id }, transaction: t });
            await Comment.destroy({ where: { chapter_id: id }, transaction: t });
            
            const count = await Chapter.destroy({ where: { id }, transaction: t });

            await t.commit();
            return count;
        } catch (error) {
            await t.rollback();
            console.error("Lỗi xóa chương:", error);
            throw error;
        }
    },

    // ===========================
    // 3. QUẢN LÝ USER
    // ===========================
    getAllUsers: async () => {
        try {
            return await User.findAll({
                attributes: { exclude: ['password_hash'] }, 
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    },

    banUser: async (userId) => {
        try {
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

    updateCategory: async (id, name) => {
        try {
            const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
            await Category.update({ name, slug }, { where: { id } });
            return await Category.findByPk(id);
        } catch (error) {
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            return await Category.destroy({ where: { id } });
        } catch (error) {
            throw error;
        }
    },

    // ===========================
    // 5. TÀI CHÍNH
    // ===========================
    addCoinsToUser: async (userId, amount) => {
        const t = await sequelize.transaction();
        try {
            await User.increment('coin_balance', { 
                by: amount, 
                where: { id: userId }, 
                transaction: t 
            });

            await Transaction.create({
                user_id: userId,
                amount: amount,
                type: 'deposit',
                description: `Admin nạp thủ công ${amount} xu`
            }, { transaction: t });

            await t.commit();
            const user = await User.findByPk(userId);
            return user.coin_balance;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    updateChapterPrice: async (chapterId, price) => {
        try {
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