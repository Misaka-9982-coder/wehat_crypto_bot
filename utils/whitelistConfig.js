// utils/whitelistConfig.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '../config.json')

export function loadConfig() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        return {
            whitelistRooms: config.whitelistRooms || [],
            adminUsers: config.adminUsers || []
        }
    } catch (error) {
        console.log('加载配置文件失败:', error.message)
        return { whitelistRooms: [], adminUsers: [] }
    }
}

// 保存配置
export function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
        console.log('配置已更新')
        return true
    } catch (error) {
        console.log('保存配置文件失败:', error.message)
        return false
    }
}

// 检查用户是否是管理员
export function isAdmin(userId) {
    const config = loadConfig()
    return config.adminUsers.includes(userId)
}

// 添加管理员
export function addAdmin(userId) {
    const config = loadConfig()
    if (!config.adminUsers.includes(userId)) {
        config.adminUsers.push(userId)
        return saveConfig(config)
    }
    return false
}

// 移除管理员
export function removeAdmin(userId) {
    const config = loadConfig()
    const index = config.adminUsers.indexOf(userId)
    if (index > -1) {
        config.adminUsers.splice(index, 1)
        return saveConfig(config)
    }
    return false
}

// 读取白名单配置
export function loadWhitelistRooms() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        return config.whitelistRooms || []
    } catch (error) {
        console.log('加载配置文件失败，使用空白名单:', error.message)
        return []
    }
}

// utils/whitelistConfig.js

// 保存白名单配置
export function saveWhitelistRooms(newRooms) {
    try {
        // 读取现有配置
        let config = {}
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        } catch (error) {
            // 如果文件不存在或内容为空，使用默认空配置
            config = { whitelistRooms: [] }
        }

        // 确保 whitelistRooms 存在
        if (!Array.isArray(config.whitelistRooms)) {
            config.whitelistRooms = []
        }

        // 将新房间添加到现有列表中（避免重复）
        if (Array.isArray(newRooms)) {
            // 如果传入的是数组
            newRooms.forEach(room => {
                if (!config.whitelistRooms.includes(room)) {
                    config.whitelistRooms.push(room)
                }
            })
        } else if (newRooms && !config.whitelistRooms.includes(newRooms)) {
            // 如果传入的是单个房间
            config.whitelistRooms.push(newRooms)
        }

        // 保存更新后的配置
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
        console.log('白名单配置已更新')
        return true
    } catch (error) {
        console.log('保存配置文件失败:', error.message)
        return false
    }
}

// 添加一个新的函数用于移除特定房间
export function removeRoomFromWhitelist(roomId) {
    try {
        // 读取现有配置
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        
        // 确保 whitelistRooms 存在
        if (!Array.isArray(config.whitelistRooms)) {
            config.whitelistRooms = []
            return false
        }

        // 查找并移除指定房间
        const index = config.whitelistRooms.indexOf(roomId)
        if (index > -1) {
            config.whitelistRooms.splice(index, 1)
            // 保存更新后的配置
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
            console.log('房间已从白名单移除')
            return true
        }
        return false
    } catch (error) {
        console.log('移除房间失败:', error.message)
        return false
    }
}

// 添加一个方便的函数来添加单个房间
export function addRoomToWhitelist(roomId) {
    return saveWhitelistRooms(roomId)
}

// 检查房间是否在白名单中
export function isRoomInWhitelist(roomId) {
    const rooms = loadWhitelistRooms()
    return rooms.includes(roomId)
}

// 初始化配置文件
export function initWhitelistConfig() {
    if (!fs.existsSync(configPath)) {
        saveWhitelistRooms([])
    }
}

// 监听配置文件变化
export function watchConfig(callback) {
    fs.watch(configPath, (eventType) => {
        if (eventType === 'change') {
            console.log('配置文件已更改，重新加载白名单')
            callback && callback()
        }
    })
}