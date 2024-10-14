const userModel = require("../model/userModel");
const commonFunction = require("../commonFunction/common");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "Key";
const productModel = require("../model/product");
const shopModel = require("../model/adminShope");

module.exports = {
    //signup api
    signUp: async (req, res) => {
        try {
            const requiredFields = [
                "firstName",
                "lastName",
                "dateOfBirth",
                "mobileNumber",
                "email",
                "password",
                "address",
            ];
            const missingFields = [];
            const body = req.body;
            requiredFields.forEach((field) => {
                if (!body[field]) {
                    missingFields.push(field);
                }
            });
            if (missingFields.length > 0) {
                const err = missingFields.map((fields) => `${fields} is required`);
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: err });
            } else {
                const user = await userModel.findOne({
                    email: req.body.email,
                    status: { $ne: "delete" },
                    userType: "user",
                });

                if (user) {
                    //if user
                    if (user.status == "blocked") {
                        return res.status(403).send({
                            responseCode: 403,
                            responseMessage: "Sorry, You are blocked by admin.",
                        });
                    } else {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMessage: "You are already a user.",
                        });
                    }
                } else if (!user) {
                    //if not user

                    const {
                        firstName,
                        lastName,
                        dateOfBirth,
                        mobileNumber,
                        email,
                        password,
                        address,
                    } = req.body;
                    //otp
                    let { otp, expirationTime } = commonFunction.otpGenerator();
                    //mail
                    const link = `http://localhost:8000/api/linkVerification/${email}`;
                    await commonFunction.sendMail(
                        email,
                        "Otp verification",

                        `<a href="${link}">Verify Email. </a>  your otp ${otp}`
                    );
                    //hassing password
                    const pass = bcrypt.hashSync(password, 10);
                    const number = mobileNumber.toString().slice(-4);
                    const userName = firstName + number;

                    let obj = {
                        email: email,
                        password: pass,
                        dateOfBirth: dateOfBirth,
                        mobileNumber: mobileNumber,
                        firstName: firstName,
                        lastName: lastName,
                        address: address,
                        userName: userName,
                        otp: otp,
                        expirationTime: expirationTime,
                    };
                    const result = await userModel.create(obj);
                    return res.status(200).send({
                        responseCode: 200,
                        responseMessage: "Please verify your account.",
                        responseResult: result,
                    });
                } else {
                    return res.status(500).send({
                        responseCode: 500,
                        responseMessage: "Internal server error.",
                    });
                }
            }
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //otp verification api
    otpVerification: async (req, res) => {
        try {
            const { email, otp } = req.body;
            if (!otp || !email) {
                if (!otp) {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "OTP is  required.",
                    });
                } else if (!email) {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: " Email is required.",
                    });
                }
            }

            const user = await userModel.findOne({ email: email });
            if (user) {
                if (user.isVarified == true) {
                    return res
                        .status(200)
                        .send({ responseCode: 200, responseMessage: "Already verified." });
                }
                if (otp === user.otp) {
                    const time = Date.now();
                    if (user.expirationTime < time) {
                        return res.status(400).send({
                            responseCode: 400,
                            responseMessage: "OTP has been expired.",
                        });
                    } else {
                        await userModel.updateOne(
                            { _id: user._id },
                            {
                                $set: { isVarified: true, otp: "" },
                            }
                        );
                        return res
                            .status(200)
                            .send({ responseCode: 200, responseMessage: "Verified" });
                    }
                } else {
                    return res
                        .status(400)
                        .send({ responseCode: 400, responseMessage: "Invalid OTP." });
                }
            } else {
                return res.status(404).send({
                    responseCode: 404,
                    responseMesssage: "User does not exist.",
                });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //resend otp api
    reSendOtp: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: "Email required." });
            }
            const user = await userModel.findOne({ email: email });
            const { otp, expirationTime } = commonFunction.otpGenerator();
            if (!user) {
                return res.status(404).send({
                    responseCode: 404,
                    responseMessage: "Email does not exists.",
                });
            } else {
                await commonFunction.sendMail(
                    req.body.email,
                    "OTP verification",
                    `your otp is ${otp}`
                );
                await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { otp: otp, expirationTime: expirationTime } }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "OTP has been successfully sent to your email.",
                });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //link verification
    linkVerification: async (req, res) => {
        try {
            const email = req.params.email;
            console.log(email);
            if (!email) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "User not found." });
            }
            if (email.isVerifiedEmail == true) {
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Email already verified.",
                });
            } else {
                await userModel.updateOne(
                    { email: email },
                    { $set: { isVerifiedEmail: true } }
                );
                return res
                    .status(200)
                    .send({ responseCode: 200, responseMessage: "Email verified." });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //login api
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userModel.findOne({ email: req.body.email });
            if (!email || !password) {
                if (!email) {
                    return res
                        .status(400)
                        .send({ responseCode: 400, responseMessage: "Email is required." });
                } else if (!password) {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "Password is required.",
                    });
                }
            } else {
                if (user) {
                    if (user.status == "blocked" || user.status == "deleted") {
                        return res
                            .status(401)
                            .send({ responseCode: 401, responseMessage: "Unauthorized" });
                    } else {
                        const compare = await bcrypt.compare(password, user.password);
                        if (compare) {
                            if (user.isVarified === true) {
                                if (user.isVerifiedEmail === true) {
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
                                } else {
                                    return res.status(400).send({
                                        responseCode: 400,
                                        responseMessage:
                                            "Email is not verified please verify email.",
                                    });
                                }
                            } else {
                                return res.status(403).send({
                                    responseCode: 403,
                                    responseMessage: "Please verify your account.",
                                });
                            }
                        } else {
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
    // reset password api
    reSetPassword: async (req, res) => {
        try {
            const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

            if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
                if (!email) {
                    return res
                        .status(400)
                        .send({ responseCode: 400, responseMessage: "email is required" });
                } else if (!oldPassword) {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "old password is required",
                    });
                } else if (!confirmNewPassword) {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "confirm new password is required",
                    });
                } else if (!newPassword) {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "new password is required",
                    });
                }
            }

            const user = await userModel.findOne({ email: email });
            if (!user) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "user not found" });
            }
            if (user.isVarified === true) {
                const compare = await bcrypt.compare(oldPassword, user.password);
                if (compare) {
                    if (newPassword === confirmNewPassword) {
                        let confirm = bcrypt.hashSync(confirmNewPassword, 10);
                        await userModel.findOneAndUpdate(
                            { email: email },
                            { $set: { password: confirm } },
                            { new: true }
                        );
                        return res.status(200).send({
                            responseCode: 200,
                            responseMessage: "password updated successfully",
                        });
                    } else {
                        return res.status(401).send({
                            responseCode: 401,
                            responseMessage: "password does not match",
                        });
                    }
                } else {
                    return res.status(401).send({
                        responseCode: 401,
                        responseMessage: "password does not matched",
                    });
                }
            } else {
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: "otp not verified" });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong " });
        }
    },
    //forget password api step-1
    forgetPassword: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: "email is required" });
            }
            const user = await userModel.findOne({ email: req.body.email });

            if (!user) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "user not found" });
            }

            const { otp, expirationTime } = commonFunction.otpGenerator();
            await commonFunction.sendMail(
                req.body.email,
                "forget password otp",
                `your otp is ${otp}`
            );

            await userModel.findOneAndUpdate(
                { email: email },
                {
                    $set: { otp: otp, isVarified: false, expirationTime: expirationTime },
                }
            );

            return res.status(200).send({
                responseCode: 200,
                responseMessage:
                    "otp has been sent to your registerd email please verify otp to reset password ",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong " });
        }
    },
    //forget password api step-2
    changePassword: async (req, res) => {
        try {
            const { otp, newPassword, confirmNewPassword, email } = req.body;
            const user = await userModel.findOne({ email: email });
            if (!user) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "user not found" });
            }
            if (otp === user.otp) {
                const time = Date.now();
                if (user.expirationTime < time) {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "OTP has been expired.",
                    });
                }
                if (newPassword === confirmNewPassword) {
                    let pass = bcrypt.hashSync(confirmNewPassword, 10);
                    await userModel.findOneAndUpdate(
                        { email: req.body.email },
                        { $set: { password: pass, isVarified: true } }
                    );
                    return res.status(200).send({
                        responseCode: 200,
                        responseMessage: "password hass been changed",
                    });
                } else {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "password does not match",
                    });
                }
            } else {
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: "Invalid otp" });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong " });
        }
    },
    //edit profile
    editProfile: async (req, res) => {
        try {
            const user = await userModel.findOne(
                { _id: req.userId },
                { status: "active" },
                { userType: "user" }
            );
            if (!user) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "User not found." });
            }
            let { email, mobileNumber, userName, password } = req.body;

            if (email && mobileNumber && userName) {
                //if all the three fields
                result = await userModel.findOne({
                    $and: [
                        {
                            $or: [
                                { email: email },
                                { mobileNumber: mobileNumber },
                                { userName: userName },
                            ],
                        },
                        { _id: { $ne: req.userId } },
                    ],
                });
                if (result) {
                    if (result.email === email) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "Email is already in use. ",
                        });
                    } else if (result.mobileNumber === mobileNumber) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "Mobile number  is already in use.",
                        });
                    } else if (result.userName === userName) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage:
                                "User Name has already been taken please try another one.",
                        });
                    }
                }
                await commonFunction.sendMail(
                    user.email,
                    "Your email has been changed."
                );

                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    {
                        $set: {
                            email: req.body.email,
                            mobileNumber: mobileNumber,
                            userName: userName,
                        },
                    },
                    { new: true }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage:
                        "Email, mobile number and user name has been changed. ",
                    responseResult: ress,
                });
            } else if (!email && mobileNumber && userName) {
                //mobileNumber and userNamme
                const result = await userModel.findOne({
                    $and: [
                        { $or: [{ mobileNumber: mobileNumber }, { userName: userName }] },
                        { _id: { $ne: req.userId } },
                    ],
                });

                if (result) {
                    if (result.mobileNumber) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "Mobile number  is already in use. ",
                        });
                    } else if (result.userName) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage:
                                "User name has already been taken please try another one.   ",
                        });
                    }
                }

                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { mobileNumber: mobileNumber, userName: userName } },
                    { new: true }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: " Mobile number and user name has been changed .",
                    responseResult: ress,
                });
            } else if (email && !mobileNumber && userName) {
                const result = await userModel.findOne({
                    $and: [
                        { $or: [{ email: email }, { userName: userName }] },
                        { _id: { $ne: req.userId } },
                    ],
                });

                if (result) {
                    if (result.email) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "Email is already in use. ",
                        });
                    } else if (result.userName) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage:
                                "User name has already been taken please try another one.   ",
                        });
                    }
                }
                await commonFunction.sendMail(
                    user.email,
                    "Your email has been changed."
                );
                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { email: email, userName: userName } },
                    { new: true }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: " Email and user name has been changed ",
                    responseResult: ress,
                });
            } else if (email && mobileNumber && !userName) {
                const result = await userModel.findOne({
                    $and: [
                        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
                        { _id: { $ne: req.userId } },
                    ],
                });

                if (result) {
                    if (result.email) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "Email is already in use. ",
                        });
                    } else if (result.mobileNumber) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "Mobile number is already in use. ",
                        });
                    }
                }
                await commonFunction.sendMail(
                    user.email,
                    "Your email has been changed."
                );
                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { email: email, mobileNumber: mobileNumber } },
                    { new: true }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: " Email and mobile number  has been changed. ",
                    responseResult: ress,
                });
            } else if (!email && !mobileNumber && userName) {
                const result = await userModel.findOne({
                    $and: [{ userName: userName }, { _id: { $ne: req.userId } }],
                });
                if (result) {
                    return res.status(409).send({
                        responseCode: 409,
                        responseMesssage:
                            "User name has already been taken please try another one. ",
                    });
                }
                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { userName: userName } }
                );
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: " User name has been changed.",
                    responseResult: ress,
                });
            } else if (!email && mobileNumber && !userName) {
                const result = await userModel.findOne({
                    $and: [{ mobileNumber: mobileNumber }, { _id: { $ne: req.userId } }],
                });
                if (result) {
                    return res.status(409).send({
                        responseCode: 409,
                        responseMesssage: "Mobile number is already in use. ",
                    });
                }
                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { mobileNumber: mobileNumber } }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: " Mobile number has been changed.",
                    responseResult: ress,
                });
            } else if (email && !mobileNumber && !userName) {
                const result = await userModel.findOne({
                    $and: [{ email: email }, { _id: { $ne: req.userId } }],
                });
                if (result) {
                    return res.status(409).send({
                        responseCode: 409,
                        responseMesssage: "Email is already in use. ",
                    });
                }
                await commonFunction.sendMail(
                    user.email,
                    "Your email has been changed."
                );
                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { email: email } }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Email has been changed.",
                    responseResult: ress,
                });
            } else if (password) {
                const { newPassword, confirmPassword } = req.body;
                const compareOld = bcrypt.compareSync(password, user.password);
                if (compareOld) {
                    if (newPassword === confirmPassword) {
                        let pass = bcrypt.hashSync(confirmPassword, 10);
                        await userModel.findByIdAndUpdate(
                            { _id: user._id },
                            { $set: { password: pass } }
                        );
                        res.status(200).send({
                            responseCode: 200,
                            responseMessage: "Password updated successfully.",
                        });
                    } else {
                        return res.status(401).send({
                            responseCode: 401,
                            responseMessage: "New password does not matched.",
                        });
                    }
                } else {
                    return res.status(401).send({
                        responseCode: 401,
                        responseMessage: "Password does not matched.",
                    });
                }
            } else {
                const ress = await userModel.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: req.body },
                    { new: true }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Updated successfully.",
                    responseResult: ress,
                });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //Get all user.
    getAllUser: async (req, res) => {
        try {
            const users = await userModel.find(
                { userType: "user" },
                { password: 0, otp: 0, expirationTime: 0 }
            );
            return res.status(200).send({
                responseCode: 200,
                responseMessage: "success",
                responseResult: users,
            });
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //view user api
    viewUser: async (req, res) => {
        try {
            const _id = req.query;
            if (!_id) {
                return res
                    .status(400)
                    .send({ responseCode: 404, responseMessage: "User not found." });
            }
            const result = await userModel.findOne({ _id: _id }, { password: 0 });
            return res.status(200).send({
                responseCode: 200,
                responseMessage: "Success",
                responseResult: result,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //user's shop list with populate.
    ProductList: async (req, res) => {
        try {
            const result = await productModel.find({}, { _id: 0 }).populate({
                path: "categoriesId",

                select: "-createdAt -updatedAt",
                populate: {
                    path: "shopId",
                    select: "-createdAt -updatedAt",
                },
            });
            // .select("-createdAt -updatedAt");
            if (!result) {
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "There is no data in the database.",
                });
            }
            return res.status(200).send({
                responseCode: 200,
                responseMessage: "success",
                responseResult: result,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //user's shop list with aggrigate and use of $project and $lookup
    productListAggr: async (req, res) => {
        try {
            const product = await productModel.aggregate([
                { $lookup: { from: "shopCategories", localField: "categoriesId", foreignField: "_id", as: "categoriesIdDetails" } },
                { $project: { createdAt: 0, updatedAt: 0 } },
            ]);
            return res
                .status(200)
                .send({
                    responseCode: 200,
                    responseMessage: "success",
                    responseResult: product,
                });
        } catch (error) {
            console.log(error);
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
       
    },
    geonear : async (req,res)=>{
        try {
            const {lat,long,maxDistance}=req.body;
          const result =  await productModel.aggregate([{
                $geoNear:{
                   near:{ type: "point",coordinates:[parseFloat(long),parseFloat(lat)]},
                  // key:"location",
                   distanceField:"distance",
                   maxDistance:5000,
                   spherical:true,
                }
            }])
            res.send(result)
        } catch (error) {
            console.log(error);
        }
    }
};
