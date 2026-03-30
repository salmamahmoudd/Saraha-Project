import { Types } from "mongoose";
import { GenderEnum } from "../Common/Response/Enums/user.enums.js";
import { badRequestException } from "../Common/Response/response.js";
import joi from "joi";

export function validation(schema) {
  return (req, res, next) => {
    const validationErrors = [];

    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, { abortEarly: false });
      req.vbody = value;
      if (error) validationErrors.push(error);
    }

    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, { abortEarly: false });
      req.vquery = value;
      if (error) validationErrors.push(error);
    }

    if (validationErrors.length > 0) {
      return badRequestException("Validation error", validationErrors);
    }

    next();
  };
}

export const CommonFieldValidation = {
  userName: joi.string().pattern( new RegExp(/^[A-Z][a-z]{1,24}\s[A-Z][a-z]{1,24}$/)),


    email: joi.string().trim(),

  password: joi.string().pattern( new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,16}/)),

  phone: joi.string().pattern( new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),

  DOB: joi.date(),

  gender: joi.string().valid(...Object.values(GenderEnum)),
OTP: joi.string().pattern(/^\d{6}$/).required(),};

export const validatedObjectIdFn = function (value, helpers){
            if (!Types.ObjectId.isValid(value)){
              return helpers.message("invalid object id formate")
            }
        }