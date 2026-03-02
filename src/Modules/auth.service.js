import {TokenType} from '../Common/Response/Enums/token.enums.js'
import { ENCRYPTION_KEY, GOOGLE_CLIENT_ID } from "../../config/config.service.js";
import { compareOperation, hashOperation } from "../Common/Response/Security/hash.js";
import { badRequestException, conflictException, notFoundException } from "../Common/Response/response.js";
import UserModel from "../DB/Models/User.model.js";
import * as DBRepo from "../DB/Models/db.respoastory.js";
import CryptoJS from "crypto-js"
import { generateAccessAndRefreshTokens, generateToken, getSignature } from '../Common/Response/Security/token.js';
import { OAuth2Client } from 'google-auth-library';
import { Provider } from '../Common/Response/Enums/user.enums.js';
export async function signup(bodyData) {

  const { email } = bodyData;

  const isEmail = await DBRepo.findOne({ 
    model:UserModel ,
    filters:{email},
});

  if (isEmail) {
    return conflictException("Email Already Exists")
  }

  bodyData.password =  await hashOperation({
    plainText: bodyData.password
  });

  const phoneEncrypted = CryptoJS.AES.encrypt(
    bodyData.phone,
    ENCRYPTION_KEY).toString();

  bodyData.phone = phoneEncrypted;

  const result = await DBRepo.create
  ({
    model:UserModel, 
    insertedData:bodyData,
});
  return result;
}

export async function login(bodyData){
    const { email , password } = bodyData;
    const user = await DBRepo.findOne({
      model:UserModel,
      filters:{ email }
    });
    
  if (!user) {
    return notFoundException("Invalid info")
  }
 
  const isPasswordValid = await compareOperation({
   plainValue: password, 
   hashedValue: user.password
  });

  if(!isPasswordValid){
    return notFoundException("Invalid info")
  }

return generateAccessAndRefreshTokens(user);
}

async function verifyGoogleToken(idToken){
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
}

export async function loginWithGoogle(idToken){

  const payload = await verifyGoogleToken(idToken)

  if(!payload.email_verified){
  return badRequestException("Email must be verified");
 }
  const user = await DBRepo.findOne({
    model: UserModel,
    filters:{email:payload.email ,provider:Provider.Google},
  });
  if(!user){
  return signupWithGmail(idToken);
  }

  return generateAccessAndRefreshTokens({user});
}
export async function signupWithGmail(idToken){  
  const payloadGoogleToken = await verifyGoogleToken(idToken);
  
  if(!payloadGoogleToken.email_verified){
  return badRequestException("Email must be verified");
 }
  const user = await DBRepo.findOne({
    model: UserModel,
    filters:{email:payloadGoogleToken.email},
  });
  if(user){
    if(user.provider == Provider.System){
      return badRequestException("Account Already Exists , login with your email and password")
    }
    return {status:200 , result:await loginWithGoogle(idToken)};
  }
const newUser = await DBRepo.create({
    model:UserModel , insertedData:{
    email:payloadGoogleToken.email,
    userName:payloadGoogleToken.name,
    profilePic:payloadGoogleToken.picture,
    confirmEmail:true,
    provider:Provider.Google,
  },
});
  return {status:201 ,result: generateAccessAndRefreshTokens({user :newUser})}
}

