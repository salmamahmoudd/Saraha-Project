import express from "express";
import * as authService from "./auth.service.js";
import { successResponse } from "../Common/Response/response.js";

const authRouter = express.Router();

authRouter.get("/", (req,res)=> res.send("Auth route is working"));
authRouter.post("/signup", async (req,res)=> {
    const result = await authService.signup(req.body)
    return successResponse({res, statusCode:201, data:result})
});
authRouter.post("/signup/gmail", async (req,res)=> {
    const {status,result} = await authService.signupWithGmail(req.body.idToken)
    return successResponse({res, statusCode: status, data:result})
});
authRouter.post("/login", async (req,res)=> {    
    const result = await authService.login(req.body ,`${req.protocol}://${req.host}`)
    return successResponse({res, statusCode:200, data:result})
});

export default authRouter;