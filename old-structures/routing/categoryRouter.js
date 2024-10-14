const express = require("express");
const categoryRouter = express.Router();
categoryRouter.use(express.json());
const categoryController = require("../controller/categoryController");
const common  = require("../commonFunction/common");



categoryRouter.post('/createCategories',common.auth,categoryController.createCategories);
categoryRouter.delete('/deletCategory/:id',common.auth,categoryController.deleteCategory);
categoryRouter.put('/updateCategory/:id',common.auth,categoryController.updateCategory);
categoryRouter.get('/getCategory/:id',common.auth,categoryController.getCategory);








module.exports = categoryRouter;