import mongoose from 'mongoose'

export async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/wechat_bot')
        console.log('MongoDB connected successfully')
    } catch (err) {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    }
}