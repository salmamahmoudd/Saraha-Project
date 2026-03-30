import UserModel from "../DB/Models/User.model.js";
import * as DBRepo from "../DB/Models/db.respoastory.js";
import * as RedisMethods from "../DB/Models/redis.service.js";
import { hashOperation, compareOperation } from "../Common/Response/Security/hash.js";
import { GOOGLE_CLIENT_ID } from "../../config/config.service.js";
import { generateAccessAndRefreshTokens } from "../Common/Response/Security/token.js";
import { badRequestException, conflictException, notFoundException } from "../Common/Response/response.js";
import { OAuth2Client } from "google-auth-library";
import { Provider } from '../Common/Response/Enums/user.enums.js';
import nodemailer from "nodemailer";
import { encryptValue } from "../Common/Response/Security/encrpt.js";
import { generateOTP } from "../Common/OTP/otp.service.js";
import { EmailTypeEnum } from "../Common/Response/Enums/email.enums.js";

async function sendEmailOtp({email, emailType, subject}){
  const pervOtpTTL = await RedisMethods.ttl(
      RedisMethods.getOTPKey({email, emailType}),

  );

  if (pervOtpTTL > 0) {
    return badRequestException(
      `There is already OTP valid for ${pervOtpTTL} seconds`
    );
  }

  const isBlocked = await RedisMethods.exists(
     RedisMethods.getOTPBlockedKey({ email, emailType}),
  )

  if(isBlocked){
    return badRequestException(`Try again later`)
  }

  const reqNo = await RedisMethods.get(RedisMethods.getOTPReqNoKey({email, emailType}))

  if(reqNo == 5){
    await RedisMethods.set({
    key: RedisMethods.getOTPBlockedKey({ email, emailType}),
    value: 1,
    exValue: 10 * 60,
  });

      return badRequestException(
      `You cannot request more than 5 emails in 20m`
    );

  }

  const otp = generateOTP();

  await sendMail({
    to: email,
    subject,
    html: `<h1>Your OTP ${otp}</h1>`,
  });

  await RedisMethods.set({
    key:RedisMethods.getOTPKey({email, emailType }),

    value: await hashOperation({ plainText: otp }),
    exValue: 120,
  });

 await RedisMethods.incr(RedisMethods.getOTPReqNoKey({email, emailType}))
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}

export async function signup(bodyData) {
  const { email, password } = bodyData;

  const existing = await DBRepo.findOne({ 
    model: UserModel, 
    filters: { email }
  });
  if (existing) return conflictException("Email Already Exists");

  bodyData.password = await hashOperation({ plainText: password });

  if(bodyData.phone){
      const phoneEncrypted = encryptValue({value: bodyData.phone})
     bodyData.phone = phoneEncrypted
  }
  const user = await DBRepo.create({
     model: UserModel, 
     insertedData: bodyData 
    });
 await sendEmailOtp({email , emailType: EmailTypeEnum.confirmEmail, subject: "Confirm Your Email"})
  return { message: "User created. OTP sent to email." };
}

export async function confirmEmail(bodyData) {
  const { email, otp } = bodyData;

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: {email, confirmEmail:false}
  })
  if(!user){
    return badRequestException("Invalid email or email already confirmed")
  }
  const storedOtp = await RedisMethods.get(
    RedisMethods.getOTPKey({email, emailType : EmailTypeEnum.confirmEmail}),
)
  if(!storedOtp){
    return badRequestException("OTP Expired")
  }
  const isOtpValid = await compareOperation({
    plainValue: otp,
    hashedValue: storedOtp
  })
  if(!isOtpValid){
    return badRequestException("OTP Not Valid")
  }
  user.confirmEmail = true
  await user.save()
}

export async function resendConfirmEmailOTP(email) {
 await sendEmailOtp({email , emailType: EmailTypeEnum.confirmEmail, subject: "Anthor OTP to Confirm Your Email"})
}

export async function resendForgetPasswordOTP(email) {
 await sendEmailOtp({email , emailType: EmailTypeEnum.forgetPassword, subject: "Anthor OTP to Reset Your Password"})
}

export async function sendOTPForgetPassword(email) {
  const user = await DBRepo.findOne({model: UserModel, filters: { email }})
  if(!user){
    return ;
  }
  if(!user.confirmEmail){
    return badRequestException("Confirm your email first")
  }
 await sendEmailOtp({email , emailType: EmailTypeEnum.forgetPassword, subject: "Reset Your Password"})
}

export async function verifyOTPForgetPassword(bodyData) {
  const { email , otp } = bodyData;
  
  const emailOTP = await RedisMethods.get(RedisMethods.getOTPKey({email, emailType:EmailTypeEnum.forgetPassword}))

  if(!emailOTP){
    return badRequestException("OTP Expired")
  }

  const isOtpValid = await compareOperation({
    plainValue: otp,
    hashedValue: emailOTP
  })
  if(!isOtpValid){
    return badRequestException("OTP Not Valid")
  }
}

export async function resetPassword(bodyData) {
  const { email, password, otp } = bodyData;
  await verifyOTPForgetPassword({email, otp})
  await DBRepo.updateOne({model:UserModel,filter:{email},data:{password: await hashOperation({plainText:password})}})
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