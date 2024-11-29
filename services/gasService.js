// services/gasService.js
import { axiosInstance } from '../httpClient.js'

// 添加备用 BTC gas API endpoints
const BTC_GAS_APIS = [
  'https://mempool.space/api/v1/fees/recommended',
  'https://blockstream.info/api/fee-estimates',
  'https://api.blockchain.info/mempool/fees'
]

async function tryBTCGasAPIs() {
  for (const api of BTC_GAS_APIS) {
    try {
      const response = await axiosInstance.get(api)

      // 处理不同API的返回格式
      if (api.includes('mempool.space')) {
        const { fastestFee, halfHourFee, hourFee, economyFee } = response.data
        return {
          fast: fastestFee,
          medium: halfHourFee,
          slow: economyFee || hourFee
        }
      } else if (api.includes('blockstream.info')) {
        const estimates = response.data
        return {
          fast: estimates['1'],
          medium: estimates['3'],
          slow: estimates['6']
        }
      } else if (api.includes('blockchain.info')) {
        const { regular, priority } = response.data
        return {
          fast: priority,
          medium: regular,
          slow: Math.floor(regular * 0.8)
        }
      }
    } catch (error) {
      console.log(`BTC gas API ${api} failed:`, error.message)
      continue
    }
  }
  throw new Error('所有BTC gas API都失败了')
}

// 使用免费的 ETH gas API
async function getETHGasPrice() {
  try {
    // 使用 Etherscan API
    const response = await axiosInstance.get('https://api.etherscan.io/api', {
      params: {
        module: 'gastracker',
        action: 'gasoracle'
      }
    })

    if (response.data.status === '1' && response.data.result) {
      const { SafeGasPrice, ProposeGasPrice, FastGasPrice } = response.data.result
      return { fast: FastGasPrice, medium: ProposeGasPrice, slow: SafeGasPrice }
    }

    // 备用：使用 ETH Gas Station API
    const gasStationResponse = await axiosInstance.get('https://ethgasstation.info/api/ethgasAPI.json')
    return {
      fast: Math.round(gasStationResponse.data.fast / 10),
      medium: Math.round(gasStationResponse.data.average / 10),
      slow: Math.round(gasStationResponse.data.safeLow / 10)
    }
  } catch (error) {
    console.error('获取ETH gas失败:', error)
    return null
  }
}

export async function getGasPrices() {
  try {
    let btcGas = null
    let ethGas = null

    try {
      btcGas = await tryBTCGasAPIs()
    } catch (error) {
      console.error('BTC gas获取失败:', error.message)
    }

    try {
      ethGas = await getETHGasPrice()
    } catch (error) {
      console.error('ETH gas获取失败:', error.message)
    }

    let result = ''

    if (btcGas) {
      result += `比特币网络费用 (sat/vB):
⚡ 快速: ${btcGas.fast} 
🚗 中等: ${btcGas.medium}
🐢 慢速: ${btcGas.slow}\n`
    } else {
      result += '获取BTC网络费用失败\n'
    }

    result += '\n'

    if (ethGas) {
      result += `以太坊网络费用 (Gwei):
⚡ 快速: ${ethGas.fast}
🚗 中等: ${ethGas.medium}
🐢 慢速: ${ethGas.slow}`
    } else {
      result += '获取ETH网络费用失败'
    }

    return result

  } catch (error) {
    console.error('获取gas价格失败:', error)
    return '获取网络费用失败'
  }
}