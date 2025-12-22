import PaymentService from '../services/PaymentService.js';

const PaymentController = {
    // API Nạp xu (Tạo yêu cầu nạp -> Pending)
    deposit: async (req, res) => {
        try {
            const userId = req.user.id;
            // Lấy amount và description từ Frontend gửi lên
            const { amount, description } = req.body; 
            
            if (!amount || amount <= 0) {
                 return res.status(400).json({ status: 'error', message: 'Số tiền không hợp lệ' });
            }

            // Gọi service để tạo Transaction ở trạng thái 'pending'
            const transaction = await PaymentService.deposit(userId, parseInt(amount), description);
            
            // Trả về thông báo chờ duyệt
            return res.status(200).json({ 
                status: 'success', 
                message: 'Đã gửi yêu cầu nạp tiền. Vui lòng đợi Admin duyệt.',
                data: transaction 
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // API Mua chương
    unlockChapter: async (req, res) => {
        try {
            const userId = req.user.id;
            const { chapterId } = req.body; 
            
            if (!chapterId) {
                return res.status(400).json({ status: 'error', message: 'Thiếu ID chương' });
            }
            
            const result = await PaymentService.unlockChapter(userId, chapterId);
            
            // Xử lý các trạng thái trả về từ Service
            if (result.status === 'success') {
                return res.status(200).json(result);
            } else if (result.status === 'not_enough_money') {
                return res.status(402).json(result); // 402: Payment Required (Hết tiền)
            } else if (result.status === 'already_owned' || result.status === 'free') {
                 return res.status(200).json(result); // Đã mua hoặc Free thì vẫn là thành công
            } else {
                return res.status(400).json(result); // Các lỗi khác
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Lỗi server' });
        }
    }
};

export default PaymentController;