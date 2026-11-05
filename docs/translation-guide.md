# ScanRuler 简体中文本地化 — 翻译规范（必须严格遵守）

## 这个软件是什么

ScanRuler 是 CNC Kitchen 做的免费开源工具（AGPL-3.0），在浏览器里跑，用于 **3D 扫描数据的分析、测量与逆向工程**。主要工作区：

- **3D Measure** — 在扫描网格上拟合几何元素（球、圆柱、圆锥、环面、平面、圆、直线、点），再做尺寸与几何公差（GD&T）
- **Surface Deviation** — 扫描件与参考 CAD 的最佳拟合、偏差色图、变形动画
- **Wall Thickness** — 射线法壁厚分析
- **2D Measure** — 剖面上的二维测量
- **Reverse engineer** — 参数化 CAD：草图、拉伸、旋转、放样、扫掠、圆角、倒角、抽壳、螺纹、阵列、镜像，输出 STEP
- **Mesh Tools** — 网格修复：去孤岛、补洞、翻法线、平滑、布尔、抽壳、简化网格、按断面裁剪
- **Flatbed / 2D** — 平板扫描图的对齐与测量

用户群是 **3D 打印玩家、机械设计工程师、逆向工程/质检人员**。翻译必须使用中文机械制图、几何量计量、CAD/CAM、3D 打印领域的**标准术语**，不要自创词。

## 术语表（唯一正确译法，出现即用这些词）

### 几何元素
| 英文 | 中文 |
|---|---|
| element | 元素 |
| point | 点 |
| line | 直线 |
| arc | 圆弧 |
| circle | 圆 |
| plane | 平面 |
| sphere | 球 |
| cylinder | 圆柱 |
| cone | 圆锥 |
| torus | 圆环面 |
| axis | 轴 |
| datum / datum plane | 基准 / 基准面 |
| feature | 特征 |
| body / bodies | 实体 |
| solid | 实体 |
| face / faces | 面 |
| edge | 边 |
| surface | 曲面（网格语境用"表面"） |
| normal / normals | 法线 |
| vertex | 顶点 |
| section | 剖面 |
| sketch | 草图 |
| profile | 轮廓 |
| outline | 外形轮廓 |
| center / centre | 中心 |
| diameter | 直径 |
| radius | 半径 |
| length | 长度 |
| width | 宽度 |
| height | 高度 |
| angle | 角度 |
| pitch | 螺距（螺纹）／节距（齿、孔阵） |
| offset | 偏置 |
| clearance | 间隙 |
| interference | 干涉 |
| overlap | 重叠 |
| tolerance | 公差 |
| nominal | 名义值 |
| deviation | 偏差 |
| residual | 残差 |

### 拟合与测量
| 英文 | 中文 |
|---|---|
| fit (a sphere / a plane) | 拟合（球／平面） |
| fitting / fitted | 拟合／拟合后的 |
| best fit | 最佳拟合 |
| least squares | 最小二乘 |
| auto-align / align | 自动对齐 / 对齐 |
| alignment | 对齐 |
| measure / measurement | 测量 |
| dimension | 尺寸 |
| GD&T / geometric tolerance | 几何公差 |
| flatness | 平面度 |
| straightness | 直线度 |
| circularity / roundness | 圆度 |
| cylindricity | 圆柱度 |
| sphericity | 球度 |
| perpendicularity | 垂直度 |
| parallelism | 平行度 |
| angularity | 倾斜度 |
| coaxiality | 同轴度 |
| concentricity | 同心度 |
| position | 位置度 |
| runout | 跳动 |
| profile of a surface | 面轮廓度 |
| draft angle | 拔模角 |
| fillet radius | 圆角半径 |
| wall thickness | 壁厚 |
| thickness | 厚度 |
| deviation map / colour map | 偏差图 / 色图 |
| signed deviation | 带符号偏差 |
| warp / warping | 翘曲 |
| pre-deformation | 预变形 |

### CAD 建模
| 英文 | 中文 |
|---|---|
| sketch / exit sketch | 草图 / 退出草图 |
| extrude | 拉伸 |
| revolve | 旋转 |
| sweep | 扫掠 |
| loft | 放样 |
| fillet | 圆角 |
| chamfer | 倒角 |
| shell / hollow | 抽壳 / 掏空 |
| thicken | 加厚 |
| draft | 拔模 |
| pattern | 阵列 |
| mirror | 镜像 |
| hole | 孔 |
| thread | 螺纹 |
| boolean: union / subtract / intersect | 布尔：并集 / 差集 / 交集 |
| trim | 修剪 |
| split | 分割 |
| cut | 切除 |
| join | 合并 |
| fuse | 融合 |
| construction geometry | 构造几何 |
| parametric | 参数化 |
| timeline / feature timeline | 时间轴 / 特征时间轴 |
| constraint | 约束 |
| degree of freedom | 自由度 |
| tessellate / tessellated | 三角化 |
| STEP / IGES / STL / 3MF / PLY / OBJ | 保持原样，不翻译 |

### 网格与扫描
| 英文 | 中文 |
|---|---|
| mesh | 网格 |
| scan | 扫描件（名词）／扫描（动词） |
| scanner | 扫描仪 |
| point cloud | 点云 |
| triangulation | 三角剖分 |
| manifold | 流形（manifold mesh = 流形网格） |
| watertight / closed | 封闭 |
| non-manifold | 非流形 |
| self-intersection | 自交 |
| hole (mesh) | 孔洞 |
| island / disconnected island | 孤岛 |
| smooth | 平滑 |
| shrink / expand | 收缩 / 扩张 |
| reduce mesh / decimate | 简化网格 |
| ray / ray casting | 射线 / 射线投射 |
| reference part | 参考件 |
| target | 目标件 |
| scan spray | 显像剂 |
| marker / markerless | 标记点 / 免标记 |

### 3D 打印
| 英文 | 中文 |
|---|---|
| 3D print / printed part | 3D 打印／打印件 |
| slicer / slicing | 切片软件 / 切片 |
| layer height | 层高 |
| infill | 填充 |
| support / support material | 支撑 / 支撑材料 |
| nozzle | 喷嘴 |
| heated chamber | 恒温腔体 |
| bed / build plate | 热床 / 打印平台 |
| ABS / PLA / PETG / TPU | 保持原样 |
| stringing | 拉丝 |
| warping | 翘曲 |
| tolerance stack | 公差链 |
| press fit / clearance fit / interference fit | 过盈配合 / 间隙配合 / 过盈配合 |

### 界面通用
| 英文 | 中文 |
|---|---|
| workspace | 工作区 |
| panel | 面板 |
| project | 项目 |
| settings | 设置 |
| preview | 预览 |
| apply | 应用 |
| cancel | 取消 |
| close | 关闭 |
| done | 完成 |
| reset | 重置 |
| delete | 删除 |
| hide / show | 隐藏 / 显示 |
| undo / redo | 撤销 / 重做 |
| save / load / open | 保存 / 载入 / 打开 |
| export / import | 导出 / 导入 |
| new | 新建 |
| copy / paste | 复制 / 粘贴 |
| summary / report | 摘要 / 报告 |
| element list | 元素列表 |
| sample | 示例 |
| units: mm / inches | 毫米 / 英寸 |
| millimetres | 毫米 |
| thumbnail | 缩略图 |

## 翻译规则

1. **只用术语表里的词**。同一个英文词在任何位置都译成同一个中文词。不确定时保守：用 CAD 领域最常见的说法。
2. **占位符原样保留**：`{0}`、`{1}`… 必须完整出现在译文里（数量与内容不变），可以按中文语序调整位置。例：`Fit {0} {1}` → `拟合 {0} {1}`。
3. **不要翻译**：`STL`、`STEP`、`3MF`、`PLY`、`OBJ`、`GD&T`、`ABS`、`PLA`、`TPU`、`mm`、`°`、`%`、`ScanRuler`、`CNC Kitchen`、`GitHub`、URL、文件名（.stl/.3mf/.step 结尾的）、`Ctrl+Z` 这类快捷键、`x`/`y`/`z` 轴名。
4. **按钮/标签**尽量短：2–4 个字，符合中文软件习惯（`Apply`→`应用`，`Cancel`→`取消`，`New dimension`→`新建尺寸`）。
5. **句子**：完整句子末尾加「。」；提示性短语不加标点。不用「您」，直接用祈使句或陈述句。
6. 中文与英文/数字之间**不加空格**（如 `STEP 文件`→`STEP文件`）；但 `{0} mm` 这类占位符与单位之间保留一个空格。
7. **不要添加解释、不要加括号注释**、不要出现英文原文（除非规则 3 的例外）。
8. 译文里**不得残留英文单词**（除规则 3 例外）。
9. 若某个字符串只是符号、单位、或纯代码（如 `noopener noreferrer`、`index is out of range:`），**不要凭空翻译**，保留原文。
10. 输出必须是**合法 JSON 对象**：`{ "英文原文": "中文译文", ... }`，键与输入文件里的字符串**逐字相同**（包括首尾空格与标点），不得漏项、不得多出键。

## 输出要求

- 只输出翻译结果文件，不输出解释性文字。
- 文件编码 UTF-8，JSON 用两个空格缩进。
- 项数必须与输入一致。
