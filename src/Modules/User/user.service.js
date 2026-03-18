import { decrypt } from 'dotenv';
import { TokenType } from '../../Common/Response/Enums/token.enums.js'
import { generateToken, getSignature } from '../../Common/Response/Security/token.js'
import * as DBRrepo from "../../DB/Models/db.respoastory.js"
import UserModel from '../../DB/Models/User.model.js';
import { decryptValue } from '../../Common/Response/Security/encrpt.js';
import * as redisMethods from "../../DB/Models/redis.service.js"
import fs from "fs";
export async function renewToken(userData){
    const {accessSignature} = getSignature(userData.role)
    const newAccessToken = generateToken({ 
      signature: accessSignature, 
      options:{
        audience: [userData.role , TokenType.access],
        expiresIn: 60 * 15,
        subject: userData._id.toString(),
    },
 });
    return newAccessToken;
}

export async function uploadProfilePic(userId, file){
    const user = await DBRrepo.findById({id: userId, model: UserModel});
    if(!user) throw new Error("User not found");

    if(user.profilePic){
        user.coverPics = user.coverPics || [];
        user.coverPics.push(user.profilePic);
    }

    user.profilePic = file.path;
    await user.save();
    return { message: "Profile picture updated successfully" };
}

export async function covserProfilePic(userId, files){
    const user = await DBRrepo.findById({id: userId, model: UserModel});
    if(!user) throw new Error("User not found");

    user.coverPics = user.coverPics || [];
    if((user.coverPics.length + files.length) > 2){
        throw new Error("Total cover pictures cannot exceed 2");
    }

    const newPics = files.map(f => f.path);
    user.coverPics = [...user.coverPics, ...newPics];
    await user.save();
    return { message: "Cover pictures updated successfully" };
}

export async function removeProfilePic(userId){
    const user = await DBRrepo.findById({id: userId, model: UserModel});
    if(!user || !user.profilePic) throw new Error("No profile picture to delete");

    fs.unlinkSync(user.profilePic); 
    user.profilePic = null;
    await user.save();
    return { message: "Profile picture removed successfully" };
}


export async function getAnthoerProfile(profileId){
    const user = await DBRrepo.findById({
        id: profileId,
        model: UserModel,
        select: "-password -role -confirmEmail -provider -createdAt -updatedAt -__v"
    });

    if(!user) throw new Error("User not found");

    user.profileVisits = (user.profileVisits || 0) + 1;
    await user.save();

    return user;
}

export async function logout(userId, tokenData, logoutOptions) {
if(logoutOptions == "all"){
  await DBRrepo.updateOne({
    model:UserModel, 
    filter:{_id:userId}, 
    data:{changeCreditTime:new Date()},
  })
}else{
 await redisMethods.set({
  key: redisMethods.blackListTokenKey({
    userId, tokenId: tokenId.jit,
  }),
  value: tokenData.jit, 
  exValue:  60 * 60 * 24 * 365 - (Date.now() / 1000 - tokenData.iat)
})
}
}