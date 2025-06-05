const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');
const { produkValidation, updateProdukValidation, idParamValidation } = require('../middlewares/validationMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');
const { uploadConfig, uploadToGCS } = require('../middlewares/uploadMiddleware');

// Semua endpoint di route ini memerlukan login (autentikasi)
router.use(authenticateToken);

// === Route untuk user yang sudah login ===
// Mendapatkan daftar semua produk yang tersedia
// GET /api/produk
router.get('/', produkController.getAllProduk);

// Mendapatkan detail satu produk berdasarkan ID
// GET /api/produk/:id
router.get('/:id', idParamValidation, produkController.getProdukById);
router.get('/:id/addcart', idParamValidation, produkController.toggleAdd)

// === Route khusus admin ===
// Membuat jenis produk baru
// POST /api/produk
// Urutan middleware:
// 1. Cek role admin
// 2. Validasi data produk
// 3. Simpan ke database
router.post('/',
  isAdmin,
  uploadConfig.produkImage,
  produkValidation,
  produkController.createProduk
);

// Mengupdate informasi produk
// PUT /api/produk/:id
// Urutan middleware:
// 1. Cek role admin
// 2. Validasi ID
// 3. Validasi data update
// 4. Update di database
router.put('/:id',
  isAdmin,
  uploadConfig.produkImage,
  idParamValidation,
  updateProdukValidation,
  produkController.updateProduk
);

// Menghapus jenis produk
// DELETE /api/produk/:id
router.delete('/:id',
  isAdmin,
  idParamValidation,
  produkController.deleteProduk
);

module.exports = router;
