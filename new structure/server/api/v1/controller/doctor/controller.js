import successResponse from "../../../../../assets/response";
import responseMessages from "../../../../../assets/responseMessages";
import apiError from "../../../../helper/apiError";
import Joi from "joi";
import commonFunction from "../../../../helper/utils";
import mongoose from "mongoose";
import services from "../../services/doctor";
const { checkAdmin, addDoctor, checkDoctor, deleteDoctor, updateDoctor } = services;



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
            sittingDays: Joi.required(),

        })
        try {
            const validated = await fields.validateAsync(req.body);
            const { hospitalId, expertsIn, doctorName, doctorImage, qualifications, age, doctorDescriptions, sittingDays } = validated;
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
                qualifications: qualifications,
                doctorImage: url,
                age: age,
                doctorDescriptions: doctorDescriptions,
                sittingDays: sittingDays,
            }
            const result = await addDoctor(obj);
            return res.json(new successResponse(result, responseMessages.DOCTOR_ADDED));
        } catch (error) {
            console.log("Error", error);
            return next(error);
        }
    }
    async deleteDoctor(req, res, next) {
        try {
            let id = req.query.id
            const admin = await checkAdmin(req.userId);
            if (!admin) {
                throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
            };
            if (!id) {
                throw apiError.invalid(responseMessages.INVALID);
            };
            const doctorDetails = await checkDoctor(id);
            if (!doctorDetails) {
                throw apiError.notFound(responseMessages.DOCTOR_NOT_FOUND);
            };
            await deleteDoctor(id);
            return res.json(new successResponse(responseMessages.DOCTOR_DELETED));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
    async updateDoctor(req, res, next) { 
        const id =req.query.id;
        const body = req.body;
   
        const adminDetails = await checkAdmin(req.userId);
        if (!adminDetails) {
            throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
        };
        if (!id) {
            throw apiError.invalid(responseMessages.INVALID);
        };
        const doctorDetails = await checkDoctor(id);
        if (!doctorDetails) {
            throw apiError.notFound(responseMessages.DOCTOR_NOT_FOUND);
        };
        if(body.doctorImage){
            const url = commonFunction.getSecureUrl(body.doctorImage);
             const updatedResult = await updateDoctor(url);
             return res.json(new successResponse(updatedResult, responseMessages.UPDATE_SUCCESS));
        };
        const updatedResult = await updateDoctor(body);
        return res.json(new successResponse(updatedResult, responseMessages.UPDATE_SUCCESS));

    }
   async getDoctor(req,res,next){

    }
}

export default new doctorController;