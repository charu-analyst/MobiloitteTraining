const model = require("../model/schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretkey = "key";
const commonfunction = require("../commonfunctions/commonfunction");
const cloudinary = require("cloudinary").v2;
const qr = require("qrcode");
const speakeasy = require("speakeasy");

cloudinary.config({
    cloud_name: "df2ckvd8a",
    api_key: "395198921416824",
    api_secret: "-K7wMPMFG_W2XJH0EunJLbcSVTc",
});

module.exports = {
    //signup api>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    signup: async (req, res) => {
        try {
            const { firstName, lastName, age, number, email, password } = req.body;
            const validateFields = commonfunction.signupValidation(req.body);
            if (validateFields.length > 0) {
                const err = validateFields.map((fields) => `${fields} is required`);
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: err });
            } else {
                const user = await model.findOne({
                    email: email,
                    status: { $ne: "delete" },
                    userType: "user",
                });
                if (user) {
                    if (user.status == "blocked") {
                        return res.status(403).send({
                            responseCode: 403,
                            responseMessage: "Sorry, You are blocked by admin",
                        });
                    } else {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMessage: "you are already a user",
                        });
                    }
                } else if (!user) {
                    //otp
                    let {otp,expirationTime} = commonfunction.otpGenerator();

                    //nodemailer sending otp
                    await commonfunction.sendMail(
                        req.body.email,
                        "Otp verification",
                        `your otp is ${otp}`
                    );
                    //hassing passsword
                    const pass = bcrypt.hashSync(password, 10);
                    let obj = {
                        email: email,
                        password: pass,
                        age: age,
                        number: number,
                        firstName: firstName,
                        lastName: lastName,
                        otp: otp,
                        expirationTime,expirationTime
                    };
                    const result = await model.create(obj);
                    return res.status(200).send({
                        responseCode: 200,
                        responseMessage: "Please verify your account",
                        result: result,
                    });
                } else {
                    return res.status(500).send({
                        responseCode: 500,
                        responseMessage: "Internal Server error",
                    });
                }
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //otp verification api >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    otpVerification: async (req, res) => {
        try {
            const user = await model.findOne({ email: req.body.email });
            if (user) {
              
                if (req.body.otp === user.otp) {
                    const time= Date.now(); 
                    if(user.expirationTime>time){ 
                        res.status(400).send({responseCode:400,responseMessage:"otp has been expired"})
                    }
                    else{ 
                        await model.updateOne(

                            { _id: user._id },
                            { $set: { isVarified: true }, $unset: { otp: 1 } }
                        );
                        return res
                            .status(200)
                            .send({ responseCode: 200, responseMessage: "Verified" });
                    }
                  

                   
                } else {
                    return res
                        .status(400)
                        .send({ responseCode: 400, responseMessage: "Invalid otp" });
                }
            } else {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMesssage: "User does not exist" });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    reSendOtp: async(req,res)=>{
        try {
            const user = await model.findOne({email:req.body.email})
            const {otp, expirationTime}=commonfunction.otpGenerator()
            if(!user){
                res.status(404).send({responseCode:404,responseMessage:"email does not exists"})
            }
            else{
                await commonfunction.sendMail(
                    req.body.email,
                    "Otp verification",
                    `your otp is ${otp}`
                );
                await model.findByIdAndUpdate({_id:user._id},{$set:{otp:otp, expirationTime: expirationTime}});
                res.status(200).send({ responseCode:200,responseMessage:"otp has been successfully sent to your email"})


            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //login api with generating  jwt token >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await model.findOne({ email: req.body.email });
            if (
                email == undefined ||
                email == null ||
                email == "" && password == "" ||
                password == undefined ||
                password == null
            ) {
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: "Field is required" });
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
                                const token = jwt.sign({ _id: user._id }, secretkey, {
                                    expiresIn: "24h",
                                });

                                return res.status(200).send({
                                    responseCode: 200,
                                    responseMessage: "Login successful",
                                    token: token,
                                });
                            } else {
                                return res.status(403).send({
                                    responseCode: 403,
                                    responseMessage: "Please verify your account",
                                });
                            }
                        } else {
                            return res.status(400).send({
                                responseCode: 400,
                                responseMessage: "Incorrect password ",
                            });
                        }
                    }
                } else {
                    return res
                        .status(404)
                        .send({ responseCode: 404, responseMessage: "Email not found" });
                }
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong " });
        }
    },
    //geting all info. of user with jwt token except password>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    getUser: async (req, res) => {
        try {
            const user = await model.findOne({ _id: req.userId });
            if (!user) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "User not found" });
            }

            return res
                .status(200)
                .send({ responseCode: 200, responseMessage: "Success", result: user });
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //updating data of the user(fname,lname)>>>>>>>>>>>>>>>>>>>(edit profile)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    updateUser: async (req, res) => {
        try {
            const { firstName, lastName } = req.body;

            if (firstName && lastName) {
                if (firstName == "" && lastName == "") {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "First-Name and Last-Name Field can't be empty",
                    });
                }
                const user = await model
                    .findByIdAndUpdate(
                        { _id: req.userId },
                        {
                            $set: {
                                firstName: firstName,
                                lastName: lastName,
                            },
                        },
                        { new: true }
                    )
                    .select({ password: 0 });

                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Success",
                    result: user,
                });
            } else if (firstName && !lastName) {
                if (lastName == "") {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: " Last-Name Field can't be empty",
                    });
                }
                const user = await model
                    .findByIdAndUpdate(
                        { _id: req.userId },
                        { firstName: firstName },
                        { new: true }
                    )
                    .select({ password: 0 });

                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Success",
                    result: user,
                });
            } else if (!firstName && lastName) {
                if (firstName == "") {
                    return res.status(400).send({
                        responseCode: 400,
                        responseMessage: "First-Name field can't be empty",
                    });
                }
                const user = await model
                    .findByIdAndUpdate(
                        { _id: req.userId },
                        { lastName: lastName },
                        { new: true }
                    )
                    .select({ password: 0 });

                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "success",
                    result: user,
                });
            } else {
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: "Field is required" });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    }, //updating email phone number of user>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    editUser: async (req, res) => {
        try {

            let result
            const user = await model.findOne(
                { _id: req.userId },
                { status: "active" },
                { userType: "user" }
            );
            const link = `http://localhost:8000/api/emailVerification/${user._id}`
            if (!user) {
                return res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "user not found" });
            }
            let { email, number } = req.body; //if user gives both the field to update

            if (email && number) {

                result = await model.findOne({
                    $and: [
                        { $or: [{ email: email }, { number: number }] },
                        { _id: { $ne: req.userId } },
                    ],
                });
                if (result) {
                    if (result.email === email) {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "email is already is use ",
                        });
                    } else {
                        return res.status(409).send({
                            responseCode: 409,
                            responseMesssage: "number is already is use ",
                        });
                    }
                }                                 //sending verification link
                await commonfunction.sendMail(
                    req.body.email,
                    "Email verification",
                    `Welcome. Please click on the link to verify your account.`,
                    `<a href="${link}">Verify Email. </a>`

                )

                await model.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { email: req.body.email, number: req.body.number } },
                    { new: true }
                );


                return res
                    .status(200)
                    .send({
                        responseCode: 200,
                        responseMesssage: "please verify your email",

                    });
            } else if (email && !number) {                     //if only email is given to update

                result = await model.findOne({
                    $and: [
                        { email: req.body.email },
                        { _id: { $ne: user._id } },
                        { status: { $ne: "delete" } },
                    ],
                });

                if (result) {
                    return res.status(409).send({
                        responseCode: 409,
                        responseMessage: "email is already in use ",
                    });
                }


                await commonfunction.sendMail(
                    req.body.email,
                    "Email verification",
                    `Welcome. Please click on the link to verify your account.`,
                    `<a href="${link}">Verify Email. </a>`

                )

                await model.findByIdAndUpdate(
                    { _id: user._id }, { $set: req.body }, { new: true });
                console.log(req.body);

                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "updated successfully",

                });                 //  if only number is  given to update
            } else if (!email && number) {
                result = await model.findOne({
                    $and: [
                        { number: req.body.number },
                        { _id: { $ne: user._id } },
                        { status: { $ne: "delete" } },
                    ],
                });
                if (result) {
                    return res.status(409).send({
                        responseCode: 409,
                        responseMessage: "number is already in use ",
                    });
                }

                await model.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: req.body },
                    { new: true }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "updated successfully",

                });
            } else {
                await model.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: req.body },
                    { new: true }
                );
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "updated successfully",

                });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //verifying email when updating email>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    emailVerification: async (req, res) => {
        const user = req.params._id
        if (!user) {
            return res.status(400).send({ responseCode: 400, responseMessage: "sorry , we are unable to find you" })
        }
        else {
            return res.status(200).send({ responseCode: 200, responseMessage: "The email has been verified." });


        }
    },
    //pagination>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    pagination: (req, res) => {
        const { page, limit } = req.query;
        if (page == 0 || limit == 0) {
            return res.status(400).send({
                responseCode: 400,
                responseMessage: "can't get page or limit",
            });
        }
        const options = {
            page: page || 1,
            limit: limit || 3,
        }
        model
            .paginate({}, options)
            .then((result) => {
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "success",
                    result: result,
                });
            })
            .catch((error) => {
                return res
                    .status(501)
                    .send({ responseCode: 501, responseMessage: "Something went wrong" });
            });
    }, //file upload>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    fileUpload: async (req, res) => {
        try {
            const photoData = req.body.photoData;

            cloudinary.uploader.upload(
                photoData,
                { resource_type: "auto" },
                (err, result) => {
                    if (err) {
                        return res.status(500).send({
                            responseCode: 500,
                            responseMessage: "Error while uploading file",
                        });
                    } else {
                        return res.status(200).send({
                            responseCode: 200,
                            responseMessage: "Successfull",
                            result: result.url,
                        });
                    }
                }
            );
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //updating profile photo>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    updateProfilePhoto: async (req, res) => {
        try {
            const user = await model.findOne({ _id: req.userId });
            if (user) {
                const file = req.files.photo;
                cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
                    if (err) {
                        return res.status(500).send({
                            responseCode: 500,
                            responseMessage: "Error while uploading profile photo",
                        });
                    } else {
                        const imgUrl = result.url;
                        await model.updateOne({ _id: user._id }, { url: imgUrl });
                        return res.status(200).send({
                            responseCode: 200,
                            responseMessage: "Successfull",
                            result: imgUrl,
                        });
                    }
                });
            } else {
                res
                    .status(404)
                    .send({ responseCode: 404, responseMessage: "user not found" });
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //qr code generation>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    qrCode: async (req, res) => {
        try {
            const qrcode = req.body.data;
            if (!qrcode) {
                return res
                    .status(400)
                    .send({ responseCode: 400, responseMessage: "field is missing" });
            }

            qr.toDataURL(qrcode, { type: "terminal" }, (err, url) => {
                if (err) {
                    return res.status(500).send({
                        responseCode: 500,
                        responseMessage: "QR  code generation failed",
                    });
                } else {
                    console.log(url);
                    // return res.status(200).send({responseCode:200, responseMessage:"Qr code generated successfully", result:`<img src="${url}" alt="QRcode`})
                }
            });
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //two factor authentication>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    twoFactorAuth: async (req, res) => {
        try {
            var secret = speakeasy.generateSecret();
            console.log(secret);
            qr.toDataURL(secret.otpauth_url, function (err, data_url) {
                if (err) {
                    return res.status(500).send({ responseCode: 500, responseMessage: 'Failed to generate QR code' })
                }
                else {
                    return res.status(200).send({ responseCode: 200, responseMessage: "successs", result: data_url, secret: secret.base32 });
                }
            });
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //verifying 2fa>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    verify2Fa: async (req, res) => {
        try {
            const { secret, code } = req.body
            var verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: code
            });
            if (verified) {
                return res.status(200).send({ responseCode: 200, responseMessage: "verified" })
            }
            else {
                return res.status(401).send({ responseCode: 401, responseMessage: "invalid" })
            }
        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    //pagination and aggrigation>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    aggrigatePaginate: async (req, res) => {
        try {
            const { page, limit } = req.query;
            if (page == 0 || limit == 0) {
                return res.status(400).send({
                    responseCode: 400,
                    responseMessage: "can't get page or limit",
                });
            }
            const options = {
                page: page || 1,
                limit: limit || 3,
            };
            let aggregate = model.aggregate();
            aggregate.match({ age: { $lte: 20 } })
            

            model.aggregatePaginate(aggregate, options, (err, result) => {
                if (err) {
                    return res.status(500).send({ responseCode: 500, responseMessage: 'internal server error' })
                }
                else {
                    return res.status(200).send({ responseCode: 200, responseMessage: "successs", result: result });
                }
            })

        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    },
    // userListwith specific keys >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    userList: async (req, res) => {
        try {
            const user = await model.findOne({ _id: req.query.id }).select('firstName lastName email number _id userType');


            if (!user) {
                res.status(404).send({ responseCode: 404, responseMessage: "user not found" })
            }
            res.status(200).send({ responseCode: 200, responseMessage: "success", result: user })

        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong" });
        }
    }, // all userListwith specific keys >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    allUserList: async (req, res) => {
        try {
            const user = await model.find({}).select('firstName lastName email number _id userType.');


            if (!user) {
                res.status(404).send({ responseCode: 404, responseMessage: "user not found." })
            }
            res.status(200).send({ responseCode: 200, responseMessage: "success", result: user })

        } catch (error) {
            return res
                .status(501)
                .send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    
    
    },
     //scheduling a job through cron job (verifying otp on  12pm )
  cronJob: async (req, res) => { 
    try {
      const user = await model.findOne({ email: req.body.email });
      if (user) {
        if (req.body.otp === user.otp) {
          const time = Date.now();
          if (user.expirationTime < time) {

            return res.status(400).send({
              responseCode: 400,
              responseMessage: "otp has been expired.",
            });
          }
          else {
            res
              .status(200)
              .send({ responseCode: 200, responseMessage: "thankyou, your task has been scheduled ." });

            var task = cron.schedule(
              ' 0 12 * * *',
              async () => {
                await model.updateOne(
                  { _id: user._id },
                  { $set: { isVarified: true }, $unset: { otp: 1 } }
                );
              },
              {
                scheduled: true, //bydefault true....
                timezone: "Asia/Kolkata",
              }
            );



          }

        } else {
          return res
            .status(400)
            .send({ responseCode: 400, responseMessage: "Invalid otp" });
        }
      } else {
        return res
          .status(404)
          .send({ responseCode: 404, responseMesssage: "User does not exist" });
      }
    } catch (error) {
      return res
        .status(501)
        .send({ responseCode: 501, responseMessage: "Something went wrong" });
    }
    //>>>>>>>>>>>>>>>>>>>>>>>>cronjob>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // try {
    //   const task = cron.schedule(
    //     "0 12 * * *",
    //     () => {
    //       console.log("running a task every two minutes");
    //     },
    //     {
    //       scheduled:true, //bydefault true....
    //       timezone: "Asia/Kolkata",
    //     }
    //   );
    //   task.stop();

    // } catch (error) {
    //     return res
    //     .status(501)
    //     .send({ responseCode: 501, responseMessage: "Something went wrong" });
    // }
  },


};