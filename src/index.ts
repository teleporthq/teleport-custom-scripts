import { Slider } from "./slider";
import { Menu } from "./menu";
import { Accordion } from "./accordion";

let url = location.href;
document.body.addEventListener(
  "click",
  () => {
    requestAnimationFrame(() => {
      if (url !== location.href) {
        new Slider().init();
        new Menu().init();
        new Accordion().init();
        url = location.href;
      }
    });
  },
  true
);

const initializeComponents = () => {
  new Slider().init();
  new Menu().init();
  new Accordion().init();
};

const isReactEnvironment = () => {
  // Simple check to see if we are in a React environment
  return (
    typeof (window as any).React !== "undefined" &&
    typeof (window as any).ReactDOM !== "undefined"
  );
};

const setupMutationObserver = () => {
  const appDiv = document.getElementById("appDiv");

  if (appDiv) {
    const observer = new MutationObserver(() => {
      initializeComponents();
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true });
  } else {
    initializeComponents();
  }
};

if (isReactEnvironment()) {
  // React environment
  (window as any).React.useEffect(() => {
    setupMutationObserver();
  }, []);
} else if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  // The DOM is already loaded
  setupMutationObserver();
} else {
  // Plain HTML environment
  document.addEventListener("DOMContentLoaded", () => {
    setupMutationObserver();
  });
}
