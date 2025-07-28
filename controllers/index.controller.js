
const { Product } = require('../models/product.model.js');
const cloudinary = require('../config/cloudinary'); 

const getDummyData = (req, res) => {
    return res.status(200).json({
        messaage: "berhasil",
        data: "OK"
    });
};

const createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Gambar produk harus diunggah' });
        }

        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                return res.status(500).json({ message: 'Gagal mengunggah gambar ke Cloudinary' });
            }

            const newProduct = new Product({
                ...req.body,
                imageUrl: result.secure_url
            });

            await newProduct.save();
            res.status(201).json({ message: 'Produk berhasil dibuat', data: newProduct });
        });

        uploadStream.end(req.file.buffer);

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
    }
};

module.exports = { getDummyData, createProduct };