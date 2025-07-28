const router = require('express').Router();
const UserController = require("../controllers/index.controller.js")
const { upload } = require('../config/cloudinary.js');


router.get("/dummy", UserController.getDummyData)
router.post('/create-product', upload.single('productImage'), UserController.createProduct);


module.exports = router