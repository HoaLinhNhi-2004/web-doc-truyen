import CommentService from '../services/CommentService.js';

const CommentController = {
    // API: Gửi bình luận
    createComment: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ Token (authMiddleware)
            const { storyId, chapterId, content, parentId } = req.body;

            // Validate cơ bản
            if (!content || !storyId) {
                return res.status(400).json({ status: 'error', message: 'Thiếu nội dung hoặc ID truyện' });
            }

            const data = await CommentService.createComment({ 
                userId, storyId, chapterId, content, parentId 
            });
            
            return res.status(201).json({ 
                status: 'success', 
                message: 'Bình luận thành công',
                data: data 
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    // API: Lấy danh sách bình luận
    getComments: async (req, res) => {
        try {
            const { storyId } = req.params; // Lấy từ URL
            const data = await CommentService.getCommentsByStory(storyId);
            
            return res.status(200).json({ status: 'success', data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    // 👇 API: Xóa bình luận (MỚI THÊM)
    deleteComment: async (req, res) => {
        try {
            const { id } = req.params; // ID của comment cần xóa
            const userId = req.user.id; // ID người thực hiện hành động (từ token)
            const userRole = req.user.role; // Role người thực hiện (admin/moderator/member)

            // Gọi service xử lý logic xóa và kiểm tra quyền
            const result = await CommentService.deleteComment(id, userId, userRole);

            if (result.status === 'error') {
                // Trả về lỗi 403 nếu không có quyền hoặc lỗi khác
                return res.status(403).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    }
};

export default CommentController;