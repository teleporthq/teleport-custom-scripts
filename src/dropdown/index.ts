import { createFocusTrap } from "focus-trap";
import { TeleportInteractiveElement } from "../types";
import { log, appendStylesToDOM, getAllElementsByDataAttribute, getElByDataAttribute } from "../utils";

const DROPDOWN = 'thq-dropdown';
const DROPDOWN_LIST = 'thq-dropdown-list';
const DROPDOWN_TOGGLE = "thq-dropdown-toggle";
const DROPDOWN_INDICATOR = 'thq-dropdown-arrow';

export class Dropdown implements TeleportInteractiveElement {
  get styles() {
    return `
    [data-thq="${DROPDOWN}:hover"] > div [data-thq="${DROPDOWN_LIST}"] {
      transform: rotate(90deg);
    }

    [data-thq="${DROPDOWN}"] {
      cursor: pointer;
      display: inline-block;
      position: relative;
    }

    [data-thq="${DROPDOWN_TOGGLE}"] {
      fill: #595959;
      color: #595959;
      width: 100%;
      display: inline-flex;
      align-items: flex-start;
    }

    [data-thq="${DROPDOWN_LIST}"] {
      left: 0%;
      width: max-content;
      display: none;
      z-index: 100;
      position: absolute;
      min-width: 100%;
      transition: 0.3s;
      align-items: stretch;
      border-color: #D9D9D9;
      border-width: 1px;
      flex-direction: column;
      list-style-type: none;
      list-style-position: inside;
    }

    [data-thq="${DROPDOWN_INDICATOR}"] {
      width: 18px;
      height: 18px;
      transition: 0.3s;
    }
    `;
  }

  handleClickEvent(ev: MouseEvent) {
    if (ev instanceof MouseEvent === false && ev instanceof KeyboardEvent === false) {
      return
    }

    if (ev instanceof KeyboardEvent && ev.key !== 'Enter') {
      return
    }

    ev.stopPropagation();
    const scope = ev.target as HTMLElement;
    const dropdown = scope.closest<HTMLElement>(`[data-thq="${DROPDOWN}"]`);
    if (!dropdown) {
      return;
    }

    const dropdownToggle = getElByDataAttribute("thq", DROPDOWN_TOGGLE, dropdown) as HTMLElement;
    const dropdownList = getElByDataAttribute("thq", DROPDOWN_LIST, dropdown);
    if (!dropdownList) {
      log("No list detected nearer to the dropdown toggle");
      return;
    }

    const trap = createFocusTrap(dropdownList, {
      clickOutsideDeactivates: true,
      onDeactivate: () => {
        dropdownList.style.display = 'none';
        dropdownList.setAttribute('aria-expanded', "false")
        trap.deactivate()
      },
      setReturnFocus: dropdownToggle,
    });

    if (dropdownList.style.display === 'none' || !dropdownList.style.display) {
      dropdownList.style.display = 'flex';
      dropdownList.setAttribute('aria-expanded', "true");
      trap.activate();
    }
  }

  init() {
    const dropdowns = getAllElementsByDataAttribute("thq", DROPDOWN);
    dropdowns.forEach((dropdown) => {
      const dropdownToggle = getElByDataAttribute("thq", DROPDOWN_TOGGLE, dropdown);
      const dropdownList = getElByDataAttribute("thq", DROPDOWN_LIST, dropdown);
      if (!dropdownToggle) {
        return;
      }
      Object.assign(dropdownToggle, {
        role: 'button',
        tabIndex: "0",
        ariaPressed: false,
      });
      dropdownToggle.addEventListener('click', this.handleClickEvent.bind(this));
      dropdownToggle.addEventListener('keydown', this.handleClickEvent.bind(this));
      dropdownList?.setAttribute('aria-expanded', "false");
    });

    appendStylesToDOM(this.styles, 'thq-dropdown-styles');
  }
}
