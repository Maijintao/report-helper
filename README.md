# report-helper

把一个项目的资料，变成**能直接念的答辩逐字稿**，和**能离线打开的 HTML 汇报页**。

这是一个给 AI agent 用的 skill（技能包），面向课程中期检查、期末答辩、工作项目进度汇报、成果验收和技术评审。

## 它解决什么

汇报最费时间的是两件事：写稿子，做页面。这两件事其实共用同一份材料，但大多数人分开做，做完还对不上。

这个 skill 把它们绑在一起：

- **逐字稿**：按意思分段（不按页），套一套 14 段的论证骨架，末尾附问答备稿。目标只有一个——照着念就能讲。
- **HTML 汇报页**：单文件、断网能开、键盘翻页、每页带 GSAP 动效，六套现成风格。

两者可以单独要，也可以从同一份资料一起出。

## 快速开始

### 当作 skill 用

把整个目录放进 agent 的 skills 目录，例如 WorkBuddy 的 `~/.workbuddy-ai/skills/report-helper`，然后直接说：

- 「帮我写周三中期检查的逐字稿，8 分钟，我负责采集端」
- 「把这份资料做成期末答辩的汇报页」
- 「稿子和页面一起要，10 分钟」

agent 会读 `SKILL.md` 里的路由，按场景加载 `references/` 下对应的规则。

### 直接用模板

不装 agent 也能用。`assets/html/styles/<风格>/deck.html` 都是自带 GSAP 的单文件，双击就能翻页，替换内容即可。

## 产出物长什么样

| 类型 | 示例 |
| --- | --- |
| 逐字稿（含问答备稿） | [`examples/script-demo/逐字稿.md`](examples/script-demo/逐字稿.md) |
| 暖纸手记风页面 | [`examples/warm-paper-demo/汇报页.html`](examples/warm-paper-demo/汇报页.html) |
| 自然多色风页面 | [`examples/natural-multi-demo/汇报页.html`](examples/natural-multi-demo/汇报页.html) |
| 基础演示页面 | [`examples/report-helper-demo/汇报页.html`](examples/report-helper-demo/汇报页.html) |

## 目录结构

```
SKILL.md                  入口：什么场景读哪份规则
references/
  script/                 逐字稿：流程、学生场景、工作场景、问答、时长预算
  html/                   汇报页：工作流程、设计基准、动效、常见问题、风格选择
  html/styles/<风格>/      每套风格的规则与色板
assets/html/
  base.html               基础模板（结构 + 翻页 + 时间线）
  deck-core.js            翻页与动效的参考实现
  styles/<风格>/deck.html  六套可离线打开的成品模板
  vendor/                 GSAP 发行文件（内联用）
scripts/
  embed-gsap.mjs          把 GSAP 整段内联进成品
  check-deck.mjs          单文件与翻页验收
  check-pagination.js     验收逻辑本体
examples/                 成品示例
```

## 六套风格

| 风格 | 适合 | 不适合 |
| --- | --- | --- |
| 稿纸风 | 有截图、图解或实测数据 | 大段结论文字 |
| 流式代码风 | 软件工程、架构、代码 | 硬件实物、非技术听众 |
| 简笔画风 | 结构、装配、状态对比 | 数据密集页 |
| 卡通风 | 科普、创意项目、社团活动 | 技术评审、严肃答辩 |
| 暖纸手记风 | 个人项目、作品集、宣讲 | 数据密集页、严肃评审 |
| 自然多色风（多色选择） | 课程汇报、创意项目 | 精确读数的图表、单一品牌色 |

自然多色风自带 17 套配色，先选一套再做页面；其余五套配色固定。

## 两条硬规矩

1. **翻页只有两个键**：A / ← 上一页，D / → 下一页。任何页内交互都不占用这四个键。
2. **每页入场必须用 GSAP 时间线**，交付前把库整段内联，成品要能断网打开。

## 验收（改模板或脚本时跑）

```sh
npm install          # 只装 playwright-core
node scripts/check-deck.mjs 你的汇报页.html
node scripts/embed-gsap.mjs 你的汇报页.html
```

`check-deck` 会断网重开页面，在 1440×900、1280×720、390×844 三种尺寸下实际发按键，检查：单页显示、首尾边界、右下角页码、投影尺寸不出现纵向滚动、滚轮不翻页、没有外部资源请求；随后在允许动效的条件下重跑一遍，确认 GSAP 已内联、每页播完后内容完整可见。

`embed-gsap` 负责把 `assets/html/vendor/gsap-3.13.0.min.js` 整段插进成品，保留许可声明，并检查有没有真正的时间线调用。

## 环境要求

- Node.js 18 以上
- Google Chrome（验收脚本用 `channel: "chrome"` 启动）
- 部分环境下 Chrome 沙箱起不来，追加 `--no-sandbox`

## 许可与致谢

- 内联的 GSAP 3.13.0 归 GreenSock 所有，按 [GSAP 标准许可](https://gsap.com/standard-license) 使用，发行文件里的许可声明原样保留。
- 自然多色风的 17 套配色解析自 [happyhues](https://www.happyhues.co/)。
- 动效写法参考 GreenSock 官方的 [gsap-skills](https://github.com/greensock/gsap-skills)（MIT）。
