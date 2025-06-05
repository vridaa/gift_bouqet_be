const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Produk = require('./product');
const Transaction = require('./transaction');

const OwnedProduk = sequelize.define('OwnedProduk', {
  ownedProdukID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ownedProdukID'
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userID',
    references: {
      model: User,
      key: 'userID'
    }
  },
  produkID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'produk_id',
    references: {
      model: Produk,
      key: 'produkID'
    }
  },
  transactionID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'transactionID'
  },
  uniqueCode: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'unique_code'
  },
  produkStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'pesanan diterima',
    field: 'produk_status'
  }
}, {
  tableName: 'ownedproduk',
  timestamps: false
});

// Define associations
OwnedProduk.belongsTo(User, { foreignKey: 'userID' });
OwnedProduk.belongsTo(Produk, { foreignKey: 'produkID' });
OwnedProduk.belongsTo(Transaction, { foreignKey: 'transactionID' });

module.exports = OwnedProduk;
