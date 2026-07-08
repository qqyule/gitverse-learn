# GitMaster 技术重构方案（TECH-REFACTOR）

> **角色**：资深前端架构师（Builder）。本文件只给出**可执行的精确规范与命令**，本回合**不实际执行**依赖升级 / 安装 / 构建，以避免破坏当前可运行的应用。
> **路线图阶段**：本文档对应 **M0 地基与 CI/CD**（React 19 / Vite 7 / Tailwind v4 / TS 5.9 + 全链路 CI/CD + 锁文件标准化）。
> **约定**：文档正文用简体中文；代码、命令、YAML 保持英文 / 标准语法。

---

## 0. 背景与目标

GitMaster 当前为纯客户端 SPA（无后端），生产域名 `gitmaster.qqyule.top`，README 提及阿里云 ESA 加速。已知技术债：

1. 仓库同时残留 `bun.lockb` + `package-lock.json` + `pnpm-lock.yaml` 三套锁文件 —— **统一为 pnpm**（本项目已以 pnpm 为准，`pnpm-lock.yaml` 为 `lockfileVersion: '9.0'`）。
2. 曾有一个 AI 代码审查 CI（cr.yml）被添加后删除 —— **本方案不恢复该 bot**。
3. `biome.json` 中多项 a11y 规则被关闭（如 `noSvgWithoutTitle`、`noStaticElementInteractions`、`useKeyWithClickEvents` 等）—— 将在 **M2** 逐步开启。
4. 当前使用 `HashRouter`（`base: './'` 相对路径）—— 静态托管友好、SEO 弱；是否切换 `BrowserRouter` 留待 **M2** 评估。

**M0 目标**：在不改动 `src/*` 与 `package.json` 的前提下，先把工具链版本策略、迁移命令、CI/CD 与锁文件标准化方案固化下来，使后续按阶段执行时有据可依。

---

## 1. 现状技术栈 vs 最新稳定版对比表

> 版本号使用「当前 → 建议」的具体范围。风险等级：**高 / 中 / 低**，指升级引入 breaking change 的概率与回滚成本。

### 1.1 核心框架与构建

| 依赖 | 当前版本 | 建议版本 | 升级理由 | 风险 |
| --- | --- | --- | --- | --- |
| `react` | `^18.3.1` | `^19.1.0` | 并发特性、更优 hydration、未来生态默认目标 | 中 |
| `react-dom` | `^18.3.1` | `^19.1.0` | 与 react 同步 | 中 |
| `@types/react` | `^18.3.23` | `^19.1.0` | 匹配 React 19 类型 | 低 |
| `@types/react-dom` | `^18.3.7` | `^19.1.0` | 匹配 React 19 类型 | 低 |
| `vite` | `^5.4.19` | `^7.0.0` | 更快的构建/依赖预构建、环境 API、长期支持 | 中 |
| `@vitejs/plugin-react-swc` | `^3.11.0` | `^4.0.0` | 兼容 Vite 7 插件契约 | 低 |
| `typescript` | `^5.8.3` | `^5.9.2` | 类型推导与编辑体验改进，5.x 内部小步升级 | 低 |
| `react-router-dom` | `^6.30.1` | `^6.30.1`（保持）/ 后续 `^7.0.0` | v6 已支持 React 19；v7 为框架化大版本，留待 M2 评估 | 中（若升 v7） |

### 1.2 样式

| 依赖 | 当前版本 | 建议版本 | 升级理由 | 风险 |
| --- | --- | --- | --- | --- |
| `tailwindcss` | `^3.4.17` | `^4.1.0` | CSS-first `@theme`、Oxide 引擎更快、零配置 | **高** |
| `@tailwindcss/vite` | —（新增） | `^4.1.0` | Tailwind v4 官方 Vite 插件，替代 PostCSS 链路 | 低 |
| `postcss` | `^8.5.6` | `^8.5.6`（保留）/ 可移除 | v4 经 `@tailwindcss/vite` 后不再需要 PostCSS 链路 | 低 |
| `autoprefixer` | `^10.4.21` | 移除 | v4 引擎内置前缀处理 | 低 |
| `@tailwindcss/typography` | `^0.5.16` | `^0.5.16` | 通过 `@plugin` 在 v4 中兼容 | 低 |
| `tailwindcss-animate` | `^1.0.7` | 替换为 `tw-animate-css ^1.2.0` | 原包未适配 v4；`tw-animate-css` 为 v4 等价实现 | 低 |

### 1.3 质量 / 测试 / 类型（保留为主）

| 依赖 | 当前版本 | 建议版本 | 升级理由 | 风险 |
| --- | --- | --- | --- | --- |
| `@biomejs/biome` | `^2.3.11` | `^2.3.11`（保留） | 已是最新 2.x，a11y 规则在 M2 开启 | 低 |
| `ultracite` | `^7.0.8` | `^7.0.8`（保留） | 已随 Biome 2 | 低 |
| `vitest` | `^4.0.16` | `^4.0.16`（保留） | 已是 4.x 最新线 | 低 |
| `@vitest/ui` | `^4.0.16` | `^4.0.16`（保留） | 跟随 vitest | 低 |
| `jsdom` | `^27.3.0` | `^27.3.0`（保留） | 稳定 | 低 |
| `@testing-library/react` | `^16.3.1` | `^16.3.1`（保留） | 已支持 React 19 | 低 |
| `@testing-library/jest-dom` | `^6.9.1` | `^6.9.1`（保留） | 稳定 | 低 |

### 1.4 运行时依赖（保留为主，确认 React 19 兼容）

| 依赖 | 当前版本 | 建议版本 | 说明 | 风险 |
| --- | --- | --- | --- | --- |
| `@radix-ui/*` | `^1.2.x` / `^2.1.x` | 保持（按 caret 自动取到兼容 19 的发行） | Radix 已支持 React 19 | 低 |
| `zustand` | `^5.0.9` | `^5.0.9` | 已支持 19 | 低 |
| `immer` | `^11.1.0` | `^11.1.0` | 稳定 | 低 |
| `@tanstack/react-query` | `^5.83.0` | `^5.83.0` | 已支持 19 | 低 |
| `react-hook-form` | `^7.61.1` | `^7.61.1` | 已支持 19 | 低 |
| `zod` | `^3.25.76` | `^3.25.76`（保持 v3） | v4 为破坏性大版本，留待后续独立评估 | 中（若升 v4） |
| `i18next` | `^25.7.3` | `^25.7.3` | 稳定 | 低 |
| `react-i18next` | `^16.5.0` | `^16.5.0` | 已支持 19 | 低 |
| `framer-motion` | `^12.23.26` | `^12.23.26`（保留；可选迁移到 `motion` 包） | 12.x 支持 19 | 低 |
| `d3` / `@types/d3` | `^7.9.0` / `^7.4.3` | 保持 | 稳定 | 低 |
| `recharts` | `^2.15.4` | `^2.15.4`（保持 v2） | v3 改动较大，留待后续 | 中（若升 v3） |
| `lucide-react` | `^0.462.0` | 跟随 caret 升级 | 图标库 | 低 |
| `sonner` | `^1.7.4` | `^1.7.4` | 已支持 19 | 低 |

### 1.5 新增依赖（M0–M2 引入）

| 依赖 | 建议版本 | 用途 | 引入阶段 |
| --- | --- | --- | --- |
| `@playwright/test` | `^1.50.0` | E2E 端到端测试 | M0 引入，M1 补全用例 |
| `@changesets/cli` | `^2.27.0` | 版本化与 CHANGELOG 自动化 | M0 引入 |
| `@lhci/cli` | `^0.14.0` | Lighthouse CI（性能/可访问性门禁） | M2 |
| `plausible` / `posthog-js` | 仅前端代码片段 | 隐私友好分析（需用户同意） | M2 |

---

## 2. 逐项迁移方案与命令

### 2.1 锁文件标准化（pnpm 为准）

```bash
# 删除非 pnpm 锁文件与构建缓存，统一为 pnpm
rm -f bun.lockb package-lock.json
rm -rf node_modules

# 用 pnpm 重新生成唯一锁文件（保留现有 pnpm-lock.yaml 亦可，仅删其余）
pnpm install
pnpm -v            # 期望 9.x（与 lockfileVersion 9.0 对齐）

# 在 package.json 增加包管理器声明（后续由维护者执行，本回合不改动）：
#   "packageManager": "pnpm@9.15.0"
```

> 不要在 CI 之外提交 `bun.lockb` / `package-lock.json`。CI 已改为 `pnpm install --frozen-lockfile`，非 pnpm 锁文件会被忽略。

### 2.2 React 18 → 19

```bash
# 升级核心与类型
pnpm add react@^19.1.0 react-dom@^19.1.0
pnpm add -D @types/react@^19.1.0 @types/react-dom@^19.1.0

# 官方 codemod（处理 ref、JSX 命名空间等 breaking change）
pnpm dlx @react-legacy/codemod@latest react-19 ./src
# 或交互式：
# pnpm dlx codemod@latest react/19/migration-rename-unsafe-lifecycles ./src
```

**主要 breaking change（风险 中）**：
- `ref` 不再支持字符串 ref；函数组件 `ref` 需 `forwardRef` 或 React 19 的 `ref` 作为 prop。
- `ReactDOM.render` 已移除（本项目用 `createRoot`，基本无影响）。- `PropTypes` 移除（本项目未用）。
- `useRef()` 初始值必填（TS 类型收紧）。

### 2.3 Tailwind 3.4 → v4（CSS-first 迁移）

核心变化：`tailwind.config.ts` 不再用于主题定义，改为在 CSS 中用 `@theme` 声明设计令牌；构建经 `@tailwindcss/vite` 插件。

```bash
# 安装 v4 与 Vite 插件，移除旧 PostCSS 链路
pnpm add -D tailwindcss@^4.1.0 @tailwindcss/vite@^4.1.0
pnpm remove postcss autoprefixer tailwindcss-animate
pnpm add -D tw-animate-css@^1.2.0
```

**`vite.config.ts` 调整**（新增插件）：

```ts
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => ({
  base: './',
  plugins: [react(), tailwindcss()],
  // ...其余保持不变
}))
```

**`postcss.config.js`**：直接删除（v4 走 Vite 插件，不再需要 PostCSS）。

**`src/index.css`（或全局样式入口）迁移 `tailwind.config.ts` → `@theme`**：

```css
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@tailwindcss/typography";

/* 暗色模式：class 策略（等价旧 darkMode: ['class']） */
@custom-variant dark (&:is(.dark *));

@theme {
  /* 容器等布局令牌可在此声明；原有 container 配置迁移为 @utility container */
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  /* 原有 colors 中 hsl(var(--xxx)) 的设计令牌保留在 :root 变量即可，
     Tailwind v4 通过 @theme inline 引用 CSS 变量 */
}

/* 关键帧（等价旧 keyframes/animation） */
@theme inline {
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

> 原 `tailwind.config.ts` 中 `colors` 大量使用 `hsl(var(--border))` 等语义变量——这些 `--border` 等 CSS 变量定义在 `:root`/`.dark` 中（shadcn 风格），**无需改动**，只需确保它们在全局 CSS 中保留；用 `@theme inline { --color-border: hsl(var(--border)); }` 重新暴露为 Tailwind 颜色工具类即可。建议用一个专用 PR 完成此迁移并跑 Lighthouse/视觉回归。

### 2.4 Vite 5 → 7

```bash
pnpm add -D vite@^7.0.0 @vitejs/plugin-react-swc@^4.0.0
```

**配置调整（风险 中）**：
- Vite 7 要求 Node 20.19+/22.12+，本仓库 `.nvmrc` 已定为 `22`，CI 用 `setup-node@v4` + `node-version-file: .nvmrc`，一致。
- 默认 `server.host` 行为、环境 API（`import.meta.env` 无变化）基本兼容；`build.rollupOptions.manualChunks` 配置可保留。
- 若使用 `vite preview` 的 `--host`，确认无废弃参数。

### 2.5 TypeScript 5.8 → 5.9

```bash
pnpm add -D typescript@^5.9.2
```

**调整**：在 `tsconfig.app.json` 中确认 `moduleResolution: "bundler"` 与 `verbatimModuleSyntax` 按需开启。5.9 主要为类型系统改进，破坏性低；升级后跑 `tsc -p tsconfig.app.json --noEmit` 校验。

### 2.6 新增工具链

```bash
# E2E
pnpm add -D @playwright/test@^1.50.0
pnpm exec playwright install --with-deps chromium

# 版本化
pnpm add -D @changesets/cli@^2.27.0
pnpm exec changeset init

# Lighthouse CI（M2）
pnpm add -D @lhci/cli@^0.14.0
```

`package.json` 建议补充脚本（后续由维护者添加，本回合不改动）：

```json
{
  "scripts": {
    "typecheck": "tsc -p tsconfig.app.json --noEmit",
    "test:e2e": "playwright test",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

---

## 3. 风险与回滚策略

| 风险点 | 等级 | 缓解 / 回滚 |
| --- | --- | --- |
| Tailwind v4 主题断链导致样式丢失 | 高 | 单独 PR 迁移；迁移后用 Playwright 截图对比 + Lighthouse；回滚即 `git revert` 该 PR，锁文件与 `vite.config.ts` 一并回退 |
| React 19 第三方组件未兼容 | 中 | 先升类型与核心，E2E 覆盖核心闭环；个别组件用 `forwardRef` 适配；回滚 `react`/`react-dom` 版本即可 |
| Vite 7 插件不兼容 | 中 | 锁定 `@vitejs/plugin-react-swc@^4`；保留 `manualChunks`；回滚 `vite` 版本 |
| pnpm 锁文件分歧 | 低 | 统一删除 `bun.lockb`/`package-lock.json`；CI 强制 `--frozen-lockfile`，分歧会在 PR 阶段暴露 |

**通用原则**：每个大项（React、Tailwind、Vite、TS）独立 PR、独立可回滚；CI（ci.yml）全绿后方可合并；`main` 经 `deploy.yml` 上线前需在 preview 环境人工确认。

---

## 4. 迁移执行顺序（对应 M0）

1. **M0.1 锁文件标准化**：删除 `bun.lockb`/`package-lock.json`，确立 pnpm 唯一；补 `.nvmrc`(22)、`dependabot.yml`(npm+github-actions)。
2. **M0.2 CI/CD 地基**：落地 `ci.yml`（lint/typecheck/test/build）、`deploy.yml`（GitHub Pages）、`preview.yml`、`release.yml`，全链路可运行。
3. **M0.3 TypeScript 5.9 + Vite 7**：低风险先行，先升级并跑通 CI。
4. **M0.4 React 19**：核心升级 + codemod + E2E 冒烟。
5. **M0.5 Tailwind v4**：高风险最后做，独立 PR + 视觉回归。
6. **M0.6 工具链补齐**：Playwright、Changesets 接入；Lighthouse 留到 M2。

> 本回合仅输出上述规范与命令；**不**执行 `pnpm install` / `pnpm add` / `vite build` 等会改动 `node_modules`、`package.json`、`dist` 的操作，以免破坏当前可运行应用。后续阶段（M1–M6）按路线图推进。
