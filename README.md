# GitMaster - 交互式 Git 学习平台

> **本项目由阿里云 ESA 提供加速、计算和保护**

<div align="center">
  <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="Logo" width="600" />
</div>

> **探索 Git 的宇宙，从新手到大师的进阶之旅**

<div align="center">
  <!-- 替换为实际 Logo -->
  <h1>GitMaster</h1>
</div>

## 🔮 项目简介 (Project Overview)

**GitMaster** 不仅仅是一个 Git 学习工具，它是一场通往版本控制大师的沉浸式探险。

我们打破了枯燥的命令行教学模式，通过**可视化交互引擎**与**游戏化叙事**的深度融合，将抽象的 Git 原理转化为可视、可触、可玩的直观体验。无论你是初涉代码的新手，还是渴望精进的老手，都能在这里找到属于你的"顿悟时刻"。

<div align="center">
  <img src="./public/CleanShot.png" alt="GitMaster Screenshot" width="100%" />
</div>

## ✨ 核心亮点 (Core Highlights)

### 🎯 极致实用 (Practicality)

- **真实终端模拟**: 内置高仿真终端环境，支持 git commit, merge, rebase 等 20+ 核心命令，每一次敲击都与真实开发无异。
- **场景化实战**: 精心设计的关卡源自真实开发场景（如分支冲突解决、提交历史修改、复杂分支管理），让你在解决实际问题中掌握技能。
- **即学即用**: 配合 [Git Documentation](https://git-scm.com/doc) 标准，不仅教你"怎么做"，更教你"为什么"。

### 🎨 独具创意 (Creativity)

- **游戏化宇宙**: 探索 "Genesis (创世纪)" 到 "Multiverse (平行宇宙)" 的宏大篇章，让学习过程像玩 RPG 游戏一样上瘾。
- **动态可视化引擎**: 摒弃静态图解，使用 D3.js 驱动的动态由向无环图 (DAG)，实时渲染你的每一次操作。分支的生长、合并的流向、HEAD 的游走，一切尽在眼底。
- **沉浸式美学**: 深度定制的暗黑模式 UI，配合流畅的 Framer Motion 动画，提供心流般的学习体验。

### ⚙️ 技术深度 (Technical Depth)

- **硬核架构**: 基于 React 18 + TypeScript 构建的现代化 SPA，采用 Zustand + Immer 进行高性能状态管理，确保复杂图谱渲染下依然丝般顺滑。
- **算法驱动**: 核心图谱渲染借鉴了 git 内部原理，完整复刻了 commit hash 计算、父子节点关联等底层逻辑。
- **全栈视野**: 虽然是纯前端应用，但我们在浏览器端完整模拟了简版文件系统与 Git 对象存储模型，展现了强大的工程化能力。

## 🛠 技术栈 (Tech Stack)

本项目采用现代化的 SPA 架构开发，整合了前沿的前端技术：

- **Core Framework**:

  - [Vite](https://vitejs.dev/) - 极速构建工具
  - [React 18](https://react.dev/) - UI 核心库
  - [TypeScript](https://www.typescriptlang.org/) - 类型安全保证

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

确保您的环境已安装 Node.js (推荐 v18+) 和 pnpm。

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

本项目支持部署到所有现代静态托管平台（Vercel, Netlify, Github Pages, ESA Pages 等）。

1. **构建项目**:

   ```bash
   pnpm build
   ```

   构建产物将输出到 `dist` 目录。

2. **部署**:
   - 将 `dist` 目录内容发布到您的静态 Web 服务器即可。

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

MIT License
