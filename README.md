# GitMaster - 交互式 Git 学习平台

> **MIT 开源协议 · 完全开源免费** · 由阿里云 ESA 提供加速、计算和保护

<div align="center">
  <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="Logo" width="600" />
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/new)

</div>

> **探索 Git 的宇宙，从新手到大师的进阶之旅**

<div align="center">
  <!-- 替换为实际 Logo -->
  <h1>GitMaster</h1>
</div>

## � 项目简介 (Project Overview)

**GitMaster** 是一款沉浸式的交互式 Git 学习应用，旨在通过可视化的方式帮助开发者掌握 Git 版本控制系统。通过"游戏化关卡 + 实时终端模拟 + 动态可视化图谱"的模式，让抽象的 Git 概念变得直观易懂。

本项目结合了现代前端技术栈，打造了流畅、美观且高效的学习体验，适合所有希望深入理解 Git 工作原理的开发者。

## ✨ 核心功能 (Key Features)

- **🎮 游戏化闯关**: 包含 Genesis (创世纪)、Multiverse (平行宇宙) 等四大篇章，循序渐进掌握 Git 核心概念。
- **💻 真实终端模拟**: 内置仿真终端，支持 Git 常用命令的实时输入与反馈。
- **🌳 动态可视化图谱**: 实时渲染 Commit、Branch 和 Merge 操作，所见即所得。
- **🌍 多语言支持**: 完美支持中文（简体）与英文无缝切换。
- **🌗 沉浸式设计**: 专为开发者打造的暗黑模式与流畅动画体验。
- **✨ 智能引导**: 集成 Driver.js 提供新手引导与交互式教程。

## 🛠 技术栈 (Tech Stack)

本项目采用现代化的 SPA 架构开发，整合了前沿的前端技术：

- **Core Framework**:

  - [Vite](https://vitejs.dev/) - 极速构建工具 (v7)
  - [React 19](https://react.dev/) - UI 核心库
  - [TypeScript](https://www.typescriptlang.org/) - 类型安全保证 (v5.9)

- **UI & Experience**:

  - [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
  - [Shadcn UI](https://ui.shadcn.com/) - 高质量组件库 (基于 Radix UI)
  - [Framer Motion](https://www.framer.com/motion/) - 强大的动画库
  - [Anime.js](https://animejs.com/) - 复杂动画处理
  - [Lucide React](https://lucide.dev/) - 精美图标集
  - [Sonner](https://sonner.emilkowal.ski/) - 优雅的 Toast 组件

- **State & Logic**:

  - [Zustand](https://github.com/pmndrs/zustand) + Immer - 轻量级状态管理
  - [React Query](https://tanstack.com/query/latest) - 异步数据管理
  - [React Router](https://reactrouter.com/) - 路由管理
  - [React Hook Form](https://react-hook-form.com/) + Zod - 表单与验证

- **Visualization & Interaction**:

  - [D3.js](https://d3js.org/) - 数据驱动文档 (可视化核心)
  - [Recharts](https://recharts.org/) - 基于 React 的图表库
  - [Driver.js](https://driverjs.com/) - 漫游引导库

- **Internationalization**:

  - [i18next](https://www.i18next.com/) - 国际化标准解决方案

- **Testing**:
  - [Vitest](https://vitest.dev/) - 下一代测试框架
  - [React Testing Library](https://testing-library.com/) - 组件测试

## 🚀 快速开始 (Getting Started)

### 1. 环境准备

确保您的环境已安装 Node.js (推荐 v22，见 `.nvmrc`) 和 pnpm。

### 2. 安装依赖

```bash
# 克隆项目
git clone <YOUR_GIT_URL>
cd gitmaster

# 安装依赖
pnpm install
```

### 3. 启动开发

```bash
pnpm dev
```

现在访问 [http://localhost:5173](http://localhost:5173) 即可开启学习之旅。

## 📦 部署 (Deployment)

本项目通过 **GitHub Actions 全自动 CI/CD 部署到 Vercel**（推荐），同时也支持 Netlify / GitHub Pages / EdgeOne / 阿里云 ESA 等平台。

- **生产部署**：push 到 `main` 自动触发 `.github/workflows/deploy.yml` → 构建并发布到 Vercel 生产环境。
- **预览部署**：每个 PR 自动触发 `.github/workflows/preview.yml` → 生成 Vercel 预览环境并在 PR 下留言预览链接。
- 本地手动构建：

  ```bash
  pnpm build          # 输出到 dist/
  ```

> 详细配置（含 Vercel Token / Org ID / Project ID 的获取与 Secrets 设置）见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 🤝 贡献说明

欢迎提交 Issue 和 Pull Request 帮助改进项目！提交前请确保通过 lint 和 type check：

```bash
pnpm lint
pnpm typecheck
```

## 📄 参赛声明

本项目承诺所用代码及设计均为原创，并未侵犯任何第三方权益。
本项目由阿里云 ESA 提供加速、计算和保护。

## 📜 许可证 (License)

本项目基于 [MIT License](./LICENSE) 开源，可自由用于学习、修改与分发。
