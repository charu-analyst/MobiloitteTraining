
import hospitalModel from "../../../models/user";




module.exports={
    checkAdmin:async(userId)=>{
         const admin = await hospitalModel.findOne({_id:userId});
         return admin;
    }
}