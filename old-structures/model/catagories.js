
const mongoose = require("mongoose");

const categories = new mongoose.Schema({
    shopId: {
        type: mongoose.Types.ObjectId,
        ref: "adminShopes",
    },
categories:{
    type:String,
    required:true
},

},
{timestamps:true}
);
module.exports = mongoose.model("shopCategories", categories);