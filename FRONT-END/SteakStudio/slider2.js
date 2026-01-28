const controls = document.querySelectorAll(".control");
let currentItem = 0;
const items = document.querySelectorAll(".slider2img");
const maxItems = items.length;
controls.forEach((control) => {
  control.addEventListener("click", (e) => {
    isLeft = e.target.classList.contains("slider2setaesq");
    if (isLeft) {
      currentItem -= 1;
    } else {
      currentItem += 1;
    }
    if (currentItem >= maxItems) {
      currentItem = 0;
    }
    if (currentItem < 0) {
      currentItem = maxItems - 1;
    }
    items.forEach((item) => item.classList.remove("slider2img1"));
    items[currentItem].scrollIntoView({
      behavior: "smooth",
      inline: "center"
    });
    items[currentItem].classList.add("slider2img1");
  });
});