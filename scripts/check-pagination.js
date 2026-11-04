async (page) => {
  function requireCondition(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  const reportUrl = new URL(page.url());
  requireCondition(reportUrl.protocol === "file:" && /\.html$/i.test(reportUrl.pathname),
    "请直接以 file:// 打开要交付的 HTML 文件。");
  reportUrl.hash = "";
  const dependencies = new Set();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (["data:", "blob:", "about:"].includes(url.protocol)) {
      return;
    }
    if (url.href === reportUrl.href && request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      return;
    }
    dependencies.add(`${url.protocol}//${url.host}${url.pathname}`);
  });

  function checkDependencies() {
    requireCondition(dependencies.size === 0,
      `HTML 请求了其他文件或网络资源，请内联到同一个文件：${[...dependencies].join("、")}`);
  }

  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const deck = page.locator(".deck");
  const slides = deck.locator(":scope > section");
  const shownSlides = deck.locator(":scope > section:visible");
  const counter = deck.locator("#slide-status");

  async function checkPage(index, total, action, projection) {
    checkDependencies();
    const shownCount = await shownSlides.count();
    requireCondition(shownCount === 1,
      `${action}：应当只有一页参与显示，实际有 ${shownCount} 页。`);
    requireCondition(await slides.nth(index).isVisible(),
      `${action}：应当显示第 ${index + 1} 页。`);
    requireCondition(await counter.count() === 1 && await counter.isVisible(),
      `${action}：右下角需要一个可见的页码。`);
    const match = (await counter.textContent()).trim().match(/^(\d+)\s*\/\s*(\d+)$/);
    requireCondition(match && Number(match[1]) === index + 1 && Number(match[2]) === total,
      `${action}：页码应为 ${index + 1} / ${total}。`);

    const layout = await counter.evaluate((element) => {
      const pageNumber = element.getBoundingClientRect();
      const slideArea = element.closest(".deck").getBoundingClientRect();
      return {
        rightGap: slideArea.right - pageNumber.right,
        bottomGap: slideArea.bottom - pageNumber.bottom,
        maxRightGap: slideArea.width * 0.15,
        maxBottomGap: slideArea.height * 0.15,
        screenHeight: document.documentElement.clientHeight,
        documentHeight: document.documentElement.scrollHeight,
      };
    });
    requireCondition(layout.rightGap >= 0 && layout.rightGap <= layout.maxRightGap &&
      layout.bottomGap >= 0 && layout.bottomGap <= layout.maxBottomGap,
      `${action}：页码应位于汇报区域的右下角。`);
    if (projection) {
      requireCondition(layout.documentHeight <= layout.screenHeight + 1,
        `${action}：投影尺寸出现纵向滚动，页面内容应在一屏内展示。`);
    }
  }

  async function press(key, index, total, projection) {
    await page.keyboard.press(key);
    await checkPage(index, total, `按 ${key} 后`, projection);
  }

  await page.context().setOffline(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height, projection] of [[1440, 900, true], [1280, 720, true], [390, 844, false]]) {
    await page.setViewportSize({ width, height });
    await page.reload();
    requireCondition(await deck.count() === 1, "汇报需要一个 .deck 容器。");
    const total = await slides.count();
    requireCondition(total > 0, "请用 .deck 下的 section 表示每张汇报页。");
    await checkPage(0, total, `${width} × ${height} 打开时`, projection);

    const linkedPages = await deck.evaluate((element) => {
      const slideIds = new Set([...element.querySelectorAll(":scope > section[id]")].map((slide) => slide.id));
      return [...document.querySelectorAll('a[href^="#"]')].some((link) =>
        link.getClientRects().length && slideIds.has(link.hash.slice(1)));
    });
    const pageButtons = page.getByRole("button", { name: /上一页|下一页|previous slide|next slide/i });
    requireCondition(!linkedPages && await pageButtons.count() === 0,
      "页面上应只显示页码，省去翻页按钮和页内导航。");

    await press("a", 0, total, projection);
    await press("ArrowLeft", 0, total, projection);
    await press("ArrowDown", 0, total, projection);

    for (let index = 1; index < total; index += 1) {
      await press("d", index, total, projection);
      await press("a", index - 1, total, projection);
      await press("ArrowRight", index, total, projection);
      await press("ArrowLeft", index - 1, total, projection);
      await press("ArrowRight", index, total, projection);
    }

    await press("d", total - 1, total, projection);
    await press("ArrowRight", total - 1, total, projection);
    await press("ArrowUp", total - 1, total, projection);

    if (projection) {
      await page.mouse.move(width / 2, height / 2);
      await page.mouse.wheel(0, -700);
      await page.waitForTimeout(200);
      await checkPage(total - 1, total, "滚轮向上后", true);
      for (let index = total - 1; index > 0; index -= 1) {
        await press("ArrowLeft", index - 1, total, true);
      }
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(200);
      await checkPage(0, total, "滚轮向下后", true);
    }
  }
  checkDependencies();
  requireCondition(errors.length === 0, errors.join("\n"));
  return "通过单文件与翻页验收：离线加载、单页显示、键盘翻页、首尾边界、右下角页码、滚轮与投影尺寸。";
}
