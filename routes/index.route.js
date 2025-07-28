const router = require('express').Router();
const UserController = require("../controllers/index.controller.js")


router.get("/dummy", UserController.getDummyData)


module.exports = router