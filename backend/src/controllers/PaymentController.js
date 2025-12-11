import PaymentService from '../services/PaymentService.js';

const PaymentController = {
    // API Nạp xu
    deposit: async (req, res) => {
        try {
            const userId = req.user.id;
            const { amount } = req.body;
            
            const newBalance = await PaymentService.deposit(userId, parseInt(amount));
            return res.status(200).json({ status: 'success', message: 'Nạp thành công', new_balance: newBalance });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // API Mua chương
    unlockChapter: async (req, res) => {
        try {
            const userId = req.user.id;
            const { chapterId } = req.body; // Hoặc lấy từ params
            
            const result = await PaymentService.unlockChapter(userId, chapterId);
            
            if (result.status === 'not_enough_money') {
                return res.status(402).json(result); // 402 Payment Required
            }
            
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    }
};

export default PaymentController;