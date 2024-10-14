import { model, Schema } from "mongoose";
import mongoose from "mongoose";
mongoose.pluralize(null);
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const experts = new Schema({
    hospitalId: {
        type: mongoose.Types.ObjectId,
        ref: "hospital",
    },
    expertsIn: {
        type: String,

    },
    doctorName: {
        type: String,
    },
    doctorImage: {
        type: String
    },
    qualifications: [],
    age: {
        type: Number,
    },
    doctorDescriptions: {
        type: String
    }
}, { timestamps: true });
experts.plugin(aggregatePaginate)
module.exports = model("doctor", experts);