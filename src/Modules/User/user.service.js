import { TokenType } from '../../Common/Response/Enums/token.enums.js'
import { generateToken, getSignature } from '../../Common/Response/Security/token.js'

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