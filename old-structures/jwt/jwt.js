const jwt = require("jsonwebtoken");
module.exports = {
    auth: (req, res, next) => {
       
        const token = req.headers['authorization'];
       
        if (!token) {
            return res.status(403).send("ACCESS DENIED!!!");
        }
        try {

            jwt.verify(token, "hiiamsecret", (err, result) => {
                if (err) {
                    res.status(500).send("Something Went Wrong ");
                } else {
                     
                    req.userId = result._id;
                }
            }

            )

        }
        catch (e) {
            return res.status(400).send("Bad Request")
        }

        next();
    }
} 