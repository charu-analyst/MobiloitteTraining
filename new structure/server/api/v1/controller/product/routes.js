import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth"


export default Express.Router()
    .post('/addProduct', auth.verifyToken, controller.addProduct)
    .delete('/deleteProduct', auth.verifyToken, controller.deleteProduct)
    .put('/editProduct', auth.verifyToken, controller.editProduct)
    .get("/getProduct", controller.getProduct)
    .get("/getProductList", controller.getProductList)
    .get("/getSpecificProduct", controller.getSpecificProduct)
    .put('/productLikedAndDisliked', auth.verifyToken, controller.productLikedAndDisliked)
    .put('/productlikedList', auth.verifyToken, controller.productlikedList)













