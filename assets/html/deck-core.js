const slides = Array.from(document.querySelectorAll(".deck > section"));
const status = document.querySelector("#slide-status");
let currentIndex = 0;

function showSlide(index) {
  if (index < 0 || index >= slides.length) {
    return;
  }
  currentIndex = index;
  slides.forEach((slide, position) => {
    slide.hidden = position !== index;
  });
  status.textContent = `${index + 1} / ${slides.length}`;
  window.scrollTo(0, 0);
}

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
