import { RoleEnum } from "../Common/Response/Enums/user.enums.js";
import { forbiddenExcetion } from "../Common/Response/response.js";

export function authorization(roles = [RoleEnum.User]){
    return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return forbiddenExcetion("Don't have access to this API")
    }
    next();
};
}