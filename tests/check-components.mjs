import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendor = resolve(root, 'assets/html/vendor/gsap-3.13.0.min.js');
const components = [
  { file: 'timeline/paper-horizontal.html', selector: '.timeline-paper', item: '.timeline-paper__item', animate: 'animateTimelinePaper' },
  { file: 'timeline/line-vertical.html', selector: '.timeline-line', item: '.timeline-line__item', animate: 'animateTimelineLine' },
  { file: 'timeline/warm-paper.html', selector: '.timeline-warm', item: '.timeline-warm__item', animate: 'animateTimelineWarm' },
  { file: 'timeline/natural-multi.html', selector: '.timeline-natural', item: '.timeline-natural__item', animate: 'animateTimelineNatural' },
  { file: 'timeline/alternating-cards.html', selector: '.timeline-cards', item: '.timeline-cards__item', animate: 'animateTimelineCards' },
];

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.setOffline(true);
const page = await context.newPage();
const fragments = components.map(({ file }) => readFileSync(resolve(root, 'assets/html/components', file), 'utf8'));

await page.setContent(`<main>${fragments.join('\n')}</main>`);
await page.addScriptTag({ path: vendor });
await page.addStyleTag({ content: 'body{margin:0;padding:24px}main{display:grid;gap:64px}main>div,main>figure{margin:0;width:100%;max-width:1100px;box-sizing:border-box}' });

for (const component of components) {
  const count = await page.locator(`${component.selector} ${component.item}`).count();
  assert.ok(count >= 3, `${component.file} 需要展示至少三个数据项`);
  const animation = await page.evaluate(({ selector, item, animate }) => {
    const element = document.querySelector(selector);
    const timeline = gsap.timeline({ paused: true });
    window[animate](timeline, element, 0);
    const duration = timeline.duration();
    timeline.progress(1);
    return { duration, visible: [...element.querySelectorAll(item)].every((entry) => getComputedStyle(entry).visibility !== 'hidden' && Number(getComputedStyle(entry).opacity) > 0.99) };
  }, component);
  assert.ok(animation.duration > 0, `${component.file} 需要创建动画`);
  assert.ok(animation.visible, `${component.file} 动画结束后内容需要可见`);
}

for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 900 });
  const overflow = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  assert.ok(overflow.document <= overflow.viewport, `${width}px 宽度下页面出现横向溢出`);
  for (const component of components) {
    const outOfBounds = await page.locator(`${component.selector} ${component.item}`).evaluateAll((entries) => entries.some((entry) => {
      const box = entry.getBoundingClientRect();
      return box.left < -1 || box.right > document.documentElement.clientWidth + 1;
    }));
    assert.equal(outOfBounds, false, `${component.file} 在 ${width}px 宽度下超出页面`);
  }
}

for (const component of components.filter((entry) => entry.file.startsWith('timeline/'))) {
  const counts = await page.evaluate(({ selector, item }) => {
    const element = document.querySelector(selector);
    const entries = element.querySelectorAll(item);
    entries[0].parentElement.append(entries[0].cloneNode(true), entries[1].cloneNode(true));
    return { before: entries.length, after: element.querySelectorAll(item).length };
  }, component);
  assert.equal(counts.after, counts.before + 2, `${component.file} 需要支持增减节点`);
}

await page.waitForFunction(() => document.querySelectorAll('.timeline-cards__links path').length === document.querySelectorAll('.timeline-cards__item').length - 1);
const cardLinks = await page.locator('.timeline-cards__links path').count();
assert.equal(cardLinks, 6, '交错卡片之间需要显示连接线');
await page.locator('.timeline-cards__item').last().evaluate((item) => item.remove());
await page.waitForFunction(() => document.querySelectorAll('.timeline-cards__links path').length === document.querySelectorAll('.timeline-cards__item').length - 1);
const endpoints = await page.evaluate(() => {
  const svg = document.querySelector('.timeline-cards__links');
  const path = svg.querySelector('path');
  const cards = document.querySelectorAll('.timeline-cards__item');
  const matrix = svg.getScreenCTM();
  const start = path.getPointAtLength(0).matrixTransform(matrix);
  const end = path.getPointAtLength(path.getTotalLength()).matrixTransform(matrix);
  const first = cards[0].getBoundingClientRect();
  const second = cards[1].getBoundingClientRect();
  return { startDistance: Math.abs(start.x - first.right), endDistance: Math.abs(end.x - second.left) };
});
assert.ok(endpoints.startDistance < 2 && endpoints.endDistance < 2, '连接线需要连接相邻卡片');

const charts = [
  { file: 'grouped-bars.html', selector: '.graph-grouped', plot: '.graph-grouped__plot', animate: 'animateGroupedChart', count: 1 },
  { file: 'story-lines.html', selector: '.story-chart', plot: '.story-row__plot', animate: 'animateStoryChart', count: 2 },
  { file: 'isometric-board.html', selector: '.iso-board', plot: '.iso-board__plot', animate: 'animateIsometricBoard', count: 1 },
];

for (const component of charts) {
  const errors = [];
  const onPageError = (error) => errors.push(error.message);
  page.on('pageerror', onPageError);
  await page.goto(pathToFileURL(resolve(root, 'assets/html/components/charts', component.file)).href);
  await page.addScriptTag({ path: vendor });
  assert.equal(await page.locator(`${component.plot} svg`).count(), component.count, `${component.file} 需要显示图表`);
  assert.ok(await page.locator(`${component.plot} svg path`).count() > 0, `${component.file} 需要绘制数据图形`);
  const duration = await page.evaluate(({ selector, animate }) => {
    const timeline = gsap.timeline({ paused: true });
    window[animate](timeline, document.querySelector(selector), 0);
    timeline.progress(1);
    return timeline.duration();
  }, component);
  assert.ok(duration > 0, `${component.file} 需要提供 GSAP 动画`);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForFunction((selector) => [...document.querySelectorAll(selector)].every((plot) => {
      const svg = plot.querySelector('svg');
      return svg && svg.getBoundingClientRect().width <= plot.getBoundingClientRect().width + 1;
    }), component.plot);
    const overflow = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    assert.ok(overflow.content <= overflow.viewport, `${component.file} 在 ${width}px 下出现横向溢出`);
    const size = await page.locator(component.plot).first().boundingBox();
    assert.ok(size.width > 100 && size.height > 100, `${component.file} 图表尺寸无效`);
  }
  if (component.file === 'grouped-bars.html') {
    assert.equal(await page.evaluate(() => document.querySelector('.graph-grouped').chartController.chart.getOption().series.length), 4);
    assert.equal(await page.locator('.graph-grouped h1, .graph-grouped p, .graph-grouped button').count(), 0);
    await page.evaluate(() => document.querySelector('.graph-grouped').chartController.update({ categories: ['甲', '乙'], maximum: 20, decimals: 0, series: [{ name: '一组', color: '#83c4e4', values: [8, 14] }, { name: '二组', color: '#63c96d', values: [10, 16] }] }));
    assert.match(await page.locator(component.plot).getAttribute('aria-label'), /甲，一组 8，二组 10/);
    assert.equal(await page.evaluate(() => document.querySelector('.graph-grouped').chartController.chart.getOption().series[0].data[0]), 8);
    assert.equal(await page.evaluate(() => document.querySelector('.graph-grouped').chartController.chart.getOption().yAxis[0].max), 20);
    await assert.rejects(page.evaluate(() => document.querySelector('.graph-grouped').chartController.update({ categories: ['甲'], maximum: 1, decimals: 2, series: [{ name: '一组', color: '#000', values: [2] }] })), /有效数值/);
  }
  if (component.file === 'story-lines.html') {
    assert.match(await page.locator(component.plot).first().getAttribute('aria-label'), /你/);
    await assert.rejects(page.evaluate(() => createStoryChart(document.querySelector('.story-chart'), { categories: ['甲', '乙'], series: [] })), /对应的数据系列/);
  }
  if (component.file === 'isometric-board.html') {
    assert.equal(await page.locator('.iso-board__total').textContent(), '1,284');
    assert.ok(await page.locator('.iso-board__plot svg path').count() >= 100, '立体柱体需要绘制各层的表面');
    const projection = await page.locator('.iso-board__total').evaluate((text) => {
      const matrix = text.getCTM();
      return { horizontalSlope: matrix.b, verticalSlope: matrix.c };
    });
    assert.ok(Math.abs(projection.horizontalSlope) > .01, `显示屏文字需要随立体视角投影：${JSON.stringify(projection)}`);
    await page.locator('.iso-board__controls button').nth(0).click();
    assert.equal(await page.locator('.iso-board__total').textContent(), '703');
    assert.match(await page.locator(`${component.plot} svg`).getAttribute('aria-label'), /7D/);
    assert.equal(await page.evaluate(() => document.querySelector('.iso-board').chartController.getState().values[0]), 61);
    await assert.rejects(page.evaluate(() => createIsometricBoard(document.querySelector('.iso-board'), { categories: ['甲'], ranges: [{ name: '一周', baseline: 2, values: [4] }] })), /三个时间范围/);
  }
  assert.deepEqual(errors, [], `${component.file} 出现运行错误`);
  page.off('pageerror', onPageError);
}

const annotations = [
  { file: 'sketch-mark.html', selector: '.sketch-mark', property: '--mark-color', color: 'rgb(40, 90, 130)' },
  { file: 'doodle-callout.html', selector: '.doodle-callout', property: '--callout-color', color: 'rgb(40, 90, 130)' },
  { file: 'marker-highlight.html', selector: '.marker-highlight', property: '--highlight-color', color: 'rgb(40, 90, 130)' },
];

for (const component of annotations) {
  const errors = [];
  const onPageError = (error) => errors.push(error.message);
  page.on('pageerror', onPageError);
  await page.goto(pathToFileURL(resolve(root, 'assets/html/components/annotations', component.file)).href);
  const locator = page.locator(component.selector);
  assert.equal(await locator.count(), 1, `${component.file} 需要包含一个组件`);
  assert.ok(await locator.isVisible(), `${component.file} 需要显示组件`);
  await locator.evaluate((element, property) => element.style.setProperty(property, 'rgb(40, 90, 130)'), component.property);
  const actualColor = await locator.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), component.property);
  assert.equal(actualColor, component.color, `${component.file} 需要支持修改颜色`);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    assert.ok(dimensions.content <= dimensions.viewport, `${component.file} 在 ${width}px 下出现横向溢出`);
  }
  if (component.file === 'sketch-mark.html') {
    assert.equal(await locator.locator('svg path').count(), 2);
    const widths = await locator.evaluate((element) => {
      const initial = element.querySelector('svg').getBoundingClientRect().width;
      element.firstChild.textContent = '需要展示的较长重点内容';
      return { initial, updated: element.querySelector('svg').getBoundingClientRect().width };
    });
    assert.ok(widths.updated > widths.initial, '圈选需要随文字宽度变化');
  }
  if (component.file === 'doodle-callout.html') {
    await locator.evaluate((element) => element.classList.add('doodle-callout--right'));
    const arrow = locator.locator('svg');
    assert.equal(await arrow.evaluate((element) => getComputedStyle(element).transform), 'matrix(-1, 0, 0, 1, 0, 0)');
    assert.equal(await locator.locator('.doodle-callout__label').textContent(), '在这里添加说明');
  }
  if (component.file === 'marker-highlight.html') {
    await locator.evaluate((element) => {
      element.style.fontSize = '22px';
      element.parentElement.style.width = '140px';
      element.textContent = '需要强调的文字可以在多行中继续显示';
    });
    const rectangles = await locator.evaluate((element) => element.getClientRects().length);
    assert.ok(rectangles > 1, '荧光笔强调需要支持换行');
    assert.equal(await locator.evaluate((element) => getComputedStyle(element).boxDecorationBreak), 'clone');
  }
  assert.deepEqual(errors, [], `${component.file} 出现运行错误`);
  page.off('pageerror', onPageError);
}

await page.goto(pathToFileURL(resolve(root, 'assets/html/components/annotations/gallery.html')).href);
assert.equal(await page.locator('.family-section').count(), 7, '标注预览需要展示七种风格');
assert.equal(await page.locator('.family-sample > .style-note').count(), 21, '每种风格需要展示三个标注');
assert.equal(await page.locator('.preview-item').count(), 20, '标注预览需要展示 20 个组件');
assert.equal(await page.locator('.annotation-mark').count(), 5);
assert.equal(await page.locator('.annotation-line').count(), 5);
assert.equal(await page.locator('.annotation-highlight').count(), 5);
assert.equal(await page.locator('.annotation-callout').count(), 5);
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 900 });
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
    clipped: [...document.querySelectorAll('.preview-item__sample > *, .family-sample > *')].some((element) => {
      const sample = element.parentElement.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return box.left < sample.left - 1 || box.right > sample.right + 1;
    }),
  }));
  assert.ok(layout.content <= layout.viewport, `标注预览在 ${width}px 下出现横向溢出`);
  assert.equal(layout.clipped, false, `标注组件在 ${width}px 下超出预览区域`);
}
const styledAnnotations = await page.evaluate(() => ({
  css: document.querySelector('#style-annotation-styles').textContent,
  examples: [...document.querySelectorAll('.family-sample > .style-note')].map((element) => element.outerHTML),
}));
await page.setContent(`<style>${styledAnnotations.css}</style><main>${styledAnnotations.examples.join(' ')}</main>`);
assert.equal(await page.locator('main > .style-note').count(), 21, '风格标注需要支持单独复制');
const styleProperties = await page.evaluate(() => {
  const value = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
  return {
    paperShadow: value('.style-note--paper', 'boxShadow'),
    codeFont: value('.style-note--code', 'fontFamily'),
    renderShadow: value('.style-note--render', 'boxShadow'),
    crayonBackground: value('.style-note--crayon', 'backgroundImage'),
    cartoonBorder: value('.style-note--cartoon', 'borderTopWidth'),
  };
});
assert.notEqual(styleProperties.paperShadow, 'none');
assert.match(styleProperties.codeFont, /mono/i);
assert.notEqual(styleProperties.renderShadow, 'none');
assert.match(styleProperties.crayonBackground, /repeating-linear-gradient/);
assert.equal(styleProperties.cartoonBorder, '2px');
await page.locator('.style-note--code .style-note__text').first().evaluate((element) => { element.textContent = '替换文字'; });
assert.equal(await page.locator('.style-note--code .style-note__text').first().textContent(), '替换文字');
await page.goto(pathToFileURL(resolve(root, 'assets/html/components/annotations/gallery.html')).href);
const reusable = await page.evaluate(() => ({
  css: document.querySelector('#annotation-styles').textContent,
  examples: [...document.querySelectorAll('.preview-item__sample > *')].map((element) => element.outerHTML),
}));
await page.setContent(`<style>${reusable.css}</style><main>${reusable.examples.join(' ')}</main>`);
assert.equal(await page.locator('main > *').count(), 20, '所有标注组件需要支持单独复制');
assert.ok(await page.locator('main .annotation-mark svg path').count() > 0, '圈选组件需要显示图形');
assert.equal(await page.locator('main .annotation-callout svg').count(), 5, '箭头标注需要显示图形');
await page.locator('main .annotation-highlight').first().evaluate((element) => {
  element.style.setProperty('--accent', 'rgb(40, 90, 130)');
  element.textContent = '替换后的文字';
});
assert.equal(await page.locator('main .annotation-highlight').first().textContent(), '替换后的文字');
assert.match(await page.locator('main .annotation-highlight').first().evaluate((element) => getComputedStyle(element).backgroundImage), /40, 90, 130/);

await browser.close();
console.log(`通过 ${components.length} 个时间线、${charts.length} 个图表和标注组件的检查，标注预览包含 21 个风格标注及 20 个通用标注。`);
