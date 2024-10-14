const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "Key";
const model = require('../model/adminShope');
const cloudinary = require("cloudinary").v2;


cloudinary.config({
    cloud_name: "df2ckvd8a",
    api_key: "395198921416824",
    api_secret: "-K7wMPMFG_W2XJH0EunJLbcSVTc",
});

module.exports = {

    adminLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userModel.findOne({ email: email });
            if (!email || !password) {
                if (!email) {
                    return res
                        .status(400)
                        .send({ responseCode: 400, responseMessage: "Email is required." });
                } else if (!password) {
                    return res
                        .status(400)
                        .send({
                            responseCode: 400,
                            responseMessage: "Password is required.",
                        });
                }
            } else {
                if (user) {
                    if (user.userType !== "admin") {
                        return res
                            .status(401)
                            .send({ responseCode: 401, responseMessage: "Unauthorized." });
                    } else {
                        const compare = await bcrypt.compare(password, user.password);
                        if (compare) {


                            const token = jwt.sign(
                                { _id: user._id, userType: user.userType },
                                secretKey,
                                {
                                    expiresIn: "24h",
                                }
                            );
                            return res.status(200).send({
                                responseCode: 200,
                                responseMessage: "Login successfully.",
                                token: token,
                            });
                        }


                        else {
                            return res.status(401).send({
                                responseCode: 401,
                                responseMessage: "Incorrect password.",
                            });
                        }
                    }
                } else {
                    return res
                        .status(404)
                        .send({ responseCode: 404, responseMessage: "Email not found." });
                }
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong. " });

        }
    },
    adminChangePassword: async (req, res) => {

        try {
            const { email, newPassword, confirmNewPassword } =
                req.body;

            if (!email || !newPassword || !confirmNewPassword) {
                if (!email) {
                    return res
                        .status(400)
                        .send({ responseCode: 400, responseMessage: "Email is required." });
                } else if (!confirmNewPassword) {
                    return res
                        .status(400)
                        .send({
                            responseCode: 400,
                            responseMessage: "Confirm new password is required.",
                        });
                }
                else if (!newPassword) {
                    return res
                        .status(400)
                        .send({
                            responseCode: 400,
                            responseMessage: "New password is required.",
                        });
                }
            }

            const user = await userModel.findOne({ $and: [{ email: email }, { userType: "admin" }] });
            if (!user) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "user not found." });
            }

            if (newPassword === confirmNewPassword) {
                let confirm = bcrypt.hashSync(confirmNewPassword, 10);
                await userModel.findOneAndUpdate(
                    { email: email },
                    { $set: { password: confirm } },
                    { new: true }
                );
                return res
                    .status(200)
                    .send({
                        responseCode: 200,
                        responseMessage: "password updated successfully.",
                    });
            } else {
                return res
                    .status(401)
                    .send({
                        responseCode: 401,
                        responseMessage: "password does not match.",
                    });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong. " });
        }
    },
    //forget password api
    adminForgotPassword: async (req, res) => {


        try {
            const { email, newPassword, confirmNewPassword } = req.body;

            if (!email || !newPassword || !confirmNewPassword) {
                if (!email) {
                    return res.status(400).send({ responseCode: 400, responseMessage: "email is required." });
                }
                else if (!newPassword) {
                    return res.status(400).send({ responseCode: 400, responseMessage: "New password is required." });
                } else if (!confirmNewPassword) {
                    return res.status(400).send({ responseCode: 400, responseMessage: "Confirm new password is required." });
                }

            }
            const user = await userModel.findOne({ _id: req.userId });

            if (!user) {
                return res.status(401).send({ responseCode: 401, responseMessage: "Unotherized." });
            }
            if (user.userType == "admin") {
                if (newPassword === confirmNewPassword) {
                    let pass = bcrypt.hashSync(confirmNewPassword, 10)
                    await userModel.findOneAndUpdate({ email: req.body.email }, { $set: { password: pass, isVarified: true } });
                    return res.status(200).send({ responseCode: 200, responseMessage: "password hass been changed." });
                } else {
                    return res
                        .status(400)
                        .send({ responseCode: 400, responseMessage: "password does not match." });
                }

            } else {
                return res.status(401).send({ responseCode: 400, responseMessage: "unotherized." });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }

    },
    createShop: async (req, res) => {
        try {
            const { lat, long, shopName, file } = req.body;
            if (!lat || !long || !shopName) {

                if (!lat) {
                    return res.status(400).send({ responseCode: 400, responseMessage: "Latitude is required." });
                } else if (!long) {
                    return res.status(400).send({ responseCode: 400, responseMessage: "Longitude is required." });
                } else if (!shopName) {
                    return res.status(400).send({ responseCode: 400, responseMessage: "Shop name  is required." });
                }
            }

            const admin = await userModel.findOne({ _id: req.userId, userType: 'admin' });
            if (!admin) {
                return res.status(404).send({ responseCode: 404, responseMessage: "Admin not found. " });
            } else {
                const upload = await cloudinary.uploader.upload(file);

                let obj = {
                    shopName: shopName,
                    location: {
                        coordinates: [parseFloat(long), parseFloat(lat)]
                    },
                    imageUrl: upload.url
                };
                const result = await model.create(obj);
                return res.status(200).send({ responseCode: 200, responseMessage: "Shop is successfully created.", responseResult: result })

            }
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong.  " });
        }
    },
    deleteShop: async (req, res) => {
        try {
            const admin = await userModel.findOne({ _id: req.userId, userType: 'admin' });
            if (!admin) {
                return res.status(404).send({ responseCode: 404, responseMessage: "Admin not found." });
            } else {
                const id = req.params.id;
                if (!id) {
                    return res.status(400).send({ responseCode: 400, responseMessage: " id of the shop is required." })
                }
                await model.findByIdAndDelete({ _id: id });
                return res.status(200).send({ responseCode: 200, responseMessage: "Deleted successfully" });
            }

        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong.  " });
        }
    },
    updateShop: async (req, res) => {
        try {
            const admin = await userModel.findOne({ _id: req.userId, userType: 'admin' });
            if (!admin) {
                return res.status(404).send({ responseCode: 404, responseMessage: "Admin not found." });
            } else {
                const id = req.params.id;
                const file = req.body.file
                const upload = await cloudinary.uploader.upload(file);
                if (!id) {
                    return res.status(400).send({ responseCode: 400, responseMessage: " id of the shop is required." })
                }
                if (id || file) {
                    if (id) {
                        const result = await model.findByIdAndUpdate({ _id: id }, { $set: { shopName: req.body.shopName } }, { new: true });
                        return res.status(200).send({ responseCode: 200, responseMessage: "updated successfully", responseResult: result });
                    }
                    else if (file) {
                        const result = await model.findByIdAndUpdate({ _id: id }, { $set: { imageUrl: upload.secure_url } }, { new: true });
                        return res.status(200).send({ responseCode: 200, responseMessage: "updated successfully", responseResult: result });

                    }
                }




            }

        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong.  " });
        }
    },
    getShop: async (req, res) => {
        try {
            const admin = await userModel.findOne({ _id: req.userId, userType: 'admin' });
            if (!admin) {
                return res.status(404).send({ responseCode: 404, responseMessage: "Admin not found." });
            } else {
                const id = req.params.id;
                if (!id) {
                    return res.status(400).send({ responseCode: 400, responseMessage: " id of the shop is required." });
                }
                const result = await model.findOne({ _id: id });
                return res.status(200).send({ responseCode: 200, responseMessage: "success", responseResult: result });
            }

        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },



}
