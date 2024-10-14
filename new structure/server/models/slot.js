import { model, Schema } from "mongoose";
import mongoose from "mongoose"
mongoose.pluralize(null);

const slot = new Schema({
    doctorId: {
        type: mongoose.Types.ObjectId,
        ref: "doctor",
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    slotDuration: {
        type: Date,
    },
    weekOfDay: {
        type: String
    },
    breakHour:{
        type: Date,
    },
    slots: [{
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },
        isOccupied: {
            type: Boolean, default: false
        }
    }]
}, { timeStamp: true });
module.exports = model("slot", slot);