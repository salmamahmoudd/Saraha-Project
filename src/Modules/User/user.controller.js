import express from "express";
import * as userService from "./user.service.js";
import { successResponse } from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { TokenType } from "../../Common/Response/Enums/token.enums.js";
import { RoleEnum } from "../../Common/Response/Enums/user.enums.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import {localUpload, allowedFileFormats } from "../../Common/Response/Multer/multer.config.js";
import { coverPicSchema, getAnthoerProfileSchema, profilePicSchema, updatePasswordSchema } from "./user.validation.js";
import { validation } from "../../Middleware/validation.middleware.js";

const userRouter = express.Router();

userRouter.get("/", authentication(), authorization([RoleEnum.Admin]), async (req,res)=> {
    return successResponse({res, data:req.user})
});
userRouter.post("/renew-token", authentication(TokenType.refresh), async (req,res)=> {
    const result = await userService.renewToken(req.user)
    return successResponse({res, data:result})
});
userRouter.post(
    "/upload-mainPic",
    authentication(),
    localUpload({ folderName: "User", allowedFormate: allowedFileFormats.img }).single("profilePic"),
    validation(profilePicSchema),
    async (req, res) => {
        const result = await userService.uploadProfilePic(req.user._id, req.file);
        return successResponse({ res, data: result });
    }
);
userRouter.post("/upload-mainPic",
    authentication(),
    localUpload({
        folderName:"User", 
        allowedFormate:allowedFileFormats.img
    }).single("profilePic"), 
    validation(profilePicSchema),
    async(req,res)=> { 
    const result = await userService.uploadProfilePic(req.user._id, req.file)
    return successResponse({res, data:result})
}); 
userRouter.post("/upload-coverPics",
    authentication(),
    localUpload({
        folderName:"User", 
        allowedFormate:allowedFileFormats.img
    }).array("coverPics" , 2), 
    validation(coverPicSchema),
    async(req,res)=> { 
    const result = await userService.covserProfilePic(req.user._id, req.files)
    return successResponse({res, data:result})
}); 
userRouter.patch("/update-password",
    authentication(),
    validation(updatePasswordSchema),
    async(req,res)=> { 
    await userService.updatePassword(req.body , req.user)
    return successResponse({res, data:"done"})
},
)
userRouter.delete(
    "/remove-profilePic",
    authentication(),
    async (req, res) => {
        const result = await userService.removeProfilePic(req.user._id);
        return successResponse({ res, data: result });
    }
);
userRouter.get("/share-profile/:profileId",
    async (req,res) => {
    const result = await userService.getAnthoerProfile(req.params.profileId)
    return successResponse({res, data:result})
});
userRouter.get("/", authentication(), authorization([RoleEnum.Admin]), async (req, res) => {
    const users = await UserModel.find({}, "userName profileVisits");
    return successResponse({ res, data: users });
});
userRouter.post("/logout", authentication(), async (req,res)=>{
    const result = await userService.logout(
        req.user._id, 
        req.tokenPayload,
        req.body.logoutOption
    );
    return successResponse({res, data:result})
});
export default userRouter;