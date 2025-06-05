const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Produk = require('./product');

const Transaction = sequelize.define('Transaction', {
  transactionID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'transactionID'
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
    field: 'produkID',
    references: {
      model: Produk,
      key: 'produkID'
    }
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'transaction_date'
  },
  produkQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'produk_quantity'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pending'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price'
  },
}, {
  tableName: 'transaction',
  timestamps: false
});

// Define associations
Transaction.belongsTo(User, { foreignKey: 'userID' });
User.hasMany(Transaction, { foreignKey: 'userID' });

Transaction.belongsTo(Produk, { foreignKey: 'produkID' });
Produk.hasMany(Transaction, { foreignKey: 'produkID' });

module.exports = Transaction;
