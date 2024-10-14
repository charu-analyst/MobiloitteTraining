const mongoose = require("mongoose");

const products = new mongoose.Schema({
    productName:{
        type:String,
        required: true,
    },
    productPrice:{
        type:String,
    },
    productImage:{
        type:String,
    },
    categoriesId:{
       type: mongoose.Types.ObjectId,
       ref: "shopCategories",
    } 
},
{timestamps:true}
);
module.exports = mongoose.model("products",products);