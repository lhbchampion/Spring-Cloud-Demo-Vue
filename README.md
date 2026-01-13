# spring-cloud-demo-vue


Spring Cloud 微服务前端登录页面

## 功能特性

- ✅ 用户名密码登录（数据库认证）
- ✅ GitHub OAuth2 登录
- ✅ LDAP 登录
- ✅ 三种登录方式切换
- ✅ Token 管理（自动保存到 localStorage）

## 项目设置

```bash
npm install
```

## 启动开发服务器

```bash
npm run serve
```

启动后，访问：**http://localhost:8081** （默认端口，如果被占用会自动使用其他端口）

## 登录页面

登录页面支持三种登录方式：

### 1. 用户名密码登录
- **普通用户**：user_1 / user_1
- **EDITOR**：editor_1 / editor_1
- **PRODUCT_ADMIN**：adm_1 / adm_1

### 2. GitHub OAuth2 登录
点击"使用GitHub登录"按钮，会跳转到GitHub授权页面，登录成功后自动获得 EDITOR 角色。

### 3. LDAP 登录
- **普通用户**：ldap_user_1 / 123456
- **EDITOR**：ldap_editor_1 / 123456
- **PRODUCT_ADMIN**：ldap_adm_1 / 123456

## API 配置

前端默认连接的后端地址：`http://localhost:7573`

如需修改，请编辑 `src/api/auth.js` 文件中的 `baseURL` 配置。

## 构建生产版本

```bash
npm run build
```

## 代码检查

```bash
npm run lint
```

## 项目结构

```
src/
├── api/
│   └── auth.js          # 认证API封装
├── views/
│   └── Login.vue        # 登录页面组件
├── router/
│   └── index.js         # 路由配置
├── App.vue              # 根组件
└── main.js              # 入口文件
```

## 注意事项

1. 确保后端服务（Gateway）已启动在 `http://localhost:7573`
2. 登录成功后，Token 会自动保存到浏览器的 localStorage 中

