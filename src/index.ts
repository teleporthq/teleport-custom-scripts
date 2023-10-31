import { Dropdown } from './dropdown'
import { Menu } from './menu'
import { Accordion } from './accordion'
import { Slider } from './slider'

new Dropdown().init()
new Menu().init();
new Accordion().init();
new Slider().init()

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
