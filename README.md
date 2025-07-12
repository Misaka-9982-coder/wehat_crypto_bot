# 微信加密货币机器人 🤖

一个功能强大的微信机器人，专为加密货币交易者和投资者设计。支持实时价格查询、代币信息检索、Gas 费用监控以及多链代币地址解析。

## ✨ 核心功能

### 🔍 价格查询
- **多交易所价格聚合**: 支持币安、OKX、Bitget、CoinGecko 等主流交易所
- **实时价格监控**: 快速获取主流加密货币最新价格
- **智能价格筛选**: 自动选择最可靠的价格源

### 🏗️ 多链代币支持
- **以太坊 (EVM)**: 支持所有 EVM 兼容链的代币查询
- **Solana**: 完整的 Solana 生态代币信息
- **Tron**: TRX 和 TRC-20 代币支持
- **Sui**: Sui 网络代币查询

### ⛽ Gas 费用监控
- 实时 Gas 价格查询
- 多档位 Gas 费用建议
- 网络拥堵状态提醒

### 🔐 权限管理
- **管理员系统**: 多级权限控制
- **白名单机制**: 精确控制服务范围
- **安全防护**: 防止滥用和恶意请求

### 📊 数据存储
- **MongoDB 集成**: 完整的消息历史记录
- **数据分析**: 用户行为和查询统计
- **配置热更新**: 无需重启即可更新配置

### 🌐 Webhook 支持
- **外部集成**: 支持第三方服务推送
- **群发消息**: 批量通知功能
- **API 接口**: RESTful API 设计

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MongoDB >= 4.4
- 微信电脑版客户端
- 稳定的网络连接（建议使用代理）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/Misaka-9982-coder/wehat_crypto_bot.git
cd wehat_crypto_bot
```

2. **安装依赖**
```bash
npm install
```

3. **配置文件设置**

复制示例配置文件：
```bash
cp config.js.example config.js
cp config.json.example config.json
```

4. **配置 MongoDB**

安装并启动 MongoDB：[官方安装指南](https://www.mongodb.com/zh-cn/docs/manual/installation/)

5. **配置代理（可选但推荐）**

编辑 `config.js`：
```javascript
export const PROXY_CONFIG = {
    host: '127.0.0.1',    // 代理服务器地址
    port: 7890            // 代理端口
}
```

6. **配置 CoinGecko API**

获取 API Key：[CoinGecko API](https://www.coingecko.com/api/documentations/v3)

```javascript
export const COINGECKO_CONFIG = {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: 'your_api_key_here'
}
```

7. **设置权限配置**

编辑 `config.json`：
```json
{
  "adminUsers": [
    "wxid_your_admin_id"
  ],
  "whitelistRooms": [
    "room_id_1@chatroom",
    "room_id_2@chatroom"
  ]
}
```

8. **启动机器人**
```bash
npm start
```

## 📖 使用指南

### 基础命令

| 命令 | 功能 | 示例 |
|------|------|------|
| `/help` | 显示帮助信息 | `/help` |
| `/gas` | 查询 Gas 价格 | `/gas` |
| `/btc` | 查询 BTC 价格 | `/btc` |
| `/eth` | 查询 ETH 价格 | `/eth` |
| `$代币名` | 按名称查询代币 | `$doge` |

### 代币地址查询

直接发送代币合约地址，机器人会自动识别并返回详细信息：

- **以太坊**: `0x1234567890123456789012345678901234567890`
- **Solana**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **Tron**: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`

### 管理员命令

仅限管理员使用：

| 命令 | 功能 |
|------|------|
| `/admin add` | 添加群聊到白名单 |
| `/admin remove` | 从白名单移除群聊 |
| `/admin list` | 查看当前白名单 |

## 🔧 高级配置

### Webhook 配置

机器人内置 Express 服务器，支持接收外部 Webhook 推送：

```javascript
// POST /webhook
{
    "message": "要推送的消息内容",
    "tweet": {
        "text": "Twitter 推文内容"
    }
}
```

### 数据库配置

默认连接本地 MongoDB：
```javascript
// config/database.js 中修改连接字符串
const mongoUrl = 'mongodb://localhost:27017/wechat-crypto-bot'
```

### 自定义交易所

在 `services/exchangeServices.js` 中添加新的交易所支持：

```javascript
export async function getNewExchangePrice(symbol) {
    // 实现新交易所的价格获取逻辑
}
```

## 📁 项目结构

```
wechat-crypto-bot/
├── commands/              # 命令处理模块
│   ├── adminCommands.js   # 管理员命令
│   ├── tokenCommands.js   # 代币查询命令
│   └── userCommands.js    # 用户命令
├── config/                # 配置文件
│   └── database.js        # 数据库配置
├── models/                # 数据模型
│   └── message.js         # 消息模型
├── services/              # 服务模块
│   ├── dexScreenTokenService.js  # DexScreener API
│   ├── exchangeServices.js       # 交易所 API
│   ├── gasService.js             # Gas 费用服务
│   ├── mevxTokenService.js       # MEV-X 服务
│   ├── priceService.js           # 价格聚合服务
│   └── webhookServer.js          # Webhook 服务器
├── utils/                 # 工具函数
│   ├── utils.js          # 通用工具
│   └── whitelistConfig.js # 白名单配置
├── config.js.example      # 配置模板
├── config.json.example    # JSON 配置模板
├── httpClient.js          # HTTP 客户端
├── index.js              # 入口文件
└── package.json          # 依赖配置
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## ⚠️ 免责声明

本机器人仅用于信息查询和学习目的，不构成投资建议。加密货币投资有风险，请谨慎决策。

## 🐛 问题反馈

如遇到问题，请在 [Issues](https://github.com/Misaka-9982-coder/wehat_crypto_bot/issues) 页面提交详细描述。

## 📞 联系方式

- GitHub: [@Misaka-9982-coder](https://github.com/Misaka-9982-coder)
- 项目主页: [wehat_crypto_bot](https://github.com/Misaka-9982-coder/wehat_crypto_bot)

---

⭐ 如果这个项目对您有帮助，请给它一个 Star！
