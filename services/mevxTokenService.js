// services/tokenAnalyzer.js
import { axiosInstance } from '../httpClient.js'

const MEVX_API = 'https://api.mevx.io/trade/newpairs'

// 格式化数字
function formatNumber(num, decimals = 2) {
  if (!num) return '0'
  if (num < 0.00001) {
    return num.toExponential(decimals)
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

// 格式化金额
function formatUSD(num) {
  if (!num) return '$0'
  if (num >= 1000000) {
    return `$${formatNumber(num / 1000000, 2)}M`
  }
  if (num >= 1000) {
    return `$${formatNumber(num / 1000, 2)}K`
  }
  return `$${formatNumber(num, 2)}`
}

// 计算时间差
function getTimeDiff(timestamp) {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

// 分析买卖压力
function analyzeTradePressure(txns) {
  const h1 = txns.h1
  const buyVolume = h1.vbuys || 0
  const sellVolume = h1.vsells || 0
  const totalVolume = buyVolume + sellVolume

  let pressureAnalysis = '💤 暂无交易'
  let buyPercent = 0

  if (totalVolume > 0) {
    buyPercent = (buyVolume / totalVolume) * 100
    if (buyPercent > 70) {
      pressureAnalysis = '🚀 强烈买入压力'
    } else if (buyPercent > 50) {
      pressureAnalysis = '📈 适中买入压力'
    } else if (buyPercent > 30) {
      pressureAnalysis = '📉 适中卖出压力'
    } else {
      pressureAnalysis = '💧 强烈卖出压力'
    }
  }

  return {
    pressure: pressureAnalysis,
    buyersCount: h1.buyers || 0,
    sellersCount: h1.sellers || 0,
    buyVolume: formatUSD(buyVolume),
    sellVolume: formatUSD(sellVolume)
  }
}

// 分析持仓风险
function analyzeRisks(token) {
  const risks = []

  if (token.holder < 50) {
    risks.push('⚠️ 持有人数过少')
  }

  if (token.top10HolderPercent > 20) {
    risks.push(`⚠️ 前10大持有者集中 (${formatNumber(token.top10HolderPercent)}%)`)
  }

  if (token.Liquidity < 50000) {
    risks.push(`⚠️ 流动性较低 (${formatUSD(token.Liquidity)})`)
  }

  if (!token.urlInfo.telegram && !token.urlInfo.twitter && !token.urlInfo.website) {
    risks.push('⚠️ 无社交媒体信息')
  }

  return risks.length ? risks.join('\n') : '✅ 未发现明显风险'
}

function calculatePriceChanges(txns, currentPrice) {
  const timeframes = {
    '5分钟': txns.m5,
    '1小时': txns.h1,
    '6小时': txns.h6,
    '24小时': txns.h24
  }

  const changes = Object.entries(timeframes).map(([period, data]) => {
    if (!data || !data.price) return `${period}: --`
    
    const priceChange = ((currentPrice - data.price) / data.price * 100)
    const arrow = priceChange >= 0 ? '↑' : '↓'
    const color = priceChange >= 0 ? '🟢' : '🔴'
    
    return `${color} ${period}: ${Math.abs(priceChange).toFixed(2)}% ${arrow}`
  })

  // 将四个时间段分成两行显示，每行两个
  return `${changes[0]}\t${changes[1]}\n${changes[2]}\t${changes[3]}`
}

export async function getMevxTokenInfo(address) {
  try {
    const response = await axiosInstance.get(MEVX_API, {
      params: { token: address },
      headers: {
        'accept': '*/*',
        'accept-language': 'zh,zh-CN;q=0.9,en;q=0.8,en-US;q=0.7',
        'content-type': 'application/json',
        'origin': 'https://mevx.io',
        'priority': 'u=1, i',
        'referer': 'https://mevx.io/',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    })

    const tokens = response.data
    if (!tokens || !tokens.length) {
      return '❌ 未找到该代币信息'
    }

    const token = tokens[0]
    const tradePressure = analyzeTradePressure(token.txns)
    const risks = analyzeRisks(token)
    const priceChanges = calculatePriceChanges(token.txns, token.priceInUSD)

    return `🪙 ${token.name} (${token.symbol})
💰 价格: $${formatNumber(token.priceInUSD, 8)}
📊 市值: ${formatUSD(token.marketCap)}
💧 流动性: ${formatUSD(token.Liquidity)}
${priceChanges}
👥 持有人数: ${token.holder}   • 前10持有: ${formatNumber(token.top10HolderPercent)}%
• 发射进度: ${token.percent >= 100 ? '已发射' : `${token.percent.toFixed(2)}%`}   • Dev持仓: ${token.devBuyPercent}%
${risks}
• 创建时间: ${getTimeDiff(token.createTime)}
• 社交媒体: 网站: ${token.urlInfo.website ? '✅' : '❌'} | x: ${token.urlInfo.twitter ? '✅' : '❌'} | tg: ${token.urlInfo.telegram ? '✅' : '❌'}`

  } catch (error) {
    console.error('获取Token信息失败:', error)
    return '❌ 获取Token信息失败: ' + error.message
  }
}