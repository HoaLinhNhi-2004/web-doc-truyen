import { Op } from 'sequelize';
import { Story, Chapter, Category, ChapterContent, StoryCategory } from '../models/index.js';

const StoryService = {
    // 1. Lấy danh sách truyện (Trang chủ & Lọc & Tìm kiếm)
    getAllStories: async ({ page, limit, keyword, sort, categorySlug }) => {
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
            
            // A. Tìm theo tên truyện
            if (keyword) {
                whereClause.title = { [Op.like]: `%${keyword}%` };
            }

            // B. Lọc theo thể loại (Quan trọng)
            if (categorySlug) {
                includeClause.push({
                    model: Category,
                    as: 'categories',
                    where: { slug: categorySlug }, // Chỉ lấy truyện thuộc category này
                    attributes: ['id', 'name', 'slug'],
                    through: { attributes: [] } // Ẩn bảng trung gian cho gọn
                });
            }

            // C. Sắp xếp
            if (sort === 'view') {
                orderClause = [['total_views', 'DESC']]; // Xem nhiều nhất
            } else if (sort === 'new') {
                orderClause = [['created_at', 'DESC']]; // Truyện mới đăng
            }

            // --- TRUY VẤN DB ---
            const { count, rows } = await Story.findAndCountAll({
                where: whereClause,
                limit: limit,
                offset: offset,
                order: orderClause,
                attributes: ['id', 'title', 'slug', 'cover_image', 'status', 'type', 'total_views', 'updated_at'],
                include: includeClause,
                distinct: true // Bắt buộc có để đếm đúng khi include nhiều bảng
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
    getStoryBySlug: async (slug) => {
        try {
            const story = await Story.findOne({
                where: { slug: slug },
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
                        attributes: ['id', 'chapter_num', 'title', 'created_at', 'price'],
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
            // Ví dụ: Đang ở chap 10, tìm chap < 10 (là chap 9)
            const prevChapter = await Chapter.findOne({
                where: { 
                    story_id: storyId,
                    chapter_num: { [Op.lt]: currentNum } // lt = Less Than
                },
                order: [['chapter_num', 'DESC']], // Lấy thằng lớn nhất trong đám nhỏ hơn
                attributes: ['id', 'chapter_num']
            });

            // Tìm chương sau (Số chap lớn hơn gần nhất)
            // Ví dụ: Đang ở chap 10, tìm chap > 10 (là chap 11)
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
    incrementView: async (storyId) => {
        try {
            // Cách 1: Tăng trực tiếp (Dễ làm, phù hợp demo)
            await Story.increment('total_views', { 
                by: 1, 
                where: { id: storyId } 
            });
            return true;
        } catch (error) {
            throw error;
        }
    }


    
};

export default StoryService;