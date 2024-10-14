import userModel from "../../../models/user";
import hospitalModel from "../../../models/hospital";
import userType from "../../../enums/userType";



module.exports = {
    checkAdmin: async (id) => {
        return await userModel.findOne({ $and: [{ _id: id }, { userType: userType.ADMIN }] });
    },
    createHospital: async (obj) => {
        return await hospitalModel.create(obj);
    }



}