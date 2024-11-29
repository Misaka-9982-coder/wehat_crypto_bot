import { axiosInstance } from '../httpClient.js'
import { formatMarketCap } from '../utils/utils.js'

export function parseDexScreenerResponse(data) {
    if (!data || !data.pairs || !data.pairs.length) {
        throw new Error('无效的响应数据结构');
    }

    // 只取第一个交易对数据
    const pair = data.pairs[0];
    const socials = pair.info;

    // 社交媒体链接检查
    const socialLinks = {
        website: socials?.websites?.find(w => w.label === 'Website'),
        tiktok: socials?.websites?.find(w => w.label === 'Tiktok'),
        twitter: socials?.socials?.find(s => s.type === 'twitter'),
        telegram: socials?.socials?.find(s => s.type === 'telegram')
    };

    return {
        // 代币信息
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        address: pair.baseToken.address,

        // 价格数据
        price: pair.priceUsd,
        priceChange5m: pair.priceChange.m5,
        priceChange1h: pair.priceChange.h1,
        priceChange6h: pair.priceChange.h6,
        priceChange24h: pair.priceChange.h24,

        // 市场数据
        marketCap: pair.marketCap,
        volume5m: pair.volume.m5,
        volume1h: pair.volume.h1,
        volume6h: pair.volume.h6,
        volume24h: pair.volume.h24,
        liquidity: pair.liquidity.usd,

        // 交易数据
        transactions: {
            m5: {
                buys: pair.txns.m5.buys,
                sells: pair.txns.m5.sells
            },
            h1: {
                buys: pair.txns.h1.buys,
                sells: pair.txns.h1.sells
            },
            h6: {
                buys: pair.txns.h6.buys,
                sells: pair.txns.h6.sells
            },
            h24: {
                buys: pair.txns.h24.buys,
                sells: pair.txns.h24.sells
            }
        },

        // 交易所信息
        exchange: pair.dexId,
        pair: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,

        // 社交媒体信息
        socials: {
            网站: socialLinks.website ? `✅` : '❌',
            tiktok: socialLinks.tiktok ? `✅` : '❌',
            x: socialLinks.twitter ? `✅` : '❌',
            tg: socialLinks.telegram ? `✅` : '❌'
        },

        // 更新时间
        timestamp: new Date().toISOString()
    };
}

export async function getTokenData(tokenAddress) {
    try {
        const response = await axiosInstance.get(
            `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
        );

        return parseDexScreenerResponse(response.data);
    } catch (error) {
        console.error('获取数据失败:', error.message);
        throw error;
    }
}

function formatPriceChange(change) {
    if (!change) return '--'
    const value = parseFloat(change)
    const arrow = value >= 0 ? '↑' : '↓'
    const color = value >= 0 ? '🟢' : '🔴'
    return `${color} ${Math.abs(value).toFixed(2)}% ${arrow}`
}

export function formatTokenData(data) {
    const socialsString = Object.entries(data.socials)
        .map(([platform, link]) => `${platform}: ${link}`)
        .join(' ');

        // 格式化价格变动
    const priceChanges = `📈 价格变动:\n${formatPriceChange(data.priceChange5m)} 5分钟   ${formatPriceChange(data.priceChange1h)} 1小时\n${formatPriceChange(data.priceChange6h)} 6小时   ${formatPriceChange(data.priceChange24h)} 24小时`;

    return `
🪙 名称: ${data.name} (${data.symbol})
💰 价格: $${parseFloat(data.price)}
📊 市值: $${formatMarketCap(data.marketCap)}
${priceChanges}

📱 媒体: ${socialsString}

更新时间: ${data.timestamp}
  `.trim()
}
