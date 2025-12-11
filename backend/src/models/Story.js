import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Story = sequelize.define('Story', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    type: { type: DataTypes.ENUM('novel', 'comic'), allowNull: false }, 
    cover_image: { type: DataTypes.STRING(500) },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('ongoing', 'completed', 'dropped'), defaultValue: 'ongoing' },
    total_views: { type: DataTypes.INTEGER, defaultValue: 0 },
    average_rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    author_name: { 
        type: DataTypes.STRING(255),
        allowNull: true // Có thể null nếu chưa rõ tác giả
    }
}, { tableName: 'stories' });

export default Story;