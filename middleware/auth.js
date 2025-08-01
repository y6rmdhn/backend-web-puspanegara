// File: middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({
            message: "Akses ditolak, token tidak ditemukan"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({
                    message: "Akses ditolak, token sudah kedaluwarsa"
                });
            }
            return res.status(403).json({
                message: "Akses ditolak, token tidak valid"
            });
        }

        req.user = decodedPayload;

        next();
    });
}

module.exports = { authenticateToken };