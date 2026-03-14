import { decrypt } from 'dotenv';
import { TokenType } from '../../Common/Response/Enums/token.enums.js'
import { generateToken, getSignature } from '../../Common/Response/Security/token.js'
import * as DBRrepo from "../../DB/Models/db.respoastory.js"
import UserModel from '../../DB/Models/User.model.js';
import { decryptValue } from '../../Common/Response/Security/encrpt.js';

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
await DBRrepo.updateOne({
  model: UserModel, 
  filter:{_id:userId}, 
  data:{profilePic: file.finalPath
  },
})
}

export async function covserProfilePic(userId, files){
const profilePicsPath = files.map((file)=>{
  return file.finalPath
})
await DBRrepo.updateOne({
  model: UserModel, 
  filter:{_id:userId}, 
  data:{covserPics: file.finalPath
  },
})
}

export async function getAnthoerProfile(profileId){
  const user = await DBRrepo.findById({id:profileId,model:UserModel, select:"-password -role -confirmEmail -provider - createdAt -updatedAt -__v"})
  if(user.phone){
      user.phone = decryptValue({ ciphertext: user.phone})
  }
  return user;
}