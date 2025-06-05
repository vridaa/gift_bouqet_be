const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produk = sequelize.define('Produk', {
  produkID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'produkID'
  },
  nama:{
    type: DataTypes.TEXT,
    allowNull : false
  }, 
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type : DataTypes.TEXT,
    allowNull : false
  },
  imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'image_url',
      get() {
        const value = this.getDataValue('imageUrl');
        if (!value) {
          return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/assets/image-placeholder.jpg`;
        }
        return value;
      }
    },
}, {
  tableName: 'produk',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Produk;
