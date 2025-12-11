import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Rating = sequelize.define('Rating', {
    user_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true // Dùng làm 1 phần của khóa chính
    },
    story_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true // Dùng làm 1 phần của khóa chính
    },
    score: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: { min: 1, max: 5 } // Chỉ cho phép từ 1 đến 5 sao [cite: 81]
    }
}, { 
    tableName: 'ratings',
    timestamps: true 
});

export default Rating;