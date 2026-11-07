# 动效规则

**所有汇报页一律用 GSAP 时间线做入场动效**，按讲述顺序呈现页面元素，不只用整页淡入。翻页只有两个键：`a` / `←` 上一页，`d` / `→` 下一页。按键只翻页，不承担页内步骤。

内容摘自 GreenSock 官方的 gsap-skills（`github.com/greensock/gsap-skills`，MIT 许可），只保留汇报页用得到的部分。

## 单文件里的引入方式

成品要能离线打开，库必须整段内联，**不允许** `<script src>` 或 CDN 地址。

skill 自带发行文件 `assets/html/vendor/gsap-3.13.0.min.js`，带 GreenSock 的许可声明。制作成品时不要在代码里手抄这份库，交付前统一跑 [强制内联命令](workflow.md#交付前强制内联-gsap)：

```sh
node /path/to/report-helper/scripts/embed-gsap.mjs /path/to/report.html
```

脚本会把库插到第一个 `<script>` 之前，保证业务脚本执行时 `gsap` 已存在；已经内联过的文件会跳过；检测到外部脚本引用会直接失败。也可在 HTML 里写 `<!-- GSAP_PLACEHOLDER -->` 指定插入位置。自己的动效代码写在这段库之后。

## 每页一条时间线

每页在显示时播一条时间线，按讲述顺序把标题、正文、图表、图注依次带入。播完就停在终态，不循环、不等待、不需要观众按键。

```html
<section class="slide">
  <p class="eyebrow">结果 / 03</p>
  <h2>三项指标一起下降</h2>
  <figure>…</figure>
  <p class="note">数据来源：8 月 12 日至 9 月 3 日，n = 1 240</p>
</section>
```

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateSlide(slide) {
  if (reduceMotion || typeof gsap === "undefined") return;
  const one = (selector) => slide.querySelector(selector);
  const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power3.out" } });

  tl.from(one(".eyebrow"), { autoAlpha: 0, y: 10 });
  tl.from(one("h2"), { autoAlpha: 0, y: 22 }, "-=.3");
  tl.from(one("figure"), { autoAlpha: 0, y: 18 }, "-=.32");
  tl.from(one(".note"), { autoAlpha: 0, y: 12 }, "-=.3");
}
```

按页选用不同的元素顺序：封面先纸片后标题，结果页先结论后证据，流程页沿路径依次出现。不要给每页都套同一个淡入上浮。

## 翻页时收尾

翻页前把上一页的补间结束、内联样式清掉，快速连按时内容不会停在半透明。翻页函数只做三件事：清理上一页、切换 `hidden`、播当前页的时间线。

```js
function resetSlide(slide) {
  if (typeof gsap === "undefined") return;
  const targets = slide.querySelectorAll("*");
  gsap.killTweensOf(targets);
  gsap.set(targets, { clearProps: "opacity,visibility,transform" });
}
```

按键处理保持最简，只有两个分支，任何页内逻辑都不拦截翻页键：

```js
document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) return;
  const key = event.key.toLowerCase();
  if (key === "a" || key === "arrowleft") showSlide(currentIndex - 1);
  else if (key === "d" || key === "arrowright") showSlide(currentIndex + 1);
  else return;
  event.preventDefault();
});
```

需要在一页里分几段讲时，用同一条时间线拆成多个 `.add()` 段，让它们自己往下播；不要为了等观众而把翻页键拦下来。

## 常用写法

- `gsap.to(targets, vars)` 从当前状态动到目标状态，`gsap.from()` 用于入场，`gsap.fromTo()` 明确首尾状态。
- 属性名用驼峰写法，例如 `backgroundColor`、`fontSize`。
- 位移、缩放、旋转用 `x`、`y`、`scale`、`rotation` 这类别名，不要直接写 `transform` 字符串。
- 淡入淡出用 `autoAlpha`。数值为 0 时会同时设置 `visibility: hidden`，避免透明元素继续接收点击。
- 多个元素依次出现用 `stagger`，例如 `stagger: 0.12`，或者 `{ amount: 0.4, from: "center" }`。
- 缓动使用内置名称，`power1.out` 到 `power4.out`、`back.out(1.7)`、`none` 足够覆盖汇报场景。
- 统一默认值用 `gsap.defaults({ duration: 0.45, ease: "power2.out" })`。

## 减少动态效果

系统开启减少动态效果时，直接显示终态，不播任何动画。页面加载时读一次即可：

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

需要在运行中跟随系统设置变化时，用 `gsap.matchMedia()`，条件不再成立时该分支创建的动画会自动撤销。

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: reduce)", () => {
  gsap.set(".slide *", { clearProps: "opacity,visibility,transform" });
});
```

## 不要这样写

- 不要用 `delay` 串起多个动画，用时间线。
- 不要动 `width`、`height`、`top`、`left`，用 `x`、`y`、`scale`。
- 不要在同一个属性上叠多个 `from()`，后一个要加 `immediateRender: false`。
- 不要让动效结束时正文停在透明状态。讲完这一页，文字和图必须完整可读。
- 不要让页内步骤接管 `a`、`d`、`←`、`→`。翻页键在任何页面上都只翻页。
