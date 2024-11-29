// httpClient.js
import axios from 'axios'
import https from 'https'
import { PROXY_CONFIG } from './config.js'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  timeout: 60000
})

export const axiosInstance = axios.create({
  httpsAgent,
  proxy: {
    protocol: 'http',
    host: PROXY_CONFIG.host,
    port: PROXY_CONFIG.port
  },
  timeout: 30000,
  maxRedirects: 5
})