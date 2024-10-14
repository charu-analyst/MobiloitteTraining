const { Schema, model } = require("mongoose");
const shop = Schema({
    shopName: {
        type: String,
    },
 location:{
coordinates:[]
 },
    imageUrl:{
        type:String
    },


},
    { timestamps: true })
module.exports = model("adminShopes", shop);