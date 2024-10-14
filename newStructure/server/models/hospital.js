import { model, Schema } from "mongoose";



const hospital = new Schema({
    hospitalName: {
        type: String
    },
    hospitalImage: {
        type: String,
    },
    location: {
        type: {
            type: String,
            default: "point"
        },
        coordinates:{
            type:[Number],
            default:[0,0]
        }
        
     
    }
},{timestamps:true});
module.exports=model("hospital",hospital,"hospital");