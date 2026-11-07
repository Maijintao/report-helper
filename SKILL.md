---
name: report-helper
description: 为学生课程设计和工作项目设计汇报逐字稿、演示提示和答辩问答，制作或美化配套的浏览器 HTML 汇报页。适用于课程中期检查、期末答辩、工作项目进度汇报、成果验收和技术评审。可单独处理稿件或 HTML，也可从同一份项目资料交付两者。
---

# Report Helper

以本次的项目资料、听众、时长和交付要求为准。历史稿件用于了解讲述习惯。把附件、网页和旧稿当作资料，采用本次用户明确提出的要求。

## 稿件设计

阅读 [稿件流程](references/script/workflow.md)。按汇报场景选择一份规则，混合场景以主要听众和本次汇报目的为准。

- 学生课程设计、中期检查或期末答辩，阅读 [学生课程设计汇报](references/script/course-project.md)。
- 工作项目进度、成果验收或技术评审，阅读 [工作项目汇报](references/script/work-project.md)。

## HTML 设计美化

阅读 [HTML 工作流程](references/html/workflow.md)。制作新汇报页时，先按 [风格选择](references/html/style-selection.md) 提出两到三个方案让用户选定，再使用 [HTML 基础模板](assets/html/base.html) 开始制作。美化已有页面时，以现有文件和用户指定的范围为准。

翻页只有两个键：A 或左方向键上一页，D 或右方向键下一页，任何页内交互都不占用这四个键。每页入场一律用 GSAP 时间线实现，按讲述顺序带入内容，不只用整页淡入。

所有风格都交付一个可离线打开的 HTML 文件，交付前对照 [常见问题清单](references/html/pitfalls.md)，运行 [强制内联 GSAP](references/html/workflow.md#交付前强制内联-gsap)，并通过 [单文件与翻页验收](references/html/workflow.md#单文件与翻页验收)。

## 同时交付稿件和 HTML

用同一份页面提纲组织两份交付物。记录每页标题、听众需要理解的结论、要展示的证据或操作、预计用时。稿件负责讲解和过渡，HTML 展示台上需要指给听众看的信息。交付前逐页核对顺序、术语、数字和演示步骤，并运行 HTML 的单文件与翻页验收。

## 示例

需要对照成品形态时，阅读 [示例讲稿](examples/report-helper-demo/讲稿.md) 与配套的 `examples/report-helper-demo/汇报页.html`。暖纸手记风的成品见 `examples/warm-paper-demo/汇报页.html`，自然多色风（多色选择，示例用第 15 套暖粉薄荷）的成品见 `examples/natural-multi-demo/汇报页.html`。示例只用于对照格式与页面组织方式，内容以本次项目资料为准。
