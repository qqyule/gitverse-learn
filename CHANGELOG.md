# Changelog

本项目所有显著变更均记录于此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)（SemVer）。

约定分类：
- **Added** 新功能
- **Changed** 对现有功能的变更
- **Deprecated** 即将移除的功能
- **Removed** 已移除的功能
- **Fixed** 缺陷修复
- **Security** 安全相关

---

## [Unreleased]

### Added
- 工程化地基与全链路 CI/CD（对应路线图 **M0**，本回合已落地）：
  - `ci.yml`：pull_request / push 到 main 时执行 lint(Biome) → i18n 键同构校验 → typecheck(tsc) → test(Vitest) → build(Vite)。
  - `deploy.yml`：push 到 main 自动构建并部署到 GitHub Pages。
  - `preview.yml`：pull_request 构建并上传 `dist` 产物，在 PR 上留言预览说明。
  - `release.yml`：push `v*` tag 或手动触发，自动生成 GitHub Release Notes。
  - `scripts/check-i18n.mjs`：CI 内 i18n 键同构校验（en ⇄ zh-CN），防止翻译键漂移。
- `.nvmrc`：锁定 Node `22.12`（满足 Vite 7 最低要求）。
- `.github/dependabot.yml`：启用 `npm`(pnpm) 与 `github-actions` 每周自动检查。

### Changed
- CI 运行环境约定统一为 **pnpm**（`pnpm/action-setup@v4` + `setup-node@v4`，`cache: pnpm`）。

> ⚠️ 以下为 **M0 规划项，本回合尚未执行**（与 ROADMAP / TECH-REFACTOR 一致）：
> - 锁文件标准化：删除 `bun.lockb` / `package-lock.json`，确立 pnpm 为唯一包管理器并重新生成 `pnpm-lock.yaml`。
> - 启用 Biome a11y 规则并纳入 CI 门禁（原 a11y 规则被关闭，将在 M2 加固）。
> - 实际依赖升级（React 19 / Vite 7 / Tailwind v4 / TS 5.9）见 TECH-REFACTOR.md，留待 M0 后续 PR 执行。

### Removed
- （规划中）待 M0 执行后移除非 pnpm 锁文件残留。

---

## [0.0.0]

### Added
- 初始版本：沉浸式交互式 Git 学习平台（React 18 + Vite 5 + Tailwind 3.4 + TypeScript）。
- 游戏化闯关、真实终端模拟、动态可视化图谱、中/英多语言、暗黑模式。
- 基于 Biome 2 + Vitest 4 的代码质量与单测基线。
