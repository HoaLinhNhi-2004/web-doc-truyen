import { Category } from '../models/index.js';

const CategoryController = {
    // API lấy tất cả thể loại (cho dropdown/checkbox)
    getAll: async (req, res) => {
        try {
            const categories = await Category.findAll({
                attributes: ['id', 'name', 'slug'],
                order: [['name', 'ASC']]
            });
            return res.status(200).json({ status: 'success', data: categories });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

export default CategoryController;