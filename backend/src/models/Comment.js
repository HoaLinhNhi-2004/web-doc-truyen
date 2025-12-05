import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    story_id: { type: DataTypes.INTEGER, allowNull: false },
    chapter_id: { type: DataTypes.INTEGER, allowNull: true }, // Có thể null nếu comment truyện
    content: { type: DataTypes.TEXT, allowNull: false },
    parent_id: { type: DataTypes.INTEGER, allowNull: true } // Để reply comment
}, { tableName: 'comments' });

export default Comment;