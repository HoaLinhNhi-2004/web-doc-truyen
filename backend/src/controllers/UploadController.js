const UploadController = {
    uploadImage: (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ status: 'error', message: 'Chưa chọn file nào' });
            }

            // Tạo đường dẫn đầy đủ để FE hiển thị
            // VD: http://localhost:3000/uploads/123-abc.jpg
            const protocol = req.protocol;
            const host = req.get('host');
            const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

            // Trả về đường dẫn cho Admin dùng
            return res.status(200).json({
                status: 'success',
                message: 'Upload thành công',
                data: {
                    url: fileUrl,       // Đường dẫn đầy đủ
                    path: `uploads/${req.file.filename}` // Đường dẫn tương đối (Lưu vào DB cái này cũng được)
                }
            });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

export default UploadController;