import responseMessages from "../../../../../assets/responseMessages";
import successResponse from "../../../../../assets/response";
import services from "../../services/chat"
import apiError from "../../../../helper/apiError";
import Joi from "joi";
import mongoose from "mongoose";
import status from "../../../../enums/status";
import chatModel from "../../../../models/chat"

const { findUserById, createChat, findUser, update, saveChat } = services

class chat {
    async chat(req, res, next) {
        const objectId = (value, helpers) => {
            //custom validation
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        }
        const fields = Joi.object({
            reciverId: Joi.string().custom(objectId).required(),
            messages: Joi.string().required(),
            contentType: Joi.string().optional(),
        }
        )
        try {
            const userId = req.userId;
            const { error, value } = fields.validate(req.body);
            if (error) {
                console.error(error.details);
                return res.status(400).json({ error: error.message });
            }
            const { reciverId, messages } = value;
            const findReciver = await findUserById(reciverId);
            if (!reciverId) {
                throw apiError.notFound(responseMessages.USER_NOT_FOUND);
            } else if (findReciver.status == status.DELETED) {
                throw apiError.unauthorized(responseMessages.USER_ID_DELETED);
            }
            const previousChats = await chatModel.findOne({
                $or: [
                    { senderId: req.userId, reciverId: reciverId },
                    { senderId: reciverId, reciverId: req.userId },
                ],
            });
            if (!previousChats) {
                const obj = {
                    reciverId: reciverId,
                    senderId: req.userId,
                    messages: [
                        {
                            reciverId: reciverId,
                            senderId: req.userId,
                            content: messages,
                        },
                    ],
                };
                const result = await createChat(obj);
                return res.json(new successResponse(result, responseMessages.SUCCESS))
            } else {
                previousChats.messages.push({
                    reciverId: reciverId,
                    senderId: req.userId,
                    content: messages,
                    contentType: contentType
                });
                const result = await previousChats.save();
                return res.json(new successResponse(result, responseMessages.SUCCESS));
            }
        } catch (error) {
            console.log("Error", error);
            return next(error);
        }
    }
}

export default new chat();









// import chatSchema from "../schemas/chatSchema";

// async function oneToOneChat(req, res) {
//   try {
//     const { senderId, receiverId, message, mediaType, disappear } = req.body;

//     const chatQuery = {
//       $or: [
//         { senderId: senderId, receiverId: receiverId },
//         { senderId: receiverId, receiverId: senderId },
//       ],
//     };

//     const newMessage = {
//       message: message,
//       receiverId: receiverId,
//       mediaType: mediaType || "text",
//       createdAt: new Date().toISOString(),
//       disappear: disappear,
//     };

//     const chat = await chatSchema.findOne(chatQuery);

//     if (!chat) {
//       const newChat = new chatSchema({
//         senderId: senderId,
//         receiverId: receiverId,
//         messages: [newMessage],
//       });

//       const savedChat = await newChat.save();

//       res.status(200).json({
//         response_code: 200,
//         response_message: "Message sent successfully.",
//         result: savedChat,
//       });
//     } else {
//       if (chat.status !== "ACTIVE") {
//         res.status(404).json({
//           response_code: 404,
//           response_message: "You can't chat.",
//           result: chat,
//         });
//       } else {
//         chat.messages.push(newMessage);
//         const updatedChat = await chat.save();

//         res.status(200).json({
//           response_code: 200,
//           response_message: "Message sent successfully.",
//           result: updatedChat,
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Error sending message:", error);
//     res.status(500).json({
//       response_code: 500,
//       response_message: "Internal server error.",
//       error: error,
//     });
//   }
// }

// export default oneToOneChat;