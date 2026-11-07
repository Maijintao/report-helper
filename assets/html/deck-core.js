const slides = Array.from(document.querySelectorAll(".deck > section"));
const status = document.querySelector("#slide-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentIndex = 0;

// 每页一条 GSAP 时间线，按讲述顺序带入内容；具体元素按页面结构改。
function animateSlide(slide) {
  if (reduceMotion || typeof gsap === "undefined") {
    return;
  }
  const one = (selector) => slide.querySelector(selector);
  const rest = slide.querySelectorAll("p, li, figure, figcaption");
  const timeline = gsap.timeline({ defaults: { duration: 0.5, ease: "power3.out" } });
  if (one("h1, h2")) {
    timeline.from(one("h1, h2"), { autoAlpha: 0, y: 20 });
  }
  if (rest.length > 0) {
    timeline.from(rest, { autoAlpha: 0, y: 14, stagger: 0.08 }, "-=.3");
  }
}

// 离开这一页时清掉内联样式，快速连按不会停在半透明。
function resetSlide(slide) {
  if (typeof gsap === "undefined") {
    return;
  }
  const targets = slide.querySelectorAll("*");
  gsap.killTweensOf(targets);
  gsap.set(targets, { clearProps: "opacity,visibility,transform" });
}

function showSlide(index) {
  if (index < 0 || index >= slides.length) {
    return;
  }
  if (slides[currentIndex] && currentIndex !== index) {
    resetSlide(slides[currentIndex]);
  }
  currentIndex = index;
  slides.forEach((slide, position) => {
    slide.hidden = position !== index;
  });
  status.textContent = `${index + 1} / ${slides.length}`;
  window.scrollTo(0, 0);
  animateSlide(slides[index]);
}

// 翻页只有两个键：a / ← 上一页，d / → 下一页。页内交互不占用这四个键。
document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) {
    return;
  }
  const key = event.key.toLowerCase();
  if (key === "a" || key === "arrowleft") {
    showSlide(currentIndex - 1);
  } else if (key === "d" || key === "arrowright") {
    showSlide(currentIndex + 1);
  } else {
    return;
  }
  event.preventDefault();
});

showSlide(0);
