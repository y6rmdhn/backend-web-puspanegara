
const getDummyData = (req, res) => {
    return res.status(200).json({
        messaage: "berhasil",
        data: "OK"
    })
}

const createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Gambar produk harus diunggah' });
        }

        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Gagal mengunggah gambar' });
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
        res.status(500).json({ message: 'Error pada server', error: err });
    }
};


module.exports = {getDummyData, createProduct}