import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StoryCategory = sequelize.define('StoryCategory', {
    // Không cần khai báo id, Sequelize tự tạo nếu muốn
    story_id: { 
        type: DataTypes.INTEGER, 
        references: { model: 'stories', key: 'id' } 
    },
    category_id: { 
        type: DataTypes.INTEGER, 
        references: { model: 'categories', key: 'id' } 
    }
}, { 
    tableName: 'story_categories', 
    timestamps: false 
});

export default StoryCategory;