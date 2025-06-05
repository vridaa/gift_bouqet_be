const { Produk, Addcart } = require('../models');
const { validationResult } = require('express-validator');
const {
  getFilename,
  bucket,
  deleteFileFromGCS,
  getDefaultImageUrl
} = require('../middlewares/uploadMiddleware');

// GET - Semua produk (publik)
exports.getAllProduk = async (req, res) => {
  try {
    const userId = req.user?.id || null;

    const produk = await Produk.findAll({
      include: userId
        ? [
            {
              model: Addcart,
              where: { userID: userId },
              required: false,
              attributes: ['isAddcart']
            }
          ]
        : [],
      order: [['created_at', 'DESC']]
    });

    const produkWithPlaceholder = produk.map((produk) => {
      const produkData = produk.toJSON();
      produkData.isAddcart = produk.Addcart?.[0]?.isAddcart || false;

      if (!produkData.imageUrl) {
        produkData.imageUrl = getDefaultImageUrl();
      }

      return produkData;
    });

    res.json({
      status: 'sukses',
      data: {
        produk: produkWithPlaceholder
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// GET - Detail produk
exports.getProdukById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const produk = await Produk.findByPk(id, {
      include: userId
        ? [
            {
              model: Addcart,
              where: { userID: userId },
              required: false,
              attributes: ['isAddcart']
            }
          ]
        : []
    });

    if (!produk) {
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }

    const produkData = produk.toJSON();
    produkData.isAddcart = produk.Addcart?.[0]?.isAddcart || false;

    if (!produkData.imageUrl) {
      produkData.imageUrl = getDefaultImageUrl();
    }

    res.json({
      status: 'sukses',
      data: { produk: produkData }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// POST - Tambah produk (admin)
exports.createProduk = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error validasi',
        errors: errors.array()
      });
    }

    const { nama, price, description, category } = req.body;

    const produk = await Produk.create({
      nama,
      price,
      description,
      category,
      imageUrl: null
    });

    if (req.file) {
      const filename = getFilename('produk', produk.produkID);
      const blob = bucket.file(filename);
      const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true,
        metadata: { contentType: req.file.mimetype }
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(new Error('Gagal upload gambar: ' + err.message)));
        blobStream.on('finish', resolve);
        blobStream.end(req.file.buffer);
      });

      const imageUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filename}`;
      await produk.update({ imageUrl });
    }

    const responseProduk = produk.toJSON();
    if (!responseProduk.imageUrl) {
      responseProduk.imageUrl = getDefaultImageUrl();
    }

    res.status(201).json({
      status: 'sukses',
      message: 'Produk berhasil dibuat',
      data: { produk: responseProduk }
    });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server: ' + error.message
    });
  }
};

// PUT - Update produk
exports.updateProduk = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error validasi',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { nama, price, description, category } = req.body;

    const produk = await Produk.findByPk(id);
    if (!produk) {
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }

    const oldImageUrl = produk.imageUrl;

    if (req.file) {
      const filename = getFilename('produk', produk.produkID);
      const blob = bucket.file(filename);
      const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true,
        metadata: { contentType: req.file.mimetype }
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(new Error('Upload gagal: ' + err.message)));
        blobStream.on('finish', resolve);
        blobStream.end(req.file.buffer);
      });

      const newImageUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filename}`;

      await produk.update({
        nama,
        price,
        description,
        category,
        imageUrl: newImageUrl
      });

      if (oldImageUrl && !oldImageUrl.includes('image-placeholder.jpg')) {
        await deleteFileFromGCS(oldImageUrl);
      }
    } else {
      await produk.update({ nama, price, description, category });
    }

    await produk.reload();
    const responseProduk = produk.toJSON();
    if (!responseProduk.imageUrl) {
      responseProduk.imageUrl = getDefaultImageUrl();
    }

    res.json({
      status: 'sukses',
      message: 'Produk berhasil diupdate',
      data: { produk: responseProduk }
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server: ' + error.message
    });
  }
};

// DELETE - Hapus produk
exports.deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const produk = await Produk.findByPk(id);

    if (!produk) {
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }

    const imageUrlToDelete = produk.imageUrl;

    await produk.destroy();

    if (imageUrlToDelete && !imageUrlToDelete.includes('image-placeholder.jpg')) {
      await deleteFileFromGCS(imageUrlToDelete);
    }

    res.json({
      status: 'sukses',
      message: 'Produk berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server: ' + error.message
    });
  }
};

// Toggle addcart status
exports.toggleAdd = async (req, res) => {
  try {
    const { id } = req.params; // produkID
    const userID = req.user.id; // Asumsi req.user.id tersedia dari authMiddleware

    const produk = await Produk.findByPk(id);
    if (!produk) {
      return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan' });
    }

    let addcartItem = await Addcart.findOne({
      where: { produkID: id, userID: userID }
    });

    if (addcartItem) {
      // Jika sudah ada, hapus dari addcart
      await addcartItem.destroy();
      return res.json({
        status: 'sukses',
        message: 'Produk berhasil dihapus dari daftar keinginan',
        data: { isAddcart: false }
      });
    } else {
      // Jika belum ada, tambahkan ke addcart
      addcartItem = await Addcart.create({
        produkID: id,
        userID: userID,
        isAddcart: true // Atau biarkan default jika schema tidak memilikinya
      });
      return res.status(201).json({
        status: 'sukses',
        message: 'Produk berhasil ditambahkan ke daftar keinginan',
        data: { isAddcart: true }
      });
    }
  } catch (error) {
    console.error('Toggle addcart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server: ' + error.message
    });
  }
};
