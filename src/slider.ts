import { Swiper } from "swiper";
import { SwiperOptions } from 'swiper/types'
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
  }

  /*
    When we generate the DOM representation from one iframe scope
    and move to another iframe scope, the node will be a different.
    Event if both are instance of thier respective HTMLElement or Text.

    So, it's a hack to get the string representation of the node.
  */
  if ((node as HTMLElement)?.outerHTML) {
    return (node as HTMLElement).outerHTML;
  } else if ((node as Text)?.textContent) {
    return (node as Text).textContent;
  }

  return "";
};

export class Slider {
  #sliderInstances = {};

  init = () => {
    const sliderElements = document.querySelectorAll<HTMLElement>('[data-thq="slider"]');
    for (const sliderElement of sliderElements) {
      const identifier = Array.from(sliderElement.classList).join(".");
      const properties = sliderElement.dataset;
      const nextButtons = sliderElement.querySelectorAll<HTMLElement>(
        '[data-thq="slider-button-next"]',
      );
      const prevButtons = sliderElement.querySelectorAll<HTMLElement>(
        '[data-thq="slider-button-prev"]',
      );
      const paginationElms = sliderElement.querySelectorAll<HTMLElement>(
        '[data-thq="slider-pagination"]',
      );

      let nextButton: HTMLElement | null = null
      let prevButton: HTMLElement | null = null
      let paginationElm: HTMLElement | null = null

      /*
        The sliders can be nested any number of times.
        Just querySelector gives the first amtch. And not the direct clid of the slider.
        So, we need to map through all the selectors and find the direct children.
      */

      for(const next of (nextButtons ?? [])) {
        if (next.parentNode === sliderElement) {
          nextButton = next
        }
      }

      for(const prev of (prevButtons ?? [])) {
        if (prev.parentNode === sliderElement) {
          prevButton = prev
        }
      }

      for(const pagination of (paginationElms ?? [])) {
        if (pagination.parentNode === sliderElement) {
          paginationElm = pagination
        }
      }

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
      const swiperOptions: SwiperOptions = {
        modules,
        observeSlideChildren: true,
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
                const paginationIcon = paginationElm?.children[index]
                if (paginationIcon) {
                  return getDOMStringRepresentation(paginationIcon);
                }

                if (!paginationIcon && paginationElm?.children?.[0]) {
                  return getDOMStringRepresentation(paginationElm?.children[0] as HTMLElement);
                }

                return getDOMStringRepresentation(paginationElm?.children[index]);
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
