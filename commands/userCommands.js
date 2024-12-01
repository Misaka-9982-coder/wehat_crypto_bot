
import { getCryptoPrice } from '../services/priceService.js'
import { getGasPrices } from '../services/gasService.js'
import { getTokenDataByName, formatTokenData } from '../services/dexScreenTokenService.js'

export const userCommands = {
    '/HELP': '显示所有可用命令的帮助信息',
    '/GAS': '查询当前gas价格',
    '/BTC': '查询BTC价格（示例）',
    '/ETH': '查询ETH价格（示例）',
    '合约地址': '直接输入合约地址可查询代币信息'
}

export function formatUserHelpMessage() {
    const lines = ['可用命令列表：']
    for (const [cmd, desc] of Object.entries(userCommands)) {
        lines.push(`${cmd}: ${desc}`)
    }
    return lines.join('\n')
}

export async function handleUserCommand(msg, text) {
    // 添加普通help命令处理
    if (text === '/HELP') {
        msg.say(formatUserHelpMessage())
        return true
    }

    if (text.startsWith('/')) {
        const command = text.slice(1)

        if (command === 'GAS') {
            const gasPrices = await getGasPrices()
            msg.say(gasPrices)
            return true
        } else {
            const price = await getCryptoPrice(command)
            msg.say(price)
            return true
        }
    } else if (text.startsWith('$')) {
        const name = text.slice(1)
        const price = await getTokenDataByName(name)
        msg.say(formatTokenData(price))
        return true
    }

    return false
}
