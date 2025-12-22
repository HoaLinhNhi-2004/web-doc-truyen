import { User, Chapter, Transaction, UnlockedChapter, sequelize } from '../models/index.js';

const PaymentService = {
    // 1. Yêu cầu nạp xu (Chuyển sang trạng thái chờ duyệt)
    deposit: async (userId, amount, description) => {
        // Lưu ý: KHÔNG dùng transaction (t) để khóa User nữa, vì ta chưa cộng tiền.
        // Chỉ tạo Transaction ở trạng thái pending.
        
        if (amount <= 0) throw new Error('Số tiền nạp phải lớn hơn 0');

        const transaction = await Transaction.create({
            user_id: userId,
            amount: amount,
            type: 'deposit',
            description: description || `Nạp ${amount} xu`,
            status: 'pending' // <--- QUAN TRỌNG: Đang chờ Admin duyệt
        });

        return transaction;
    },

    // 2. Mua chương (Unlock) - Giữ nguyên logic, chỉ thêm status 'completed'
    unlockChapter: async (userId, chapterId) => {
        const t = await sequelize.transaction();
        try {
            // Check xem đã mua chưa
            const existing = await UnlockedChapter.findOne({
                where: { user_id: userId, chapter_id: chapterId }
            });
            if (existing) return { status: 'already_owned', message: 'Bạn đã mua chương này rồi' };

            // Lấy thông tin Chapter và User
            const chapter = await Chapter.findByPk(chapterId);
            const user = await User.findByPk(userId);

            if (!chapter) throw new Error('Chương không tồn tại');
            const price = chapter.price;

            // Nếu chương miễn phí
            if (price <= 0) return { status: 'free', message: 'Chương này miễn phí' };

            // Check số dư
            if (user.coin_balance < price) {
                return { status: 'not_enough_money', message: 'Số dư không đủ' };
            }

            // Trừ tiền User
            await User.decrement('coin_balance', { by: price, where: { id: userId }, transaction: t });

            // Ghi vào bảng UnlockedChapter
            await UnlockedChapter.create({
                user_id: userId,
                chapter_id: chapterId,
                price_paid: price
            }, { transaction: t });

            // Ghi lịch sử giao dịch (Đã hoàn thành)
            await Transaction.create({
                user_id: userId,
                amount: -price, // Số âm vì là trừ tiền
                type: 'unlock_chapter',
                description: `Mua chương ${chapter.chapter_num}: -${price} xu`,
                status: 'completed' // <--- Mua chương là xong luôn
            }, { transaction: t });

            await t.commit();
            return { status: 'success', message: 'Mua chương thành công' };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },
    
    // 3. Kiểm tra quyền truy cập chương
    checkAccess: async (userId, chapterId) => {
        const chapter = await Chapter.findByPk(chapterId);
        // Nếu chapter không tồn tại hoặc lỗi, trả về false hoặc xử lý lỗi tùy ý
        if (!chapter) return false; 

        if (chapter.price === 0) return true;
        
        const unlocked = await UnlockedChapter.findOne({
            where: { user_id: userId, chapter_id: chapterId }
        });
        return !!unlocked;
    }
};

export default PaymentService;