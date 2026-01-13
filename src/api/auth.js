import axios from 'axios'

// 配置axios基础URL
// 走 /api 前缀，交给 vue.config.js 的 devServer.proxy 处理跨域
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

/**
 * 用户名密码登录（数据库认证）
 * 最终请求路径：前端调用 /api/auth/login，经代理转发到 http://localhost:7573/auth/login
 */
export function loginWithPassword(username, password, loginType = 'USER') {
  return apiClient.post(
    '/auth/login',
    {
      username,
      password,
      loginType
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

/**
 * GitHub OAuth2登录 - 重定向到GitHub授权页面
 * 这里按你的后端要求，直接跳转网关地址，不走前端代理
 */
export function loginWithGitHub() {
  window.location.href = 'http://localhost:7573/auth/oauth2/authorization/github'
}

/**
 * LDAP登录
 * 使用与用户名密码登录相同的接口：/auth/login，只是 loginType = 'LDAP'
 * 最终请求路径：/api/auth/login -> http://localhost:7573/auth/login
 */
export function loginWithLDAP(username, password) {
  return apiClient.post(
    '/auth/login',
    {
      username,
      password,
      loginType: 'LDAP'
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

/**
 * 保存token到localStorage
 */
export function saveToken(token) {
  localStorage.setItem('access_token', token)
}

/**
 * 获取token
 */
export function getToken() {
  return localStorage.getItem('access_token')
}

/**
 * 清除token
 */
export function clearToken() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_info')
}

/**
 * 保存用户信息（包含角色）
 */
export function saveUserInfo(user) {
  localStorage.setItem('user_info', JSON.stringify(user || {}))
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  const raw = localStorage.getItem('user_info')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}
