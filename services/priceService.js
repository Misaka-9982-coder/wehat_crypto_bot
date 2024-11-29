// services/priceService.js
import { getBinancePrice, getOKXPrice, getBitgetPrice, getCoinGeckoPrice } from './exchangeServices.js'

export async function getCryptoPrice(symbol) {
  try {
    const results = await Promise.all([
      getBinancePrice(symbol).catch(() => null),
      getOKXPrice(symbol).catch(() => null),
      getBitgetPrice(symbol).catch(() => null),
      getCoinGeckoPrice(symbol).catch(() => null)
    ]);

    const validResult = results.find(result => result !== null);
    return validResult || `未找到 ${symbol} 的价格数据`;

  } catch (error) {
    return `获取${symbol}价格失败: ${error.message}`;
  }
}