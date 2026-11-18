# 图表组件说明

## 组件选择

- `grouped-bars.html`：多类别、多系列的分组柱状图，数据范围为零至指定上限。
- `story-lines.html`：两行叙事折线图，适合展示两组数据随时间的变化，数据范围为 0 至 100。
- `isometric-board.html`：等距视角的显示屏、分层柱体和数据台，支持三个时间范围。一至八个类别的数值为非负数。

组件文件里的数据仅用于示例。使用时替换标题、文字、数据、单位、统计范围和来源，并确认图表形式适合数据。需要其他比例尺或数据类型时，调整 ECharts 配置与数据检查逻辑。

## 预览与依赖

在当前 skill 目录中直接打开组件 HTML，即可离线预览。分组柱状图和叙事折线图使用 `assets/html/vendor/echarts-6.min.js`；立体数据台使用 `assets/html/vendor/zdog-1.1.3.min.js`。许可证声明保留在发行文件中。

汇报成品需要是单个离线 HTML。将所选组件的样式、组件 HTML 和业务函数放入汇报文件。在编辑器中把所需发行文件的完整内容读入单独的 `<script>`，并保留许可证声明。每个库内联一次，放在调用它的业务脚本之前。组件文件中的 `<script src>` 用于本地预览。GSAP 也按 [HTML 工作流程](../workflow.md) 内联。

各文件中的 `body` 样式用于组件预览；接入汇报时使用组件根类及其内部的样式。移除组件根元素上的 `data-demo`，避免运行预览数据。

## 设置数据与初始化

各组件使用独立的根元素，并返回包含 `dispose()` 的控制对象。页面初次显示后再初始化图表，确保容器已有尺寸；同一组件使用多次时，对每个根元素分别初始化。图表会跟随容器尺寸变化。

沿用基础翻页脚本时，在 `showSlide` 更新各页的 `hidden` 之后、调用 `animateSlide` 之前初始化当前页图表。先初始化，再根据系统设置判断是否播放动画。已初始化的图表可以随页面保留，移除图表或重新初始化前调用原控制对象的 `dispose()`。

- 分组柱状图调用 `createGroupedChart(root, config)`。`config.categories` 是类别，`config.series` 保存系列名称、颜色和数值数组，`config.maximum` 是共同上限，`config.decimals` 指定小数位数。可选的 `config.separatorAfter` 指定分隔线前的类别序号，序号从零开始。调用返回对象的 `update(config)` 可以更新数据。
- 叙事折线图调用 `createStoryChart(root, config)`。`config.categories` 是时间标签，`config.series` 包含两组名称、说明、颜色与数值。
- 立体数据台调用 `createIsometricBoard(root, config)`。`config.categories` 是类别，`config.ranges` 保存三个时间范围；每个范围包含名称、上一周期的 `baseline` 和数值数组。显示屏的总数与变化比例根据这些数据计算，柱体层数按当前范围的最大值缩放。调用返回对象的 `selectRange(index)` 可以切换范围。

每个文件末尾的示例对象展示完整数据结构。数据数量、范围或名称无效时，初始化函数立即报错。图表标签和文字说明使用同一份数据，避免修改数据后产生不一致。

## 动画与检查

将 `animateGroupedChart(timeline, root, position)`、`animateStoryChart(timeline, root, position)` 或 `animateIsometricBoard(timeline, root, position)` 加入页面的 GSAP 时间线。系统启用减少动态效果时跳过页面动画，ECharts 同样关闭入场动画。页面移除图表时调用控制对象的 `dispose()`，释放图表和尺寸监听。

交付前检查图表标题、系列名称、数值、单位、比例尺和来源。立体数据台的显示屏展示总数，图形的文字说明包含各类别的准确数值；比较需要精确读数的数据时，优先选择便于读取的平面图表。带图表的汇报按 [HTML 工作流程](../workflow.md) 检查离线打开、动画和键盘翻页。
