import joi from "joi";
import { CommonFieldValidation } from "../../Middleware/validation.middleware.js";
export const sendMessageSchema = {
    body : joi.object({}).keys({
        content: joi.string().min(1).max(1000),
    }),
    params: joi.object({}).keys({
        receiverId:CommonFieldValidation.id.required(),
    }).required(),
}
export const getMessageByIdSchema = {
    params: joi.object({}).keys({
        messageId:CommonFieldValidation.id.required(),
    }).required(),
}
export const deleteMessageSchema = {
    params: joi.object({}).keys({
        messageId:CommonFieldValidation.id.required(),
    }).required(),
}
