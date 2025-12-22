import express from 'express';
import StoryController from '../controllers/StoryController.js';
import AuthController from '../controllers/AuthController.js';
import UserController from '../controllers/UserController.js';
import CommentController from '../controllers/CommentController.js';
import RatingController from '../controllers/RatingController.js';
import PaymentController from '../controllers/PaymentController.js';
import AdminController from '../controllers/AdminController.js';
import UploadController from '../controllers/UploadController.js';
import CategoryController from '../controllers/CategoryController.js';

import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
// [MỚI] Import middleware xác thực không bắt buộc (dùng cho xem chương)
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware.js'; 

import upload from '../config/upload.js';

const router = express.Router();

const initRoutes = (app) => {
    
    // ============================================
    // 1. NHÓM PUBLIC (KHÔNG CẦN ĐĂNG NHẬP)
    // ============================================
    
    // --- Truyện & Chương ---
    router.get('/api/stories', StoryController.getStories);
    router.get('/api/stories/:slug', StoryController.getStoryDetail);
    
    // [QUAN TRỌNG] Thêm optionalAuthMiddleware vào đây để check quyền VIP
    router.get('/api/chapters/:id', optionalAuthMiddleware, StoryController.getChapter);
    
    router.post('/api/stories/:id/view', StoryController.increaseView);

    // --- Thể loại ---
    router.get('/api/categories', CategoryController.getAll);

    // --- Bình luận (Xem) ---
    router.get('/api/comments/:storyId', CommentController.getComments);


    // ============================================
    // 2. NHÓM AUTH (XÁC THỰC TÀI KHOẢN)
    // ============================================
    
    router.post('/api/auth/register', AuthController.register);
    router.post('/api/auth/login', AuthController.login);
    // Lấy thông tin cá nhân
    router.get('/api/auth/me', authMiddleware, AuthController.getMe);


    // ============================================
    // 3. NHÓM USER (CÁ NHÂN - CẦN LOGIN)
    // ============================================

    // --- Tủ truyện & Lịch sử ---
    router.get('/api/user/favorites', authMiddleware, UserController.getFavorites);
    router.post('/api/user/favorites/toggle', authMiddleware, UserController.toggleFavorite);
    
    router.get('/api/user/history', authMiddleware, UserController.getHistory);
    router.post('/api/user/history', authMiddleware, UserController.saveHistory);

    // --- Cập nhật Profile ---
    router.put('/api/user/profile', authMiddleware, UserController.updateProfile);
    router.put('/api/user/password', authMiddleware, UserController.changePassword);

    // --- Tương tác (Bình luận & Đánh giá) ---
    router.post('/api/comments', authMiddleware, CommentController.createComment);
    router.delete('/api/comments/:id', authMiddleware, CommentController.deleteComment);

    router.post('/api/ratings', authMiddleware, RatingController.rate);
    router.get('/api/ratings/:storyId/me', authMiddleware, RatingController.getMyRating);

    // --- Thanh toán ---
    router.post('/api/payment/deposit', authMiddleware, PaymentController.deposit);
    router.post('/api/payment/unlock', authMiddleware, PaymentController.unlockChapter);


    // ============================================
    // 4. NHÓM ADMIN (CMS - CẦN QUYỀN ADMIN)
    // ============================================

    // --- Quản lý Truyện ---
    // [QUAN TRỌNG] Lấy danh sách truyện cho Admin (Trang danh sách)
    router.get('/api/admin/stories', authMiddleware, adminMiddleware, AdminController.getStories);
    
    // [QUAN TRỌNG] Lấy chi tiết truyện theo ID (Trang chỉnh sửa)
    router.get('/api/admin/stories/:id', authMiddleware, adminMiddleware, AdminController.getStoryById); 
    
    router.post('/api/admin/stories', authMiddleware, adminMiddleware, AdminController.createStory);
    router.put('/api/admin/stories/:id', authMiddleware, adminMiddleware, AdminController.updateStory);
    router.delete('/api/admin/stories/:id', authMiddleware, adminMiddleware, AdminController.deleteStory);

    // --- Quản lý Chương ---
    router.post('/api/admin/stories/:storyId/chapters', authMiddleware, adminMiddleware, AdminController.createChapter);
    router.put('/api/admin/chapters/:id', authMiddleware, adminMiddleware, AdminController.updateChapter); 
    router.delete('/api/admin/chapters/:id', authMiddleware, adminMiddleware, AdminController.deleteChapter);
    router.put('/api/admin/chapters/:id/price', authMiddleware, adminMiddleware, AdminController.setChapterPrice);

    // --- Quản lý Thể loại ---
    router.post('/api/admin/categories', authMiddleware, adminMiddleware, AdminController.createCategory);
    router.put('/api/admin/categories/:id', authMiddleware, adminMiddleware, AdminController.updateCategory);
    router.delete('/api/admin/categories/:id', authMiddleware, adminMiddleware, AdminController.deleteCategory);

    // --- Quản lý User & Tiền tệ ---
    router.get('/api/admin/users', authMiddleware, adminMiddleware, AdminController.getUsers);
    router.post('/api/admin/users/:id/ban', authMiddleware, adminMiddleware, AdminController.banUser);
    router.post('/api/admin/users/deposit', authMiddleware, adminMiddleware, AdminController.addCoins);

    // [MỚI] --- Quản lý Giao dịch Nạp tiền ---
    router.get('/api/admin/transactions', authMiddleware, adminMiddleware, AdminController.getTransactions);
    router.post('/api/admin/transactions/:id/approve', authMiddleware, adminMiddleware, AdminController.approveTrans);
    router.post('/api/admin/transactions/:id/reject', authMiddleware, adminMiddleware, AdminController.rejectTrans);


    // ============================================
    // 5. TIỆN ÍCH HỆ THỐNG (UPLOAD)
    // ============================================
    
    // Middleware upload bọc trong function để bắt lỗi Multer không crash server
    router.post('/api/upload', authMiddleware, (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: err.message || 'Lỗi upload ảnh (File quá lớn hoặc sai định dạng)' 
                });
            }
            next();
        });
    }, UploadController.uploadImage);


    return app.use('/', router);
};

export default initRoutes;