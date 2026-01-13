<template>
  <div class="page">
    <header class="header">
      <h1>商品管理</h1>
      <div class="actions">
        <router-link to="/login" class="link">返回登录</router-link>
      </div>
    </header>

    <section class="card">
      <h3>新增商品</h3>
      <div class="form-row">
        <input
          v-model="newProductName"
          type="text"
          placeholder="输入商品名称"
          @keyup.enter="handleAdd"
        />
        <button :disabled="loading" @click="handleAdd">
          {{ loading ? '处理中...' : '添加' }}
        </button>
      </div>
      <p class="hint">需要 EDITOR 权限以上。</p>
    </section>

    <section class="card">
      <div class="card-header">
        <h3>商品列表</h3>
        <div class="pager">
          <button :disabled="page <= 1 || loading" @click="changePage(page - 1)">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页（共 {{ total }} 条）</span>
          <button :disabled="page >= totalPages || loading" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>

      <div class="table">
        <div class="thead">
          <span>ID</span>
          <span>名称</span>
          <span>操作</span>
        </div>
        <div v-for="item in records" :key="item.id" class="row">
          <span>{{ item.id }}</span>
          <span v-if="editId !== item.id">{{ item.name }}</span>
          <span v-else>
            <input v-model="editName" type="text" />
          </span>
          <span class="ops">
            <template v-if="editId === item.id">
              <button :disabled="loading" @click="saveEdit(item.id)">保存</button>
              <button :disabled="loading" @click="cancelEdit">取消</button>
            </template>
            <template v-else>
              <button :disabled="loading" @click="startEdit(item)">编辑</button>
              <button :disabled="loading" class="danger" @click="remove(item.id)">删除</button>
            </template>
          </span>
        </div>
      </div>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success">{{ successMessage }}</div>
    </section>

    <!-- 权限不足弹框 -->
    <div v-if="showPermissionModal" class="modal-overlay" @click="closePermissionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>权限不足</h3>
          <button class="modal-close" @click="closePermissionModal">×</button>
        </div>
        <div class="modal-body">
          <p>{{ permissionMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="closePermissionModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct
} from '@/api/product'
import { getUserInfo } from '@/api/auth'

export default {
  name: 'ProductPage',
  data() {
    return {
      page: 1,
      size: 10,
      total: 0,
      records: [],
      newProductName: '',
      editId: null,
      editName: '',
      loading: false,
      errorMessage: '',
      successMessage: '',
      userRole: null,
      showPermissionModal: false,
      permissionMessage: ''
    }
  },
  computed: {
    totalPages() {
      return this.total > 0 ? Math.ceil(this.total / this.size) : 1
    },
    // 只有 EDITOR / ADMIN / PRODUCT_ADMIN 等高权限角色可以编辑
    canEdit() {
      if (!this.userRole) return false
      const upper = String(this.userRole).toUpperCase()
      // 后端目前返回的普通角色是 COMMON，其它视为有编辑权限
      return upper !== 'COMMON'
    }
  },
  created() {
    const info = getUserInfo()
    this.userRole = info?.role || null
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      this.errorMessage = ''
      try {
        const res = await fetchProducts(this.page, this.size)
        const body = res.data
        if (body?.code !== 200) {
          this.errorMessage = body?.message || '查询失败'
          return
        }
        this.total = body?.data?.total || 0
        this.records = body?.data?.records || []
      } catch (err) {
        console.error('查询失败', err)
        this.errorMessage = err?.response?.data?.message || '网络错误或未授权'
      } finally {
        this.loading = false
      }
    },
    async handleAdd() {
      if (!this.canEdit) {
        this.showPermissionModal = true
        this.permissionMessage = '权限不足：只有 EDITOR / ADMIN 及以上角色才能新增商品'
        return
      }
      if (!this.newProductName) {
        this.errorMessage = '请输入商品名称'
        return
      }
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        const res = await addProduct(this.newProductName)
        const body = res.data
        if (body?.code !== 200) {
          this.errorMessage = body?.message || '新增失败'
        } else {
          this.successMessage = '新增成功'
          this.newProductName = ''
          this.loadList()
        }
      } catch (err) {
        console.error('新增失败', err)
        this.errorMessage = err?.response?.data?.message || '网络错误或权限不足'
      } finally {
        this.loading = false
      }
    },
    startEdit(item) {
      if (!this.canEdit) {
        this.showPermissionModal = true
        this.permissionMessage = '权限不足：只有 EDITOR / ADMIN 及以上角色才能修改商品'
        return
      }
      this.editId = item.id
      this.editName = item.name
      this.errorMessage = ''
      this.successMessage = ''
    },
    cancelEdit() {
      this.editId = null
      this.editName = ''
    },
    async saveEdit(id) {
      if (!this.editName) {
        this.errorMessage = '名称不能为空'
        return
      }
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        const res = await updateProduct(id, this.editName)
        const body = res.data
        if (body?.code !== 200) {
          this.errorMessage = body?.message || '修改失败'
        } else {
          this.successMessage = '修改成功'
          this.editId = null
          this.editName = ''
          this.loadList()
        }
      } catch (err) {
        console.error('修改失败', err)
        this.errorMessage = err?.response?.data?.message || '网络错误或权限不足'
      } finally {
        this.loading = false
      }
    },
    async remove(id) {
      if (!this.canEdit) {
        this.showPermissionModal = true
        this.permissionMessage = '权限不足：只有 EDITOR / ADMIN 及以上角色才能删除商品'
        return
      }
      if (!confirm('确认删除该商品吗？')) return
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        const res = await deleteProduct(id)
        const body = res.data
        if (body?.code !== 200) {
          this.errorMessage = body?.message || '删除失败'
        } else {
          this.successMessage = '删除成功'
          this.loadList()
        }
      } catch (err) {
        console.error('删除失败', err)
        this.errorMessage = err?.response?.data?.message || '网络错误或权限不足'
      } finally {
        this.loading = false
      }
    },
    changePage(p) {
      if (p < 1 || p > this.totalPages) return
      this.page = p
      this.loadList()
    },
    closePermissionModal() {
      this.showPermissionModal = false
      this.permissionMessage = ''
    }
  }
}
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  color: #333;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.header h1 {
  margin: 0;
  font-size: 22px;
}
.actions .link {
  color: #667eea;
  text-decoration: none;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}
.card h3 {
  margin: 0 0 12px;
}
.form-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}
.form-row input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.form-row button {
  padding: 8px 14px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.form-row button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.hint {
  color: #888;
  font-size: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.pager button {
  padding: 4px 10px;
}
.table {
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
}
.thead, .row {
  display: grid;
  grid-template-columns: 80px 1fr 180px;
  padding: 10px;
  align-items: center;
}
.thead {
  background: #f7f7fb;
  font-weight: 600;
}
.row:nth-child(odd) {
  background: #fafafa;
}
.ops button {
  margin-right: 8px;
  padding: 4px 10px;
}
.ops .danger {
  background: #e65b6e;
  color: #fff;
  border: none;
}
.error {
  margin-top: 12px;
  color: #c33;
  background: #fee;
  padding: 10px;
  border-radius: 4px;
}
.success {
  margin-top: 12px;
  color: #2f8f2f;
  background: #eef9ee;
  padding: 10px;
  border-radius: 4px;
}

/* 权限不足弹框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.modal-btn {
  padding: 8px 20px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.modal-btn:hover {
  background: #5568d3;
}
</style>
