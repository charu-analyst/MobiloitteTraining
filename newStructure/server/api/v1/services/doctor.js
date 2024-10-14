import userModel from "./../../../models/user";
import doctorModel from "../../../models/doctor";
import userType from "../../../enums/userType";






module.exports = {

    checkAdmin: async (id) => {
        return await userModel.findOne({ $and: [{ _id: id }, { userType: userType.ADMIN }] });
    },
    addDoctor: async(obj)=>{
        return await doctorModel.create(obj);
    }




}