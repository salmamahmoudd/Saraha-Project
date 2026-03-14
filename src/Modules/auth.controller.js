import express from "express";
import * as authService from "./auth.service.js";
import { successResponse } from "../Common/Response/response.js";
import { validation } from "../Middleware/validation.middleware.js";
import { signupSchema, loginSchema } from "./auth.validation.js";
import {localUpload , allowedFileFormats } from '../Common/Response/Multer/multer.config.js'
const authRouter = express.Router();

authRouter.get("/", (req,res)=> res.send("Auth route is working"));

authRouter.post( 
   "/signup", 
   localUpload({
    folderName: "User", 
    allowedFormate:allowedFileFormats.img
  }).single("profilePic"), 
  async (req,res)=> {
const result = await authService.signup(req.body);
return successResponse({res, statusCode:201, data: result});  }
);

authRouter.post("/verify-otp", async (req,res)=>{
  const { email, otp } = req.body;
  const result = await authService.verifyOtp({ email, otp });
  return successResponse({ res, statusCode:200, data: result });
});

authRouter.post("/login", validation(loginSchema), async (req,res)=> {    
    const result = await authService.login(req.body);
    return successResponse({res, statusCode:200, data:result})
});

authRouter.post("/signup/gmail", async (req,res)=> {
    const {status,result} = await authService.signupWithGmail(req.body.idToken)
    return successResponse({res, statusCode: status, data:result})
});

export default authRouter;