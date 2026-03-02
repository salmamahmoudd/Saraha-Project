import mongoose from "mongoose";
import { GenderEnum, Provider, RoleEnum } from "../../Common/Response/Enums/user.enums.js";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,   
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: function(){
        return  this.provider == Provider.System;
        },
    },
    phone: String,
    DOB:Date,
    gender:{
        type:String,
        enum:Object.values(GenderEnum),
        default: GenderEnum.Female,
    },
    role:{
    type:String,
    enum:Object.values(RoleEnum),
    default:RoleEnum.User
    },
    confirmEmail:{
        type:Boolean,
        default:false,
    },
    provider:{
        type:String,
        enum:Object.values(Provider),
        default:Provider.System,
    },
    profilePic:String,
},
{
    timestamps: true,
}
)
const UserModel = mongoose.model("User", userSchema)
export default UserModel;