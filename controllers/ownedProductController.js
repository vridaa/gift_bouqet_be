// ===================================
// Controller Produk Dimiliki/Owned Produk
// ===================================
// Fungsi: Menangani operasi terkait produk yang dimiliki user
// Fitur:
// 1. Mendapatkan semua produk yang dimiliki user
// 2. Mendapatkan detail produk yang dimiliki
// 3. Membuat record produk yang dimiliki
// 4. Memperbarui status penggunaan produk

// Import library dan model yang dibutuhkan
const { OwnedProduk, Produk, Transaction } = require('../models');  // Model dari database
const { validationResult } = require('express-validator');                  // Validasi input
const crypto = require('crypto');                                          // Generate kode unik

// === Get All Owned Produk ===
// Fungsi: Mendapatkan daftar semua produk yang dimiliki user
// Method: GET
// Endpoint: /api/owned-produk
// Akses: User yang login
exports.getOwnedProduk = async (req, res) => {
  try {
    // === Tahap 1: Ambil ID User ===
    const userID = req.user.userID;
    
    // === Tahap 2: Ambil Data Produk ===
    const ownedProduk = await OwnedProduk.findAll({
      where: { userID },
      include: [{
        model: Produk,
        attributes: ['nama','price']
      }, {
        model: Transaction,
        attributes: ['transactionID','totalPrice', 'transactionDate', 'status']
      }],
      order: [['ownedProdukID', 'DESC']]
    });

    // === Tahap 3: Kirim Response ===
    res.json({
      status: 'sukses',
      data: { ownedProduk }
    });
  } catch (error) {
    // === Error Handling ===
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// === Get Owned Produk By ID ===
// Fungsi: Mendapatkan detail satu produk yang dimiliki
// Method: GET
// Endpoint: /api/owned-produk/:id
// Akses: User yang login
exports.getOwnedProdukById = async (req, res) => {
  try {
    // === Tahap 1: Ambil Parameter ===
    const { id } = req.params;
    const userID = req.user.userID;

    // === Tahap 2: Ambil Data Produk ===
    const ownedProduk = await OwnedProduk.findOne({
      where: { 
        ownedProdukID: id,
        userID 
      },
      include: [{
        model: Produk,
        attributes: ['nama','price']
      }, {
        model: Transaction,
        attributes: ['transactionID', 'totalPrice', 'transactionDate', 'status']
      }]
    });

    // === Tahap 3: Validasi Keberadaan Produk ===
    if (!ownedProduk) {
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }

    // === Tahap 4: Kirim Response ===
    res.json({
      status: 'sukses',
      data: { ownedProduk }
    });
  } catch (error) {
    // === Error Handling ===
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// === Create Owned Produk ===
// Fungsi: Membuat record produk yang dimiliki
// Method: POST
// Endpoint: /api/owned-produk
// Akses: User yang login
exports.createOwnedProduk = async (req, res) => {
  try {
    // === Tahap 1: Validasi Input ===
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error validasi',
        errors: errors.array()
      });
    }

    // === Tahap 2: Ambil Data Input ===
    const { produkID, transactionID } = req.body;
    const userID = req.user.userID;

    // === Tahap 3: Generate Kode Unik ===
    const uniqueCode = crypto.randomBytes(8).toString('hex');

    // === Tahap 4: Buat Record Produk ===
    const ownedProduk = await OwnedProduk.create({
      userID,
      produkID,
      transactionID,
      uniqueCode,
      produkStatus: 'pesanan diterima'
    });

    // === Tahap 5: Kirim Response ===
    res.status(201).json({
      status: 'sukses',
      message: 'Pesanan berhasil dibuat',
      data: { ownedProduk }
    });
  } catch (error) {
    // === Error Handling ===
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// === Update Usage Status ===
// Fungsi: Memperbarui status penggunaan produk
// Method: PUT
// Endpoint: /api/owned-produk/:id/use
// Akses: User yang login
exports.updateProdukStatus = async (req, res) => {
  try {
    // === Tahap 1: Ambil Parameter ===
    const { id } = req.params;
    const userID = req.user.userID;

    // === Tahap 2: Validasi Keberadaan Produk ===
    const ownedProduk = await OwnedProduk.findOne({
      where: { 
        ownedProdukID: id,
        userID 
      }
    });

    if (!ownedProduk) {
      return res.status(404).json({
        status: 'error',
        message: 'Pesanan tidak ditemukan'
      });
    }

    // === Tahap 3: Validasi Status Produk ===
    if (ownedProduk.usageStatus === 'Pesanan Selesai') {
      return res.status(400).json({
        status: 'error',
        message: 'Pesanan sudah selesai'
      });
    }

    // === Tahap 4: Update Status ===
    await ownedProduk.update({
      usageStatus: 'Pesanan Selesai'
    });

    // === Tahap 5: Ambil Data Terbaru ===
    const updatedProduk = await OwnedProduk.findOne({
      where: { ownedProdukID: id },
      include: [{
        model: Produk,
        attributes: ['nama','price']
      }, {
        model: Transaction,
        attributes: ['transactionID', 'totalPrice', 'transactionDate', 'status']
      }]
    });

    // === Tahap 6: Kirim Response ===
    res.json({
      status: 'sukses',
      message: 'Status pesanan berhasil diperbarui',
      data: { ownedProduk: updatedProduk }
    });
  } catch (error) {
    // === Error Handling ===
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};
