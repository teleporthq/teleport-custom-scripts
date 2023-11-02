import { Slider } from './slider'

let url = location.href;
document.body.addEventListener(
  "click",
  () => {
    requestAnimationFrame(() => {
      if (url !== location.href) {
        new Slider().init()
        url = location.href;
      }
    });
  },
  true
);

const appDiv = document.getElementById("app");
if (appDiv) {
  const observer = new MutationObserver(() => {
    new Slider().init()
    observer.disconnect();
  });
  observer.observe(document.body, { childList: true });
} else {
  new Slider().init()
}
