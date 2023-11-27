import { TeleportInteractiveElement } from "./types";
import * as teleport from './utils'

export class Accordion implements TeleportInteractiveElement {
  get styles() {
    return ``
  }

  init = () => {
    this.getAccordionElementsAndAddEvents("type");
    this.getAccordionElementsAndAddEvents("role");
  };

  getAccordionElementsAndAddEvents = (dataAttr: string) => {
    const allAccordions = teleport.getAllElementsByDataAttribute(
      "role",
      "Accordion"
    );

    allAccordions.forEach((accordion) => {
      const accordionHeader = teleport.getElByDataAttribute(
        dataAttr,
        "AccordionHeader",
        accordion
      );
      const accordionContent = teleport.getElByDataAttribute(
        dataAttr,
        "AccordionContent",
        accordion
      );

      if (!accordionHeader || !accordionContent) {
        return;
      }

      accordionHeader.addEventListener("click", () => {
        accordionContent.style.maxHeight
          ? (accordionContent.style.maxHeight = "")
          : (accordionContent.style.maxHeight = `${accordionContent.scrollHeight}px`);
      });
    });
  };
}
