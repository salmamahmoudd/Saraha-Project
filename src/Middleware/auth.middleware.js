import { TokenType } from "../Common/Response/Enums/token.enums.js";
import { decodeToken, getSignature, verifyToken } from "../Common/Response/Security/token.js";
import { badRequestException, unAuthorizedException } from "../Common/Response/response.js";
import UserModel from "../DB/Models/User.model.js";
import * as DBRepo from "../DB/Models/db.respoastory.js"
import * as redisMethods from "../DB/Models/redis.service.js";
import { blackListTokenKey } from "../DB/Models/redis.service.js";
export function authentication(tokenTypeParam = TokenType.access){
    return async (req,res,next)=>{

        const { authorization } = req.headers;

        if(!authorization){
            return unAuthorizedException("Missing Authorization Header");
        }

        const [BearerKey , token] = authorization.split(" ");

        if(BearerKey !== "Bearer"){
            return badRequestException("Invalid Bearer Key");
        }

        const decodedToken = decodeToken({ token });

        if(!decodedToken){
            return unAuthorizedException("Invalid Token");
        }

        const [userRole , tokenType] = decodedToken.aud;

        if(tokenType !== tokenTypeParam){
            return badRequestException("Invalid Token Type");
        }

        const {accessSignature , refreshSignature} = getSignature(userRole);

        const verifiedToken = verifyToken({
            token,
            signature:
                tokenTypeParam === TokenType.access
                ? accessSignature
                : refreshSignature,
        });

        if(
        await redisMethods.get(
        redisMethods.blackListTokenKey({
            userId:verifiedToken.sub, 
            tokenId:verifiedToken.jti,
        })
        )
    ){ 
        return unAuthorizedException("You need to login again");
        }

        const user = await DBRepo.findById({
            model:UserModel,
            id: verifiedToken.sub,
        });

        if(!user){
            return unAuthorizedException("Account not found , Signup Again");
        }

        if(verifiedToken.iat * 1000 < user.changeCreditTime){
            return unAuthorizedException("You need to login again")
        }
        req.user = user;
        req.tokenPayload = verifiedToken;
        next();
    }; 
}