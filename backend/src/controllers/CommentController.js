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
    }
};

export default CommentController;