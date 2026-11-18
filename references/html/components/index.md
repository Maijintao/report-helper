# 汇报组件目录

组件按展示内容分类。阅读本目录后，只读取需要使用的组件文件及其类别说明；把组件放入最终汇报时，按当前风格调整颜色、字体和图形。

各组件文件可以直接在浏览器中打开，查看示例内容与排版；动画函数在汇报页面接入 GSAP 后播放。

## 时间线

适用于按时间顺序说明阶段、事件或里程碑。日期和节点内容由本次资料提供。

| 组件 | 适合的页面 | 风格 |
| --- | --- | --- |
| [横向稿纸时间线](../../../assets/html/components/timeline/paper-horizontal.html) | 横向展示少量阶段与简短注记 | 稿纸风 |
| [纵向线条时间线](../../../assets/html/components/timeline/line-vertical.html) | 日期、标题和说明沿一条竖线排列 | 简笔画风 |
| [手记时间线](../../../assets/html/components/timeline/warm-paper.html) | 用纸面与日期标签记录项目进程 | 暖纸手记风 |
| [自然多色时间线](../../../assets/html/components/timeline/natural-multi.html) | 用相连的彩色节点讲述阶段变化 | 自然多色风 |
| [交错卡片时间线](../../../assets/html/components/timeline/alternating-cards.html) | 用交错卡片和虚线展示步骤或时间进程 | 轻盈纸片风 |

## 图表

图表需要真实的数据、单位、统计范围和来源。组件里的数字标为示例，使用时全部替换。

| 组件 | 适合的页面 | 数据范围 |
| --- | --- | --- |
| [分组柱状图](../../../assets/html/components/charts/grouped-bars.html) | 比较多个类别中的多组数值 | 零至指定上限的数值 |
| [叙事折线图](../../../assets/html/components/charts/story-lines.html) | 展示两组数据随时间的变化，附关键节点说明 | 0 至 100 的数值 |
| [立体数据台](../../../assets/html/components/charts/isometric-board.html) | 用等距视角展示显示屏、分层柱体与底座，支持切换时间范围 | 一至八个类别的非负数值 |

图表选型、数据设置与检查方法见 [图表组件说明](charts.md)。

## 重点标注

组件可单独复制到汇报页面。文字、颜色、字号和位置均可调整，标注内容使用本次资料。

[重点标注组件预览](../../../assets/html/components/annotations/gallery.html)按稿纸、代码、立体渲染、蜡笔画、卡通、简笔画和暖纸手记展示标注，也提供圈选、下划线、色块和箭头样式。风格标注复制 `style-annotation-styles` 的样式和所选组件的 HTML；圈选等标注复制 `annotation-styles` 的样式和所选组件的 HTML。`preview-styles` 只用于预览页面。修改组件文字、颜色和字号，使其适合当前汇报页面；箭头的位置通过页面布局调整。

| 组件 | 用途 | 调整方法 |
| --- | --- | --- |
| [手绘圈选](../../../assets/html/components/annotations/sketch-mark.html) | 圈出文字或数值 | 修改文字和 `--mark-color`；SVG 会随文字宽度变化 |
| [手绘箭头标注](../../../assets/html/components/annotations/doodle-callout.html) | 用箭头和文字指出页面中的位置 | 修改文字和 `--callout-color`；添加 `doodle-callout--right` 可以水平翻转箭头 |
| [荧光笔强调](../../../assets/html/components/annotations/marker-highlight.html) | 用色块强调文字 | 修改文字和 `--highlight-color`；文字换行时每行保留色块 |

复制组件文件中的 `<style>` 和组件 HTML 即可使用。相同组件重复使用时，只需保留一份样式；可以在页面的 GSAP 时间线中为组件添加入场动画。箭头组件由页面布局决定位置和指向，放置后需要检查箭头末端与目标的位置。

## 放进汇报页面

每个组件文件包含样式、组件 HTML 和函数。时间线按下方方法接入；图表使用 ECharts，按 [图表组件说明](charts.md) 接入。相同组件使用多次时，样式和函数各保留一份，HTML 按实际需要放置。

组件样式限定在各自的根类名下；图表文件中用于预览的 `body` 样式按图表说明处理。组件颜色按汇报的风格调整。时间线可以增减 `<li>`；节点需要过多空间时，按内容另建页面。日期、标题、说明与 `aria-label` 使用项目资料。

交错卡片时间线的脚本放在组件 HTML 之后，会自动为页面中的组件绘制连接线；增减节点或调整内容后连接线会更新。动态插入组件时调用 `createTimelineCards(root)`，移除组件时调用返回对象的 `dispose()`。每张卡片可以通过 CSS 自定义属性 `--card-accent` 和 `--card-tint` 调整颜色。

图表在页面显示后初始化，具体步骤见 [图表组件说明](charts.md)。图表标题、数值、单位、比例尺和来源必须互相一致。

每个组件的动画函数接收页面的 GSAP 时间线、组件根元素和可选位置。按页面内容选择出现顺序，例如：

```js
const timeline = gsap.timeline();
timeline.from(slide.querySelector('h2'), { autoAlpha: 0, y: 18, duration: 0.5 });
slide.querySelectorAll('.timeline-paper').forEach((root) => {
  animateTimelinePaper(timeline, root, '-=.2');
});
```

在页面的 `animateSlide(slide)` 中调用组件动画函数。系统启用减少动态效果时，保持组件终态并跳过动画；翻页时沿用汇报页面的清理逻辑。组件不注册翻页按键，也不创建自己的页面计数。

交付前对整个汇报运行 [单文件与翻页验收](../workflow.md#单文件与翻页验收)，并检查组件在投影尺寸和窄窗口下的排列、文字、颜色和内容。
