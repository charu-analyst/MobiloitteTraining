const express = require("express");
const productCategory = express.Router();
productCategory.use(express.json());
const productController = require("../controller/productController");
const common = require("../commonFunction/common");


productCategory.post('/createProduct',common.auth,productController.createProduct);
productCategory.get('/getProduct',common.auth,productController. getProduct);
productCategory.put('/updateProduct',common.auth,productController.updateProduct);
productCategory.delete('/deleteProduct',common.auth,productController.deleteProduct);







module.exports = productCategory;