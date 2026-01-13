const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
      port: 8081, // 固定端口
    proxy: {
      '/api': {
        target: 'http://localhost:7573',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      },
      '/loginSuccess': {
        target: 'http://localhost:7771',
        changeOrigin: true
      }
    },
    client: { overlay: false }
  }
})
