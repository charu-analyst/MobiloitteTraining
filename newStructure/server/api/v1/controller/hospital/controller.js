
import apiError from "../../../../helper/apiError";
import successResponse from "../../../../../assets/response";
import responseMessages from "../../../../../assets/responseMessages";
import commonFunction from "../../../../helper/utils";
import Joi from "joi";
import services from "../../services/hospital"
const { checkAdmin, createHospital } = services;

class hospitalController {
    async createHospital(req, res, next) {
        const fields = Joi.object({
            hospitalName: Joi.string().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            hospitalImage: Joi.string().optional(),
        })
        try {
            const validated = await fields.validateAsync(req.body);
            const { hospitalName, latitude, longitude, hospitalImage } = validated;
            const adminDetails = await checkAdmin(req.userId);
            if (!adminDetails) {
                throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
            };
            let url = null;
            if (hospitalImage) {
                url = await commonFunction.getSecureUrl(hospitalImage);
            }
            const obj = {
                hospitalName: hospitalName,
                location: { coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                hospitalImage: url
            }
            const result = await createHospital(obj);
            return res.json(new successResponse(result, responseMessages.HOSPITAL_CREATED));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }


}



export default new hospitalController();