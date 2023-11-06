import { Slider } from './slider'
import { Menu } from './menu'
import { Accordion } from './accordion'

let url = location.href;
document.body.addEventListener(
  "click",
  () => {
    requestAnimationFrame(() => {
      if (url !== location.href) {
        new Slider().init()
        new Menu().init()
        new Accordion().init()
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
    new Menu().init()
    new Accordion().init()
    observer.disconnect();
  });
  observer.observe(document.body, { childList: true });
} else {
  new Slider().init()
}
