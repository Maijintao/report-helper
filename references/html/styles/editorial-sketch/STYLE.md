# 杂志手绘风（Editorial Sketch）

以「主编亲笔批注的精装杂志跨页」为基本画面：宽敞留白、细墨线分栏、大号衬线标题配手绘颗粒笔触批注与数据新闻图表。适合技术评审、项目汇报、成果验收、课程答辩和深度分析报告；不适合高饱和度卡通科普或强炫酷暗黑科技风。

## 核心视觉引擎

为了消除生硬的机械矢量感，必须在 HTML 顶部放置一个全局隐藏的 `<svg>` 字典（使用 `style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"`，避免 `display:none` 导致部分浏览器滤镜失效），内置以下复用资源：

- **粉笔/粗糙笔触滤镜 (`#chalk-texture`)**：`<feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" />` 配合 `<feDisplacementMap scale="2.5" />`，为手绘圆圈、波浪下划线、有机箭头与图表关键线赋予真实粉笔/铅笔颗粒感。
- **柔和阴影滤镜 (`#soft-shadow`)**：用于便签、浮层纸片。
- **纸面纤维肌理 (`#paper-grain`)**：极低不透明度（3%–5%）叠加在全屏，营造印刷纸面或黑板触感。
- **斜纹排线填充 (`#hatch-red` / `#hatch-blue` / `#hatch-yellow`)**：45° 手绘斜线 `<pattern>`，用于对比进度条与高亮区域。

所有使用滤镜的 SVG 必须在 `viewBox` 四周留足内边距（padding），防止滤镜边缘被裁切。

## 双模式与配色

支持**暖纸白（默认）**与**深黑板粉笔**两种模式，整份汇报择一使用，不混用：

- **暖纸白模式**：底色 `#FAF9F6`，纸面 `#FFFFFF` / `#F3EFE6`，主墨 `#1C1A17`，次墨 `#565047`，细线 `rgba(28,26,23,0.14)`。
- **深黑板粉笔模式**：底色 `#1E1F22`，板面 `#25272B`，粉笔白 `#F2EFE9`，次粉笔 `#B8B3A8`。
- **三枚功能强调色（严格分工）**：
  - 朱砂红 `#E05A47`（黑板 `#F27462`）：圈画核心异常值、主角曲线、最高优先焦点。
  - 芥末黄 `#F4C430`（黑板 `#F7D154`）：底层荧光笔斜切涂抹。
  - 墨水蓝 `#2B5B84`（黑板 `#6EA8DC`）：有机弯曲引导箭头、次级对照指标。

## 手绘批注克制铁律

- **单页手绘批注不超过 3 处**（例如：圈 1 个异常数字 + 涂 1 句核心结论 + 引 1 条边注便签），严禁满屏乱画导致焦点分散。
- **禁止机械图形**：圈选必须用不闭合或略微重叠的贝塞尔曲线（`C`/`Q`），禁止标准 `<ellipse>`；引导箭头必须用二次/三次贝塞尔曲线配不对称手绘 V 字箭头，禁止直角折线与机械三角形。
- **去卡片化**：优先使用细墨线（Hairline rules）与留白划分版面，避免堆砌圆角大卡片和厚重阴影。

## 字体与排版

- **标题与核心指标数**：衬线体 `"Songti SC", "STSong", "Noto Serif SC", Georgia, serif`，数字启用 `font-variant-numeric: tabular-nums`。
- **正文**：清晰无衬线或衬线体，保持 1.6–1.85 舒适行高。
- **页眉、刊号、图例、日期**：等宽字体 `"SF Mono", "JetBrains Mono", ui-monospace, monospace`，大写字母配 `0.08em–0.12em` 字距。
- **旁注与便签**：手写体回退 `"Kaiti SC", "STKaiti", "Bradley Hand", cursive`，仅用于批注和便签，不进正文。

## 常用版式骨架与配套组件

- **封面与导语页**：顶部双细线杂志报头 + 大衬线标题 + 导语行内三件套批注 + 有机弯曲箭头指向微倾 `-1.5deg` 胶带便利贴。
- **核心指标页**：使用 [无框编辑部 KPI 栏](../../../../assets/html/components/editorial/kpi-strip.html)，大数字配趋势微箭头与朱砂圈异常值。
- **差距与跃迁页**：优先选用 [哑铃对比图](../../../../assets/html/components/editorial/dumbbell-gap.html)（优化前后差距）或 [斜率跃迁图](../../../../assets/html/components/editorial/slopegraph.html)（多指标排名跃迁）。
- **进度与构成页**：使用 [斜纹排线对比条](../../../../assets/html/components/editorial/hatched-bars.html) 与 [10×10 瓦片比例图](../../../../assets/html/components/editorial/waffle-matrix.html)。
- **因果与评审结论页**：使用 [有机弯曲箭头因果流](../../../../assets/html/components/editorial/organic-flow.html) 或 [学术三线表与拉引金句](../../../../assets/html/components/editorial/three-line-table.html)。
- **里程碑页**：使用 [档案风竖向时间轴](../../../../assets/html/components/timeline/editorial-chronology.html)。

## 动效

- 每页按阅读顺序用 GSAP 时间线依次带入：报头/标题 → 骨架与数据 → **手绘批注逐笔描边（`strokeDashoffset`）** → 便签轻落。
- 缓动优先 `power2.out` / `power3.out`，克制平滑，不做弹跳或闪烁。
- 系统开启 `prefers-reduced-motion: reduce` 时跳过描边与位移，直接呈现完整终态。
