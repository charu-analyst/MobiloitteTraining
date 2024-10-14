import { mongoose, Schema } from "mongoose"
const hospitals = new Schema({
    hospitalName: {
        type: String,
    },
    location: {
        type: {
            type: String,
            default: "point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }

    },
    hospitalImage:{
        type:String
    },

})
module.exports=mongoose.model("hospital", hospitals);