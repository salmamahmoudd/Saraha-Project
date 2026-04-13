import { badRequestException, notFoundException } from "../../Common/Response/response.js";
import * as DBRepo from "../../DB/Models/db.respoastory.js";
import MessageModel from "../../DB/Models/Message.model.js";
import UserModel from "../../DB/Models/User.model.js";
export async function sendMessage(receiverId, content, fileData, senderId) {
    const receiver = await DBRepo.findById({model : UserModel, id: receiverId});
    if (!receiver) {
        return badRequestException("Receiver not found");
    }
    await DBRepo.create({model: MessageModel, insertedData: {
        receiverId,
        content,
        attachments: fileData.map((file) => file.finalPath),
        senderId
    }});
}

export async function getMessageById(userData, messageId){
    const msg = await DBRepo.findOne({
        model: MessageModel,
        filter: {
        _id: messageId,
        receiverId: userData._id,
    },
    });
    if (!msg) {
        return notFoundException("Message not found");
    }
 return msg;
}

export async function getAllMessages(userId){
    const msgs = await DBRepo.find({
        model: MessageModel,
        filter: {
        $or: [
            { receiverId: userId },
            { senderId: userId }
        ]
    },
    select: "-senderId",
    });
    if (!msgs.length) {
        return notFoundException("No messages found");
    }
 return msgs;
}

export async function removeMessage(userData, messageId){
    const msgs = await DBRepo.deleteOne({
        model: MessageModel,
        filters: {
            _id: messageId,
            receiverId: userData._id,
    },
    });
    if (!msgs.deletedCount) {
        return notFoundException("No messages found");
    }
 return msgs;
}