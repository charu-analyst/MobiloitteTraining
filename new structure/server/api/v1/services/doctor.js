import userModel from "./../../../models/user";
import doctorModel from "../../../models/doctor";
import userType from "../../../enums/userType";
import status from "../../../enums/status";
import slotModel from "../../../models/slot"




module.exports = {

    checkAdmin: async (id) => {
        return await userModel.findOne({ $and: [{ _id: id }, { userType: userType.ADMIN }] });
    },
    checkDoctor: async(id)=>{
        return await doctorModel.findOne({$and:[{_id:id},{status:status.ACTIVE}]})
    },
    addDoctor: async(obj)=>{
        return await doctorModel.create(obj);
    },
    deleteDoctor: async(id)=>{
        return await doctorModel.findByIdAndDelete({_id:id});
    },
    updateDoctor: async(id,body)=>{
        return await doctorModel.findByIdAndUpdate({_id:id},{$set:body},{new:true})
    },








    createSlot: async(obj)=>{
        return await slotModel.create(obj);
    }
   



   



}