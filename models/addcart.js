const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Produk = require('./product');

const Addcart = sequelize.define('Addcart', {
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'userID',
    references: {
      model: User,
      key: 'userID'
    }
  },
  produkID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'produkID',
    references: {
      model: Produk,
      key: 'produkID'
    }
  },
  isAddcart: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_addcart'
  }
}, {
  tableName: 'addcart',
  timestamps: false
});

module.exports = Addcart;
