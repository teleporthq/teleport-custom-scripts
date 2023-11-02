import { Swiper } from "swiper";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/pagination";

const getDOMStringRepresentation = (node: HTMLElement | Text) => {
  if (node instanceof Element) {
    return node.outerHTML;
  } else if (node instanceof Text) {
    return node.textContent;
  } else {
    return "Cannot get string representation for this node type.";
  }
};

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
      const paginationElm = sliderElement.querySelector<HTMLElement>(
        '[data-thq="slider-pagination"]',
      );

      const autoplay = JSON.parse(properties.autoplay ?? "false");
      const autoPlayDelay = JSON.parse(properties.autoplayDelay ?? "3000");
      const loop = JSON.parse(properties.loop ?? "false");
      const pagination = JSON.parse(properties.pagination ?? "false");
      const disableAutoplayOnInteraction = JSON.parse(
        properties.disableAutoplayOnInteraction ?? "true",
      );
      const pauseAutoplayOnMouseEnter = JSON.parse(
        properties.pauseAutoplayOnMouseEnter ?? "false",
      );

      let autoplayOptions: null | boolean | Record<string, string>;
      if (!autoplay) {
        autoplayOptions = null;
      } else if (
        autoplay &&
        !autoPlayDelay &&
        !disableAutoplayOnInteraction &&
        !pauseAutoplayOnMouseEnter
      ) {
        autoplayOptions = true;
      } else {
        autoplayOptions = {
          delay: autoPlayDelay,
          disableOnInteraction: disableAutoplayOnInteraction,
          pauseOnMouseEnter: pauseAutoplayOnMouseEnter,
        };
      }

      /*
        If pagination is disabled but the elements are added.
        Usually the design editor marks them as display `none`.
      */
      if (!pagination && paginationElm) {
        paginationElm.style.display = "none";
      }

      const modules = [Navigation, Autoplay, Pagination];
      const swiperOptions = {
        modules,
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton,
        },
        ...(loop && { loop }),
        ...(pagination &&
          paginationElm && {
            pagination: {
              el: paginationElm,
              clickable: true,
              renderBullet: (index: string) => {
                return getDOMStringRepresentation(paginationElm.children[index]);
              },
            },
          }),
        ...(autoplayOptions && {
          autoplay: autoplayOptions,
        }),
      };

      const swiperInstance = new Swiper(sliderElement, swiperOptions);
      this.#sliderInstances[identifier] = swiperInstance;
    }
  };
}
