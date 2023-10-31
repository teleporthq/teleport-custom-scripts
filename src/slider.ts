import { Swiper } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css"
import "swiper/css/navigation";
import "swiper/css/autoplay";

export class Slider {
  #sliderInstances = {};

  init = () => {
    const sliderElements = document.querySelectorAll<HTMLElement>('[data-thq="slider"]');
    for (const sliderElement of sliderElements) {
      const identifier = Array.from(sliderElement.classList).join(".");
      const properties = sliderElement.dataset;
      const nextButton = sliderElement.querySelector<HTMLElement>(
        '[data-thq="slider-button-next"]',
      );
      const prevButton = sliderElement.querySelector<HTMLElement>(
        '[data-thq="slider-button-prev"]',
      );

      const autoplay = Boolean(properties?.autoplay);
      const modules = [Navigation, Autoplay];

      const swiperInstance = new Swiper(sliderElement, {
        modules,
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton,
        },
        autoplay,
      });

      this.#sliderInstances[identifier] = swiperInstance;
    }
  };
}
