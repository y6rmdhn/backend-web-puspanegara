const router = require('express').Router();
const UserController = require("../controllers/index.controller.js");
const { authenticateToken } = require('../middleware/auth.js');
const upload = require('../middleware/file.js');

// auth
router.post("/login" ,UserController.signIn)
router.post("/register", UserController.signUp)
router.post("/log-out", authenticateToken ,UserController.signOut)

// products
router.post(
  '/add-products',
  authenticateToken,
  upload.single('productImage'),
  UserController.createProduct
);

router.put(
  '/products/:id',
  authenticateToken,
  upload.single('productImage'),
  UserController.updateProduct
);

router.delete(
  '/products/delete',
  authenticateToken,
  UserController.deleteProducts
);

// without authentication   
router.get('/products', UserController.getAllProducts);
router.get('/products/:id', UserController.getProductById);

module.exports = router