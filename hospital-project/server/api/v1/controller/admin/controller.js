import joi from "joi";
import apiError from "../../../../helper/apiError";
import successResponse from "../../../../../assets/response";
import responseMessages from "../../../../../assets/responseMessages";
import services from "../../services/admin";
import bcrypt from "bcrypt"
import userType from "../../../../enums/userType";
import commonFunction from "../../../../helper/utils";


const { checkAdmin, updateUserById } = services

class admin {

    async adminLogin(req, res, next) {
        const fields = joi.object({
            email: joi.string().required(),
            password: joi.string().required(),
        })
        try {
            const validate = await fields.validateAsync(req.body);
            const { email, password } = validate;
            let query = { $and: [{ userType: userType.ADMIN }, { email: email }] };
            const adminDetails = await checkAdmin(query);
            if (!adminDetails) {
                throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
            };
            const passwordCheck = bcrypt.compareSync(password, adminDetails.password);
            if (passwordCheck == false) {
                throw apiError.invalid(responseMessages.PASSWORD_NOT_MATCH);
            } else {
                const token = await commonFunction.getToken({ _id: checkAdmin._id });
                return res.json(new successResponse(token, responseMessages.LOGIN_SUCCESS));
            }
        } catch (error) {
            console.log("Error", error);
            return next(error);
        }


    }

    async adminResetPassword(req, res, next) {
        try {

            const requiredFields = [
                "oldPassword",
                "newPassword",
                "confirmNewPassword",
            ];
            const missingFields = [];
            const body = req.body;
            requiredFields.forEach((field) => {
                if (!body[field]) {
                    missingFields.push(field);
                }
            });
            console.log("drcfeeeefefe");
            if (missingFields.length > 0) {
                const err = missingFields.map((fields) => `${fields} is required`);
                return res.json({ responseMessages: err });
            } else {
                let query = { $and: [{ userType: userType.ADMIN }, { _id: req.userId }] };
                const adminDetails = await checkAdmin(query);
                if (!adminDetails) {
                    throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
                };
                const compare = await bcrypt.compare(
                    body.oldPassword,
                    admin.password,
                );
                if (compare == false) {
                    throw apiError.badRequest(responseMessages.INVALID_OLD_PASSWORD);
                } else if (body.newPassword != body.confirmNewPassword) {
                    throw apiError.badRequest(
                        responseMessages.CONFIRM_PASSWORD_NOT_MATCHED
                    );
                } else {
                    const updatPassword = bcrypt.hashSync(body.confirmNewPassword, 10);
                    await updateUserById(
                        { _id: admin._id },
                        { set: { password: updatPassword } }
                    );
                    return res.json(
                        new successResponse(responseMessages.PASSWORD_CHANGED)
                    );
                }
            }
        } catch (error) {
            console.log("Error", error);
            return next(error);
        }
    }





}


export default new admin;