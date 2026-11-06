# 动效规则

模板默认用 CSS 让整页内容一起入场，讲解时不需要额外操作。需要在一页之内按讲述顺序逐条显示，或者需要按返回键退回上一步时，使用本页的 GSAP 用法。

内容摘自 GreenSock 官方的 gsap-skills（`github.com/greensock/gsap-skills`，MIT 许可），只保留汇报页用得到的部分。

## 单文件里的引入方式

成品要能离线打开，把库的发行文件内容整段放进 `<script>`，保留文件开头的版权与许可声明，再写自己的代码。不引用外部地址，也不留 `<script src>`。

## 逐步揭示与回退

用一条暂停的时间线把本页的步骤串起来，按键时正向播放，返回时倒放。倒放会把已经出现的内容退回上一步的状态，不需要自己记录进度。

```html
<section class="slide">
  <h2>标题</h2>
  <p data-step>第一条</p>
  <p data-step>第二条</p>
</section>
```

```js
function buildSteps(slide) {
  const steps = slide.querySelectorAll("[data-step]");
  const timeline = gsap.timeline({ paused: true });
  timeline.set(steps, { autoAlpha: 0, y: 16 });
  steps.forEach((step) => {
    timeline.to(step, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" });
  });
  return timeline;
}
```

按键处理里，先判断本页是否还有未播放的步骤，有就推进时间线，没有才翻页。返回时先判断是否可以倒放，倒到开头再翻到上一页。

## 常用写法

- `gsap.to(targets, vars)` 从当前状态动到目标状态，`gsap.from()` 用于入场，`gsap.fromTo()` 明确首尾状态。
- 属性名用驼峰写法，例如 `backgroundColor`、`fontSize`。
- 位移、缩放、旋转用 `x`、`y`、`scale`、`rotation` 这类别名，不要直接写 `transform` 字符串。
- 淡入淡出用 `autoAlpha`。数值为 0 时会同时设置 `visibility: hidden`，避免透明元素继续接收点击。
- 多个元素依次出现用 `stagger`，例如 `stagger: 0.12`，或者 `{ amount: 0.4, from: "center" }`。
- 缓动使用内置名称，`power1.out` 到 `power4.out`、`back.out(1.7)`、`none` 足够覆盖汇报场景。
- 统一默认值用 `gsap.defaults({ duration: 0.45, ease: "power2.out" })`。

## 减少动态效果

用 `gsap.matchMedia()` 同时处理响应式断点和系统的减少动效设置。条件不再成立时，该分支创建的动画会自动撤销。

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: reduce)", () => {
  gsap.set("[data-step]", { autoAlpha: 1, y: 0 });
});
mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.defaults({ duration: 0.45, ease: "power2.out" });
});
```

## 不要这样写

- 不要用 `delay` 串起多个动画，用时间线。
- 不要动 `width`、`height`、`top`、`left`，用 `x`、`y`、`scale`。
- 不要在同一个属性上叠多个 `from()`，后一个要加 `immediateRender: false`。
- 不要让动效结束时正文停在透明状态。讲完这一页，文字和图必须完整可读。
