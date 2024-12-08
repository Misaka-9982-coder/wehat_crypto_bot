import mongoose from 'mongoose'

// Payload Schema
const PayloadSchema = new mongoose.Schema({
    id: String,
    text: String,
    talkerId: String,
    listenerId: String,
    timestamp: Number,
    roomId: String,
    isRefer: Boolean,
    type: Number
}, { _id: false })

// Message Schema
const MessageSchema = new mongoose.Schema({
    id: String,
    payload: PayloadSchema
}, { 
    timestamps: true 
})

export const Message = mongoose.model('Message', MessageSchema)

// 保存消息的函数
export async function saveMessageToDb(msg) {
    try {
        const messageData = {
            id: msg.id,
            payload: {
                id: msg.payload.id,
                text: msg.payload.text,
                talkerId: msg.payload.talkerId,
                listenerId: msg.payload.listenerId,
                timestamp: msg.payload.timestamp,
                roomId: msg.payload.roomId,
                isRefer: msg.payload.isRefer,
                type: msg.payload.type
            }
        }

        const message = new Message(messageData)
        await message.save()
        console.log('Message saved to database:', message.id)
    } catch (error) {
        console.error('Error saving message to database:', error)
    }
}