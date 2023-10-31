import { Dropdown } from './dropdown'
import { Menu } from './menu'
import { Accordion } from './accordion'

new Dropdown().init()
new Menu().init();
new Accordion().init();

let url = location.href;
document.body.addEventListener(
  "click",
  () => {
    requestAnimationFrame(() => {
      if (url !== location.href) {
        new Menu().init();
        new Accordion().init();
        url = location.href;
      }
    });
  },
  true
);
