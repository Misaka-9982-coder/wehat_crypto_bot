import express from 'express'
import cors from 'cors'
import { loadWhitelistRooms } from '../utils/whitelistConfig.js'

export async function handleWebhook(bot, data) {
    try {
        if (!data) {
            console.log('无效的数据格式:', data)
            return
        }

        let sendMessage = data.message || data.tweet.text

        if (sendMessage && bot) {
            const rooms = loadWhitelistRooms()

            // 遍历所有白名单群聊
            for (const roomId of rooms) {
                try {
                    const room = await bot.Room.find({id: roomId})
                    if (room) {
                        await room.say(sendMessage)
                        console.log(`消息已发送到群聊 ${roomId}`)
                    } else {
                        console.log(`未找到群聊 ${roomId}`)
                    }
                } catch (error) {
                    console.error(`发送消息到群聊 ${roomId} 失败:`, error)
                }
            }
        }
    } catch (error) {
        console.error('处理 webhook 消息失败:', error)
        throw error
    }
}

export function setupWebhookServer(bot) {
    const app = express()
    app.use(cors())

    app.post('/webhook', (req, res) => {
        let data = ''

        req.on('data', chunk => {
            data += chunk
        })

        req.on('end', async () => {
            try {
                console.log('收到请求头:', req.headers)
                console.log('收到原始数据:', data)

                let parsedData
                try {
                    parsedData = JSON.parse(data)
                    console.log('解析后的数据:', parsedData)
                } catch (e) {
                    console.error('JSON解析失败:', e)
                    return res.status(400).send('Invalid JSON format')
                }

                await handleWebhook(bot, parsedData)
                res.status(200).send('OK')
            } catch (error) {
                console.error('处理 webhook 失败:', error)
                res.status(500).send('Error')
            }
        })
    })

    const PORT = 3000
    app.listen(PORT, () => {
        console.log(`Webhook 服务器运行在端口 ${PORT}`)
    })

    return app
}