import RatingService from '../services/RatingService.js';

const RatingController = {
    // API: Đánh giá
    rate: async (req, res) => {
        try {
            const userId = req.user.id;
            const { storyId, score } = req.body;

            // Validate
            if (!storyId || !score) return res.status(400).json({ message: 'Thiếu thông tin' });
            if (score < 1 || score > 5) return res.status(400).json({ message: 'Điểm phải từ 1 đến 5' });

            const result = await RatingService.rateStory(userId, storyId, score);
            
            return res.status(200).json({ status: 'success', message: 'Đánh giá thành công', data: result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    },

    // API: Xem điểm mình đã đánh giá
    getMyRating: async (req, res) => {
        try {
            const userId = req.user.id;
            const { storyId } = req.params;
            
            const score = await RatingService.getUserRating(userId, storyId);
            return res.status(200).json({ status: 'success', data: { score } });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    }
};

export default RatingController;