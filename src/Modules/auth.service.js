import UserModel from "../DB/Models/User.model.js";
import * as DBRepo from "../DB/Models/db.respoastory.js";
import { hashOperation, compareOperation } from "../Common/Response/Security/hash.js";
import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY, GOOGLE_CLIENT_ID } from "../../config/config.service.js";
import { generateAccessAndRefreshTokens } from "../Common/Response/Security/token.js";
import { badRequestException, conflictException, notFoundException } from "../Common/Response/response.js";
import { OAuth2Client } from "google-auth-library";
import { Provider } from '../Common/Response/Enums/user.enums.js';
import nodemailer from "nodemailer";
import { encryptValue } from "../Common/Response/Security/encrpt.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function signup(bodyData) {
  const { email, phone, password } = bodyData;

  const existing = await DBRepo.findOne({ model: UserModel, filters: { email }});
  if (existing) return conflictException("Email Already Exists");

  bodyData.password = await hashOperation({ plainText: password });

  if(bodyData.phone){
      const phoneEncrypted = encryptValue({value: bodyData.phone})
     bodyData.phone = phoneEncrypted
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  bodyData.otp = otp;
  bodyData.otpExpire = Date.now() + 5*60*1000;

  const user = await DBRepo.create({ model: UserModel, insertedData: bodyData });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
  });

  return { message: "User created. OTP sent to email." };
}

export async function verifyOtp({ email, otp }) {
  const user = await DBRepo.findOne({ model: UserModel, filters: { email }});
  if (!user) return notFoundException("User not found");

  if(user.otp !== Number(otp)) return badRequestException("Invalid OTP");
  if(Date.now() > user.otpExpire) return badRequestException("OTP expired");

  user.confirmEmail = true;
  user.otp = null;
  user.otpExpire = null;
  await user.save();

  return { message: "Email verified successfully" };
}

export async function login({ email, password }) {
  const user = await DBRepo.findOne({ model: UserModel, filters:{ email }});
  if(!user) {
    console.log("User not found:", email);
    return notFoundException("Invalid info");
  }

  const valid = await compareOperation({ plainValue: password, hashedValue: user.password });
  if(!valid) {
    console.log("Password mismatch for user:", email);
    return notFoundException("Invalid info");
  }

  return generateAccessAndRefreshTokens({user});
}

async function verifyGoogleToken(idToken){
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
  return ticket.getPayload();
}

export async function loginWithGoogle(idToken){
  const payload = await verifyGoogleToken(idToken);
  if(!payload.email_verified) return badRequestException("Email must be verified");

  const user = await DBRepo.findOne({ model: UserModel, filters:{ email:payload.email , provider:Provider.Google }});
  if(!user) return signupWithGmail(idToken);

  return generateAccessAndRefreshTokens({user});
}

export async function signupWithGmail(idToken){
  const payload = await verifyGoogleToken(idToken);
  if(!payload.email_verified) return badRequestException("Email must be verified");

  const existing = await DBRepo.findOne({ model: UserModel, filters:{ email:payload.email }});
  if(existing){
    if(existing.provider == Provider.System)
      return badRequestException("Account exists, login with email/password");
    return {status:200 , result: await loginWithGoogle(idToken)};
  }

  const newUser = await DBRepo.create({ model:UserModel, insertedData:{
    email: payload.email,
    userName: payload.name,
    profilePic: payload.picture,
    confirmEmail: true,
    provider: Provider.Google
  }});

  return { status:201, result: generateAccessAndRefreshTokens({user :newUser}) };
}