import { getTokenData, formatTokenData } from '../services/dexScreenTokenService.js'
import { getMevxTokenInfo } from '../services/mevxTokenService.js'
import { EVMRegex, SolanaRegex, SuiRegex, TronRegex } from '../utils/utils.js'

export async function handleTokenCommand(msg, address) {
    if (SolanaRegex.test(address)) {
        const info = await getMevxTokenInfo(address)
        msg.say(info)
        return true
    }
    else if (TronRegex.test(address)
        || EVMRegex.test(address)
        || SuiRegex.test(address)) {
        try {
            const data = await getTokenData(address)
            msg.say(`${formatTokenData(data)}`)
            return true
        } catch (error) {
            console.log(`获取代币数据失败: ${error.message}`)
        }
    }
    return false
}