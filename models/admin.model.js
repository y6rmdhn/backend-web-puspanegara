const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username harus diisi'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        minlength: [6, 'Password minimal 6 karakter']
    }
});


module.exports = {
    Admin: mongoose.model('Admin', adminSchema)
};