import joi from "joi";
import { CommonFieldValidation } from "../Middleware/validation.middleware.js";

export const loginSchema = 
joi.object({}).keys({
    email: CommonFieldValidation.email.required(),
    password: CommonFieldValidation.password.required(),
})

.required();

export const signupSchema = {
    query : joi.object({}).keys({
    lang: joi.string().valid("ar", "en" ,"fr").required(),
}),
    body:joi
    .object({})
    .keys({
    userName: CommonFieldValidation.userName.required(),
    email: CommonFieldValidation.email.required(),
    password: CommonFieldValidation.password.required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    phone: CommonFieldValidation.phone,
    DOB: CommonFieldValidation.DOB,
    gender: CommonFieldValidation.gender
})
.required(),
}

export const confirmEmailSchema = {
    body:joi.object().keys({
     email: CommonFieldValidation.email.required(),
     otp:CommonFieldValidation.OTP.required()
    }).required()
}

export const resendOtpConfirmEmailSchema = {
    body:joi.object().keys({
     email: CommonFieldValidation.email.required(),
    }).required()
}

export const sendOTPForgetPasswordSchema = {
    body:joi.object().keys({
     email: CommonFieldValidation.email.required(),
    }).required()
}

export const verifyOTPForgetPasswordSchema = {
    body:joi.object().keys({
     email: CommonFieldValidation.email.required(),
     otp:CommonFieldValidation.OTP.required()
    }).required()
}

export const resetPasswordSchema = {
    body:joi.object().keys({
     email: CommonFieldValidation.email.required(),
     otp:CommonFieldValidation.OTP.required(),
     password:CommonFieldValidation.password.required(),
    }).required()
}