const staticModel = require("../model/staticModel");
module.exports = {
    //all static lists
    staticList: async (req, res) => {
        try {
            const result = await staticModel.find({});
            if (!result) {
                return res.status(404).send({ responseCode: 404, responseMessage: "Static content not found." });
            } else {
                return res.status(200).send({ responseCode: 200, responseMessage: "Success.", responseResult: result });
            }

        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong." });

        }
    },
    //specific static list with params
    viewStatic: async (req, res) => {
        try {
            const { type } = req.params;
            const content = await staticModel.findOne({ type: type });
            if (!type) {
                res.status(404).send({ responseCode: 404, responseMessage: "Content not found." })
            } else {
                return res.status(200).send({ responseCode: 200, responseMessage: "Success.", responseResult: content });
            }

        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },
    //edit static api
    editStatic: async (req, res) => {
        try {
            const { _id, type, description, title } = req.body;
            if (_id == '' || _id == undefined || _id == null) {
                return res.status(400).send({ responseCode: 400, responseMessage: "Id is required." });

            }
            const result = await staticModel.findOne({ $and: [{ _id: req.userId }, { userType: "admin." }] });
            if (!result) {
                return res.status(400).send({ responseCode: 400, responseMessage: "Admin not found." })
            } else {
                if (type || description || title) {
                    if (type) {
                        const result = await staticModel.findOneAndUpdate({ _id: _id }, { $set: { type: type } });
                        return res.status(200).send({ responseCode: 200, responseMessage: "Type has been changed.", responseResult: result });
                    } else if (description) {
                        const result = await staticModel.findOneAndUpdate({ _id: _id }, { $set: { description: description } });
                        return res.status(200).send({ responseCode: 200, responseMessage: "Description has been changed.", responseResult: result });
                    } else if (title) {
                        const result = await staticModel.findByIdAndUpdate({ _id: _id }, { $set: { title: title } });
                        return res.status(200).send({ responseCode: 200, responseMessage: "Title has been changed.", responseResult: result });
                    }
                }
            }

        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong." });
        }
    },

}