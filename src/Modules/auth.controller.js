import express from "express";
import * as authService from "./auth.service.js";
import { successResponse } from "../Common/Response/response.js";
import { validation } from "../Middleware/validation.middleware.js";
import { signupSchema, loginSchema, confirmEmailSchema, resendOtpConfirmEmailSchema, sendOTPForgetPasswordSchema, verifyOTPForgetPasswordSchema, resetPasswordSchema } from "./auth.validation.js";
const authRouter = express.Router();

authRouter.get("/", (req,res)=> res.send("Auth route is working"));

authRouter.post( "/signup", validation(signupSchema),
  async (req,res)=> {
const result = await authService.signup(req.body);
return successResponse({res, statusCode:201, data: "check your inbox"});  }
);

authRouter.post("/confirm-email", validation(confirmEmailSchema),
  async (req,res)=> {
const result = await authService.confirmEmail(req.body);
return successResponse({res, statusCode:201, data: "confirmed"});  }
);

authRouter.post("/send-male-forget-password", validation(sendOTPForgetPasswordSchema),
  async (req,res)=> {
const result = await authService.sendOTPForgetPassword(req.body.email);
return successResponse({res, statusCode:201, data: "check your inbox"});  }
);

authRouter.post("/verfiy-forget-password", validation(verifyOTPForgetPasswordSchema),
  async (req,res)=> {
const result = await authService.verifyOTPForgetPassword(req.body);
return successResponse({res, statusCode:200, data: "verfied"});  }
);

authRouter.post("/reset-password", validation(resetPasswordSchema),
  async (req,res)=> {
const result = await authService.resetPassword(req.body);
return successResponse({res, statusCode:200, data: "done"});  }
);

authRouter.post(
  "/resend-otp-confirm-email",
  validation(resendOtpConfirmEmailSchema),
  async (req, res) => {
    const result = await authService.resendConfirmEmailOTP(req.body.email);
    return successResponse({
      res,
      statusCode: 201,
      data: "check your inbox",
    });
  }
);

authRouter.post(
  "/resend-otp-reset-password",
  validation(resendOtpConfirmEmailSchema),
  async (req, res) => {
    const result = await authService.resendForgetPasswordOTP(req.body.email);
    return successResponse({
      res,
      statusCode: 201,
      data: "check your inbox",
    });
  }
);

authRouter.post("/login", validation(loginSchema), async (req,res)=> {    
    const result = await authService.login(req.body);
    return successResponse({res, statusCode:200, data:result})
});

authRouter.post("/signup/gmail", async (req,res)=> {
    const {status,result} = await authService.signupWithGmail(req.body.idToken)
    return successResponse({res, statusCode: status, data:result})
});

export default authRouter;