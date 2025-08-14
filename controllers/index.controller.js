
const { Product } = require('../models/product.model.js');
const { Admin } = require('../models/admin.model.js');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CRUD operations for Product
const createProduct = async (req, res) => {
  let publicId = null;
  try {
    // <-- UBAH DI SINI: Ambil 'no_wa' dari body
    const { name, description, price, stock, category, no_wa } = req.body;

    // <-- UBAH DI SINI: Tambahkan validasi untuk 'no_wa'
    if (!name || !description || !price || !no_wa) {
      return res.status(400).json({ message: 'Nama, deskripsi, harga, dan No. WA wajib diisi.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Foto produk wajib diunggah.' });
    }
    
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "products",
    });
    
    const imageUrl = result.secure_url;
    publicId = result.public_id;

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
      publicId,
      no_wa,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "Produk berhasil dibuat",
      data: savedProduct,
    });
  } catch (error) {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const queryFilter = {
      name: { $regex: search, $options: "i" },
    };

    const totalProducts = await Product.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(queryFilter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Success get all products",
      data: {
        data: products,
        currentPage: page,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.status(200).json({
      message: "Berhasil mendapatkan produk",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// ** FUNGSI BARU UNTUK UPDATE **
const updateProduct = async (req, res) => {
  const { id } = req.params;
  // <-- UBAH DI SINI: Ambil 'no_wa' dari body
  const { name, description, price, stock, category, no_wa } = req.body;
  let newPublicId = null;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const oldPublicId = product.publicId;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, { folder: "products" });
      
      product.imageUrl = result.secure_url;
      product.publicId = result.public_id;
      newPublicId = result.public_id;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;
    product.no_wa = no_wa || product.no_wa; // <-- UBAH DI SINI: Perbarui 'no_wa'

    const updatedProduct = await product.save();

    if (newPublicId && oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }

    res.status(200).json({
      message: "Produk berhasil diperbarui",
      data: updatedProduct,
    });

  } catch (error) {
    if (newPublicId) {
      await cloudinary.uploader.destroy(newPublicId);
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// ** FUNGSI DELETE YANG DIPERBAIKI **
const deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Harap sediakan array ID produk yang akan dihapus.' });
    }

    // Temukan produk untuk mendapatkan public_id gambarnya
    const productsToDelete = await Product.find({ _id: { $in: ids } });
    if (productsToDelete.length === 0) {
        return res.status(404).json({ message: 'Tidak ada produk yang ditemukan dengan ID yang diberikan.' });
    }
    
    // Kumpulkan semua publicId
    const publicIds = productsToDelete.map(p => p.publicId).filter(id => id);

    // Hapus gambar dari Cloudinary jika ada
    if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
    }

    // Hapus produk dari database
    const result = await Product.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: `${result.deletedCount} produk dan gambar terkait berhasil dihapus.` });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Authentication functions

const signUp = async (req, res) => {
    const { username, password } = req.body
    const hashPass = await argon2.hash(password)

    try {
        const admin = await Admin.findOne({ username });
        
        if(admin){
            return res.status(400).json({
                message: "Username sudah terdaftar"
            })
        }

        const addNewUser = new Admin({ username, password: hashPass })
        await addNewUser.save()

        return res.status(201).json({
            message: "Admin berhasil dibuat",
            data: {
                username: addNewUser.username
            }
        });

    } catch (error) {
        console.error("Error pada saat sign-up:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server",
            error: error.message
        });
    }
}

const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const isPasswordMatch = await argon2.verify(admin.password, password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const payload = {
            id: admin._id,
            username: admin.username,
            role: admin.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            message: "Berhasil masuk",
            data: {
                username: admin.username,
                role: admin.role,
            },
            token: token
        });

    } catch (error) {
        console.error("Error pada saat sign-in:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server",
            error: error.message
        });
    }
}

const signOut = (req, res) => {
    return res.status(200).json({
        message: "Sign-out berhasil"
    });
};




module.exports = { signUp, signIn, signOut, createProduct, getAllProducts, updateProduct, getProductById, deleteProducts };