import hospitalModel from "../../../../models/hospital"
import joi from "joi";
import apiError from "../../../../helper/apiError";
import successResponse from "../../../../../assets/response";
import responseMessages from "../../../../../assets/responseMessages";
import services from "../../services/hospital"
import commonFunction from "../../../../helper/utils"


const{checkAdmin,createHospital}= services


class hospitalController{

async createHospital(req,res,next){
const fields = joi.object({
    hospitalName:joi.string().required(),
    hospitalImage:joi.string().optional(),
    latitude:joi.string().required(),
    longitude:joi.string().required(),
})

try {
    const validate = await fields.validateAsync(req.body);
    const {hospitalName,hospitalImage,latitude,longitude} = validate;
    const adminDetails = await checkAdmin(req.userId);
if(!adminDetails){
    throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
}
 const url = await commonFunction.getSecureUrl(hospitalImage);

const obj ={
    hospitalName:hospitalName,
    hospitalImage:url,
    location:{coordinates:[parseFloat(longitude),parseFloat(latitude)]},
}
const result =  await createHospital(obj);
return res.json(new successResponse(result,responseMessages.HOSPITAL_CREATED))



} catch (error) {
    console.log("Error",error);
    return next(error);
}
}






}


export default new hospitalController;