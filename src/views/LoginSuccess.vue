<template>
  <div class="login-success-container">
    <div class="loading-box" v-if="loading">
      <div class="spinner"></div>
      <p>正在处理登录信息...</p>
    </div>
    <div class="error-box" v-else-if="errorMessage">
      <h3>登录失败</h3>
      <p>{{ errorMessage }}</p>
      <button @click="goToLogin" class="btn">返回登录页</button>
    </div>
  </div>
</template>

<script>
import { saveToken, saveUserInfo } from '@/api/auth'

export default {
  name: 'LoginSuccessPage',
  data() {
    return {
      loading: true,
      errorMessage: ''
    }
  },
  created() {
    this.handleGitHubCallback()
  },
  methods: {
    async handleGitHubCallback() {
      try {
        // 从 URL 参数中获取 token（后端重定向时传递的）
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        
        if (!token) {
          this.errorMessage = '未找到访问令牌，请重新登录'
          this.loading = false
          return
        }
        
        // 保存 token
        saveToken(token)
        
        // 根据后端代码，GitHub 用户默认角色是 EDITOR
        // 先设置默认用户信息，如果需要完整信息可以后续调用接口获取
        const defaultUserInfo = {
          role: 'EDITOR',
          loginType: 'GITHUB'
        }
        saveUserInfo(defaultUserInfo)
        
        // 尝试调用后端接口获取完整用户信息（如果有的话）
        // 这里可以根据你的后端实际情况调整
        try {
          // 如果后端有获取当前用户信息的接口，可以在这里调用
          // const userResponse = await axios.get('/api/user/current', {
          //   headers: { 'Authorization': `Bearer ${token}` }
          // })
          // if (userResponse.data?.code === 200 && userResponse.data?.data) {
          //   saveUserInfo(userResponse.data.data)
          // }
        } catch (err) {
          // 如果接口不存在或失败，使用默认信息
          console.log('获取用户信息失败，使用默认信息', err)
        }
        
        // 跳转到商品页
        this.$router.push('/product')
      } catch (error) {
        console.error('GitHub 登录回调处理失败:', error)
        this.errorMessage = error?.message || '处理登录信息失败，请重试'
        this.loading = false
      }
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.login-success-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.loading-box,
.error-box {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-box p {
  color: #666;
  margin: 0;
}

.error-box h3 {
  color: #c33;
  margin: 0 0 15px;
}

.error-box p {
  color: #666;
  margin: 0 0 20px;
}

.btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn:hover {
  background: #5568d3;
}
</style>
