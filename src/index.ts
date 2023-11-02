import { Dropdown } from './dropdown'
import { Menu } from './menu'
import { Accordion } from './accordion'
import { Slider } from './slider'

let url = location.href;
document.body.addEventListener(
  "click",
  () => {
    requestAnimationFrame(() => {
      if (url !== location.href) {
        new Menu().init();
        new Accordion().init();
        new Dropdown().init()
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
    new Dropdown().init()
    new Menu().init();
    new Accordion().init();
    new Slider().init()
    observer.disconnect();
  });
  observer.observe(document.body, { childList: true });
} else {
  new Dropdown().init()
  new Menu().init();
  new Accordion().init();
  new Slider().init()
}
