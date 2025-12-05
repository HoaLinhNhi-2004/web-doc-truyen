import express from 'express';
import StoryController from '../controllers/StoryController.js';
import AuthController from '../controllers/AuthController.js'; // <-- Import mới
import authMiddleware from '../middlewares/authMiddleware.js'; // <-- Import mới
import UserController from '../controllers/UserController.js';
import CommentController from '../controllers/CommentController.js';
import RatingController from '../controllers/RatingController.js';
import PaymentController from '../controllers/PaymentController.js';
import AdminController from '../controllers/AdminController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import UploadController from '../controllers/UploadController.js'; // <-- Import mới
import upload from '../config/upload.js';


const router = express.Router();

const initRoutes = (app) => {
    // --- 1. NHÓM TRUYỆN (PUBLIC) ---
    router.get('/api/stories', StoryController.getStories);
    router.get('/api/stories/:slug', StoryController.getStoryDetail);
    router.get('/api/chapters/:id', StoryController.getChapter);
    router.post('/api/stories/:id/view', StoryController.increaseView);

    // --- 2. NHÓM AUTH (TÀI KHOẢN) ---
    // Đăng ký & Đăng nhập (Ai cũng vào được)
    router.post('/api/auth/register', AuthController.register);
    router.post('/api/auth/login', AuthController.login);

    // Lấy thông tin cá nhân (Phải đăng nhập mới xem được -> dùng authMiddleware)
    router.get('/api/auth/me', authMiddleware, AuthController.getMe);

    // --- 3. NHÓM USER (CÁ NHÂN) ---
    // Tủ truyện (Favorites)
    router.get('/api/user/favorites', authMiddleware, UserController.getFavorites);
    router.post('/api/user/favorites/toggle', authMiddleware, UserController.toggleFavorite);

    // Lịch sử (History)
    router.get('/api/user/history', authMiddleware, UserController.getHistory);
    router.post('/api/user/history', authMiddleware, UserController.saveHistory);


    // 4. NHÓM TƯƠNG TÁC (BÌNH LUẬN)
    // Xem bình luận (Ai cũng xem được -> Không cần authMiddleware)
    router.get('/api/comments/:storyId', CommentController.getComments);
    // Gửi bình luận (Phải đăng nhập -> Cần authMiddleware)
    router.post('/api/comments', authMiddleware, CommentController.createComment);

    // --- 5. NHÓM ĐÁNH GIÁ (RATING) ---
    // Đánh giá (Cần login)
    router.post('/api/ratings', authMiddleware, RatingController.rate);
    
    // Xem điểm mình đã chấm cho truyện này
    router.get('/api/ratings/:storyId/me', authMiddleware, RatingController.getMyRating);

    // --- 6. NHÓM KINH TẾ (MUA BÁN) ---
    // Nạp xu
    router.post('/api/payment/deposit', authMiddleware, PaymentController.deposit);
    
    // Mua chương
    router.post('/api/payment/unlock', authMiddleware, PaymentController.unlockChapter);

    // ============================================
    // 7. NHÓM ADMIN (CMS) - BẢO MẬT CAO
    // ============================================
    
    // --- QUẢN LÝ TRUYỆN ---
    router.post('/api/admin/stories', authMiddleware, adminMiddleware, AdminController.createStory);
    router.put('/api/admin/stories/:id', authMiddleware, adminMiddleware, AdminController.updateStory);
    router.delete('/api/admin/stories/:id', authMiddleware, adminMiddleware, AdminController.deleteStory);

    // --- QUẢN LÝ CHƯƠNG ---
    router.post('/api/admin/stories/:storyId/chapters', authMiddleware, adminMiddleware, AdminController.createChapter);

    // --- QUẢN LÝ USER ---
    router.get('/api/admin/users', authMiddleware, adminMiddleware, AdminController.getUsers);
    router.post('/api/admin/users/:id/ban', authMiddleware, adminMiddleware, AdminController.banUser);

    // --- QUẢN LÝ THỂ LOẠI ---
    router.post('/api/admin/categories', authMiddleware, adminMiddleware, AdminController.createCategory);
    // --- QUẢN LÝ TIỀN TỆ ---
    // Admin nạp tiền cho user bất kỳ
    router.post('/api/admin/users/deposit', authMiddleware, adminMiddleware, AdminController.addCoins);

    // --- QUẢN LÝ GIÁ CHƯƠNG ---
    // Khóa chương/Set giá (Gửi body { price: 100 })
    router.put('/api/admin/chapters/:id/price', authMiddleware, adminMiddleware, AdminController.setChapterPrice);


    // ============================================
    // 8. TIỆN ÍCH HỆ THỐNG (UPLOAD)
    // ============================================
    
    // Upload 1 ảnh (Dùng cho ảnh bìa truyện)
    // upload.single('image') nghĩa là bên Postman key phải đặt tên là 'image'
    router.post('/api/upload', authMiddleware, adminMiddleware, upload.single('image'), UploadController.uploadImage);


    return app.use('/', router);
};

export default initRoutes;