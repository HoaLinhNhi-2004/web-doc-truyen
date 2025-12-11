const adminMiddleware = (req, res, next) => {
    // req.user đã có dữ liệu nhờ authMiddleware chạy trước đó
    // Kiểm tra role
    if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
        next(); // Là Sếp -> Cho qua
    } else {
        return res.status(403).json({ 
            status: 'error', 
            message: 'Truy cập bị từ chối! Bạn không phải Admin.' 
        });
    }
};

export default adminMiddleware;