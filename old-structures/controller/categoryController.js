const categoryModel = require("../model/catagories");
const adminShopModel = require("../model/adminShope");
const userModel = require("../model/userModel")




module.exports = {
  createCategories: async (req, res) => {
    try {

      const { shopId, categories } = req.body;
      const admin = await userModel.findOne({ _id: req.userId, userType: "admin" });
      if (!admin) {
        return res.status(404).send("Admin not found.");
      };

      const category = adminShopModel.findOne({ _id: shopId });

      if (category) {

        if (categories) {

          const object = {
            categories: categories,
            shopId: shopId,
          };
          const result = await categoryModel.create(object);
          return res.status(200).send({
            responseCode: 200,
            responseMessage: "shope category created",
            responseResult: result,
          });
        } else {
          return res.status(400).send({
            responseCode: 400,
            responseMessage: "category name required",
          });
        }
      } else {
        return res.status(400).send({
          responseCode: 400,
          responseMessage: "shop category required",
        });
      }
    } catch (error) {
      return res
        .status(501)
        .send({ responseCode: 501, responseMessage: "Something went wrong." });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const admin = await userModel.findOne({ _id: req.userId, userType: 'admin' });
      if (!admin) {
        return res.status(404).send({ responseCode: 404, responseMessage: "Admin not found." });
      } else {
        const id = req.params.id;
        if (!id) {
          return res.status(400).send({ responseCode: 400, responseMessage: " id of the category is required." })
        }

        await categoryModel.findByIdAndDelete({ _id: id });
        return res.status(200).send({ responseCode: 200, responseMessage: "category Deleted successfully", });
      }

    } catch (error) {
      return res
        .status(501)
        .send({ responseCode: 501, responseMessage: "Something went wrong.  " });
    }
  },
  updateCategory: async (req, res) => {
    try {
      const admin = await userModel.findOne({ _id: req.userId, userType: 'admin' });
      if (!admin) {
        return res.status(404).send({ responseCode: 404, responseMessage: "Admin not found." });
      } else {
        const id = req.params.id;
        const categories = req.body;
        if (!id) {
          return res.status(400).send({ responseCode: 400, responseMessage: " id of the category is required." })
        }
        await categoryModel.findByIdAndUpdate({ _id: id }, { $set: { categories: categories } },{new:true});
        return res.status(200).send({ responseCode: 200, responseMessage: "category updated successfully", });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(501)
        .send({ responseCode: 501, responseMessage: "Something went wrong.  " });
    }
  },
  getCategory: async (req, res) => {
    try {
      const admin = await userModel.findOne({ _id: req.userId, userType: 'admin' });
      if (!admin) {
        return res.status(404).send({ responseCode: 404, responseMessage: "Admin not found." });
      } else {
        const id = req.params.id;
        if (!id) {
          return res.status(400).send({ responseCode: 400, responseMessage: " id of the category is required." })
        }

        const result = await categoryModel.findOne({ _id: id });
        return res.status(200).send({ responseCode: 200, responseMessage: " success", responseResult: result });
      }

    } catch (error) {
      console.log(error);
      return res
        .status(501)
        .send({ responseCode: 501, responseMessage: "Something went wrong." });
    }
  },
};
