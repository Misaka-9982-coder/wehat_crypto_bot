import { WechatferryPuppet } from '@wechatferry/puppet'
import { WechatyBuilder } from 'wechaty'
import {
    initWhitelistConfig,
    watchConfig,
    isRoomInWhitelist,
    isAdmin
} from './utils/whitelistConfig.js'
import { handleAdminCommand } from './commands/adminCommands.js'
import { handleUserCommand } from './commands/userCommands.js'
import { handleTokenCommand } from './commands/tokenCommands.js'
import { setupWebhookServer } from './services/webhookServer.js'

// 初始化配置
initWhitelistConfig()

const puppet = new WechatferryPuppet()
const bot = WechatyBuilder.build({ puppet })

// 设置 webhook 服务器
setupWebhookServer(bot)

bot.on('message', async (msg) => {
    console.log(msg)
    const text = msg.text().trim().toUpperCase()
    const address = msg.text().trim()
    const roomId = msg.payload.roomId
    const userId = msg.payload.talkerId
    const mentionId = msg.mentionList[0]

    // 管理员命令处理
    if (text.startsWith('/ADMIN')) {
        if (!isAdmin(userId)) {
            msg.say('抱歉，您没有管理员权限')
            return
        }

        const [_, action] = text.split(' ')
        const targetId = msg.payload.roomId
        await handleAdminCommand(msg, action, targetId)
        return
    }

    // 检查消息是否来自房间
    if (roomId && !isRoomInWhitelist(roomId)) {
        console.log(`Room ${roomId} not in whitelist, ignoring message`)
        return
    }

    // 处理用户命令
    if (await handleUserCommand(msg, text)) {
        return
    }

    // 处理代币地址查询
    if (await handleTokenCommand(msg, address)) {
        return
    }
})

// 监听配置文件变化
watchConfig(() => {
    console.log('白名单已重新加载')
})

bot.start()
console.log('Bot started with price monitoring')