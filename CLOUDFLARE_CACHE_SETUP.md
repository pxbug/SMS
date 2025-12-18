# Cloudflare CDN 缓存配置指南

## 🎯 目标
通过配置 Cloudflare Cache Rules，大幅减少源站请求，避免访问额度被刷爆。

---

## 📝 配置步骤

### 1️⃣ 登录 Cloudflare Dashboard
访问：https://dash.cloudflare.com/

### 2️⃣ 进入 Cache Rules 配置
```
选择你的域名 -> Caching -> Cache Rules
```

### 3️⃣ 创建缓存规则

#### **规则 1：静态资源长缓存（图片/GIF）**
- **规则名称**：`Static Assets Cache`
- **匹配条件**：
  ```
  Hostname equals: proxy.zk99999.dpdns.org
  AND
  URI Path matches: .*\.(gif|png|jpg|jpeg|webp|ico|svg)$
  ```
- **缓存设置**：
  - ✅ **Edge TTL**: 选择 `Ignore cache-control`，设置为 **1 Month**（一个月）
  - ✅ **Browser TTL**: 设置为 **1 Month**
  - ✅ **Cache Everything**: 启用

---

#### **规则 2：HTML 页面中等缓存**
- **规则名称**：`HTML Pages Cache`
- **匹配条件**：
  ```
  Hostname equals: proxy.zk99999.dpdns.org
  AND
  URI Path matches: .*\.(html|htm)$
  ```
- **缓存设置**：
  - ✅ **Edge TTL**: 选择 `Ignore cache-control`，设置为 **1 Hour**（1小时）
  - ✅ **Browser TTL**: 设置为 **1 Hour**
  - ✅ **Cache Everything**: 启用

---

#### **规则 3：API 代理不缓存**
- **规则名称**：`API Proxy No Cache`
- **匹配条件**：
  ```
  Hostname equals: proxy.zk99999.dpdns.org
  AND
  URI Path starts with: /api/
  ```
- **缓存设置**：
  - ✅ **Edge TTL**: 选择 `Bypass cache`（绕过缓存）
  - ✅ **Browser TTL**: 不缓存

---

## 🔥 推荐的完整配置

### Cloudflare Cache Rules 优先级顺序（从高到低）：

| 优先级 | 规则名称 | 匹配条件 | Edge TTL | 说明 |
|--------|----------|----------|----------|------|
| **1** | API Proxy No Cache | `/api/*` | Bypass | 代理请求不缓存 |
| **2** | Static Assets Cache | `*.gif, *.png, *.jpg` | 1 Month | 静态资源长缓存 |
| **3** | HTML Pages Cache | `*.html` | 1 Hour | HTML 页面短缓存 |

---

## 📊 预期效果

### 优化前（当前状态）：
- ❌ 每次访问都请求源站
- ❌ 访问额度：137,030 / 100,000（超限 37%）
- ❌ logo.gif (672KB) 每次都重新加载
- ❌ index.html (182KB) 每次都重新加载

### 优化后（配置 Cache Rules）：
- ✅ 静态资源缓存 30 天，CDN 直接返回
- ✅ HTML 缓存 1 小时，大幅减少请求
- ✅ 预计减少 **80-90%** 的源站请求
- ✅ 访问额度消耗降低到原来的 **10-20%**

---

## ⚙️ 高级优化建议

### 1. 启用 Cloudflare 压缩
```
Optimization -> Speed -> Optimization
- ✅ Auto Minify: HTML, CSS, JavaScript
- ✅ Brotli Compression: 启用
- ✅ Early Hints: 启用
```

### 2. 启用 Argo Smart Routing（可选，付费功能）
- 智能路由，进一步加速全球访问
- 减少延迟 30%

### 3. 图片优化（免费）
```
Optimization -> Speed -> Image Optimization
- ✅ Polish: Lossless（无损压缩）
- ✅ WebP 转换: 自动启用
```

---

## 🧪 验证缓存是否生效

### 方法 1：检查响应头
```bash
curl -I https://proxy.zk99999.dpdns.org/logo.gif
```

**应该看到**：
```
CF-Cache-Status: HIT
Cache-Control: public, max-age=2592000
```

### 方法 2：浏览器开发者工具
1. 打开浏览器 F12
2. 切换到 Network 标签
3. 刷新页面
4. 查看 `logo.gif` 请求：
   - ✅ **Status**: `200 (from disk cache)` 或 `304`
   - ✅ **CF-Cache-Status**: `HIT`

---

## 📈 监控缓存效果

### Cloudflare Analytics 查看
```
Analytics -> Traffic -> Cached Requests
```

观察指标：
- **Cache Hit Rate**（缓存命中率）：应该达到 **80%+**
- **Bandwidth Saved**（节省带宽）：应该显著提升
- **Requests**（请求数）：源站请求大幅下降

---

## 🚨 注意事项

1. **清除缓存**：
   ```
   Caching -> Configuration -> Purge Cache -> Purge Everything
   ```

2. **更新内容后**：
   - 修改 `index.html` 后，需要清除缓存才能立即生效
   - 或者等待 1 小时缓存自动过期

3. **API 代理**：
   - `/api/proxy` 不会被缓存，确保数据实时性

---

## 💡 额外建议

### 使用 Cloudflare Images（可选，付费）
- 将 `logo.gif` (672KB) 迁移到 Cloudflare Images
- 自动优化、自动缓存、全球 CDN
- 价格：$5/月（5万张图片）

### 使用 Cloudflare Workers KV（可选）
- 将静态资源存储在 KV 中
- 完全不消耗 Pages 配额
- 免费额度：100,000 读取/天

---

## ✅ 总结

配置 Cloudflare Cache Rules 后：
1. **静态资源**（图片、GIF）缓存 1 个月 → CDN 直接返回，不消耗源站额度
2. **HTML 页面**缓存 1 小时 → 大幅减少重复请求
3. **API 代理**不缓存 → 保证数据实时性
4. **预计节省 80-90% 访问额度** 🎉

立即配置，几分钟内即可生效！
