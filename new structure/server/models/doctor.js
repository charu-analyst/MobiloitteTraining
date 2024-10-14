import { model, Schema } from "mongoose";
import mongoose from "mongoose";
mongoose.pluralize(null);
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import status from "../enums/status";

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
        type: String,
    },
    qualifications: {
        type: []
    },
    age: {
        type: Number,
    },
    doctorDescriptions: {
        type: String
    },
    sittingDays: {
        type: []
    },
    status: {
        type: String,
        default: status.ACTIVE
    }


}, { timestamps: true });
experts.plugin(aggregatePaginate)
module.exports = model("doctor", experts);