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

    // Lấy chi tiết truyện theo ID
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

    updateStory: async (id, data) => {
        const t = await sequelize.transaction();
        try {
            const { title, status, cover_image, author_name, description, type, categories } = data;
            
            await Story.update(
                { title, status, cover_image, author_name, description, type, updated_at: new Date() }, 
                { where: { id: id }, transaction: t }
            );

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
    
    createChapter: async (storyId, data) => {
        const t = await sequelize.transaction();
        try {
            const { chapter_num, title, content_images, content_text, price } = data;
            
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
            console.error('[createChapter] ❌ Lỗi:', error.message);
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
            await ChapterContent.destroy({ where: { chapter_id: id }, transaction: t });
            await ReadingHistory.destroy({ where: { last_chapter_id: id }, transaction: t });
            await UnlockedChapter.destroy({ where: { chapter_id: id }, transaction: t });
            await Comment.destroy({ where: { chapter_id: id }, transaction: t });
            
            const count = await Chapter.destroy({ where: { id }, transaction: t });

            await t.commit();
            return count;
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
                attributes: { exclude: ['password_hash'] }, 
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    },

    // [CẬP NHẬT] Hàm Ban/Unban (Toggle)
    banUser: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Người dùng không tồn tại');
            }

            // Kiểm tra trạng thái hiện tại để đảo ngược
            // Nếu đang 'banned' -> Chuyển thành 'active' (Mở khóa)
            // Nếu đang 'active' -> Chuyển thành 'banned' (Khóa)
            const newStatus = user.status === 'banned' ? 'active' : 'banned';
            
            await user.update({ status: newStatus });
            
            // Trả về trạng thái mới để Controller biết đường thông báo
            return newStatus; 
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
    // 5. TÀI CHÍNH (NẠP THỦ CÔNG & SET GIÁ)
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
                description: `Admin nạp thủ công ${amount} xu`,
                status: 'completed' // Nạp thủ công thì xong luôn
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
    },

    // ===========================
    // 6. QUẢN LÝ GIAO DỊCH
    // ===========================
    
    // Lấy danh sách giao dịch (để Admin duyệt)
    getAllTransactions: async ({ page, limit }) => {
        const offset = (page - 1) * limit;
        const { count, rows } = await Transaction.findAndCountAll({
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['username', 'email'] 
            }]
        });
        return { transactions: rows, total: count };
    },

    // Duyệt nạp tiền (Cộng tiền + Đổi status)
    approveDeposit: async (transactionId) => {
        const t = await sequelize.transaction();
        try {
            const trans = await Transaction.findByPk(transactionId);
            if (!trans) throw new Error('Giao dịch không tồn tại');
            if (trans.status !== 'pending') throw new Error('Giao dịch này đã được xử lý rồi');

            // 1. Cộng tiền cho User
            await User.increment('coin_balance', { 
                by: trans.amount, 
                where: { id: trans.user_id },
                transaction: t
            });

            // 2. Cập nhật trạng thái transaction
            trans.status = 'completed';
            await trans.save({ transaction: t });

            await t.commit();
            return true;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    // Từ chối nạp tiền
    rejectDeposit: async (transactionId) => {
        const trans = await Transaction.findByPk(transactionId);
        if (!trans) throw new Error('Không tìm thấy');
        if (trans.status !== 'pending') throw new Error('Đã xử lý rồi');
        
        trans.status = 'cancelled';
        await trans.save();
        return true;
    }
};

export default AdminService;