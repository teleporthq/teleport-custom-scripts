(function () {
  class Menu {
    init = () => {
      this.listenForUrlChanges()
      this.getMenuElementsAndAddEvents()
      return this;
    };

    getMenuElementsAndAddEvents = () => {
      const menuElements = teleport.getAllElByClass(
        "teleport-menu-burger"
      );

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

    listenForUrlChanges = () => {
      let url = location.href;
      document.body.addEventListener('click', () => {
        requestAnimationFrame(() => {
          if (url !== location.href) {
            console.log('URL changed');
            this.getMenuElementsAndAddEvents()
            url = location.href
          }
        });
      }, true);
    }
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
        teleport.error(`did not find ${className} class`);
      }
      return el;
    },
    getAllElByClass: (className) => {
      const elements = document.querySelectorAll(`*[class*="${className}"]`);
      if (!elements) {
        teleport.error(`did not find ${className} class`);
      }
      return elements;
    },
    Menu,
  }

  new Menu().init()
})()


