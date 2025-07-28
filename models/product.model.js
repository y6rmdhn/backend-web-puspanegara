// models/Product.js (Tidak ada perubahan)
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: false, default: 0 },
    category: { type: String, required: false },
    imageUrl: { type: String, required: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;