import { model, Schema } from "mongoose";
import mongoose from "mongoose";
mongoose.pluralize(null);
import contentType from "../enums/contentType";

const chat = Schema(
    {
        reciverId: {
            type: mongoose.Types.ObjectId,
            ref: "new-api",
        },
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: "new-api",
        },
        messages: [
            {
                senderId: {type: mongoose.Types.ObjectId},
               reciverId:{type: mongoose.Types.ObjectId},
                contentType: {
                    type:String,
                    default:contentType.TEXT},
                content:{type:String}


            },
        ],
    },
    { timestamps: true }
);
module.exports = mongoose.model("chat", chat);
