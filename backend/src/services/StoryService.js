import { Op } from 'sequelize';
// 👇 Thêm 'sequelize' vào import để dùng transaction và các hàm query raw nếu cần
import { Story, Chapter, Category, ChapterContent, StoryCategory, sequelize } from '../models/index.js';

const StoryService = {
    // 1. Lấy danh sách truyện (Trang chủ & Lọc & Tìm kiếm & Hot Stories)
    getAllStories: async ({ page, limit, keyword, sort, categorySlug, timeframe }) => {
        try {
            const offset = (page - 1) * limit;
            let whereClause = {};
            let orderClause = [['updated_at', 'DESC']]; // Mặc định: Mới cập nhật trước
            
            // Cấu hình Include (Liên kết bảng)
            let includeClause = [
                {
                    model: Chapter,
                    as: 'chapters',
                    limit: 1, // Chỉ lấy 1 chương mới nhất để hiện ra ngoài bìa
                    order: [['chapter_num', 'DESC']],
                    attributes: ['chapter_num', 'title', 'created_at']
                }
            ];

            // --- XỬ LÝ LỌC ---
            
            // A. Tìm theo tên truyện (Case-insensitive)
            if (keyword) {
                whereClause.title = sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('title')), 
                    Op.like, 
                    `%${keyword.toLowerCase()}%`
                );
            }

            // B. Lọc theo thể loại
            if (categorySlug) {
                includeClause.push({
                    model: Category,
                    as: 'categories',
                    where: { slug: categorySlug },
                    attributes: ['id', 'name', 'slug'],
                    through: { attributes: [] }
                });
            }

            // C. Sắp xếp theo timeframe (day/week/month) - Chỉ dùng khi sort=view
            if (sort === 'view' && timeframe) {
                const now = new Date();
                let startDate = new Date();
                
                if (timeframe === 'day') {
                    startDate.setDate(now.getDate() - 1);
                } else if (timeframe === 'week') {
                    startDate.setDate(now.getDate() - 7);
                } else if (timeframe === 'month') {
                    startDate.setMonth(now.getMonth() - 1);
                }
                
                // Lọc theo ngày cập nhật gần đây
                whereClause.updated_at = { [Op.gte]: startDate };
                orderClause = [['total_views', 'DESC']];
            } else if (sort === 'view') {
                // Không có timeframe, lấy tất cả xem nhiều nhất
                orderClause = [['total_views', 'DESC']];
            } else if (sort === 'new') {
                orderClause = [['created_at', 'DESC']];
            }

            // --- TRUY VẤN DB ---
            const { count, rows } = await Story.findAndCountAll({
                where: whereClause,
                limit: limit,
                offset: offset,
                order: orderClause,
                attributes: ['id', 'title', 'slug', 'cover_image', 'status', 'type', 'total_views', 'updated_at', 'average_rating'],
                include: includeClause,
                distinct: true
            });

            return {
                stories: rows,
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    },

    // 2. Lấy chi tiết truyện (Kèm danh sách chương)
    // [FIX QUAN TRỌNG] Hỗ trợ tìm bằng cả ID hoặc Slug
    getStoryBySlug: async (idOrSlug) => {
        try {
            let whereCondition = {};
            const cleanInput = String(idOrSlug).trim();
            // Regex kiểm tra: Nếu là số thì tìm theo ID, ngược lại tìm theo Slug
            const isId = /^\d+$/.test(cleanInput);

            if (isId) {
                whereCondition = { id: parseInt(cleanInput) };
            } else {
                whereCondition = { slug: cleanInput };
            }

            const story = await Story.findOne({
                where: whereCondition,
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        attributes: ['id', 'name', 'slug'],
                        through: { attributes: [] }
                    },
                    {
                        model: Chapter,
                        as: 'chapters',
                        // 👇 Thêm 'views' vào đây để hiển thị ra ngoài Frontend
                        attributes: ['id', 'chapter_num', 'title', 'created_at', 'price', 'views'],
                        // Sắp xếp danh sách chương: Mới nhất lên đầu
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

    // 3. Lấy nội dung chương (Kèm nút Next/Prev)
    getChapterContent: async (id) => {
        try {
            // Lấy chương hiện tại
            const currentChapter = await Chapter.findOne({
                where: { id: id },
                include: [
                    { 
                        model: ChapterContent, 
                        as: 'content' 
                    },
                    { 
                        model: Story, 
                        as: 'story', 
                        attributes: ['id', 'title', 'slug'] // Để làm Breadcrumb
                    }
                ]
            });

            if (!currentChapter) return null;

            // --- LOGIC TÌM CHƯƠNG TRƯỚC & SAU ---
            const storyId = currentChapter.story_id;
            const currentNum = currentChapter.chapter_num;

            // Tìm chương trước (Số chap nhỏ hơn gần nhất)
            const prevChapter = await Chapter.findOne({
                where: { 
                    story_id: storyId,
                    chapter_num: { [Op.lt]: currentNum } // lt = Less Than
                },
                order: [['chapter_num', 'DESC']], // Lấy thằng lớn nhất trong đám nhỏ hơn
                attributes: ['id', 'chapter_num']
            });

            // Tìm chương sau (Số chap lớn hơn gần nhất)
            const nextChapter = await Chapter.findOne({
                where: { 
                    story_id: storyId,
                    chapter_num: { [Op.gt]: currentNum } // gt = Greater Than
                },
                order: [['chapter_num', 'ASC']], // Lấy thằng nhỏ nhất trong đám lớn hơn
                attributes: ['id', 'chapter_num']
            });

            // Gộp kết quả lại
            return {
                ...currentChapter.toJSON(), 
                prev_chapter: prevChapter,
                next_chapter: nextChapter
            };
        } catch (error) {
            throw error;
        }
    },

    // 👇 CẬP NHẬT HÀM NÀY
    incrementView: async (storyId, chapterId = null) => {
        const t = await sequelize.transaction();
        try {
            // 1. Luôn tăng view tổng của Truyện
            await Story.increment('total_views', { 
                by: 1, 
                where: { id: storyId },
                transaction: t
            });

            // 2. Nếu có chapterId gửi lên -> Tăng view của Chương đó
            if (chapterId) {
                await Chapter.increment('views', {
                    by: 1,
                    where: { id: chapterId },
                    transaction: t
                });
            }

            await t.commit();
            return true;
        } catch (error) {
            await t.rollback();
            console.error("Lỗi tăng view:", error);
            // Không throw error để tránh crash API nếu chỉ lỗi tăng view
            return false;
        }
    }
    
};

export default StoryService;