import userModel from "../../../models/user"




module.exports={
    checkAdmin:async(query)=>{
return await userModel.findOne(query);
    },
    updateUserById: async(id,query)=>{
return await userModel.findByIdAndUpdate(id,query);
    }
}