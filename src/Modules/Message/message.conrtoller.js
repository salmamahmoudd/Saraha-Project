import express from 'express';
import { allowedFileFormats, localUpload } from '../../Common/Response/Multer/multer.config.js';
import { getMessageById, sendMessage } from './message.service.js';
import { badRequestException, successResponse } from '../../Common/Response/response.js';
import { validation } from '../../Middleware/validation.middleware.js';
import { deleteMessageSchema, getMessageByIdSchema, sendMessageSchema } from './message.validation.js';
import { authentication } from '../../Middleware/auth.middleware.js';
const messageRouter = express.Router({ caseSensitive: false , strict: true });

messageRouter.post('/:receiverId',
    (req, res, next) => {
        const { authorization } = req.headers;
        if (authorization) {
            return authMiddleware(req, res, next);
        }
        next()
    },
    localUpload({
    folderName: "Messages",
    allowedFormats: [...allowedFileFormats.img, ...allowedFileFormats.video],fileSize: 50,}).array("attachments", 5), 
    validation(sendMessageSchema),
async (req, res) => {
    if(!req.body && !req.files){
        return badRequestException("Message content or attachments are required");
    }
    await sendMessage(req.params.receiverId, req.body.content, req.files, req.user?._id);
    return successResponse(res, { statusCode: 201, data : "Message sent successfully" });
})

messageRouter.get('/get-msg-by-Id/:messageId',
    authentication(),
    validation(getMessageByIdSchema),
    async (req, res) => {
    const result = await getMessageById(req.user, req.params.messageId);
    return successResponse({res, data: result });
})

messageRouter.get('/get-all-messages',
    authentication(),
    async (req, res) => {
    const result = await getAllMessages(req.user._id);
    return successResponse({res, data: result });
})

messageRouter.delete('/:messageId',
    authentication(),
    validation(deleteMessageSchema),
    async (req, res) => {
    removeMessage(req.user, req.params.messageId);
    return successResponse({res, data: "Message deleted successfully" });
})

export default messageRouter;