# HTML 工作流程

## 使用项目资料与参考原件

根据用户请求确定听众、时长、演示环境和交付范围，并判断每份原件的用途。用户有具体说明时按说明使用。一份原件可以同时承担几种用途。

- **项目资料**提供事实、数字、截图和演示步骤。沿用用户当次补充的数据和口径，同步到页面、图表和讲稿。依据不全时，只展示可确认的内容，待补数据记入备查材料。
- **视觉参考**用于提取版心、标题层级、字号、留白、颜色和代表性页面的构图。可复用 HTML 和 CSS 时，沿用与当前任务匹配的结构。对照参考的对应页面检查这些设计决定。
- **既有汇报**是本次编辑的基础。只修改用户指定的范围及直接相关的内容。

## 确定讲述顺序与逐页内容

根据汇报目的选一个能够贯穿全场的线索，例如一次用户操作、一条实验问题或一项待验收目标。选择合适的真实材料，让开场、机制、结果和演示能相互接续。

写 HTML 前，为每页在工作过程中记下三项内容。

1. 听众离开这一页要记住的一句话。
2. 支撑这句话的真实证据，例如操作画面、数据、流程节点或系统关系。
3. 证据怎样展示，哪些解释留给讲稿。按 [整页版式](page-layouts.md) 选择主体结构。

用必要的单位、范围和来源说明数据。过程图写清起点、关键步骤和结果。有实际产品画面时，优先让画面与标注承担讲解。投影空间不够时，把补充解释移到讲稿或备查页。窄窗口按主要阅读顺序排列内容。

## 修改已有汇报

打开用户指定的版本，定位需要修改的页面及对应讲稿。局部排版调整沿用现有样式，改完核对阅读顺序、图注和演示操作。更换截图时同步更新指向位置和讲述提示，更新指标时同步核对正文与图表。缩短汇报时重新分配讲述、演示和换人时间，保留支撑主要观点的证据。局部修改后使用整份文件运行翻页验收。

## 管理风格

按 [风格选择](style-selection.md) 采用合适的视觉方向，只读取对应规则。可以从匹配的风格模板或用户参考开始，按内容重组页面。需要共享语义结构和翻页交互时，复用 [HTML 基础模板](../../assets/html/base.html)。

- 稿纸风读取 [稿纸风设计规则](styles/paper/STYLE.md)，可参考 `assets/html/styles/paper/deck.html`。
- 流式代码风读取 [流式代码风设计规则](styles/code-flow/STYLE.md)。
- 简笔画风读取 [简笔画风设计规则](styles/line-art/STYLE.md)。
- 卡通风读取 [卡通风设计规则](styles/cartoon/STYLE.md)。
- 暖纸手记风读取 [暖纸手记风设计规则](styles/warm-paper/STYLE.md)，可参考 `assets/html/styles/warm-paper/deck.html`，成品形态见 `examples/warm-paper-demo/汇报页.html`。
- 自然多色风（多色选择）读取 [自然多色风设计规则](styles/natural-multi/STYLE.md) 与 [色板表](styles/natural-multi/palettes.md)，先定下用哪一套配色再做页面；可参考 `assets/html/styles/natural-multi/deck.html`，成品形态见 `examples/natural-multi-demo/汇报页.html`。

可直接用于成品的风格素材按主题放在 `assets/html/styles/<style-name>/`。模板提供基础动效和占位内容，制作成品时结合选定风格规则与本次内容调整。共享结构和翻页交互可复用基础模板。页面示例见 `examples/report-helper-demo/`，配套稿件示例见 `examples/script-demo/逐字稿.md`。

## 使用汇报组件

按页面需要查阅 [汇报组件目录](components/index.md)。组件按用途分类，选定后读取对应文件和说明，使用本次资料替换示例内容，再结合当前风格调整组件。图表还需按 [图表组件说明](components/charts.md) 设置和检查数据。

组件样式、HTML 和动画函数放入同一份汇报文件；组件动画加入当前页面的 GSAP 时间线，并沿用页面的减少动态效果与切页清理逻辑。最终文件按下方要求检查离线打开和翻页。

## 交付前：强制内联 GSAP

所有汇报页都必须带动效，按 [动效规则](motion.md) 给每页写一条 GSAP 时间线。交付前对每一份成品运行一次：

```sh
node /path/to/report-helper/scripts/embed-gsap.mjs /path/to/report.html
```

可以一次传多个文件。脚本把 skill 自带的 `assets/html/vendor/gsap-3.13.0.min.js` 整段内联（含 GreenSock 许可声明）：

- 插到第一个 `<script>` 之前，保证业务脚本执行时 `gsap` 已存在；也可在 HTML 里写 `<!-- GSAP_PLACEHOLDER -->` 指定位置
- 已经内联过的文件跳过，不会重复插入
- 存在 `<script src>` 时报错且不写回；写入后复查版本号、外链，以及是否存在 GSAP 动效调用（只内联库却不写时间线同样判失败）

脚本退出码为 0 才算完成这一步。`assets/html/base.html` 和六套风格模板都已内联库并写好每页时间线，替换内容时保留这段结构；从空白页面起步时按动效规则自己写。

之后逐页确认：动效按讲述顺序播放，结束后正文、数据和图注完整可读，系统开启减少动态效果时直接显示终态。

## 在浏览器中验证

- 交付前对成品运行下方的单文件与翻页验收。检查失败时修复并重新运行，脚本通过后才完成验收。
- 逐页按设计基准核对用色数量、渐变使用、动效和图文布局，并对照 [常见问题清单](pitfalls.md)。检查页码是否在右下角，删去重复说明和操作提示，以及模板自带的配色库页、组件备选页和示意占位页。
- 将 CSS 和 JavaScript 放在同一 HTML 中。使用 GSAP 时，将库的发行文件内容放进 `<script>` 并保留许可证声明。矢量图优先使用内联 SVG，位图和自定义字体使用 data URL，展示数据一并嵌入。用 `file://` 打开最终文件，检查字体、图片和交互。
- 核对每页的展示重点、证据、图注和阅读顺序。有视觉参考时，对照采用的版式和样式。检查投影与窄窗口下的溢出、对比度和动效。
- 配套逐字稿存在时，核对图表与讲稿的数据、翻页提示、演示步骤和交接时长。用户要求打印时，检查打印结果是否包含全部页面。

### 单文件与翻页验收

沿用基础模板的结构。`.deck` 是汇报容器，每页使用它的直接子元素 `section`，容器内用唯一的 `#slide-status` 显示「当前页 / 总页数」。翻页只有两个键：A 或左方向键上一页，D 或右方向键下一页。翻页脚本以 `assets/html/deck-core.js` 为基准实现（含每页时间线与切页收尾），模板内联同一份逻辑，改动时同步更新各处。

需要 Node.js 和 Chrome。在 skill 目录运行一次 `npm install`。把示例路径换为实际交付的 HTML 文件的绝对路径，可以一次传入多个文件。

```sh
node /path/to/report-helper/scripts/check-deck.mjs /path/to/report.html
```

新制作的成品还要在 1280 × 720 下检查显示字号。标题使用 `h1` 或 `h2`，图注使用 `figcaption`。为正文内容标上 `data-font-role="body"`，可标在整段正文的容器上。标题或图注采用其他元素时，分别标为 `data-font-role="title"` 或 `data-font-role="caption"`。图表画布或图像内的文字单独核对。

```sh
node /path/to/report-helper/scripts/check-deck.mjs /path/to/report.html --check-font-sizes
```

该检查采用 [投影字号标准](pitfalls.md#版式)，报告字号不足的页码、文字和计算字号。修改已有汇报时，有角色标记的页面可以沿用相同检查。用户指定画幅或字号时，按本次要求核对。

Chrome 自带的沙箱在部分环境下无法初始化，此时追加 `--no-sandbox`。

```sh
node /path/to/report-helper/scripts/check-deck.mjs /path/to/report.html --no-sandbox
```

脚本逐份输出结果。全部通过时退出码为 0；有文件未通过时打印失败原因，退出码为 1。检查逻辑在 `scripts/check-pagination.js`，也可以直接用 `playwright-cli` 运行同一份文件：

```sh
(
  set -e
  report_skill="/path/to/report-helper"
  report_file="/path/to/report.html"
  report_session="report-pagination-$$"
  report_url=$(node -p 'require("node:url").pathToFileURL(process.argv[1]).href' "$report_file")
  playwright-cli -s="$report_session" open "$report_url" --browser=chrome --config="$report_skill/scripts/pagination.browser.json" --idle-timeout=30000
  trap 'playwright-cli -s="$report_session" close' EXIT
  playwright-cli -s="$report_session" --raw run-code --filename="$report_skill/scripts/check-pagination.js"
)
```

脚本断开浏览器网络后重新打开本地文件，检查页面是否请求其他本地文件或网络资源。在两个投影尺寸和一个窄窗口尺寸下实际发送按键，检查单页显示、首尾边界、右下角页码和可见翻页控件。投影尺寸另检查纵向滚动和滚轮。随后在允许动效的条件下检查 GSAP 是否已内联，以及每页正文、数据和图注在终态是否可见。以脚本输出和退出状态判断验收结果。
