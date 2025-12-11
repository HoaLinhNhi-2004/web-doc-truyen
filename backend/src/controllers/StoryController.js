import StoryService from '../services/StoryService.js';
import jwt from 'jsonwebtoken'; // <-- MỚI: Để giải mã token
import { UnlockedChapter } from '../models/index.js'; // <-- MỚI: Để check bảng mua chương
import dotenv from 'dotenv';

dotenv.config();

const StoryController = {
    // API 1: Lấy danh sách truyện
    getStories: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const keyword = req.query.keyword || '';
            const sort = req.query.sort || 'latest';
            const categorySlug = req.query.category || '';

            const result = await StoryService.getAllStories({ page, limit, keyword, sort, categorySlug });

            return res.status(200).json({
                status: 'success',
                message: 'Lấy danh sách truyện thành công',
                data: result.stories,
                pagination: {
                    total: result.totalItems,
                    perPage: limit,
                    currentPage: result.currentPage,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi Server' });
        }
    },

    // API 2: Chi tiết truyện
    getStoryDetail: async (req, res) => {
        try {
            const { slug } = req.params;
            const story = await StoryService.getStoryBySlug(slug);

            if (!story) {
                return res.status(404).json({ status: 'error', message: 'Không tìm thấy truyện' });
            }

            return res.status(200).json({
                status: 'success',
                data: story
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi Server' });
        }
    },

    // API 3: Nội dung chương (Đã nâng cấp logic chặn VIP)
    getChapter: async (req, res) => {
        try {
            const { id } = req.params;
            
            // 1. Lấy dữ liệu chương
            const chapter = await StoryService.getChapterContent(id);

            if (!chapter) {
                return res.status(404).json({ status: 'error', message: 'Không tìm thấy chương' });
            }

            // ========================================================
            // 2. LOGIC KIỂM TRA QUYỀN (VIP CHECK) - MỚI THÊM
            // ========================================================
            if (chapter.price > 0) {
                // Bước A: Kiểm tra Token (Thủ công vì route này Public)
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];

                // Nếu không có token -> Chặn luôn
                if (!token) {
                    return res.status(403).json({ 
                        status: 'error', 
                        code: 'login_required',
                        message: 'Chương này bị khóa. Vui lòng đăng nhập để mua.',
                        // Trả về info chương nhưng Content = NULL để FE hiện nút mua
                        data: { ...chapter, content: null } 
                    });
                }

                // Bước B: Giải mã Token lấy User ID
                let userId = null;
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.id;
                } catch (err) {
                    return res.status(403).json({ status: 'error', message: 'Token không hợp lệ' });
                }

                // Bước C: Check xem đã mua chưa trong DB
                const isUnlocked = await UnlockedChapter.findOne({
                    where: { user_id: userId, chapter_id: id }
                });

                // Nếu chưa mua -> Báo lỗi cần thanh toán
                if (!isUnlocked) {
                    return res.status(402).json({ 
                        status: 'error', 
                        code: 'payment_required',
                        message: `Bạn cần ${chapter.price} xu để mở khóa chương này.`,
                        data: { ...chapter, content: null } // Che nội dung
                    });
                }
                
                // Nếu đã mua -> Code chạy tiếp xuống dưới để trả về ảnh
            }
            // ========================================================

            return res.status(200).json({
                status: 'success',
                data: chapter
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi Server' });
        }
    },

    // API 4: Tăng lượt xem
    increaseView: async (req, res) => {
        try {
            const { id } = req.params;
            await StoryService.incrementView(id);
            
            return res.status(200).json({ status: 'success', message: 'Đã tăng view' });
        } catch (error) {
            console.error(error);
            return res.status(200).json({ status: 'success' }); 
        }
    }
};

export default StoryController;