import { Rating, Story, sequelize } from '../models/index.js';

const RatingService = {
    // Đánh giá truyện
    rateStory: async (userId, storyId, score) => {
        const transaction = await sequelize.transaction(); // Dùng transaction để đảm bảo an toàn dữ liệu
        try {
            // 1. Lưu hoặc Cập nhật điểm đánh giá của User
            // (Nếu đánh giá rồi thì sửa điểm, chưa thì tạo mới)
            await Rating.upsert({
                user_id: userId,
                story_id: storyId,
                score: score
            }, { transaction });

            // 2. Tính lại điểm trung bình của truyện đó
            // Lấy tất cả đánh giá của truyện này
            const ratings = await Rating.findAll({
                where: { story_id: storyId },
                attributes: ['score'],
                transaction
            });

            // Tính trung bình cộng
            const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
            const avgRating = (totalScore / ratings.length).toFixed(1); // Làm tròn 1 chữ số thập phân (VD: 4.5)

            // 3. Cập nhật vào bảng Story
            await Story.update(
                { average_rating: avgRating },
                { where: { id: storyId }, transaction }
            );

            await transaction.commit();
            return { average_rating: avgRating, my_score: score };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    // Lấy đánh giá của User với 1 truyện (Để hiển thị user đã chấm mấy sao)
    getUserRating: async (userId, storyId) => {
        try {
            const rating = await Rating.findOne({
                where: { user_id: userId, story_id: storyId }
            });
            return rating ? rating.score : 0;
        } catch (error) {
            throw error;
        }
    }
};

export default RatingService;