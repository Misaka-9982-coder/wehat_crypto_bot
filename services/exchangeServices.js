// services/exchangeServices.js
import { axiosInstance } from '../httpClient.js'
import { COINGECKO_CONFIG } from '../config.js'
import { formatMarketCap } from '../utils/utils.js'

export async function getBinancePrice(symbol) {
    const pairSymbol = `${symbol}USDT`;
    const response = await axiosInstance.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${pairSymbol}`,
        {
            headers: {
                'accept': 'application/json'
            }
        }
    );

    const ticker = response.data;
    if (!ticker) return null;

    const price = parseFloat(ticker.lastPrice).toFixed(ticker.lastPrice < 1 ? 6 : 2);
    const change24h = parseFloat(ticker.priceChangePercent).toFixed(2);
    const volume = parseFloat(ticker.quoteVolume);
    const arrow = change24h >= 0 ? '↑' : '↓';

    return `${symbol}/USDT
价格: $${price}
24h涨跌: ${change24h}% ${arrow}
24h成交额: $${formatMarketCap(volume)}
数据来源: Binance`;
}

export async function getOKXPrice(symbol) {
    const instId = `${symbol}-USDT`;
    const fullUrl = `https://www.okx.com/api/v5/market/ticker?instId=${instId}`;

    const response = await axiosInstance.get(fullUrl, {
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        }
    });

    if (response.data.code !== '0' || !response.data.data?.[0]) return null;

    const tickerData = response.data.data[0];
    const price = tickerData.last;
    const change24h = ((parseFloat(tickerData.last) - parseFloat(tickerData.open24h)) / parseFloat(tickerData.open24h) * 100).toFixed(2);
    const volume = parseFloat(tickerData.vol24h) * parseFloat(price);
    const arrow = change24h >= 0 ? '↑' : '↓';

    return `${symbol}/USDT
价格: $${price}
24h涨跌: ${change24h}% ${arrow}
24h成交额: $${formatMarketCap(volume)}
数据来源: OKX`;
}

export async function getBitgetPrice(symbol) {
    const pairSymbol = `${symbol}USDT`;
    const response = await axiosInstance.get(
        `https://api.bitget.com/api/v2/spot/market/tickers?symbol=${pairSymbol}`,
        {
            headers: {
                'accept': 'application/json'
            }
        }
    );

    const data = response.data;
    if (data.code !== '00000' || !data.data?.[0]) return null;

    const ticker = data.data[0];
    const change24h = ((parseFloat(ticker.lastPr) - parseFloat(ticker.open)) / parseFloat(ticker.open) * 100).toFixed(2);
    const arrow = change24h >= 0 ? '↑' : '↓';
    const volume = parseFloat(ticker.quoteVolume);

    return `${symbol}/USDT
价格: $${ticker.lastPr}
24h涨跌: ${change24h}% ${arrow}
24h成交额: $${formatMarketCap(volume)}
数据来源: Bitget`;
}

export async function getCoinGeckoPrice(symbol) {
    const cgResponse = await axiosInstance.get(
        `${COINGECKO_CONFIG.baseUrl}/simple/price`,
        {
            params: {
                ids: symbol.toLowerCase(),
                vs_currencies: 'usd',
                include_24hr_change: true,
                include_24hr_vol: true
            },
            headers: {
                'accept': 'application/json',
                'x-cg-demo-api-key': COINGECKO_CONFIG.apiKey
            }
        }
    );

    const data = cgResponse.data?.[symbol.toLowerCase()];
    if (!data) return null;

    const price = data.usd;
    const change24h = data.usd_24h_change ? data.usd_24h_change.toFixed(2) : 'N/A';
    const volume = data.usd_24h_vol || 0;
    const arrow = data.usd_24h_change >= 0 ? '↑' : '↓';

    return `${symbol}/USD
价格: $${price}
24h涨跌: ${change24h}% ${arrow}
24h成交额: $${formatMarketCap(volume)}
数据来源: CoinGecko`;
}