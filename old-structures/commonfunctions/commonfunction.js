const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const model = require("../model/schema");
const cloudinary = require("cloudinary").v2;
module.exports = {
  //nodemailer sending otp
  sendMail: async (email, subject, text,html) => {
    try {
      var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "abhijeet.rai@indicchain.com",
          pass: "dygclgzqcdiqqime",
        },
      });

      var mailOptions = {
        from: "abhijeet.rai@indicchain.com",
        to: email,
        subject: subject,
        text: text,
        html:html
      };
      let send = await transporter.sendMail(mailOptions);
      return send;
    } catch (error) {
      return error;
    }
  },

  otpGenerator: () => {
    const otp= Math.floor(1000000 + Math.random() * 9000000).toString();
    const expirationTime = new Date(Date.now()+5 * 60 * 1000);
    return { otp, expirationTime };

  },

  auth: async (req, res, next) => {
    try {
      const token = req.headers["authorization"];

      if (!token) {
        return res
          .status(403)
          .send({ responseCode: 403, responseMessage: "Access denied!!!" });
      } else {
        const result = await model.find(
          { _id: token._id },
          { status: "active" }
        );

        if (result) {
          jwt.verify(token, "key", (err, result) => {
            if (err) {
              return res
                .status(400)
                .send({ responseCode: 400, responseMessage: "Bad request" });
            } else {
              req.userId = result._id;
              return next();
            }
          });
        } else {
          return res
            .status(403)
            .send({ responseCode: 403, responseMessage: "Unauthorized" });
        }
      }
    } catch (error) {
      return res
        .status(500)
        .send({ responseCode: 500, responseMessage: "Something went wrong" });
    }
  },
  signupValidation: (body)=>{
const requiredFields = ["firstName","lastName","age","number","email","password"];
const missingFields = [];

requiredFields.forEach(fields=>{
    if(!body[fields]){
        missingFields.push(fields);
    }
    return missingFields;
    
});
return missingFields;

  },
};
