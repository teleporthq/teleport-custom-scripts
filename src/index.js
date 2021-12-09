(function () {
  class Menu {
    init = () => {
      this.getMenuElementsAndAddEvents()
      this.getMenuElementsAndAddEventsByDataAttrs()
      return this;
    };

    getMenuElementsAndAddEventsByDataAttrs = () => {
      const allHeaders = teleport.getAllElementsByDataAttribute('role', 'Header')

      if (!allHeaders.length) {
        teleport.log("No teleport Headers found in your project")
      }

      allHeaders.forEach(header => {
        const burgerBtn = teleport.getElByDataAttribute('type', 'BurgerMenu', header)
        const mobileMenu = teleport.getElByDataAttribute('type', 'MobileMenu', header)
        const closeBtn = teleport.getElByDataAttribute('type', 'CloseMobileMenu', header)

        burgerBtn.addEventListener('click', () => {
          mobileMenu.classList.add('teleport-show')
        })

        closeBtn.addEventListener('click', () => {
          mobileMenu.classList.remove('teleport-show')
        })
      })

    }

    getMenuElementsAndAddEvents = () => {
      const menuElements = teleport.getAllElByClass(
        "teleport-menu-burger"
      )

      if (!menuElements.length) {
        teleport.log("No teleport-menu-burger items found");
        return;
      }

      menuElements.forEach((burgerMenuElement) => {
        const mobileMenuElement =
          burgerMenuElement.nextElementSibling?.className.includes(
            "teleport-menu-mobile"
          )
            ? (burgerMenuElement.nextElementSibling)
            : null;
        if (!mobileMenuElement) {
          teleport.error(
            `${burgerMenuElement} has no corresponding element with class 'teleport-menu-mobile' as the next sibling.`
          );
          return;
        }

        const closeMenuElement = mobileMenuElement.querySelector(
          '*[class*="teleport-menu-close"]'
        );
        if (!closeMenuElement) {
          teleport.error(
            `${mobileMenuElement} has no child element with class 'teleport-menu-close'`
          );
          return;
        }

        burgerMenuElement.addEventListener("click", () => {
          mobileMenuElement.classList.add("teleport-show");
        });
        closeMenuElement.addEventListener("click", () => {
          mobileMenuElement.classList.remove("teleport-show");
        });
      });
    };
  }

  class Accordion {
    init = () => {
      this.getAccordionElementsAndAddEvents()
    }

    getAccordionElementsAndAddEvents = () => {
      const allAccordions = teleport.getAllElementsByDataAttribute('role', 'Accordion')

      if (!allAccordions.length) {
        teleport.log("No teleport Accordions found in project")
      }

      allAccordions.forEach(accordion => {
        const accordionHeader = teleport.getElByDataAttribute('type', 'AccordionHeader', accordion)
        const accordionContent = teleport.getElByDataAttribute('type', 'AccordionContent', accordion)

        accordionHeader.addEventListener('click', () => {
          accordionContent.style.maxHeight ?
            accordionContent.style.maxHeight = "" :
            accordionContent.style.maxHeight = `${accordionContent.scrollHeight}px`
        })
      })
    }
  }

  const listenForUrlChanges = () => {
    let url = location.href;
    document.body.addEventListener('click', () => {
      requestAnimationFrame(() => {
        if (url !== location.href) {
          new Menu().init()
          new Accordion().init()
          url = location.href
        }
      });
    }, true);
  }

  const teleport = {
    debug: false,
    log: (msg, obj) => {
      if (teleport.debug) {
        console.log("teleport: " + msg, obj || "");
      }
    },
    error: (msg, object) => {
      console.error("teleport-error: " + msg, object);
    },
    getElByClass: (className) => {
      const el = document.querySelector(`*[class*="${className}"]`);
      if (!el) {
        teleport.log(`did not find element with "${className}" class`);
      }
      return el;
    },
    getElByDataAttribute: (attribute, value, scope = document) => {
      const el = scope.querySelector(`[data-${attribute}="${value}"]`)
      if (!el) {
        teleport.log(`did not find element with "data-${attribute}=${value}"`)
      }
      return el
    },
    getAllElByClass: (className) => {
      const elements = document.querySelectorAll(`*[class*="${className}"]`);
      if (!elements) {
        teleport.log(`did not find any elements with "${className}" class`);
      }
      return elements;
    },
    getAllElementsByDataAttribute: (attribute, value, scope = document) => {
      const elements = scope.querySelectorAll(`[data-${attribute}="${value}"]`)
      if (!elements) {
        teleport.log(`did not find any elements with "data-${attribute}=${value}"`);
      }
      return elements
    },
    Menu,
    Accordion,
  }

  listenForUrlChanges()

  new Menu().init()
  new Accordion().init()
})()


