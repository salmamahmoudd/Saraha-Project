import { TokenType } from "../Enums/token.enums.js";
import { 
  TOKEN_SIGNATURE_Admin_ACCESS, 
  TOKEN_SIGNATURE_Admin_REFRESH, 
  TOKEN_SIGNATURE_User_ACCESS, 
  TOKEN_SIGNATURE_User_REFRESH } from "../../../../config/config.service.js";
import { RoleEnum } from "../Enums/user.enums.js";
import jwt from "jsonwebtoken"

export function getSignature(role = RoleEnum.User){
    let accessSignature ="";
    let refreshSignature = "";
      switch (role) {
        case RoleEnum.User:
        accessSignature = TOKEN_SIGNATURE_User_ACCESS;
        refreshSignature = TOKEN_SIGNATURE_User_REFRESH
        break;
        case RoleEnum.Admin:
        accessSignature = TOKEN_SIGNATURE_Admin_ACCESS;
        refreshSignature = TOKEN_SIGNATURE_Admin_REFRESH
        break;
    }
    return { accessSignature , refreshSignature }
}

export function generateToken({payload ={} ,signature , options = {}}){
  return jwt.sign(payload, signature, options)
}
export function verifyToken({token , signature}){
  return jwt.verify(token , signature)
}
export function decodeToken({token}){
  return jwt.decode(token)
}
export function generateAccessAndRefreshTokens({user}){
  const  { accessSignature , refreshSignature } = getSignature(user.role)

const access_token = generateToken({ 
  signature: accessSignature, 
  options:{
   audience: [user.role , TokenType.access],
   expiresIn: 60 * 15,
   subject:user._id.toString(),
},
});

const refresh_token = generateToken({ 
  signature: refreshSignature, 
  options:{
   audience:[user.role , TokenType.refresh],
   expiresIn: "1y",
   subject:user._id.toString(),
  }, 
});
return {access_token ,refresh_token}
}