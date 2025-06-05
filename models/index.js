const User = require('./user');
const Produk = require('./product');
const Transaction = require('./transaction');
const OwnedProduk = require('./ownedProduct');

// User associations
User.hasMany(Transaction, { foreignKey: 'userID' });
Transaction.belongsTo(User, { foreignKey: 'userID' });

User.hasMany(OwnedProduk, { foreignKey: 'userID' });
OwnedProduk.belongsTo(User, { foreignKey: 'userID' });

// Produk associations
Produk.hasMany(Transaction, { foreignKey: 'produkID' });
Transaction.belongsTo(Produk, { foreignKey: 'produkID' });

Produk.hasMany(OwnedProduk, { foreignKey: 'produkID' });
OwnedProduk.belongsTo(Produk, { foreignKey: 'produkID' });

// Transaction associations
Transaction.hasMany(OwnedProduk, { foreignKey: 'transactionID' });
OwnedProduk.belongsTo(Transaction, { foreignKey: 'transactionID' });

module.exports = {
  User,
  Produk,
  Transaction,
  OwnedProduk,
};