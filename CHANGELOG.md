# 变更记录

## 0.9.4.1 — 2026-11-06

首个版本，对应上游 ScanRuler 0.9.4（commit `5c1f2f9`）。

- 词表 6,500 条，覆盖六个工作区（3D 测量、表面偏差、壁厚、2D 测量、逆向工程、网格工具）的面板、工具磁贴、参数表单、工具提示、空状态说明与报错文案
- 运行时补丁：`MutationObserver` 跟踪 DOM，只替换界面文本，不碰 React 状态、不碰数值、不碰文件名
- 支持 `{0}` / `{1}` 占位符，按中文语序重排
- `Alt+Shift+L` 在中英文之间切换，选择记在 `localStorage['scanruler.lang']`
- `apply.mjs` 一键注入自建部署的 `dist/`，`--undo` 撤销
- 附带 Tampermonkey 用户脚本

已知边界：

- 上游以后新增的界面文案会保持英文，直到词表补上（`window.scanrulerZh.missing()` 可列出当前页面还缺哪些）
- 三个第三方库的错误消息（three.js、OCCT 内核、Manifold）按原样保留，不翻译
- 着色器指令、CSS 类名、API 参数名等非界面文本不进词表
