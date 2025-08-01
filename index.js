require("dotenv").config();
const express = require("express");
const cors = require("cors")
const router = require("./routes/index.route");
const mongoose = require("mongoose");

const { MONGO_URL, API_PORT } = process.env

const app = express();
const PORT = API_PORT || 3000;

app.use(cors());
app.use(express.json())
app.use('/api', router);

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('Berhasil terhubung ke MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MongoDB:', err);
  });

app.get('/', (req, res) => {
    res.send('Welcome to the API Server');
})

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app