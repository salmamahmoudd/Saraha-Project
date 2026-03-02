import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
})

const MessageModel = mongoose.model("Message" , messageSchema)

export default MessageModel;