import express from "express";
import * as userService from "./user.service.js";
import { successResponse } from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { TokenType } from "../../Common/Response/Enums/token.enums.js";
import { RoleEnum } from "../../Common/Response/Enums/user.enums.js";
import { authorization } from "../../Middleware/authorization.middleware.js";

const userRouter = express.Router();

userRouter.get("/", authentication(), authorization([RoleEnum.Admin]), async (req,res)=> {
    return successResponse({res, data:req.user})
});
userRouter.post("/renew-token", authentication(TokenType.refresh), async (req,res)=> {
    const result = await userService.renewToken(req.user)
    return successResponse({res, data:result})
});

export default userRouter;