const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const model = require("../model/userModel");
module.exports = {
    otpGenerator: () => {
        const otp = Math.floor(1000000 + Math.random() * 9000000).toString();
        const expirationTime = new Date(Date.now() + 3 * 60 * 1000);
        return { otp, expirationTime };

    },
    sendMail: async (email, subject, html) => {
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
                html: html,
            };
            let send = await transporter.sendMail(mailOptions);
            return send;
        } catch (error) {
            return error;
        }

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
              jwt.verify(token, "Key", (err, result) => {
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
      
  
}