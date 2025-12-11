import { Comment, User } from '../models/index.js';

const CommentService = {
    // 1. Gửi bình luận (Hỗ trợ cả Comment thường và Reply)
    createComment: async ({ userId, storyId, chapterId, content, parentId }) => {
        try {
            const newComment = await Comment.create({
                user_id: userId,
                story_id: storyId,
                chapter_id: chapterId || null, // Null nếu comment vào truyện chung chung
                content: content,
                parent_id: parentId || null // Null nếu là comment gốc, có ID nếu là Reply
            });

            // Quan trọng: Sau khi tạo xong, phải fetch lại ngay để lấy Avatar/Tên User
            // trả về cho Frontend hiển thị luôn mà không cần F5
            const commentWithUser = await Comment.findByPk(newComment.id, {
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url', 'role']
                }]
            });

            return commentWithUser;
        } catch (error) {
            throw error;
        }
    },

    // 2. Lấy danh sách bình luận của 1 truyện
    getCommentsByStory: async (storyId) => {
        try {
            const comments = await Comment.findAll({
                where: { 
                    story_id: storyId,
                    parent_id: null // Chỉ lấy comment Gốc (Cha)
                },
                order: [['created_at', 'DESC']], // Mới nhất lên đầu
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'avatar_url', 'role']
                    },
                    {
                        // Lấy kèm các câu trả lời (Children/Replies)
                        model: Comment,
                        as: 'replies', 
                        include: [{ 
                            model: User, 
                            as: 'user', 
                            attributes: ['id', 'username', 'avatar_url', 'role'] 
                        }],
                        // Sắp xếp reply: Cũ nhất lên trước (để đọc theo dòng thời gian)
                        // Note: Sequelize v6 sắp xếp trong include hơi phức tạp, ta cứ lấy về FE tự sort hoặc để mặc định
                    }
                ]
            });
            return comments;
        } catch (error) {
            throw error;
        }
    }
};

export default CommentService;