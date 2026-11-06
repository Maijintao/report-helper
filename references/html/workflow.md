# HTML 工作流程

开始设计前阅读 [HTML 汇报页设计基准](design-baseline.md)。选择风格和检查页面时均使用这份基准。

## 确定页面任务

确认是在制作新汇报页，还是在美化已有 HTML。读取项目资料、演示环境、听众、页面顺序和用户提供的风格参考。使用附件中的图片或图表前，确认它们属于本次项目并适合本次展示。

制作新页面时，可以复制 `assets/html/base.html` 到项目输出位置，复用语义结构和翻页交互，按基准调整样式和内容。美化已有页面时，检查布局、字号、对比度、内容溢出和操作状态，按项目已有的 HTML、CSS 和组件约定实施。

## 组织展示内容

每页围绕一个需要听众理解的结论。选能证明结论的内容形式，例如结果数据、操作画面、故障过程或架构图。数字附单位和必要的统计范围，图表注明来源。使用流程图时，用清楚的标签标出起点、关键步骤和结果。

投影场景优先保证标题、数据和图注可以远距离阅读。长文本可以分到多页或放入逐字稿。保留标题层级，在较窄窗口使用单列或可换行的布局。

## 管理风格

在设计基准内，优先采用用户指定的风格及项目已有的设计规范。没有指定风格时，根据汇报内容安排版式。

风格规则按主题分别放在 `references/html/styles/`。选定风格后，只读取对应的规则，并与共用基准一起使用。

- 稿纸风读取 [稿纸风设计规则](styles/paper/STYLE.md)，可参考 `assets/html/styles/paper/deck.html`。
- 古典科技风读取 [古典科技风设计规则](styles/technical/STYLE.md)，可参考 `assets/html/styles/technical/deck.html`。「科技风」也使用此规则。
- 流式代码风读取 [流式代码风设计规则](styles/code-flow/STYLE.md)。
- 简笔画风读取 [简笔画风设计规则](styles/line-art/STYLE.md)。
- 卡通风读取 [卡通风设计规则](styles/cartoon/STYLE.md)。

可直接用于成品的风格素材按主题放在 `assets/html/styles/<style-name>/`。模板提供基础动效和占位内容，制作成品时结合选定风格规则与本次内容调整。共享结构和翻页交互可复用基础模板。完整的稿件和页面示例见 `examples/report-helper-demo/`。

## 在浏览器中验证

- 交付前对成品运行下方的单文件与翻页验收。检查失败时修复并重新运行，脚本通过后才完成验收。
- 逐页按设计基准核对用色数量、渐变使用、动效和图文布局，并对照 [常见问题清单](pitfalls.md)。检查页码是否在右下角，删去重复说明和操作提示。
- 将 CSS 和 JavaScript 放在同一 HTML 中。使用 GSAP 时，将库的发行文件内容放进 `<script>` 并保留许可证声明。矢量图优先使用内联 SVG，位图和自定义字体使用 data URL，展示数据一并嵌入。用 `file://` 打开最终文件，检查字体、图片和交互。
- 检查投影常用宽度和窄窗口下的内容布局、横向溢出、字体和对比度。核对链接、图片加载和动效。
- 检查所有页面的数据、图注和展示顺序。配套逐字稿存在时，核对翻页提示和演示步骤。用户要求打印时，检查打印结果是否包含全部页面。

### 单文件与翻页验收

沿用基础模板的结构。`.deck` 是汇报容器，每页使用它的直接子元素 `section`，容器内用唯一的 `#slide-status` 显示「当前页 / 总页数」。翻页脚本以 `assets/html/deck-core.js` 为基准实现，模板内联同一份内容，改动时同步更新各处。

使用 Node.js、`playwright-cli` 和 Chrome。运行前用 `node --version`、`playwright-cli --version` 检查命令，并确认 Chrome 已安装。缺少 `playwright-cli` 时安装 Node.js 后运行 `npm install -g @playwright/cli`；缺少 Chrome 时安装 Chrome。准备好依赖后运行验收。命令使用仓库中的浏览器配置访问本地 HTML 文件；把示例路径换为 skill 目录和实际交付的 HTML 文件的绝对路径。

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

脚本断开浏览器网络后重新打开本地文件，检查页面是否请求其他本地文件或网络资源。在两个投影尺寸和一个窄窗口尺寸下实际发送按键，检查单页显示、首尾边界、右下角页码和可见翻页控件。投影尺寸另检查纵向滚动和滚轮。以脚本输出和退出状态判断验收结果。
