<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">Spring Cloud 微服务登录</h1>
      
      <!-- 登录方式切换标签 -->
      <div class="login-tabs">
        <button 
          :class="['tab-button', { active: loginType === 'password' }]"
          @click="switchLoginType('password')"
        >
          用户名密码登录
        </button>
        <button 
          :class="['tab-button', { active: loginType === 'github' }]"
          @click="switchLoginType('github')"
        >
          GITHUB登录
        </button>
        <button 
          :class="['tab-button', { active: loginType === 'ldap' }]"
          @click="switchLoginType('ldap')"
        >
          LDAP登录
        </button>
      </div>

      <!-- 用户名密码登录表单 -->
      <div v-if="loginType === 'password'" class="login-form">
        <div class="form-group">
          <label>用户名：</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="请输入用户名"
            @keyup.enter="handlePasswordLogin"
          />
        </div>
        <div class="form-group">
          <label>密码：</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            @keyup.enter="handlePasswordLogin"
          />
        </div>
        <button class="login-button" @click="handlePasswordLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>

      <!-- GitHub登录 -->
      <div v-if="loginType === 'github'" class="login-form">
        <p class="login-hint">点击下方按钮使用GitHub账号登录</p>
        <button class="login-button github-button" @click="handleGitHubLogin" :disabled="loading">
          {{ loading ? '跳转中...' : '使用GitHub登录' }}
        </button>
      </div>

      <!-- LDAP登录表单 -->
      <div v-if="loginType === 'ldap'" class="login-form">
        <div class="form-group">
          <label>LDAP用户名：</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="请输入LDAP用户名"
            @keyup.enter="handleLDAPLogin"
          />
        </div>
        <div class="form-group">
          <label>密码：</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            @keyup.enter="handleLDAPLogin"
          />
        </div>
        <button class="login-button" @click="handleLDAPLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

    </div>
  </div>
</template>

<script>
import { loginWithPassword, loginWithGitHub, loginWithLDAP, saveToken, saveUserInfo } from '@/api/auth'

export default {
  name: 'LoginPage',
  data() {
    return {
      loginType: 'password', // password, github, ldap
      form: {
        username: '',
        password: ''
      },
      loading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    switchLoginType(type) {
      this.loginType = type
      this.errorMessage = ''
      this.successMessage = ''
      this.form.username = ''
      this.form.password = ''
    },
    async handlePasswordLogin() {
      if (!this.form.username || !this.form.password) {
        this.errorMessage = '请输入用户名和密码'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await loginWithPassword(this.form.username, this.form.password)
        const body = response.data
        // 后端返回结构：{ code, message, data: { accessToken, role, ... } }
        const token =
          body?.data?.accessToken ||
          body?.token ||
          body?.accessToken ||
          body?.access_token ||
          body?.data?.token

        if (body?.code !== 200) {
          this.errorMessage = `登录失败: ${body?.message || '业务错误'}`
        } else if (token) {
          saveToken(token)
          // 额外保存用户信息（包含角色）
          if (body?.data) {
            saveUserInfo(body.data)
          }
          this.successMessage = `登录成功！即将跳转到商品页...`
          this.$router.push('/product')
        } else {
          this.errorMessage = '登录失败: 响应中未找到token'
        }
      } catch (error) {
        console.error('登录失败:', error)
        if (error.response) {
          const errorData = error.response.data
          this.errorMessage = `登录失败: ${errorData?.message || errorData?.error_description || errorData?.error || errorData?.msg || '未知错误'}`
        } else {
          this.errorMessage = '登录失败: 网络错误，请检查后端服务是否启动'
        }
      } finally {
        this.loading = false
      }
    },
    handleGitHubLogin() {
      this.loading = true
      this.errorMessage = ''
      loginWithGitHub()
    },
    async handleLDAPLogin() {
      if (!this.form.username || !this.form.password) {
        this.errorMessage = '请输入LDAP用户名和密码'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await loginWithLDAP(this.form.username, this.form.password)
        const body = response.data
        const token =
          body?.data?.accessToken ||
          body?.token ||
          body?.accessToken ||
          body?.access_token ||
          body?.data?.token

        if (body?.code !== 200) {
          this.errorMessage = `登录失败: ${body?.message || '业务错误'}`
        } else if (token) {
          saveToken(token)
          if (body?.data) {
            // 与用户名密码登录保持一致，保存用户信息
            saveUserInfo(body.data)
          }
          this.successMessage = `登录成功！即将跳转到商品页...`
          this.$router.push('/product')
        } else {
          this.errorMessage = '登录失败: 响应中未找到token'
        }
      } catch (error) {
        console.error('LDAP登录失败:', error)
        if (error.response) {
          const errorData = error.response.data
          this.errorMessage = `登录失败: ${errorData?.message || errorData?.error_description || errorData?.error || errorData?.msg || '未知错误'}`
        } else {
          this.errorMessage = '登录失败: 网络错误，请检查后端服务是否启动'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.login-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.tab-button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #667eea;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: bold;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-button:hover:not(:disabled) {
  background: #5568d3;
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.github-button {
  background: #24292e;
}

.github-button:hover:not(:disabled) {
  background: #1a1e22;
}

.login-hint {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
}

.success-message {
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
  word-break: break-all;
}

</style>
