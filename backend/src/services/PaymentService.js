import { User, Chapter, Transaction, UnlockedChapter, sequelize } from '../models/index.js';

const PaymentService = {
    // 1. Nạp xu (Giả lập)
    deposit: async (userId, amount) => {
        const t = await sequelize.transaction();
        try {
            if (amount <= 0) throw new Error('Số tiền nạp phải lớn hơn 0');

            // Cộng tiền vào User
            await User.increment('coin_balance', { by: amount, where: { id: userId }, transaction: t });

            // Ghi lịch sử giao dịch
            await Transaction.create({
                user_id: userId,
                amount: amount,
                type: 'deposit',
                description: `Nạp ${amount} xu vào tài khoản`
            }, { transaction: t });

            await t.commit();
            
            // Lấy lại số dư mới nhất
            const user = await User.findByPk(userId);
            return user.coin_balance;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    // 2. Mua chương (Unlock)
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

            // Nếu chương miễn phí (price = 0) -> Không cần mua, trả về luôn
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

            // Ghi lịch sử giao dịch
            await Transaction.create({
                user_id: userId,
                amount: -price, // Số âm vì là trừ tiền
                type: 'unlock_chapter',
                description: `Mua chương ${chapter.chapter_num}: -${price} xu`
            }, { transaction: t });

            await t.commit();
            return { status: 'success', message: 'Mua chương thành công' };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },
    
    // 3. Kiểm tra quyền truy cập chương (Dùng khi vào đọc)
    checkAccess: async (userId, chapterId) => {
        // Logic: Nếu chương Free hoặc User đã mua -> Có quyền
        const chapter = await Chapter.findByPk(chapterId);
        if (chapter.price === 0) return true;
        
        const unlocked = await UnlockedChapter.findOne({
            where: { user_id: userId, chapter_id: chapterId }
        });
        return !!unlocked; // Trả về true/false
    }
};

export default PaymentService;