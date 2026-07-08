# GitMaster 部署指南（DEPLOYMENT）

> 本文档覆盖 GitMaster（纯客户端 SPA，`vite build` → `dist/`）在 Vercel 上的 **CI/CD 自动部署**，以及其他静态托管平台的手动部署方式。
> 仓库默认 `base: './'`（相对路径），对**任意静态托管 + 子路径**都友好。
> 相关 CI/CD 见 `.github/workflows/`：`deploy.yml`（Vercel 生产部署）、`preview.yml`（PR 预览部署）、`ci.yml`（lint/typecheck/test 门禁）、`release.yml`（发版）。

---

## 0. 前置：构建产物

```bash
pnpm install
pnpm build          # 输出到 dist/
```

> 本仓库以 **pnpm** 为唯一包管理器（已删除 `bun.lockb` / `package-lock.json`）。Node 版本见 `.nvmrc`（`22`）。

---

## 1. Vercel（CI/CD 自动部署 · 推荐）

GitMaster 的官方部署目标。Push 到 `main` 自动上线生产环境，每个 PR 自动生成预览环境。

### 1.1 在 Vercel 创建项目

1. 打开 [vercel.com/new](https://vercel.com/new) → **Import** 你的 GitHub 仓库 `gitverse-learn`。
2. Framework Preset 选 **Vite**；构建命令 `pnpm build`；输出目录 `dist`（仓库根已含 `vercel.json`，会自动识别）。
3. 在项目 **Settings → Environment Variables** 设置 `NODE_VERSION=22`（与 `.nvmrc` 一致）。
4. （可选）在 **Settings → Domains** 绑定自定义域名 `gitmaster.qqyule.top`。

> 首次导入后，Vercel 会分配一个 `*.vercel.app` 域名，可直接访问。

### 1.2 获取三个 Secret

在 GitHub 仓库 `Settings → Secrets and variables → Actions → New repository secret` 中添加：

| Secret 名称 | 获取方式 |
| --- | --- |
| `VERCEL_TOKEN` | Vercel 控制台 → Settings → Tokens → 新建一个 **Access Token**（Full Account 权限），复制值 |
| `VERCEL_ORG_ID` | 项目 **Settings → General** 页面底部的 **Team ID / Org ID**（形如 `team_xxx` 或个人 `usr_xxx`） |
| `VERCEL_PROJECT_ID` | 项目 **Settings → General** 页面底部的 **Project ID**（形如 `prj_xxx`） |

### 1.3 触发部署

- **生产**：push 到 `main`（或手动在 Actions 运行 `Deploy to Vercel`）→ `deploy.yml` 构建并发布到生产环境。
- **预览**：打开 / 更新 PR → `preview.yml` 生成 Vercel 预览部署，并在 PR 下自动留言预览链接（`PREVIEW_URL`）。

> `BetaHuhn/deploy-to-vercel-action` 会读取上述 Secrets 完成部署，无需 `vercel link` 交互。
> 如需固定版本，可将 `deploy.yml` / `preview.yml` 中的 `BetaHuhn/deploy-to-vercel-action@v1` 改为具体版本（如 `@v1.10.0`）。

**SPA 说明**：当前使用 `HashRouter`，Vercel 直接可用，**无需 rewrite**。若后续在 **M2** 切换为 `BrowserRouter`，在 `vercel.json` 增加：

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## 2. EdgeOne Pages（腾讯云，贴合用户生态）

腾讯云 **EdgeOne Pages** 对前端框架/静态站点有一键接入：

**方式 A：Git 联动（推荐）**
1. EdgeOne 控制台 → EdgeOne Pages → 新建项目 → 关联 GitHub 仓库 `gitverse-learn`。
2. 构建命令：`pnpm install && pnpm build`；输出目录：`dist`。
3. 节点/环境变量：`NODE_VERSION=22`（与 `.nvmrc` 一致）。
4. 绑定自定义域名 `gitmaster.qqyule.top`。

**方式 B：CLI 手动部署**
```bash
pnpm add -g edgeone
edgeone pages deploy dist --project gitmaster
```

**SPA 说明**：`HashRouter` 下无需 rewrite。若后续在 **M2** 切换为 `BrowserRouter`，需在 EdgeOne 函数/重定向规则中添加 **SPA fallback**：所有非静态资源路径回退到 `index.html`。

---

## 3. Netlify

1. 新建 site → 关联仓库；Build command：`pnpm build`；Publish directory：`dist`。
2. Node 版本：在 `netlify.toml` 或 Site settings → Environment 设置 `NODE_VERSION=22`。
3. 绑定自定义域名 `gitmaster.qqyule.top`。

**SPA fallback（仅当使用 BrowserRouter 时）**，`netlify.toml`：

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

`HashRouter` 下可省略 redirects。

---

## 5. 阿里云 ESA（README 已提及）

README 声明「本项目由阿里云 ESA 提供加速、计算和保护」。ESA（Edge Security Acceleration）定位为边缘加速 + 安全防护，通常**叠加在源站之上**：

**推荐架构**：源站用 GitHub Pages / EdgeOne / Vercel 任一；ESA 作为边缘接入层做加速、WAF、缓存与自定义域名 `gitmaster.qqyule.top`。

**ESA 侧配置思路**：
1. 在阿里云 ESA 添加站点 `gitmaster.qqyule.top`，按引导修改 DNS NS 记录。
2. 回源地址填写真实源站域名（如 GitHub Pages 的 `qqyule.github.io`）。
3. 开启「全站加速 / 边缘缓存」；对 `dist/` 静态资源（带 content hash）设置长缓存，对 `index.html` 设置不缓存或短缓存。
4. 如需国内部署低延迟，可让 ESA 回源到国内节点（EdgeOne/阿里 OSS 静态站）。

**SPA 说明**：ESA 边缘函数可做 rewrite 实现 `BrowserRouter` 的 SPA fallback；`HashRouter` 下无需处理。

---

## 6. 平台对比速查

| 平台 | 触发方式 | SPA(HashRouter) | SPA(BrowserRouter) | 自定义域名 |
| --- | --- | --- | --- | --- |
| **Vercel（官方）** | `deploy.yml` / `preview.yml` 自动 | 无需配置 | `vercel.json` rewrite | 支持 |
| GitHub Pages | 手动 / 旧 `deploy.yml` | 无需配置 | 需 404.html 回退 | 支持 |
| EdgeOne Pages | Git/CLI | 无需配置 | 需边缘函数 rewrite | 支持 |
| Netlify | Git | 无需配置 | `netlify.toml` redirect | 支持 |
| 阿里云 ESA | 叠加边缘层 | 无需配置 | 边缘函数 rewrite | 支持 |

> Vercel 为本项目 CI/CD 默认目标；其余平台作为手动备选。

> 结论：当前 `HashRouter` + `base: './'` 方案在**所有上述平台零额外配置**即可上线；SEO 优化（改用 `BrowserRouter`）留待 **M2**，届时按需在各平台补充 SPA fallback。
