const productModel = require("../model/product");
const userModel = require("../model/userModel");
const cloudinary = require("cloudinary").v2;


cloudinary.config({
    cloud_name: "df2ckvd8a",
    api_key: "395198921416824",
    api_secret: "-K7wMPMFG_W2XJH0EunJLbcSVTc",
});

module.exports = {
    createProduct: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                _id: req.userId,
                userType: "admin",
            });
            if (!admin) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "Admin not found." });
            } else {
                const { categoriesId, productName, productPrice } = req.body;
                if (!categoriesId || !productName || !productPrice) {
                    if (!categoriesId) {
                        return res.status(400).send({
                            responseCode: 400,
                            responseMessage: "category id is required",
                        });
                    } else if (!productName) {
                        return res.status(400).send({
                            responseCode: 400,
                            responseMessage: "product name is required",
                        });
                    } else if (!productPrice) {
                        return res.status(400).send({
                            responseCode: 400,
                            responseMessage: "product price is required",
                        });
                    }
                }
                const file = req.body.file;
                // cloudinary.uploader.upload("/home/admin1/Desktop/node all folder/node m1+m2 test/tempfiles/cap.jpeg", { public_id: "caps" })
                const upload = await cloudinary.uploader.upload(file);

                const obj = {
                    categoriesId: categoriesId,
                    productName: productName,
                    productPrice: productPrice,
                    productImage: upload.secure_url,
                };

                const result = await productModel.create(obj);
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Product added successfully.",
                    responseResult: result,
                });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    getProduct: async (req, res) => {
        try {
            const admin = await userModel.findOne(
                { _id: req, userId },
                { userType: "admin" }
            );
            if (!admin) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "Admin not found." });
            }
            const id = req.params.id;
            if (!id) {
                return res.status(400).send({
                    responseCode: 400,
                    responseMessage: "id of the product is required.",
                });
            }
            const result = await productModel.findOne({ _id: id });
            if (!result) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "Result not found." });
            } else {
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: "success",
                    responseResult: result,
                });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    updateProduct: async (req, res) => {
        try {
            const admin = await userModel.findOne(
                { _id: req, userId },
                { userType: "admin" }
            );
            if (!admin) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "Admin not found." });
            }
            const id = req.params.id;

            const { productName, productPrice, file } = req.body;
            if (!id) {
                return res.status(400).send({
                    responseCode: 400,
                    responseMessage: "id of the product is required.",
                });
            }

            if (productName || file || productPrice) {
                if (productName) {
                    const result = await productModel.findByIdAndUpdate(
                        { _id: id },
                        {
                            $set: {
                                productName: productName,
                            },
                        },
                        { new: true }
                    );
                    return res.status(200).send({
                        responseCode: 200,
                        responseMessage: "updated successfully",
                        responseResult: result,
                    });
                } else if (file) {
                    const upload = await cloudinary.uploader.upload(file);
                    const result = await productModel.findByIdAndUpdate(
                        { _id: id },
                        {
                            $set: {
                                productImage: upload.secure_url,
                            },
                        },
                        { new: true }
                    );
                    return res.status(200).send({
                        responseCode: 200,
                        responseMessage: "updated successfully",
                        responseResult: result,
                    });
                } else if (price) {
                    const result = await productModel.findByIdAndUpdate(
                        { _id: id },
                        {
                            $set: {
                                price: price,
                            },
                        },
                        { new: true }
                    );
                    return res.status(200).send({
                        responseCode: 200,
                        responseMessage: "updated successfully",
                        responseResult: result,
                    });
                }
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const admin = await userModel.findOne(
                { _id: req.userId },
                { userType: "admin" }
            );
            if (!admin) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "Admin not found." });
            }

            const id = req.params.id;
            if (!id) {
                return res.status(400).send({
                    responseCode: 400,
                    responseMessage: "id of the product is required.",
                });
            }
            await productModel.findByIdAndDelete({ _id: id });
            return res
                .status(200)
                .send({ responseCode: 200, responseMessage: "successfully deleted" });
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
};
