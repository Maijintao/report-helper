# HTML 工作流程

开始设计前阅读 [HTML 汇报页设计基准](design-baseline.md)。选择风格和检查页面时均使用这份基准。

## 确定页面任务

确认是在制作新汇报页，还是在美化已有 HTML。读取项目资料、演示环境、听众、页面顺序和用户提供的风格参考。使用附件中的图片或图表前，确认它们属于本次项目并适合本次展示。

制作新页面时，可以复制 `assets/html/base.html` 到项目输出位置，复用语义结构和翻页交互，按基准调整样式和内容。美化已有页面时，检查布局、字号、对比度、内容溢出和操作状态，按项目已有的 HTML、CSS 和组件约定实施。

## 组织展示内容

每页围绕一个需要听众理解的结论。选能证明结论的内容形式，例如结果数据、操作画面、故障过程或架构图。数字附单位和必要的统计范围，图表注明来源。使用流程图时，用清楚的标签标出起点、关键步骤和结果。

投影场景优先保证标题、数据和图注可以远距离阅读。长文本可以分到多页或放入逐字稿。保留标题层级，在较窄窗口使用单列或可换行的布局。

## 管理风格

制作新汇报页时，先按 [风格选择](style-selection.md) 提出两到三个方案让用户选定，再读对应风格的规则。用户已指定风格或项目已有设计规范时直接采用，跳过这一步。

风格规则按主题分别放在 `references/html/styles/`。选定风格后，只读取对应的规则，并与共用基准一起使用。

- 稿纸风读取 [稿纸风设计规则](styles/paper/STYLE.md)，可参考 `assets/html/styles/paper/deck.html`。
- 流式代码风读取 [流式代码风设计规则](styles/code-flow/STYLE.md)。
- 简笔画风读取 [简笔画风设计规则](styles/line-art/STYLE.md)。
- 卡通风读取 [卡通风设计规则](styles/cartoon/STYLE.md)。
- 暖纸手记风读取 [暖纸手记风设计规则](styles/warm-paper/STYLE.md)，可参考 `assets/html/styles/warm-paper/deck.html`，成品形态见 `examples/warm-paper-demo/汇报页.html`。
- 自然多色风（多色选择）读取 [自然多色风设计规则](styles/natural-multi/STYLE.md) 与 [色板表](styles/natural-multi/palettes.md)，先定下用哪一套配色再做页面；可参考 `assets/html/styles/natural-multi/deck.html`，成品形态见 `examples/natural-multi-demo/汇报页.html`。

可直接用于成品的风格素材按主题放在 `assets/html/styles/<style-name>/`。模板提供基础动效和占位内容，制作成品时结合选定风格规则与本次内容调整。共享结构和翻页交互可复用基础模板。完整的稿件和页面示例见 `examples/report-helper-demo/`。

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
- 检查投影常用宽度和窄窗口下的内容布局、横向溢出、字体和对比度。核对链接、图片加载和动效。
- 检查所有页面的数据、图注和展示顺序。配套逐字稿存在时，核对翻页提示和演示步骤。用户要求打印时，检查打印结果是否包含全部页面。

### 单文件与翻页验收

沿用基础模板的结构。`.deck` 是汇报容器，每页使用它的直接子元素 `section`，容器内用唯一的 `#slide-status` 显示「当前页 / 总页数」。翻页只有两个键：A 或左方向键上一页，D 或右方向键下一页。翻页脚本以 `assets/html/deck-core.js` 为基准实现（含每页时间线与切页收尾），模板内联同一份逻辑，改动时同步更新各处。

需要 Node.js 和 Chrome。在 skill 目录运行一次 `npm install` 安装 `playwright-core`，之后可以直接调用脚本，也可以用 `npx` 从 skill 目录运行。把示例路径换为实际交付的 HTML 文件的绝对路径，可以一次传入多个文件。

```sh
node /path/to/report-helper/scripts/check-deck.mjs /path/to/report.html
npx --yes /path/to/report-helper /path/to/report.html
```

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

脚本断开浏览器网络后重新打开本地文件，检查页面是否请求其他本地文件或网络资源。在两个投影尺寸和一个窄窗口尺寸下实际发送按键，检查单页显示、首尾边界、右下角页码和可见翻页控件。投影尺寸另检查纵向滚动和滚轮。随后在允许动效的条件下重跑一遍，确认 GSAP 已内联、每页动效能播，播完后正文、数据和图注都可见。以脚本输出和退出状态判断验收结果。
