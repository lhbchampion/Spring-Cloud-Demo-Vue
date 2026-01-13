import axios from 'axios'
import { getToken } from './auth'

// 使用 /api 前缀，走 devServer 代理到网关
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 商品列表
export function fetchProducts(page = 1, size = 10) {
  return apiClient.get('/product', {
    params: { page, size },
    headers: authHeaders()
  })
}

// 新增商品
export function addProduct(name) {
  return apiClient.post(
    '/product',
    { name },
    { headers: authHeaders() }
  )
}

// 修改商品
export function updateProduct(id, name) {
  return apiClient.put(
    `/product/${id}`,
    { name },
    { headers: authHeaders() }
  )
}

// 删除商品
export function deleteProduct(id) {
  return apiClient.delete(`/product/${id}`, {
    headers: authHeaders()
  })
}
