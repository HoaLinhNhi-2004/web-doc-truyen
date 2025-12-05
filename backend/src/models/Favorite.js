import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favorite = sequelize.define('Favorite', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    story_id: { type: DataTypes.INTEGER, primaryKey: true },
    notification: { type: DataTypes.BOOLEAN, defaultValue: true } // Nhận thông báo chương mới
}, { 
    tableName: 'favorites',
    timestamps: true 
});

export default Favorite;