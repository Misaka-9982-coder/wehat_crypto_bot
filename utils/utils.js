// utils.js
export const formatMarketCap = (num) => {
    if (num === null || num === undefined) return '0';
  
    const value = Math.abs(Number(num));
  
    if (value >= 1.0e+12) {
      return (value / 1.0e+12).toFixed(2) + 'T';
    } else if (value >= 1.0e+9) {
      return (value / 1.0e+9).toFixed(2) + 'B';
    } else if (value >= 1.0e+6) {
      return (value / 1.0e+6).toFixed(2) + 'M';
    } else if (value >= 1.0e+3) {
      return (value / 1.0e+3).toFixed(2) + 'K';
    } else {
      return value.toFixed(2);
    }
  }
  
// 检查是否是以pump结尾的Solana地址
export function isPumpToken(address) {
  // 检查是否是Solana地址格式
  const isSolanaAddr = SolanaRegex.test(address)
  // 检查是否以pump结尾
  const endsWithPump = address.toLowerCase().endsWith('pump')
  
  return isSolanaAddr && endsWithPump
}

  export const EVMRegex = /^0x[a-fA-F0-9]{40}$/;
  export const SolanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  export const SuiRegex = /^0x[a-fA-F0-9]{64}(::[\w]+)*$/;
  export const TronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;