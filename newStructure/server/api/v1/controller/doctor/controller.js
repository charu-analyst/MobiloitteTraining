import successResponse from "../../../../../assets/response";
import responseMessages from "../../../../../assets/responseMessages";
import apiError from "../../../../helper/apiError";
import Joi from "joi";
import commonFunction from "../../../../helper/utils";
import mongoose from "mongoose";


import services from "../../services/doctor";
const { checkAdmin, addDoctor } = services;



class doctorController {
    async addDoctors(req, res, next) {
        const fields = Joi.object({
            hospitalId: Joi.string().custom((value, helpers) => {           //custom validation
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error('any.invalid');
                }
                return value;
            }).required(),
            expertsIn: Joi.string().required(),
            doctorName: Joi.string().required(),
            doctorImage: Joi.string().optional(),
            qualifications: Joi.required(),
            age: Joi.number().required(),
            doctorDescriptions: Joi.string().required(),

        })
        try {
            const validated = await fields.validateAsync(req.body);
            const { hospitalId, expertsIn, doctorName, doctorImage, qualifications, age, doctorDescriptions } = validated;
            const admin = await checkAdmin(req.userId);
            if (!admin) {
                throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
            };
            const url = null;
            if (doctorImage) {
                url = await commonFunction.getSecureUrl(doctorImage);
            };
            const obj = {
                hospitalId: hospitalId,
                expertsIn: expertsIn,
                doctorName: doctorName,
               qualifications:qualifications,
                doctorImage: url,
                age: age,
                doctorDescriptions: doctorDescriptions,
            }
            const result = await addDoctor(obj);
            return res.json(new successResponse(result, responseMessages));
        } catch (error) {
            console.log("Error", error);
            return next(error);
        }
    }
}

export default new doctorController;
