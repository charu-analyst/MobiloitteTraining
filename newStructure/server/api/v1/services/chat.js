import userModel from "../../../models/user"
import chatModel from "../../../models/chat"

module.exports = {
    findUserById: async (id) => {
        return await userModel.findOne({_id:id});
    },
    createChat: async (obj) => {
        return await chatModel.create(obj);
    },
    findUser: async(query)=>{ 
    return await chatModel.findOne(query);
    },
    saveChat: async(obj)=>{
        return await chatModel.save(obj);
    },
    update: async (id,obj)=>{
        return await chatModel.findOneAndUpdate({_id:id},{$set:obj})
    }
}