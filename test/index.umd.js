var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
(function(factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function() {
  var _sliderInstances;
  "use strict";
  /*!
  * tabbable 6.2.0
  * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
  */
  var candidateSelectors = ["input:not([inert])", "select:not([inert])", "textarea:not([inert])", "a[href]:not([inert])", "button:not([inert])", "[tabindex]:not(slot):not([inert])", "audio[controls]:not([inert])", "video[controls]:not([inert])", '[contenteditable]:not([contenteditable="false"]):not([inert])', "details>summary:first-of-type:not([inert])", "details:not([inert])"];
  var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
  var NoElement = typeof Element === "undefined";
  var matches = NoElement ? function() {
  } : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
    var _element$getRootNode;
    return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
  } : function(element) {
    return element === null || element === void 0 ? void 0 : element.ownerDocument;
  };
  var isInert = function isInert2(node, lookUp) {
    var _node$getAttribute;
    if (lookUp === void 0) {
      lookUp = true;
    }
    var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, "inert");
    var inert = inertAtt === "" || inertAtt === "true";
    var result = inert || lookUp && node && isInert2(node.parentNode);
    return result;
  };
  var isContentEditable = function isContentEditable2(node) {
    var _node$getAttribute2;
    var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, "contenteditable");
    return attValue === "" || attValue === "true";
  };
  var getCandidates = function getCandidates2(el, includeContainer, filter) {
    if (isInert(el)) {
      return [];
    }
    var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
    if (includeContainer && matches.call(el, candidateSelector)) {
      candidates.unshift(el);
    }
    candidates = candidates.filter(filter);
    return candidates;
  };
  var getCandidatesIteratively = function getCandidatesIteratively2(elements, includeContainer, options) {
    var candidates = [];
    var elementsToCheck = Array.from(elements);
    while (elementsToCheck.length) {
      var element = elementsToCheck.shift();
      if (isInert(element, false)) {
        continue;
      }
      if (element.tagName === "SLOT") {
        var assigned = element.assignedElements();
        var content = assigned.length ? assigned : element.children;
        var nestedCandidates = getCandidatesIteratively2(content, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, nestedCandidates);
        } else {
          candidates.push({
            scopeParent: element,
            candidates: nestedCandidates
          });
        }
      } else {
        var validCandidate = matches.call(element, candidateSelector);
        if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
          candidates.push(element);
        }
        var shadowRoot = element.shadowRoot || // check for an undisclosed shadow
        typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
        var validShadowRoot = !isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
        if (shadowRoot && validShadowRoot) {
          var _nestedCandidates = getCandidatesIteratively2(shadowRoot === true ? element.children : shadowRoot.children, true, options);
          if (options.flatten) {
            candidates.push.apply(candidates, _nestedCandidates);
          } else {
            candidates.push({
              scopeParent: element,
              candidates: _nestedCandidates
            });
          }
        } else {
          elementsToCheck.unshift.apply(elementsToCheck, element.children);
        }
      }
    }
    return candidates;
  };
  var hasTabIndex = function hasTabIndex2(node) {
    return !isNaN(parseInt(node.getAttribute("tabindex"), 10));
  };
  var getTabIndex = function getTabIndex2(node) {
    if (!node) {
      throw new Error("No node provided");
    }
    if (node.tabIndex < 0) {
      if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) {
        return 0;
      }
    }
    return node.tabIndex;
  };
  var getSortOrderTabIndex = function getSortOrderTabIndex2(node, isScope) {
    var tabIndex = getTabIndex(node);
    if (tabIndex < 0 && isScope && !hasTabIndex(node)) {
      return 0;
    }
    return tabIndex;
  };
  var sortOrderedTabbables = function sortOrderedTabbables2(a, b) {
    return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
  };
  var isInput = function isInput2(node) {
    return node.tagName === "INPUT";
  };
  var isHiddenInput = function isHiddenInput2(node) {
    return isInput(node) && node.type === "hidden";
  };
  var isDetailsWithSummary = function isDetailsWithSummary2(node) {
    var r = node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
      return child.tagName === "SUMMARY";
    });
    return r;
  };
  var getCheckedRadio = function getCheckedRadio2(nodes, form) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].checked && nodes[i].form === form) {
        return nodes[i];
      }
    }
  };
  var isTabbableRadio = function isTabbableRadio2(node) {
    if (!node.name) {
      return true;
    }
    var radioScope = node.form || getRootNode(node);
    var queryRadios = function queryRadios2(name) {
      return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
    };
    var radioSet;
    if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") {
      radioSet = queryRadios(window.CSS.escape(node.name));
    } else {
      try {
        radioSet = queryRadios(node.name);
      } catch (err) {
        console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
        return false;
      }
    }
    var checked = getCheckedRadio(radioSet, node.form);
    return !checked || checked === node;
  };
  var isRadio = function isRadio2(node) {
    return isInput(node) && node.type === "radio";
  };
  var isNonTabbableRadio = function isNonTabbableRadio2(node) {
    return isRadio(node) && !isTabbableRadio(node);
  };
  var isNodeAttached = function isNodeAttached2(node) {
    var _nodeRoot;
    var nodeRoot = node && getRootNode(node);
    var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;
    var attached = false;
    if (nodeRoot && nodeRoot !== node) {
      var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
      attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
      while (!attached && nodeRootHost) {
        var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
        nodeRoot = getRootNode(nodeRootHost);
        nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
        attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
      }
    }
    return attached;
  };
  var isZeroArea = function isZeroArea2(node) {
    var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
    return width === 0 && height === 0;
  };
  var isHidden = function isHidden2(node, _ref) {
    var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
    if (getComputedStyle(node).visibility === "hidden") {
      return true;
    }
    var isDirectSummary = matches.call(node, "details>summary:first-of-type");
    var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
    if (matches.call(nodeUnderDetails, "details:not([open]) *")) {
      return true;
    }
    if (!displayCheck || displayCheck === "full" || displayCheck === "legacy-full") {
      if (typeof getShadowRoot === "function") {
        var originalNode = node;
        while (node) {
          var parentElement = node.parentElement;
          var rootNode = getRootNode(node);
          if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) {
            return isZeroArea(node);
          } else if (node.assignedSlot) {
            node = node.assignedSlot;
          } else if (!parentElement && rootNode !== node.ownerDocument) {
            node = rootNode.host;
          } else {
            node = parentElement;
          }
        }
        node = originalNode;
      }
      if (isNodeAttached(node)) {
        return !node.getClientRects().length;
      }
      if (displayCheck !== "legacy-full") {
        return true;
      }
    } else if (displayCheck === "non-zero-area") {
      return isZeroArea(node);
    }
    return false;
  };
  var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
    if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
      var parentNode = node.parentElement;
      while (parentNode) {
        if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
          for (var i = 0; i < parentNode.children.length; i++) {
            var child = parentNode.children.item(i);
            if (child.tagName === "LEGEND") {
              return matches.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
            }
          }
          return true;
        }
        parentNode = parentNode.parentElement;
      }
    }
    return false;
  };
  var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
    if (node.disabled || // we must do an inert look up to filter out any elements inside an inert ancestor
    //  because we're limited in the type of selectors we can use in JSDom (see related
    //  note related to `candidateSelectors`)
    isInert(node) || isHiddenInput(node) || isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
    isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
      return false;
    }
    return true;
  };
  var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
    if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
      return false;
    }
    return true;
  };
  var isValidShadowRootTabbable = function isValidShadowRootTabbable2(shadowHostNode) {
    var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
    if (isNaN(tabIndex) || tabIndex >= 0) {
      return true;
    }
    return false;
  };
  var sortByOrder = function sortByOrder2(candidates) {
    var regularTabbables = [];
    var orderedTabbables = [];
    candidates.forEach(function(item, i) {
      var isScope = !!item.scopeParent;
      var element = isScope ? item.scopeParent : item;
      var candidateTabindex = getSortOrderTabIndex(element, isScope);
      var elements = isScope ? sortByOrder2(item.candidates) : element;
      if (candidateTabindex === 0) {
        isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
      } else {
        orderedTabbables.push({
          documentOrder: i,
          tabIndex: candidateTabindex,
          item,
          isScope,
          content: elements
        });
      }
    });
    return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
      sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
      return acc;
    }, []).concat(regularTabbables);
  };
  var tabbable = function tabbable2(container, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([container], options.includeContainer, {
        filter: isNodeMatchingSelectorTabbable.bind(null, options),
        flatten: false,
        getShadowRoot: options.getShadowRoot,
        shadowRootFilter: isValidShadowRootTabbable
      });
    } else {
      candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
    }
    return sortByOrder(candidates);
  };
  var focusable = function focusable2(container, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([container], options.includeContainer, {
        filter: isNodeMatchingSelectorFocusable.bind(null, options),
        flatten: true,
        getShadowRoot: options.getShadowRoot
      });
    } else {
      candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
    }
    return candidates;
  };
  var isTabbable = function isTabbable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error("No node provided");
    }
    if (matches.call(node, candidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorTabbable(options, node);
  };
  var focusableCandidateSelector = /* @__PURE__ */ candidateSelectors.concat("iframe").join(",");
  var isFocusable = function isFocusable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error("No node provided");
    }
    if (matches.call(node, focusableCandidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorFocusable(options, node);
  };
  /*!
  * focus-trap 7.5.4
  * @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
  */
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  var activeFocusTraps = {
    activateTrap: function activateTrap(trapStack, trap) {
      if (trapStack.length > 0) {
        var activeTrap = trapStack[trapStack.length - 1];
        if (activeTrap !== trap) {
          activeTrap.pause();
        }
      }
      var trapIndex = trapStack.indexOf(trap);
      if (trapIndex === -1) {
        trapStack.push(trap);
      } else {
        trapStack.splice(trapIndex, 1);
        trapStack.push(trap);
      }
    },
    deactivateTrap: function deactivateTrap(trapStack, trap) {
      var trapIndex = trapStack.indexOf(trap);
      if (trapIndex !== -1) {
        trapStack.splice(trapIndex, 1);
      }
      if (trapStack.length > 0) {
        trapStack[trapStack.length - 1].unpause();
      }
    }
  };
  var isSelectableInput = function isSelectableInput2(node) {
    return node.tagName && node.tagName.toLowerCase() === "input" && typeof node.select === "function";
  };
  var isEscapeEvent = function isEscapeEvent2(e) {
    return (e === null || e === void 0 ? void 0 : e.key) === "Escape" || (e === null || e === void 0 ? void 0 : e.key) === "Esc" || (e === null || e === void 0 ? void 0 : e.keyCode) === 27;
  };
  var isTabEvent = function isTabEvent2(e) {
    return (e === null || e === void 0 ? void 0 : e.key) === "Tab" || (e === null || e === void 0 ? void 0 : e.keyCode) === 9;
  };
  var isKeyForward = function isKeyForward2(e) {
    return isTabEvent(e) && !e.shiftKey;
  };
  var isKeyBackward = function isKeyBackward2(e) {
    return isTabEvent(e) && e.shiftKey;
  };
  var delay = function delay2(fn) {
    return setTimeout(fn, 0);
  };
  var findIndex = function findIndex2(arr, fn) {
    var idx = -1;
    arr.every(function(value, i) {
      if (fn(value)) {
        idx = i;
        return false;
      }
      return true;
    });
    return idx;
  };
  var valueOrHandler = function valueOrHandler2(value) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }
    return typeof value === "function" ? value.apply(void 0, params) : value;
  };
  var getActualTarget = function getActualTarget2(event) {
    return event.target.shadowRoot && typeof event.composedPath === "function" ? event.composedPath()[0] : event.target;
  };
  var internalTrapStack = [];
  var createFocusTrap = function createFocusTrap2(elements, userOptions) {
    var doc = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;
    var trapStack = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.trapStack) || internalTrapStack;
    var config = _objectSpread2({
      returnFocusOnDeactivate: true,
      escapeDeactivates: true,
      delayInitialFocus: true,
      isKeyForward,
      isKeyBackward
    }, userOptions);
    var state = {
      // containers given to createFocusTrap()
      // @type {Array<HTMLElement>}
      containers: [],
      // list of objects identifying tabbable nodes in `containers` in the trap
      // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
      //  is active, but the trap should never get to a state where there isn't at least one group
      //  with at least one tabbable node in it (that would lead to an error condition that would
      //  result in an error being thrown)
      // @type {Array<{
      //   container: HTMLElement,
      //   tabbableNodes: Array<HTMLElement>, // empty if none
      //   focusableNodes: Array<HTMLElement>, // empty if none
      //   posTabIndexesFound: boolean,
      //   firstTabbableNode: HTMLElement|undefined,
      //   lastTabbableNode: HTMLElement|undefined,
      //   firstDomTabbableNode: HTMLElement|undefined,
      //   lastDomTabbableNode: HTMLElement|undefined,
      //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
      // }>}
      containerGroups: [],
      // same order/length as `containers` list
      // references to objects in `containerGroups`, but only those that actually have
      //  tabbable nodes in them
      // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
      //  the same length
      tabbableGroups: [],
      nodeFocusedBeforeActivation: null,
      mostRecentlyFocusedNode: null,
      active: false,
      paused: false,
      // timer ID for when delayInitialFocus is true and initial focus in this trap
      //  has been delayed during activation
      delayInitialFocusTimer: void 0,
      // the most recent KeyboardEvent for the configured nav key (typically [SHIFT+]TAB), if any
      recentNavEvent: void 0
    };
    var trap;
    var getOption = function getOption2(configOverrideOptions, optionName, configOptionName) {
      return configOverrideOptions && configOverrideOptions[optionName] !== void 0 ? configOverrideOptions[optionName] : config[configOptionName || optionName];
    };
    var findContainerIndex = function findContainerIndex2(element, event) {
      var composedPath = typeof (event === null || event === void 0 ? void 0 : event.composedPath) === "function" ? event.composedPath() : void 0;
      return state.containerGroups.findIndex(function(_ref) {
        var container = _ref.container, tabbableNodes = _ref.tabbableNodes;
        return container.contains(element) || // fall back to explicit tabbable search which will take into consideration any
        //  web components if the `tabbableOptions.getShadowRoot` option was used for
        //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
        //  look inside web components even if open)
        (composedPath === null || composedPath === void 0 ? void 0 : composedPath.includes(container)) || tabbableNodes.find(function(node) {
          return node === element;
        });
      });
    };
    var getNodeForOption = function getNodeForOption2(optionName) {
      var optionValue = config[optionName];
      if (typeof optionValue === "function") {
        for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          params[_key2 - 1] = arguments[_key2];
        }
        optionValue = optionValue.apply(void 0, params);
      }
      if (optionValue === true) {
        optionValue = void 0;
      }
      if (!optionValue) {
        if (optionValue === void 0 || optionValue === false) {
          return optionValue;
        }
        throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
      }
      var node = optionValue;
      if (typeof optionValue === "string") {
        node = doc.querySelector(optionValue);
        if (!node) {
          throw new Error("`".concat(optionName, "` as selector refers to no known node"));
        }
      }
      return node;
    };
    var getInitialFocusNode = function getInitialFocusNode2() {
      var node = getNodeForOption("initialFocus");
      if (node === false) {
        return false;
      }
      if (node === void 0 || !isFocusable(node, config.tabbableOptions)) {
        if (findContainerIndex(doc.activeElement) >= 0) {
          node = doc.activeElement;
        } else {
          var firstTabbableGroup = state.tabbableGroups[0];
          var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
          node = firstTabbableNode || getNodeForOption("fallbackFocus");
        }
      }
      if (!node) {
        throw new Error("Your focus-trap needs to have at least one focusable element");
      }
      return node;
    };
    var updateTabbableNodes = function updateTabbableNodes2() {
      state.containerGroups = state.containers.map(function(container) {
        var tabbableNodes = tabbable(container, config.tabbableOptions);
        var focusableNodes = focusable(container, config.tabbableOptions);
        var firstTabbableNode = tabbableNodes.length > 0 ? tabbableNodes[0] : void 0;
        var lastTabbableNode = tabbableNodes.length > 0 ? tabbableNodes[tabbableNodes.length - 1] : void 0;
        var firstDomTabbableNode = focusableNodes.find(function(node) {
          return isTabbable(node);
        });
        var lastDomTabbableNode = focusableNodes.slice().reverse().find(function(node) {
          return isTabbable(node);
        });
        var posTabIndexesFound = !!tabbableNodes.find(function(node) {
          return getTabIndex(node) > 0;
        });
        return {
          container,
          tabbableNodes,
          focusableNodes,
          /** True if at least one node with positive `tabindex` was found in this container. */
          posTabIndexesFound,
          /** First tabbable node in container, __tabindex__ order; `undefined` if none. */
          firstTabbableNode,
          /** Last tabbable node in container, __tabindex__ order; `undefined` if none. */
          lastTabbableNode,
          // NOTE: DOM order is NOT NECESSARILY "document position" order, but figuring that out
          //  would require more than just https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
          //  because that API doesn't work with Shadow DOM as well as it should (@see
          //  https://github.com/whatwg/dom/issues/320) and since this first/last is only needed, so far,
          //  to address an edge case related to positive tabindex support, this seems like a much easier,
          //  "close enough most of the time" alternative for positive tabindexes which should generally
          //  be avoided anyway...
          /** First tabbable node in container, __DOM__ order; `undefined` if none. */
          firstDomTabbableNode,
          /** Last tabbable node in container, __DOM__ order; `undefined` if none. */
          lastDomTabbableNode,
          /**
           * Finds the __tabbable__ node that follows the given node in the specified direction,
           *  in this container, if any.
           * @param {HTMLElement} node
           * @param {boolean} [forward] True if going in forward tab order; false if going
           *  in reverse.
           * @returns {HTMLElement|undefined} The next tabbable node, if any.
           */
          nextTabbableNode: function nextTabbableNode(node) {
            var forward = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
            var nodeIdx = tabbableNodes.indexOf(node);
            if (nodeIdx < 0) {
              if (forward) {
                return focusableNodes.slice(focusableNodes.indexOf(node) + 1).find(function(el) {
                  return isTabbable(el);
                });
              }
              return focusableNodes.slice(0, focusableNodes.indexOf(node)).reverse().find(function(el) {
                return isTabbable(el);
              });
            }
            return tabbableNodes[nodeIdx + (forward ? 1 : -1)];
          }
        };
      });
      state.tabbableGroups = state.containerGroups.filter(function(group) {
        return group.tabbableNodes.length > 0;
      });
      if (state.tabbableGroups.length <= 0 && !getNodeForOption("fallbackFocus")) {
        throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
      }
      if (state.containerGroups.find(function(g) {
        return g.posTabIndexesFound;
      }) && state.containerGroups.length > 1) {
        throw new Error("At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.");
      }
    };
    var getActiveElement = function getActiveElement2(el) {
      var activeElement = el.activeElement;
      if (!activeElement) {
        return;
      }
      if (activeElement.shadowRoot && activeElement.shadowRoot.activeElement !== null) {
        return getActiveElement2(activeElement.shadowRoot);
      }
      return activeElement;
    };
    var tryFocus = function tryFocus2(node) {
      if (node === false) {
        return;
      }
      if (node === getActiveElement(document)) {
        return;
      }
      if (!node || !node.focus) {
        tryFocus2(getInitialFocusNode());
        return;
      }
      node.focus({
        preventScroll: !!config.preventScroll
      });
      state.mostRecentlyFocusedNode = node;
      if (isSelectableInput(node)) {
        node.select();
      }
    };
    var getReturnFocusNode = function getReturnFocusNode2(previousActiveElement) {
      var node = getNodeForOption("setReturnFocus", previousActiveElement);
      return node ? node : node === false ? false : previousActiveElement;
    };
    var findNextNavNode = function findNextNavNode2(_ref2) {
      var target = _ref2.target, event = _ref2.event, _ref2$isBackward = _ref2.isBackward, isBackward = _ref2$isBackward === void 0 ? false : _ref2$isBackward;
      target = target || getActualTarget(event);
      updateTabbableNodes();
      var destinationNode = null;
      if (state.tabbableGroups.length > 0) {
        var containerIndex = findContainerIndex(target, event);
        var containerGroup = containerIndex >= 0 ? state.containerGroups[containerIndex] : void 0;
        if (containerIndex < 0) {
          if (isBackward) {
            destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
          } else {
            destinationNode = state.tabbableGroups[0].firstTabbableNode;
          }
        } else if (isBackward) {
          var startOfGroupIndex = findIndex(state.tabbableGroups, function(_ref3) {
            var firstTabbableNode = _ref3.firstTabbableNode;
            return target === firstTabbableNode;
          });
          if (startOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target, false))) {
            startOfGroupIndex = containerIndex;
          }
          if (startOfGroupIndex >= 0) {
            var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
            var destinationGroup = state.tabbableGroups[destinationGroupIndex];
            destinationNode = getTabIndex(target) >= 0 ? destinationGroup.lastTabbableNode : destinationGroup.lastDomTabbableNode;
          } else if (!isTabEvent(event)) {
            destinationNode = containerGroup.nextTabbableNode(target, false);
          }
        } else {
          var lastOfGroupIndex = findIndex(state.tabbableGroups, function(_ref4) {
            var lastTabbableNode = _ref4.lastTabbableNode;
            return target === lastTabbableNode;
          });
          if (lastOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target))) {
            lastOfGroupIndex = containerIndex;
          }
          if (lastOfGroupIndex >= 0) {
            var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
            var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
            destinationNode = getTabIndex(target) >= 0 ? _destinationGroup.firstTabbableNode : _destinationGroup.firstDomTabbableNode;
          } else if (!isTabEvent(event)) {
            destinationNode = containerGroup.nextTabbableNode(target);
          }
        }
      } else {
        destinationNode = getNodeForOption("fallbackFocus");
      }
      return destinationNode;
    };
    var checkPointerDown = function checkPointerDown2(e) {
      var target = getActualTarget(e);
      if (findContainerIndex(target, e) >= 0) {
        return;
      }
      if (valueOrHandler(config.clickOutsideDeactivates, e)) {
        trap.deactivate({
          // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
          //  which will result in the outside click setting focus to the node
          //  that was clicked (and if not focusable, to "nothing"); by setting
          //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
          //  on activation (or the configured `setReturnFocus` node), whether the
          //  outside click was on a focusable node or not
          returnFocus: config.returnFocusOnDeactivate
        });
        return;
      }
      if (valueOrHandler(config.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
    };
    var checkFocusIn = function checkFocusIn2(event) {
      var target = getActualTarget(event);
      var targetContained = findContainerIndex(target, event) >= 0;
      if (targetContained || target instanceof Document) {
        if (targetContained) {
          state.mostRecentlyFocusedNode = target;
        }
      } else {
        event.stopImmediatePropagation();
        var nextNode;
        var navAcrossContainers = true;
        if (state.mostRecentlyFocusedNode) {
          if (getTabIndex(state.mostRecentlyFocusedNode) > 0) {
            var mruContainerIdx = findContainerIndex(state.mostRecentlyFocusedNode);
            var tabbableNodes = state.containerGroups[mruContainerIdx].tabbableNodes;
            if (tabbableNodes.length > 0) {
              var mruTabIdx = tabbableNodes.findIndex(function(node) {
                return node === state.mostRecentlyFocusedNode;
              });
              if (mruTabIdx >= 0) {
                if (config.isKeyForward(state.recentNavEvent)) {
                  if (mruTabIdx + 1 < tabbableNodes.length) {
                    nextNode = tabbableNodes[mruTabIdx + 1];
                    navAcrossContainers = false;
                  }
                } else {
                  if (mruTabIdx - 1 >= 0) {
                    nextNode = tabbableNodes[mruTabIdx - 1];
                    navAcrossContainers = false;
                  }
                }
              }
            }
          } else {
            if (!state.containerGroups.some(function(g) {
              return g.tabbableNodes.some(function(n) {
                return getTabIndex(n) > 0;
              });
            })) {
              navAcrossContainers = false;
            }
          }
        } else {
          navAcrossContainers = false;
        }
        if (navAcrossContainers) {
          nextNode = findNextNavNode({
            // move FROM the MRU node, not event-related node (which will be the node that is
            //  outside the trap causing the focus escape we're trying to fix)
            target: state.mostRecentlyFocusedNode,
            isBackward: config.isKeyBackward(state.recentNavEvent)
          });
        }
        if (nextNode) {
          tryFocus(nextNode);
        } else {
          tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
        }
      }
      state.recentNavEvent = void 0;
    };
    var checkKeyNav = function checkKeyNav2(event) {
      var isBackward = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      state.recentNavEvent = event;
      var destinationNode = findNextNavNode({
        event,
        isBackward
      });
      if (destinationNode) {
        if (isTabEvent(event)) {
          event.preventDefault();
        }
        tryFocus(destinationNode);
      }
    };
    var checkKey = function checkKey2(event) {
      if (isEscapeEvent(event) && valueOrHandler(config.escapeDeactivates, event) !== false) {
        event.preventDefault();
        trap.deactivate();
        return;
      }
      if (config.isKeyForward(event) || config.isKeyBackward(event)) {
        checkKeyNav(event, config.isKeyBackward(event));
      }
    };
    var checkClick = function checkClick2(e) {
      var target = getActualTarget(e);
      if (findContainerIndex(target, e) >= 0) {
        return;
      }
      if (valueOrHandler(config.clickOutsideDeactivates, e)) {
        return;
      }
      if (valueOrHandler(config.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    var addListeners = function addListeners2() {
      if (!state.active) {
        return;
      }
      activeFocusTraps.activateTrap(trapStack, trap);
      state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function() {
        tryFocus(getInitialFocusNode());
      }) : tryFocus(getInitialFocusNode());
      doc.addEventListener("focusin", checkFocusIn, true);
      doc.addEventListener("mousedown", checkPointerDown, {
        capture: true,
        passive: false
      });
      doc.addEventListener("touchstart", checkPointerDown, {
        capture: true,
        passive: false
      });
      doc.addEventListener("click", checkClick, {
        capture: true,
        passive: false
      });
      doc.addEventListener("keydown", checkKey, {
        capture: true,
        passive: false
      });
      return trap;
    };
    var removeListeners = function removeListeners2() {
      if (!state.active) {
        return;
      }
      doc.removeEventListener("focusin", checkFocusIn, true);
      doc.removeEventListener("mousedown", checkPointerDown, true);
      doc.removeEventListener("touchstart", checkPointerDown, true);
      doc.removeEventListener("click", checkClick, true);
      doc.removeEventListener("keydown", checkKey, true);
      return trap;
    };
    var checkDomRemoval = function checkDomRemoval2(mutations) {
      var isFocusedNodeRemoved = mutations.some(function(mutation) {
        var removedNodes = Array.from(mutation.removedNodes);
        return removedNodes.some(function(node) {
          return node === state.mostRecentlyFocusedNode;
        });
      });
      if (isFocusedNodeRemoved) {
        tryFocus(getInitialFocusNode());
      }
    };
    var mutationObserver = typeof window !== "undefined" && "MutationObserver" in window ? new MutationObserver(checkDomRemoval) : void 0;
    var updateObservedNodes = function updateObservedNodes2() {
      if (!mutationObserver) {
        return;
      }
      mutationObserver.disconnect();
      if (state.active && !state.paused) {
        state.containers.map(function(container) {
          mutationObserver.observe(container, {
            subtree: true,
            childList: true
          });
        });
      }
    };
    trap = {
      get active() {
        return state.active;
      },
      get paused() {
        return state.paused;
      },
      activate: function activate(activateOptions) {
        if (state.active) {
          return this;
        }
        var onActivate = getOption(activateOptions, "onActivate");
        var onPostActivate = getOption(activateOptions, "onPostActivate");
        var checkCanFocusTrap = getOption(activateOptions, "checkCanFocusTrap");
        if (!checkCanFocusTrap) {
          updateTabbableNodes();
        }
        state.active = true;
        state.paused = false;
        state.nodeFocusedBeforeActivation = doc.activeElement;
        onActivate === null || onActivate === void 0 || onActivate();
        var finishActivation = function finishActivation2() {
          if (checkCanFocusTrap) {
            updateTabbableNodes();
          }
          addListeners();
          updateObservedNodes();
          onPostActivate === null || onPostActivate === void 0 || onPostActivate();
        };
        if (checkCanFocusTrap) {
          checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
          return this;
        }
        finishActivation();
        return this;
      },
      deactivate: function deactivate(deactivateOptions) {
        if (!state.active) {
          return this;
        }
        var options = _objectSpread2({
          onDeactivate: config.onDeactivate,
          onPostDeactivate: config.onPostDeactivate,
          checkCanReturnFocus: config.checkCanReturnFocus
        }, deactivateOptions);
        clearTimeout(state.delayInitialFocusTimer);
        state.delayInitialFocusTimer = void 0;
        removeListeners();
        state.active = false;
        state.paused = false;
        updateObservedNodes();
        activeFocusTraps.deactivateTrap(trapStack, trap);
        var onDeactivate = getOption(options, "onDeactivate");
        var onPostDeactivate = getOption(options, "onPostDeactivate");
        var checkCanReturnFocus = getOption(options, "checkCanReturnFocus");
        var returnFocus = getOption(options, "returnFocus", "returnFocusOnDeactivate");
        onDeactivate === null || onDeactivate === void 0 || onDeactivate();
        var finishDeactivation = function finishDeactivation2() {
          delay(function() {
            if (returnFocus) {
              tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
            }
            onPostDeactivate === null || onPostDeactivate === void 0 || onPostDeactivate();
          });
        };
        if (returnFocus && checkCanReturnFocus) {
          checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
          return this;
        }
        finishDeactivation();
        return this;
      },
      pause: function pause(pauseOptions) {
        if (state.paused || !state.active) {
          return this;
        }
        var onPause = getOption(pauseOptions, "onPause");
        var onPostPause = getOption(pauseOptions, "onPostPause");
        state.paused = true;
        onPause === null || onPause === void 0 || onPause();
        removeListeners();
        updateObservedNodes();
        onPostPause === null || onPostPause === void 0 || onPostPause();
        return this;
      },
      unpause: function unpause(unpauseOptions) {
        if (!state.paused || !state.active) {
          return this;
        }
        var onUnpause = getOption(unpauseOptions, "onUnpause");
        var onPostUnpause = getOption(unpauseOptions, "onPostUnpause");
        state.paused = false;
        onUnpause === null || onUnpause === void 0 || onUnpause();
        updateTabbableNodes();
        addListeners();
        updateObservedNodes();
        onPostUnpause === null || onPostUnpause === void 0 || onPostUnpause();
        return this;
      },
      updateContainerElements: function updateContainerElements(containerElements) {
        var elementsAsArray = [].concat(containerElements).filter(Boolean);
        state.containers = elementsAsArray.map(function(element) {
          return typeof element === "string" ? doc.querySelector(element) : element;
        });
        if (state.active) {
          updateTabbableNodes();
        }
        updateObservedNodes();
        return this;
      }
    };
    trap.updateContainerElements(elements);
    return trap;
  };
  const getElByDataAttribute = (attribute, value, scope = document) => {
    const el = scope.querySelector(`[data-${attribute}="${value}"]`);
    return el;
  };
  const getAllElByClass = (className) => {
    const elements = document.querySelectorAll(`*[class*="${className}"]`);
    return elements;
  };
  const getAllElementsByDataAttribute = (attribute, value, scope = document) => {
    const elements = scope.querySelectorAll(`[data-${attribute}="${value}"]`);
    return elements;
  };
  const appendStylesToDOM = (styles, identifier) => {
    const styleTag = document.createElement("style");
    styleTag.setAttribute(`data-${identifier}`, identifier);
    styleTag.innerHTML = styles.trim();
    document.head.append(styleTag);
  };
  const DROPDOWN = "thq-dropdown";
  const DROPDOWN_LIST = "thq-dropdown-list";
  const DROPDOWN_TOGGLE = "thq-dropdown-toggle";
  const DROPDOWN_INDICATOR = "thq-dropdown-arrow";
  class Dropdown {
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
    handleClickEvent(ev) {
      if (ev instanceof MouseEvent === false && ev instanceof KeyboardEvent === false) {
        return;
      }
      if (ev instanceof KeyboardEvent && ev.key !== "Enter") {
        return;
      }
      ev.stopPropagation();
      const scope = ev.target;
      const dropdown = scope.closest(`[data-thq="${DROPDOWN}"]`);
      if (!dropdown) {
        return;
      }
      const dropdownToggle = getElByDataAttribute("thq", DROPDOWN_TOGGLE, dropdown);
      const dropdownList = getElByDataAttribute("thq", DROPDOWN_LIST, dropdown);
      if (!dropdownList) {
        return;
      }
      const trap = createFocusTrap(dropdownList, {
        clickOutsideDeactivates: true,
        onDeactivate: () => {
          dropdownList.style.display = "none";
          dropdownList.setAttribute("aria-expanded", "false");
          trap.deactivate();
        },
        setReturnFocus: dropdownToggle
      });
      if (dropdownList.style.display === "none" || !dropdownList.style.display) {
        dropdownList.style.display = "flex";
        dropdownList.setAttribute("aria-expanded", "true");
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
          role: "button",
          tabIndex: "0",
          ariaPressed: false
        });
        dropdownToggle.addEventListener("click", this.handleClickEvent.bind(this));
        dropdownToggle.addEventListener("keydown", this.handleClickEvent.bind(this));
        dropdownList == null ? void 0 : dropdownList.setAttribute("aria-expanded", "false");
      });
      appendStylesToDOM(this.styles, "thq-dropdown-styles");
    }
  }
  class Menu {
    constructor() {
      this.init = () => {
        this.getMenuElementsAndAddEvents();
        this.getMenuElementsAndAddEventsByDataAttrs("type");
        this.getMenuElementsAndAddEventsByDataAttrs("role");
        this.getNavbarElementsAndAddEventsByDataThqAttrs();
        return this;
      };
      this.getMenuElementsAndAddEventsByDataAttrs = (dataAttr) => {
        const allHeaders = getAllElementsByDataAttribute(
          "role",
          "Header"
        );
        allHeaders.forEach((header) => {
          const burgerBtn = getElByDataAttribute(
            dataAttr,
            "BurgerMenu",
            header
          );
          const mobileMenu = getElByDataAttribute(
            dataAttr,
            "MobileMenu",
            header
          );
          const closeBtn = getElByDataAttribute(
            dataAttr,
            "CloseMobileMenu",
            header
          );
          if (!burgerBtn || !mobileMenu || !closeBtn) {
            return;
          }
          burgerBtn.addEventListener("click", () => {
            mobileMenu.classList.add("teleport-show");
          });
          closeBtn.addEventListener("click", () => {
            mobileMenu.classList.remove("teleport-show");
          });
        });
      };
      this.getNavbarElementsAndAddEventsByDataThqAttrs = () => {
        const allNavbars = getAllElementsByDataAttribute(
          "thq",
          "thq-navbar"
        );
        const bodyOverflow = document.body.style.overflow;
        allNavbars.forEach((navbar) => {
          const burgerBtn = getElByDataAttribute(
            "thq",
            "thq-burger-menu",
            navbar
          );
          const mobileMenu = getElByDataAttribute(
            "thq",
            "thq-mobile-menu",
            navbar
          );
          const closeBtn = getElByDataAttribute(
            "thq",
            "thq-close-menu",
            navbar
          );
          if (!burgerBtn || !mobileMenu || !closeBtn) {
            return;
          }
          burgerBtn.addEventListener("click", () => {
            window.addEventListener(
              "click",
              function checkSameLinkClicked(event) {
                if (!event) {
                  return;
                }
                let currentElement = event.target;
                while (currentElement !== document.body && !currentElement.href) {
                  currentElement = currentElement.parentNode;
                }
                if (!currentElement.href) {
                  return;
                }
                if (!mobileMenu) {
                  return;
                }
                if (currentElement.href) {
                  document.body.style.overflow = bodyOverflow;
                }
                if (currentElement.pathname === window.location.pathname) {
                  mobileMenu.classList.remove("teleport-show");
                  mobileMenu.classList.remove("thq-show");
                  mobileMenu.classList.remove("thq-translate-to-default");
                }
                this.removeEventListener("click", checkSameLinkClicked);
              }
            );
            document.body.style.overflow = "hidden";
            mobileMenu.classList.add("teleport-show");
            mobileMenu.classList.add("thq-show");
            mobileMenu.classList.add("thq-translate-to-default");
          });
          closeBtn.addEventListener("click", () => {
            document.body.style.overflow = bodyOverflow;
            mobileMenu.classList.remove("teleport-show");
            mobileMenu.classList.remove("thq-show");
            mobileMenu.classList.remove("thq-translate-to-default");
          });
        });
      };
      this.getMenuElementsAndAddEvents = () => {
        const menuElements = getAllElByClass("teleport-menu-burger");
        if (menuElements.length === 0) {
          return;
        }
        menuElements.forEach((burgerMenuElement) => {
          var _a;
          const mobileMenuElement = ((_a = burgerMenuElement.nextElementSibling) == null ? void 0 : _a.className.includes(
            "teleport-menu-mobile"
          )) ? burgerMenuElement.nextElementSibling : null;
          if (!mobileMenuElement) {
            return;
          }
          const closeMenuElement = mobileMenuElement.querySelector(
            '*[class*="teleport-menu-close"]'
          );
          if (!closeMenuElement) {
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
    get styles() {
      return ``;
    }
  }
  class Accordion {
    constructor() {
      this.init = () => {
        this.getAccordionElementsAndAddEvents("type");
        this.getAccordionElementsAndAddEvents("role");
      };
      this.getAccordionElementsAndAddEvents = (dataAttr) => {
        const allAccordions = getAllElementsByDataAttribute(
          "role",
          "Accordion"
        );
        allAccordions.forEach((accordion) => {
          const accordionHeader = getElByDataAttribute(
            dataAttr,
            "AccordionHeader",
            accordion
          );
          const accordionContent = getElByDataAttribute(
            dataAttr,
            "AccordionContent",
            accordion
          );
          if (!accordionHeader || !accordionContent) {
            return;
          }
          accordionHeader.addEventListener("click", () => {
            accordionContent.style.maxHeight ? accordionContent.style.maxHeight = "" : accordionContent.style.maxHeight = `${accordionContent.scrollHeight}px`;
          });
        });
      };
    }
    get styles() {
      return ``;
    }
  }
  function isObject$1(obj) {
    return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
  }
  function extend$1(target, src) {
    if (target === void 0) {
      target = {};
    }
    if (src === void 0) {
      src = {};
    }
    Object.keys(src).forEach((key) => {
      if (typeof target[key] === "undefined")
        target[key] = src[key];
      else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
        extend$1(target[key], src[key]);
      }
    });
  }
  const ssrDocument = {
    body: {},
    addEventListener() {
    },
    removeEventListener() {
    },
    activeElement: {
      blur() {
      },
      nodeName: ""
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    getElementById() {
      return null;
    },
    createEvent() {
      return {
        initEvent() {
        }
      };
    },
    createElement() {
      return {
        children: [],
        childNodes: [],
        style: {},
        setAttribute() {
        },
        getElementsByTagName() {
          return [];
        }
      };
    },
    createElementNS() {
      return {};
    },
    importNode() {
      return null;
    },
    location: {
      hash: "",
      host: "",
      hostname: "",
      href: "",
      origin: "",
      pathname: "",
      protocol: "",
      search: ""
    }
  };
  function getDocument() {
    const doc = typeof document !== "undefined" ? document : {};
    extend$1(doc, ssrDocument);
    return doc;
  }
  const ssrWindow = {
    document: ssrDocument,
    navigator: {
      userAgent: ""
    },
    location: {
      hash: "",
      host: "",
      hostname: "",
      href: "",
      origin: "",
      pathname: "",
      protocol: "",
      search: ""
    },
    history: {
      replaceState() {
      },
      pushState() {
      },
      go() {
      },
      back() {
      }
    },
    CustomEvent: function CustomEvent() {
      return this;
    },
    addEventListener() {
    },
    removeEventListener() {
    },
    getComputedStyle() {
      return {
        getPropertyValue() {
          return "";
        }
      };
    },
    Image() {
    },
    Date() {
    },
    screen: {},
    setTimeout() {
    },
    clearTimeout() {
    },
    matchMedia() {
      return {};
    },
    requestAnimationFrame(callback) {
      if (typeof setTimeout === "undefined") {
        callback();
        return null;
      }
      return setTimeout(callback, 0);
    },
    cancelAnimationFrame(id) {
      if (typeof setTimeout === "undefined") {
        return;
      }
      clearTimeout(id);
    }
  };
  function getWindow() {
    const win = typeof window !== "undefined" ? window : {};
    extend$1(win, ssrWindow);
    return win;
  }
  function classesToTokens(classes2) {
    if (classes2 === void 0) {
      classes2 = "";
    }
    return classes2.trim().split(" ").filter((c) => !!c.trim());
  }
  function deleteProps(obj) {
    const object = obj;
    Object.keys(object).forEach((key) => {
      try {
        object[key] = null;
      } catch (e) {
      }
      try {
        delete object[key];
      } catch (e) {
      }
    });
  }
  function nextTick(callback, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return setTimeout(callback, delay2);
  }
  function now() {
    return Date.now();
  }
  function getComputedStyle$1(el) {
    const window2 = getWindow();
    let style;
    if (window2.getComputedStyle) {
      style = window2.getComputedStyle(el, null);
    }
    if (!style && el.currentStyle) {
      style = el.currentStyle;
    }
    if (!style) {
      style = el.style;
    }
    return style;
  }
  function getTranslate(el, axis) {
    if (axis === void 0) {
      axis = "x";
    }
    const window2 = getWindow();
    let matrix;
    let curTransform;
    let transformMatrix;
    const curStyle = getComputedStyle$1(el);
    if (window2.WebKitCSSMatrix) {
      curTransform = curStyle.transform || curStyle.webkitTransform;
      if (curTransform.split(",").length > 6) {
        curTransform = curTransform.split(", ").map((a) => a.replace(",", ".")).join(", ");
      }
      transformMatrix = new window2.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
    } else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
      matrix = transformMatrix.toString().split(",");
    }
    if (axis === "x") {
      if (window2.WebKitCSSMatrix)
        curTransform = transformMatrix.m41;
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[12]);
      else
        curTransform = parseFloat(matrix[4]);
    }
    if (axis === "y") {
      if (window2.WebKitCSSMatrix)
        curTransform = transformMatrix.m42;
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[13]);
      else
        curTransform = parseFloat(matrix[5]);
    }
    return curTransform || 0;
  }
  function isObject(o) {
    return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
  }
  function isNode(node) {
    if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
      return node instanceof HTMLElement;
    }
    return node && (node.nodeType === 1 || node.nodeType === 11);
  }
  function extend() {
    const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
    const noExtend = ["__proto__", "constructor", "prototype"];
    for (let i = 1; i < arguments.length; i += 1) {
      const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
      if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
        const keysArray = Object.keys(Object(nextSource)).filter((key) => noExtend.indexOf(key) < 0);
        for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
          const nextKey = keysArray[nextIndex];
          const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== void 0 && desc.enumerable) {
            if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
              if (nextSource[nextKey].__swiper__) {
                to[nextKey] = nextSource[nextKey];
              } else {
                extend(to[nextKey], nextSource[nextKey]);
              }
            } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
              to[nextKey] = {};
              if (nextSource[nextKey].__swiper__) {
                to[nextKey] = nextSource[nextKey];
              } else {
                extend(to[nextKey], nextSource[nextKey]);
              }
            } else {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
    }
    return to;
  }
  function setCSSProperty(el, varName, varValue) {
    el.style.setProperty(varName, varValue);
  }
  function animateCSSModeScroll(_ref) {
    let {
      swiper: swiper2,
      targetPosition,
      side
    } = _ref;
    const window2 = getWindow();
    const startPosition = -swiper2.translate;
    let startTime = null;
    let time;
    const duration = swiper2.params.speed;
    swiper2.wrapperEl.style.scrollSnapType = "none";
    window2.cancelAnimationFrame(swiper2.cssModeFrameID);
    const dir = targetPosition > startPosition ? "next" : "prev";
    const isOutOfBound = (current, target) => {
      return dir === "next" && current >= target || dir === "prev" && current <= target;
    };
    const animate = () => {
      time = (/* @__PURE__ */ new Date()).getTime();
      if (startTime === null) {
        startTime = time;
      }
      const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
      let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
      if (isOutOfBound(currentPosition, targetPosition)) {
        currentPosition = targetPosition;
      }
      swiper2.wrapperEl.scrollTo({
        [side]: currentPosition
      });
      if (isOutOfBound(currentPosition, targetPosition)) {
        swiper2.wrapperEl.style.overflow = "hidden";
        swiper2.wrapperEl.style.scrollSnapType = "";
        setTimeout(() => {
          swiper2.wrapperEl.style.overflow = "";
          swiper2.wrapperEl.scrollTo({
            [side]: currentPosition
          });
        });
        window2.cancelAnimationFrame(swiper2.cssModeFrameID);
        return;
      }
      swiper2.cssModeFrameID = window2.requestAnimationFrame(animate);
    };
    animate();
  }
  function elementChildren(element, selector) {
    if (selector === void 0) {
      selector = "";
    }
    return [...element.children].filter((el) => el.matches(selector));
  }
  function showWarning(text) {
    try {
      console.warn(text);
      return;
    } catch (err) {
    }
  }
  function createElement(tag, classes2) {
    if (classes2 === void 0) {
      classes2 = [];
    }
    const el = document.createElement(tag);
    el.classList.add(...Array.isArray(classes2) ? classes2 : classesToTokens(classes2));
    return el;
  }
  function elementPrevAll(el, selector) {
    const prevEls = [];
    while (el.previousElementSibling) {
      const prev = el.previousElementSibling;
      if (selector) {
        if (prev.matches(selector))
          prevEls.push(prev);
      } else
        prevEls.push(prev);
      el = prev;
    }
    return prevEls;
  }
  function elementNextAll(el, selector) {
    const nextEls = [];
    while (el.nextElementSibling) {
      const next = el.nextElementSibling;
      if (selector) {
        if (next.matches(selector))
          nextEls.push(next);
      } else
        nextEls.push(next);
      el = next;
    }
    return nextEls;
  }
  function elementStyle(el, prop) {
    const window2 = getWindow();
    return window2.getComputedStyle(el, null).getPropertyValue(prop);
  }
  function elementIndex(el) {
    let child = el;
    let i;
    if (child) {
      i = 0;
      while ((child = child.previousSibling) !== null) {
        if (child.nodeType === 1)
          i += 1;
      }
      return i;
    }
    return void 0;
  }
  function elementParents(el, selector) {
    const parents = [];
    let parent = el.parentElement;
    while (parent) {
      if (selector) {
        if (parent.matches(selector))
          parents.push(parent);
      } else {
        parents.push(parent);
      }
      parent = parent.parentElement;
    }
    return parents;
  }
  function elementOuterSize(el, size, includeMargins) {
    const window2 = getWindow();
    if (includeMargins) {
      return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
    }
    return el.offsetWidth;
  }
  let support;
  function calcSupport() {
    const window2 = getWindow();
    const document2 = getDocument();
    return {
      smoothScroll: document2.documentElement && document2.documentElement.style && "scrollBehavior" in document2.documentElement.style,
      touch: !!("ontouchstart" in window2 || window2.DocumentTouch && document2 instanceof window2.DocumentTouch)
    };
  }
  function getSupport() {
    if (!support) {
      support = calcSupport();
    }
    return support;
  }
  let deviceCached;
  function calcDevice(_temp) {
    let {
      userAgent
    } = _temp === void 0 ? {} : _temp;
    const support2 = getSupport();
    const window2 = getWindow();
    const platform = window2.navigator.platform;
    const ua = userAgent || window2.navigator.userAgent;
    const device = {
      ios: false,
      android: false
    };
    const screenWidth = window2.screen.width;
    const screenHeight = window2.screen.height;
    const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
    const windows = platform === "Win32";
    let macos = platform === "MacIntel";
    const iPadScreens = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
    if (!ipad && macos && support2.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
      ipad = ua.match(/(Version)\/([\d.]+)/);
      if (!ipad)
        ipad = [0, 1, "13_0_0"];
      macos = false;
    }
    if (android && !windows) {
      device.os = "android";
      device.android = true;
    }
    if (ipad || iphone || ipod) {
      device.os = "ios";
      device.ios = true;
    }
    return device;
  }
  function getDevice(overrides) {
    if (overrides === void 0) {
      overrides = {};
    }
    if (!deviceCached) {
      deviceCached = calcDevice(overrides);
    }
    return deviceCached;
  }
  let browser;
  function calcBrowser() {
    const window2 = getWindow();
    let needPerspectiveFix = false;
    function isSafari() {
      const ua = window2.navigator.userAgent.toLowerCase();
      return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
    }
    if (isSafari()) {
      const ua = String(window2.navigator.userAgent);
      if (ua.includes("Version/")) {
        const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num) => Number(num));
        needPerspectiveFix = major < 16 || major === 16 && minor < 2;
      }
    }
    return {
      isSafari: needPerspectiveFix || isSafari(),
      needPerspectiveFix,
      isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window2.navigator.userAgent)
    };
  }
  function getBrowser() {
    if (!browser) {
      browser = calcBrowser();
    }
    return browser;
  }
  function Resize(_ref) {
    let {
      swiper: swiper2,
      on,
      emit
    } = _ref;
    const window2 = getWindow();
    let observer = null;
    let animationFrame = null;
    const resizeHandler = () => {
      if (!swiper2 || swiper2.destroyed || !swiper2.initialized)
        return;
      emit("beforeResize");
      emit("resize");
    };
    const createObserver = () => {
      if (!swiper2 || swiper2.destroyed || !swiper2.initialized)
        return;
      observer = new ResizeObserver((entries) => {
        animationFrame = window2.requestAnimationFrame(() => {
          const {
            width,
            height
          } = swiper2;
          let newWidth = width;
          let newHeight = height;
          entries.forEach((_ref2) => {
            let {
              contentBoxSize,
              contentRect,
              target
            } = _ref2;
            if (target && target !== swiper2.el)
              return;
            newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
            newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
          });
          if (newWidth !== width || newHeight !== height) {
            resizeHandler();
          }
        });
      });
      observer.observe(swiper2.el);
    };
    const removeObserver = () => {
      if (animationFrame) {
        window2.cancelAnimationFrame(animationFrame);
      }
      if (observer && observer.unobserve && swiper2.el) {
        observer.unobserve(swiper2.el);
        observer = null;
      }
    };
    const orientationChangeHandler = () => {
      if (!swiper2 || swiper2.destroyed || !swiper2.initialized)
        return;
      emit("orientationchange");
    };
    on("init", () => {
      if (swiper2.params.resizeObserver && typeof window2.ResizeObserver !== "undefined") {
        createObserver();
        return;
      }
      window2.addEventListener("resize", resizeHandler);
      window2.addEventListener("orientationchange", orientationChangeHandler);
    });
    on("destroy", () => {
      removeObserver();
      window2.removeEventListener("resize", resizeHandler);
      window2.removeEventListener("orientationchange", orientationChangeHandler);
    });
  }
  function Observer(_ref) {
    let {
      swiper: swiper2,
      extendParams,
      on,
      emit
    } = _ref;
    const observers = [];
    const window2 = getWindow();
    const attach = function(target, options) {
      if (options === void 0) {
        options = {};
      }
      const ObserverFunc = window2.MutationObserver || window2.WebkitMutationObserver;
      const observer = new ObserverFunc((mutations) => {
        if (swiper2.__preventObserver__)
          return;
        if (mutations.length === 1) {
          emit("observerUpdate", mutations[0]);
          return;
        }
        const observerUpdate = function observerUpdate2() {
          emit("observerUpdate", mutations[0]);
        };
        if (window2.requestAnimationFrame) {
          window2.requestAnimationFrame(observerUpdate);
        } else {
          window2.setTimeout(observerUpdate, 0);
        }
      });
      observer.observe(target, {
        attributes: typeof options.attributes === "undefined" ? true : options.attributes,
        childList: typeof options.childList === "undefined" ? true : options.childList,
        characterData: typeof options.characterData === "undefined" ? true : options.characterData
      });
      observers.push(observer);
    };
    const init = () => {
      if (!swiper2.params.observer)
        return;
      if (swiper2.params.observeParents) {
        const containerParents = elementParents(swiper2.hostEl);
        for (let i = 0; i < containerParents.length; i += 1) {
          attach(containerParents[i]);
        }
      }
      attach(swiper2.hostEl, {
        childList: swiper2.params.observeSlideChildren
      });
      attach(swiper2.wrapperEl, {
        attributes: false
      });
    };
    const destroy = () => {
      observers.forEach((observer) => {
        observer.disconnect();
      });
      observers.splice(0, observers.length);
    };
    extendParams({
      observer: false,
      observeParents: false,
      observeSlideChildren: false
    });
    on("init", init);
    on("destroy", destroy);
  }
  var eventsEmitter = {
    on(events2, handler, priority) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (typeof handler !== "function")
        return self;
      const method = priority ? "unshift" : "push";
      events2.split(" ").forEach((event) => {
        if (!self.eventsListeners[event])
          self.eventsListeners[event] = [];
        self.eventsListeners[event][method](handler);
      });
      return self;
    },
    once(events2, handler, priority) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (typeof handler !== "function")
        return self;
      function onceHandler() {
        self.off(events2, onceHandler);
        if (onceHandler.__emitterProxy) {
          delete onceHandler.__emitterProxy;
        }
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        handler.apply(self, args);
      }
      onceHandler.__emitterProxy = handler;
      return self.on(events2, onceHandler, priority);
    },
    onAny(handler, priority) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (typeof handler !== "function")
        return self;
      const method = priority ? "unshift" : "push";
      if (self.eventsAnyListeners.indexOf(handler) < 0) {
        self.eventsAnyListeners[method](handler);
      }
      return self;
    },
    offAny(handler) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (!self.eventsAnyListeners)
        return self;
      const index = self.eventsAnyListeners.indexOf(handler);
      if (index >= 0) {
        self.eventsAnyListeners.splice(index, 1);
      }
      return self;
    },
    off(events2, handler) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (!self.eventsListeners)
        return self;
      events2.split(" ").forEach((event) => {
        if (typeof handler === "undefined") {
          self.eventsListeners[event] = [];
        } else if (self.eventsListeners[event]) {
          self.eventsListeners[event].forEach((eventHandler, index) => {
            if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
              self.eventsListeners[event].splice(index, 1);
            }
          });
        }
      });
      return self;
    },
    emit() {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (!self.eventsListeners)
        return self;
      let events2;
      let data;
      let context;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      if (typeof args[0] === "string" || Array.isArray(args[0])) {
        events2 = args[0];
        data = args.slice(1, args.length);
        context = self;
      } else {
        events2 = args[0].events;
        data = args[0].data;
        context = args[0].context || self;
      }
      data.unshift(context);
      const eventsArray = Array.isArray(events2) ? events2 : events2.split(" ");
      eventsArray.forEach((event) => {
        if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
          self.eventsAnyListeners.forEach((eventHandler) => {
            eventHandler.apply(context, [event, ...data]);
          });
        }
        if (self.eventsListeners && self.eventsListeners[event]) {
          self.eventsListeners[event].forEach((eventHandler) => {
            eventHandler.apply(context, data);
          });
        }
      });
      return self;
    }
  };
  function updateSize() {
    const swiper2 = this;
    let width;
    let height;
    const el = swiper2.el;
    if (typeof swiper2.params.width !== "undefined" && swiper2.params.width !== null) {
      width = swiper2.params.width;
    } else {
      width = el.clientWidth;
    }
    if (typeof swiper2.params.height !== "undefined" && swiper2.params.height !== null) {
      height = swiper2.params.height;
    } else {
      height = el.clientHeight;
    }
    if (width === 0 && swiper2.isHorizontal() || height === 0 && swiper2.isVertical()) {
      return;
    }
    width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
    height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
    if (Number.isNaN(width))
      width = 0;
    if (Number.isNaN(height))
      height = 0;
    Object.assign(swiper2, {
      width,
      height,
      size: swiper2.isHorizontal() ? width : height
    });
  }
  function updateSlides() {
    const swiper2 = this;
    function getDirectionPropertyValue(node, label) {
      return parseFloat(node.getPropertyValue(swiper2.getDirectionLabel(label)) || 0);
    }
    const params = swiper2.params;
    const {
      wrapperEl,
      slidesEl,
      size: swiperSize,
      rtlTranslate: rtl,
      wrongRTL
    } = swiper2;
    const isVirtual = swiper2.virtual && params.virtual.enabled;
    const previousSlidesLength = isVirtual ? swiper2.virtual.slides.length : swiper2.slides.length;
    const slides = elementChildren(slidesEl, `.${swiper2.params.slideClass}, swiper-slide`);
    const slidesLength = isVirtual ? swiper2.virtual.slides.length : slides.length;
    let snapGrid = [];
    const slidesGrid = [];
    const slidesSizesGrid = [];
    let offsetBefore = params.slidesOffsetBefore;
    if (typeof offsetBefore === "function") {
      offsetBefore = params.slidesOffsetBefore.call(swiper2);
    }
    let offsetAfter = params.slidesOffsetAfter;
    if (typeof offsetAfter === "function") {
      offsetAfter = params.slidesOffsetAfter.call(swiper2);
    }
    const previousSnapGridLength = swiper2.snapGrid.length;
    const previousSlidesGridLength = swiper2.slidesGrid.length;
    let spaceBetween = params.spaceBetween;
    let slidePosition = -offsetBefore;
    let prevSlideSize = 0;
    let index = 0;
    if (typeof swiperSize === "undefined") {
      return;
    }
    if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
      spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
    } else if (typeof spaceBetween === "string") {
      spaceBetween = parseFloat(spaceBetween);
    }
    swiper2.virtualSize = -spaceBetween;
    slides.forEach((slideEl) => {
      if (rtl) {
        slideEl.style.marginLeft = "";
      } else {
        slideEl.style.marginRight = "";
      }
      slideEl.style.marginBottom = "";
      slideEl.style.marginTop = "";
    });
    if (params.centeredSlides && params.cssMode) {
      setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
      setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
    }
    const gridEnabled = params.grid && params.grid.rows > 1 && swiper2.grid;
    if (gridEnabled) {
      swiper2.grid.initSlides(slides);
    } else if (swiper2.grid) {
      swiper2.grid.unsetSlides();
    }
    let slideSize;
    const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
      return typeof params.breakpoints[key].slidesPerView !== "undefined";
    }).length > 0;
    for (let i = 0; i < slidesLength; i += 1) {
      slideSize = 0;
      let slide2;
      if (slides[i])
        slide2 = slides[i];
      if (gridEnabled) {
        swiper2.grid.updateSlide(i, slide2, slides);
      }
      if (slides[i] && elementStyle(slide2, "display") === "none")
        continue;
      if (params.slidesPerView === "auto") {
        if (shouldResetSlideSize) {
          slides[i].style[swiper2.getDirectionLabel("width")] = ``;
        }
        const slideStyles = getComputedStyle(slide2);
        const currentTransform = slide2.style.transform;
        const currentWebKitTransform = slide2.style.webkitTransform;
        if (currentTransform) {
          slide2.style.transform = "none";
        }
        if (currentWebKitTransform) {
          slide2.style.webkitTransform = "none";
        }
        if (params.roundLengths) {
          slideSize = swiper2.isHorizontal() ? elementOuterSize(slide2, "width", true) : elementOuterSize(slide2, "height", true);
        } else {
          const width = getDirectionPropertyValue(slideStyles, "width");
          const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
          const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
          const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
          const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
          const boxSizing = slideStyles.getPropertyValue("box-sizing");
          if (boxSizing && boxSizing === "border-box") {
            slideSize = width + marginLeft + marginRight;
          } else {
            const {
              clientWidth,
              offsetWidth
            } = slide2;
            slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
          }
        }
        if (currentTransform) {
          slide2.style.transform = currentTransform;
        }
        if (currentWebKitTransform) {
          slide2.style.webkitTransform = currentWebKitTransform;
        }
        if (params.roundLengths)
          slideSize = Math.floor(slideSize);
      } else {
        slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
        if (params.roundLengths)
          slideSize = Math.floor(slideSize);
        if (slides[i]) {
          slides[i].style[swiper2.getDirectionLabel("width")] = `${slideSize}px`;
        }
      }
      if (slides[i]) {
        slides[i].swiperSlideSize = slideSize;
      }
      slidesSizesGrid.push(slideSize);
      if (params.centeredSlides) {
        slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
        if (prevSlideSize === 0 && i !== 0)
          slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
        if (i === 0)
          slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
        if (Math.abs(slidePosition) < 1 / 1e3)
          slidePosition = 0;
        if (params.roundLengths)
          slidePosition = Math.floor(slidePosition);
        if (index % params.slidesPerGroup === 0)
          snapGrid.push(slidePosition);
        slidesGrid.push(slidePosition);
      } else {
        if (params.roundLengths)
          slidePosition = Math.floor(slidePosition);
        if ((index - Math.min(swiper2.params.slidesPerGroupSkip, index)) % swiper2.params.slidesPerGroup === 0)
          snapGrid.push(slidePosition);
        slidesGrid.push(slidePosition);
        slidePosition = slidePosition + slideSize + spaceBetween;
      }
      swiper2.virtualSize += slideSize + spaceBetween;
      prevSlideSize = slideSize;
      index += 1;
    }
    swiper2.virtualSize = Math.max(swiper2.virtualSize, swiperSize) + offsetAfter;
    if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) {
      wrapperEl.style.width = `${swiper2.virtualSize + spaceBetween}px`;
    }
    if (params.setWrapperSize) {
      wrapperEl.style[swiper2.getDirectionLabel("width")] = `${swiper2.virtualSize + spaceBetween}px`;
    }
    if (gridEnabled) {
      swiper2.grid.updateWrapperSize(slideSize, snapGrid);
    }
    if (!params.centeredSlides) {
      const newSlidesGrid = [];
      for (let i = 0; i < snapGrid.length; i += 1) {
        let slidesGridItem = snapGrid[i];
        if (params.roundLengths)
          slidesGridItem = Math.floor(slidesGridItem);
        if (snapGrid[i] <= swiper2.virtualSize - swiperSize) {
          newSlidesGrid.push(slidesGridItem);
        }
      }
      snapGrid = newSlidesGrid;
      if (Math.floor(swiper2.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
        snapGrid.push(swiper2.virtualSize - swiperSize);
      }
    }
    if (isVirtual && params.loop) {
      const size = slidesSizesGrid[0] + spaceBetween;
      if (params.slidesPerGroup > 1) {
        const groups = Math.ceil((swiper2.virtual.slidesBefore + swiper2.virtual.slidesAfter) / params.slidesPerGroup);
        const groupSize = size * params.slidesPerGroup;
        for (let i = 0; i < groups; i += 1) {
          snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
        }
      }
      for (let i = 0; i < swiper2.virtual.slidesBefore + swiper2.virtual.slidesAfter; i += 1) {
        if (params.slidesPerGroup === 1) {
          snapGrid.push(snapGrid[snapGrid.length - 1] + size);
        }
        slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
        swiper2.virtualSize += size;
      }
    }
    if (snapGrid.length === 0)
      snapGrid = [0];
    if (spaceBetween !== 0) {
      const key = swiper2.isHorizontal() && rtl ? "marginLeft" : swiper2.getDirectionLabel("marginRight");
      slides.filter((_, slideIndex) => {
        if (!params.cssMode || params.loop)
          return true;
        if (slideIndex === slides.length - 1) {
          return false;
        }
        return true;
      }).forEach((slideEl) => {
        slideEl.style[key] = `${spaceBetween}px`;
      });
    }
    if (params.centeredSlides && params.centeredSlidesBounds) {
      let allSlidesSize = 0;
      slidesSizesGrid.forEach((slideSizeValue) => {
        allSlidesSize += slideSizeValue + (spaceBetween || 0);
      });
      allSlidesSize -= spaceBetween;
      const maxSnap = allSlidesSize - swiperSize;
      snapGrid = snapGrid.map((snap) => {
        if (snap <= 0)
          return -offsetBefore;
        if (snap > maxSnap)
          return maxSnap + offsetAfter;
        return snap;
      });
    }
    if (params.centerInsufficientSlides) {
      let allSlidesSize = 0;
      slidesSizesGrid.forEach((slideSizeValue) => {
        allSlidesSize += slideSizeValue + (spaceBetween || 0);
      });
      allSlidesSize -= spaceBetween;
      if (allSlidesSize < swiperSize) {
        const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
        snapGrid.forEach((snap, snapIndex) => {
          snapGrid[snapIndex] = snap - allSlidesOffset;
        });
        slidesGrid.forEach((snap, snapIndex) => {
          slidesGrid[snapIndex] = snap + allSlidesOffset;
        });
      }
    }
    Object.assign(swiper2, {
      slides,
      snapGrid,
      slidesGrid,
      slidesSizesGrid
    });
    if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
      setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
      setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper2.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
      const addToSnapGrid = -swiper2.snapGrid[0];
      const addToSlidesGrid = -swiper2.slidesGrid[0];
      swiper2.snapGrid = swiper2.snapGrid.map((v) => v + addToSnapGrid);
      swiper2.slidesGrid = swiper2.slidesGrid.map((v) => v + addToSlidesGrid);
    }
    if (slidesLength !== previousSlidesLength) {
      swiper2.emit("slidesLengthChange");
    }
    if (snapGrid.length !== previousSnapGridLength) {
      if (swiper2.params.watchOverflow)
        swiper2.checkOverflow();
      swiper2.emit("snapGridLengthChange");
    }
    if (slidesGrid.length !== previousSlidesGridLength) {
      swiper2.emit("slidesGridLengthChange");
    }
    if (params.watchSlidesProgress) {
      swiper2.updateSlidesOffset();
    }
    if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
      const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
      const hasClassBackfaceClassAdded = swiper2.el.classList.contains(backFaceHiddenClass);
      if (slidesLength <= params.maxBackfaceHiddenSlides) {
        if (!hasClassBackfaceClassAdded)
          swiper2.el.classList.add(backFaceHiddenClass);
      } else if (hasClassBackfaceClassAdded) {
        swiper2.el.classList.remove(backFaceHiddenClass);
      }
    }
  }
  function updateAutoHeight(speed) {
    const swiper2 = this;
    const activeSlides = [];
    const isVirtual = swiper2.virtual && swiper2.params.virtual.enabled;
    let newHeight = 0;
    let i;
    if (typeof speed === "number") {
      swiper2.setTransition(speed);
    } else if (speed === true) {
      swiper2.setTransition(swiper2.params.speed);
    }
    const getSlideByIndex = (index) => {
      if (isVirtual) {
        return swiper2.slides[swiper2.getSlideIndexByData(index)];
      }
      return swiper2.slides[index];
    };
    if (swiper2.params.slidesPerView !== "auto" && swiper2.params.slidesPerView > 1) {
      if (swiper2.params.centeredSlides) {
        (swiper2.visibleSlides || []).forEach((slide2) => {
          activeSlides.push(slide2);
        });
      } else {
        for (i = 0; i < Math.ceil(swiper2.params.slidesPerView); i += 1) {
          const index = swiper2.activeIndex + i;
          if (index > swiper2.slides.length && !isVirtual)
            break;
          activeSlides.push(getSlideByIndex(index));
        }
      }
    } else {
      activeSlides.push(getSlideByIndex(swiper2.activeIndex));
    }
    for (i = 0; i < activeSlides.length; i += 1) {
      if (typeof activeSlides[i] !== "undefined") {
        const height = activeSlides[i].offsetHeight;
        newHeight = height > newHeight ? height : newHeight;
      }
    }
    if (newHeight || newHeight === 0)
      swiper2.wrapperEl.style.height = `${newHeight}px`;
  }
  function updateSlidesOffset() {
    const swiper2 = this;
    const slides = swiper2.slides;
    const minusOffset = swiper2.isElement ? swiper2.isHorizontal() ? swiper2.wrapperEl.offsetLeft : swiper2.wrapperEl.offsetTop : 0;
    for (let i = 0; i < slides.length; i += 1) {
      slides[i].swiperSlideOffset = (swiper2.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper2.cssOverflowAdjustment();
    }
  }
  function updateSlidesProgress(translate2) {
    if (translate2 === void 0) {
      translate2 = this && this.translate || 0;
    }
    const swiper2 = this;
    const params = swiper2.params;
    const {
      slides,
      rtlTranslate: rtl,
      snapGrid
    } = swiper2;
    if (slides.length === 0)
      return;
    if (typeof slides[0].swiperSlideOffset === "undefined")
      swiper2.updateSlidesOffset();
    let offsetCenter = -translate2;
    if (rtl)
      offsetCenter = translate2;
    slides.forEach((slideEl) => {
      slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass);
    });
    swiper2.visibleSlidesIndexes = [];
    swiper2.visibleSlides = [];
    let spaceBetween = params.spaceBetween;
    if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
      spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper2.size;
    } else if (typeof spaceBetween === "string") {
      spaceBetween = parseFloat(spaceBetween);
    }
    for (let i = 0; i < slides.length; i += 1) {
      const slide2 = slides[i];
      let slideOffset = slide2.swiperSlideOffset;
      if (params.cssMode && params.centeredSlides) {
        slideOffset -= slides[0].swiperSlideOffset;
      }
      const slideProgress = (offsetCenter + (params.centeredSlides ? swiper2.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
      const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper2.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
      const slideBefore = -(offsetCenter - slideOffset);
      const slideAfter = slideBefore + swiper2.slidesSizesGrid[i];
      const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper2.size - swiper2.slidesSizesGrid[i];
      const isVisible = slideBefore >= 0 && slideBefore < swiper2.size - 1 || slideAfter > 1 && slideAfter <= swiper2.size || slideBefore <= 0 && slideAfter >= swiper2.size;
      if (isVisible) {
        swiper2.visibleSlides.push(slide2);
        swiper2.visibleSlidesIndexes.push(i);
        slides[i].classList.add(params.slideVisibleClass);
      }
      if (isFullyVisible) {
        slides[i].classList.add(params.slideFullyVisibleClass);
      }
      slide2.progress = rtl ? -slideProgress : slideProgress;
      slide2.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
    }
  }
  function updateProgress(translate2) {
    const swiper2 = this;
    if (typeof translate2 === "undefined") {
      const multiplier = swiper2.rtlTranslate ? -1 : 1;
      translate2 = swiper2 && swiper2.translate && swiper2.translate * multiplier || 0;
    }
    const params = swiper2.params;
    const translatesDiff = swiper2.maxTranslate() - swiper2.minTranslate();
    let {
      progress,
      isBeginning,
      isEnd,
      progressLoop
    } = swiper2;
    const wasBeginning = isBeginning;
    const wasEnd = isEnd;
    if (translatesDiff === 0) {
      progress = 0;
      isBeginning = true;
      isEnd = true;
    } else {
      progress = (translate2 - swiper2.minTranslate()) / translatesDiff;
      const isBeginningRounded = Math.abs(translate2 - swiper2.minTranslate()) < 1;
      const isEndRounded = Math.abs(translate2 - swiper2.maxTranslate()) < 1;
      isBeginning = isBeginningRounded || progress <= 0;
      isEnd = isEndRounded || progress >= 1;
      if (isBeginningRounded)
        progress = 0;
      if (isEndRounded)
        progress = 1;
    }
    if (params.loop) {
      const firstSlideIndex = swiper2.getSlideIndexByData(0);
      const lastSlideIndex = swiper2.getSlideIndexByData(swiper2.slides.length - 1);
      const firstSlideTranslate = swiper2.slidesGrid[firstSlideIndex];
      const lastSlideTranslate = swiper2.slidesGrid[lastSlideIndex];
      const translateMax = swiper2.slidesGrid[swiper2.slidesGrid.length - 1];
      const translateAbs = Math.abs(translate2);
      if (translateAbs >= firstSlideTranslate) {
        progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
      } else {
        progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
      }
      if (progressLoop > 1)
        progressLoop -= 1;
    }
    Object.assign(swiper2, {
      progress,
      progressLoop,
      isBeginning,
      isEnd
    });
    if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight)
      swiper2.updateSlidesProgress(translate2);
    if (isBeginning && !wasBeginning) {
      swiper2.emit("reachBeginning toEdge");
    }
    if (isEnd && !wasEnd) {
      swiper2.emit("reachEnd toEdge");
    }
    if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
      swiper2.emit("fromEdge");
    }
    swiper2.emit("progress", progress);
  }
  function updateSlidesClasses() {
    const swiper2 = this;
    const {
      slides,
      params,
      slidesEl,
      activeIndex
    } = swiper2;
    const isVirtual = swiper2.virtual && params.virtual.enabled;
    const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
    const getFilteredSlide = (selector) => {
      return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
    };
    slides.forEach((slideEl) => {
      slideEl.classList.remove(params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
    });
    let activeSlide;
    let prevSlide;
    let nextSlide;
    if (isVirtual) {
      if (params.loop) {
        let slideIndex = activeIndex - swiper2.virtual.slidesBefore;
        if (slideIndex < 0)
          slideIndex = swiper2.virtual.slides.length + slideIndex;
        if (slideIndex >= swiper2.virtual.slides.length)
          slideIndex -= swiper2.virtual.slides.length;
        activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
      } else {
        activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
      }
    } else {
      if (gridEnabled) {
        activeSlide = slides.filter((slideEl) => slideEl.column === activeIndex)[0];
        nextSlide = slides.filter((slideEl) => slideEl.column === activeIndex + 1)[0];
        prevSlide = slides.filter((slideEl) => slideEl.column === activeIndex - 1)[0];
      } else {
        activeSlide = slides[activeIndex];
      }
    }
    if (activeSlide) {
      activeSlide.classList.add(params.slideActiveClass);
      if (gridEnabled) {
        if (nextSlide) {
          nextSlide.classList.add(params.slideNextClass);
        }
        if (prevSlide) {
          prevSlide.classList.add(params.slidePrevClass);
        }
      } else {
        nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
        if (params.loop && !nextSlide) {
          nextSlide = slides[0];
        }
        if (nextSlide) {
          nextSlide.classList.add(params.slideNextClass);
        }
        prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
        if (params.loop && !prevSlide === 0) {
          prevSlide = slides[slides.length - 1];
        }
        if (prevSlide) {
          prevSlide.classList.add(params.slidePrevClass);
        }
      }
    }
    swiper2.emitSlidesClasses();
  }
  const processLazyPreloader = (swiper2, imageEl) => {
    if (!swiper2 || swiper2.destroyed || !swiper2.params)
      return;
    const slideSelector = () => swiper2.isElement ? `swiper-slide` : `.${swiper2.params.slideClass}`;
    const slideEl = imageEl.closest(slideSelector());
    if (slideEl) {
      let lazyEl = slideEl.querySelector(`.${swiper2.params.lazyPreloaderClass}`);
      if (!lazyEl && swiper2.isElement) {
        if (slideEl.shadowRoot) {
          lazyEl = slideEl.shadowRoot.querySelector(`.${swiper2.params.lazyPreloaderClass}`);
        } else {
          requestAnimationFrame(() => {
            if (slideEl.shadowRoot) {
              lazyEl = slideEl.shadowRoot.querySelector(`.${swiper2.params.lazyPreloaderClass}`);
              if (lazyEl)
                lazyEl.remove();
            }
          });
        }
      }
      if (lazyEl)
        lazyEl.remove();
    }
  };
  const unlazy = (swiper2, index) => {
    if (!swiper2.slides[index])
      return;
    const imageEl = swiper2.slides[index].querySelector('[loading="lazy"]');
    if (imageEl)
      imageEl.removeAttribute("loading");
  };
  const preload = (swiper2) => {
    if (!swiper2 || swiper2.destroyed || !swiper2.params)
      return;
    let amount = swiper2.params.lazyPreloadPrevNext;
    const len = swiper2.slides.length;
    if (!len || !amount || amount < 0)
      return;
    amount = Math.min(amount, len);
    const slidesPerView = swiper2.params.slidesPerView === "auto" ? swiper2.slidesPerViewDynamic() : Math.ceil(swiper2.params.slidesPerView);
    const activeIndex = swiper2.activeIndex;
    if (swiper2.params.grid && swiper2.params.grid.rows > 1) {
      const activeColumn = activeIndex;
      const preloadColumns = [activeColumn - amount];
      preloadColumns.push(...Array.from({
        length: amount
      }).map((_, i) => {
        return activeColumn + slidesPerView + i;
      }));
      swiper2.slides.forEach((slideEl, i) => {
        if (preloadColumns.includes(slideEl.column))
          unlazy(swiper2, i);
      });
      return;
    }
    const slideIndexLastInView = activeIndex + slidesPerView - 1;
    if (swiper2.params.rewind || swiper2.params.loop) {
      for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
        const realIndex = (i % len + len) % len;
        if (realIndex < activeIndex || realIndex > slideIndexLastInView)
          unlazy(swiper2, realIndex);
      }
    } else {
      for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
        if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
          unlazy(swiper2, i);
        }
      }
    }
  };
  function getActiveIndexByTranslate(swiper2) {
    const {
      slidesGrid,
      params
    } = swiper2;
    const translate2 = swiper2.rtlTranslate ? swiper2.translate : -swiper2.translate;
    let activeIndex;
    for (let i = 0; i < slidesGrid.length; i += 1) {
      if (typeof slidesGrid[i + 1] !== "undefined") {
        if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
          activeIndex = i;
        } else if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1]) {
          activeIndex = i + 1;
        }
      } else if (translate2 >= slidesGrid[i]) {
        activeIndex = i;
      }
    }
    if (params.normalizeSlideIndex) {
      if (activeIndex < 0 || typeof activeIndex === "undefined")
        activeIndex = 0;
    }
    return activeIndex;
  }
  function updateActiveIndex(newActiveIndex) {
    const swiper2 = this;
    const translate2 = swiper2.rtlTranslate ? swiper2.translate : -swiper2.translate;
    const {
      snapGrid,
      params,
      activeIndex: previousIndex,
      realIndex: previousRealIndex,
      snapIndex: previousSnapIndex
    } = swiper2;
    let activeIndex = newActiveIndex;
    let snapIndex;
    const getVirtualRealIndex = (aIndex) => {
      let realIndex2 = aIndex - swiper2.virtual.slidesBefore;
      if (realIndex2 < 0) {
        realIndex2 = swiper2.virtual.slides.length + realIndex2;
      }
      if (realIndex2 >= swiper2.virtual.slides.length) {
        realIndex2 -= swiper2.virtual.slides.length;
      }
      return realIndex2;
    };
    if (typeof activeIndex === "undefined") {
      activeIndex = getActiveIndexByTranslate(swiper2);
    }
    if (snapGrid.indexOf(translate2) >= 0) {
      snapIndex = snapGrid.indexOf(translate2);
    } else {
      const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
      snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
    }
    if (snapIndex >= snapGrid.length)
      snapIndex = snapGrid.length - 1;
    if (activeIndex === previousIndex && !swiper2.params.loop) {
      if (snapIndex !== previousSnapIndex) {
        swiper2.snapIndex = snapIndex;
        swiper2.emit("snapIndexChange");
      }
      return;
    }
    if (activeIndex === previousIndex && swiper2.params.loop && swiper2.virtual && swiper2.params.virtual.enabled) {
      swiper2.realIndex = getVirtualRealIndex(activeIndex);
      return;
    }
    const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
    let realIndex;
    if (swiper2.virtual && params.virtual.enabled && params.loop) {
      realIndex = getVirtualRealIndex(activeIndex);
    } else if (gridEnabled) {
      const firstSlideInColumn = swiper2.slides.filter((slideEl) => slideEl.column === activeIndex)[0];
      let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
      if (Number.isNaN(activeSlideIndex)) {
        activeSlideIndex = Math.max(swiper2.slides.indexOf(firstSlideInColumn), 0);
      }
      realIndex = Math.floor(activeSlideIndex / params.grid.rows);
    } else if (swiper2.slides[activeIndex]) {
      const slideIndex = swiper2.slides[activeIndex].getAttribute("data-swiper-slide-index");
      if (slideIndex) {
        realIndex = parseInt(slideIndex, 10);
      } else {
        realIndex = activeIndex;
      }
    } else {
      realIndex = activeIndex;
    }
    Object.assign(swiper2, {
      previousSnapIndex,
      snapIndex,
      previousRealIndex,
      realIndex,
      previousIndex,
      activeIndex
    });
    if (swiper2.initialized) {
      preload(swiper2);
    }
    swiper2.emit("activeIndexChange");
    swiper2.emit("snapIndexChange");
    if (swiper2.initialized || swiper2.params.runCallbacksOnInit) {
      if (previousRealIndex !== realIndex) {
        swiper2.emit("realIndexChange");
      }
      swiper2.emit("slideChange");
    }
  }
  function updateClickedSlide(el, path) {
    const swiper2 = this;
    const params = swiper2.params;
    let slide2 = el.closest(`.${params.slideClass}, swiper-slide`);
    if (!slide2 && swiper2.isElement && path && path.length > 1 && path.includes(el)) {
      [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
        if (!slide2 && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
          slide2 = pathEl;
        }
      });
    }
    let slideFound = false;
    let slideIndex;
    if (slide2) {
      for (let i = 0; i < swiper2.slides.length; i += 1) {
        if (swiper2.slides[i] === slide2) {
          slideFound = true;
          slideIndex = i;
          break;
        }
      }
    }
    if (slide2 && slideFound) {
      swiper2.clickedSlide = slide2;
      if (swiper2.virtual && swiper2.params.virtual.enabled) {
        swiper2.clickedIndex = parseInt(slide2.getAttribute("data-swiper-slide-index"), 10);
      } else {
        swiper2.clickedIndex = slideIndex;
      }
    } else {
      swiper2.clickedSlide = void 0;
      swiper2.clickedIndex = void 0;
      return;
    }
    if (params.slideToClickedSlide && swiper2.clickedIndex !== void 0 && swiper2.clickedIndex !== swiper2.activeIndex) {
      swiper2.slideToClickedSlide();
    }
  }
  var update = {
    updateSize,
    updateSlides,
    updateAutoHeight,
    updateSlidesOffset,
    updateSlidesProgress,
    updateProgress,
    updateSlidesClasses,
    updateActiveIndex,
    updateClickedSlide
  };
  function getSwiperTranslate(axis) {
    if (axis === void 0) {
      axis = this.isHorizontal() ? "x" : "y";
    }
    const swiper2 = this;
    const {
      params,
      rtlTranslate: rtl,
      translate: translate2,
      wrapperEl
    } = swiper2;
    if (params.virtualTranslate) {
      return rtl ? -translate2 : translate2;
    }
    if (params.cssMode) {
      return translate2;
    }
    let currentTranslate = getTranslate(wrapperEl, axis);
    currentTranslate += swiper2.cssOverflowAdjustment();
    if (rtl)
      currentTranslate = -currentTranslate;
    return currentTranslate || 0;
  }
  function setTranslate(translate2, byController) {
    const swiper2 = this;
    const {
      rtlTranslate: rtl,
      params,
      wrapperEl,
      progress
    } = swiper2;
    let x = 0;
    let y = 0;
    const z = 0;
    if (swiper2.isHorizontal()) {
      x = rtl ? -translate2 : translate2;
    } else {
      y = translate2;
    }
    if (params.roundLengths) {
      x = Math.floor(x);
      y = Math.floor(y);
    }
    swiper2.previousTranslate = swiper2.translate;
    swiper2.translate = swiper2.isHorizontal() ? x : y;
    if (params.cssMode) {
      wrapperEl[swiper2.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper2.isHorizontal() ? -x : -y;
    } else if (!params.virtualTranslate) {
      if (swiper2.isHorizontal()) {
        x -= swiper2.cssOverflowAdjustment();
      } else {
        y -= swiper2.cssOverflowAdjustment();
      }
      wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    }
    let newProgress;
    const translatesDiff = swiper2.maxTranslate() - swiper2.minTranslate();
    if (translatesDiff === 0) {
      newProgress = 0;
    } else {
      newProgress = (translate2 - swiper2.minTranslate()) / translatesDiff;
    }
    if (newProgress !== progress) {
      swiper2.updateProgress(translate2);
    }
    swiper2.emit("setTranslate", swiper2.translate, byController);
  }
  function minTranslate() {
    return -this.snapGrid[0];
  }
  function maxTranslate() {
    return -this.snapGrid[this.snapGrid.length - 1];
  }
  function translateTo(translate2, speed, runCallbacks, translateBounds, internal) {
    if (translate2 === void 0) {
      translate2 = 0;
    }
    if (speed === void 0) {
      speed = this.params.speed;
    }
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    if (translateBounds === void 0) {
      translateBounds = true;
    }
    const swiper2 = this;
    const {
      params,
      wrapperEl
    } = swiper2;
    if (swiper2.animating && params.preventInteractionOnTransition) {
      return false;
    }
    const minTranslate2 = swiper2.minTranslate();
    const maxTranslate2 = swiper2.maxTranslate();
    let newTranslate;
    if (translateBounds && translate2 > minTranslate2)
      newTranslate = minTranslate2;
    else if (translateBounds && translate2 < maxTranslate2)
      newTranslate = maxTranslate2;
    else
      newTranslate = translate2;
    swiper2.updateProgress(newTranslate);
    if (params.cssMode) {
      const isH = swiper2.isHorizontal();
      if (speed === 0) {
        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
      } else {
        if (!swiper2.support.smoothScroll) {
          animateCSSModeScroll({
            swiper: swiper2,
            targetPosition: -newTranslate,
            side: isH ? "left" : "top"
          });
          return true;
        }
        wrapperEl.scrollTo({
          [isH ? "left" : "top"]: -newTranslate,
          behavior: "smooth"
        });
      }
      return true;
    }
    if (speed === 0) {
      swiper2.setTransition(0);
      swiper2.setTranslate(newTranslate);
      if (runCallbacks) {
        swiper2.emit("beforeTransitionStart", speed, internal);
        swiper2.emit("transitionEnd");
      }
    } else {
      swiper2.setTransition(speed);
      swiper2.setTranslate(newTranslate);
      if (runCallbacks) {
        swiper2.emit("beforeTransitionStart", speed, internal);
        swiper2.emit("transitionStart");
      }
      if (!swiper2.animating) {
        swiper2.animating = true;
        if (!swiper2.onTranslateToWrapperTransitionEnd) {
          swiper2.onTranslateToWrapperTransitionEnd = function transitionEnd2(e) {
            if (!swiper2 || swiper2.destroyed)
              return;
            if (e.target !== this)
              return;
            swiper2.wrapperEl.removeEventListener("transitionend", swiper2.onTranslateToWrapperTransitionEnd);
            swiper2.onTranslateToWrapperTransitionEnd = null;
            delete swiper2.onTranslateToWrapperTransitionEnd;
            if (runCallbacks) {
              swiper2.emit("transitionEnd");
            }
          };
        }
        swiper2.wrapperEl.addEventListener("transitionend", swiper2.onTranslateToWrapperTransitionEnd);
      }
    }
    return true;
  }
  var translate = {
    getTranslate: getSwiperTranslate,
    setTranslate,
    minTranslate,
    maxTranslate,
    translateTo
  };
  function setTransition(duration, byController) {
    const swiper2 = this;
    if (!swiper2.params.cssMode) {
      swiper2.wrapperEl.style.transitionDuration = `${duration}ms`;
      swiper2.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
    }
    swiper2.emit("setTransition", duration, byController);
  }
  function transitionEmit(_ref) {
    let {
      swiper: swiper2,
      runCallbacks,
      direction,
      step
    } = _ref;
    const {
      activeIndex,
      previousIndex
    } = swiper2;
    let dir = direction;
    if (!dir) {
      if (activeIndex > previousIndex)
        dir = "next";
      else if (activeIndex < previousIndex)
        dir = "prev";
      else
        dir = "reset";
    }
    swiper2.emit(`transition${step}`);
    if (runCallbacks && activeIndex !== previousIndex) {
      if (dir === "reset") {
        swiper2.emit(`slideResetTransition${step}`);
        return;
      }
      swiper2.emit(`slideChangeTransition${step}`);
      if (dir === "next") {
        swiper2.emit(`slideNextTransition${step}`);
      } else {
        swiper2.emit(`slidePrevTransition${step}`);
      }
    }
  }
  function transitionStart(runCallbacks, direction) {
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    const swiper2 = this;
    const {
      params
    } = swiper2;
    if (params.cssMode)
      return;
    if (params.autoHeight) {
      swiper2.updateAutoHeight();
    }
    transitionEmit({
      swiper: swiper2,
      runCallbacks,
      direction,
      step: "Start"
    });
  }
  function transitionEnd(runCallbacks, direction) {
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    const swiper2 = this;
    const {
      params
    } = swiper2;
    swiper2.animating = false;
    if (params.cssMode)
      return;
    swiper2.setTransition(0);
    transitionEmit({
      swiper: swiper2,
      runCallbacks,
      direction,
      step: "End"
    });
  }
  var transition = {
    setTransition,
    transitionStart,
    transitionEnd
  };
  function slideTo(index, speed, runCallbacks, internal, initial) {
    if (index === void 0) {
      index = 0;
    }
    if (speed === void 0) {
      speed = this.params.speed;
    }
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    if (typeof index === "string") {
      index = parseInt(index, 10);
    }
    const swiper2 = this;
    let slideIndex = index;
    if (slideIndex < 0)
      slideIndex = 0;
    const {
      params,
      snapGrid,
      slidesGrid,
      previousIndex,
      activeIndex,
      rtlTranslate: rtl,
      wrapperEl,
      enabled
    } = swiper2;
    if (swiper2.animating && params.preventInteractionOnTransition || !enabled && !internal && !initial) {
      return false;
    }
    const skip = Math.min(swiper2.params.slidesPerGroupSkip, slideIndex);
    let snapIndex = skip + Math.floor((slideIndex - skip) / swiper2.params.slidesPerGroup);
    if (snapIndex >= snapGrid.length)
      snapIndex = snapGrid.length - 1;
    const translate2 = -snapGrid[snapIndex];
    if (params.normalizeSlideIndex) {
      for (let i = 0; i < slidesGrid.length; i += 1) {
        const normalizedTranslate = -Math.floor(translate2 * 100);
        const normalizedGrid = Math.floor(slidesGrid[i] * 100);
        const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
        if (typeof slidesGrid[i + 1] !== "undefined") {
          if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
            slideIndex = i;
          } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
            slideIndex = i + 1;
          }
        } else if (normalizedTranslate >= normalizedGrid) {
          slideIndex = i;
        }
      }
    }
    if (swiper2.initialized && slideIndex !== activeIndex) {
      if (!swiper2.allowSlideNext && (rtl ? translate2 > swiper2.translate && translate2 > swiper2.minTranslate() : translate2 < swiper2.translate && translate2 < swiper2.minTranslate())) {
        return false;
      }
      if (!swiper2.allowSlidePrev && translate2 > swiper2.translate && translate2 > swiper2.maxTranslate()) {
        if ((activeIndex || 0) !== slideIndex) {
          return false;
        }
      }
    }
    if (slideIndex !== (previousIndex || 0) && runCallbacks) {
      swiper2.emit("beforeSlideChangeStart");
    }
    swiper2.updateProgress(translate2);
    let direction;
    if (slideIndex > activeIndex)
      direction = "next";
    else if (slideIndex < activeIndex)
      direction = "prev";
    else
      direction = "reset";
    if (rtl && -translate2 === swiper2.translate || !rtl && translate2 === swiper2.translate) {
      swiper2.updateActiveIndex(slideIndex);
      if (params.autoHeight) {
        swiper2.updateAutoHeight();
      }
      swiper2.updateSlidesClasses();
      if (params.effect !== "slide") {
        swiper2.setTranslate(translate2);
      }
      if (direction !== "reset") {
        swiper2.transitionStart(runCallbacks, direction);
        swiper2.transitionEnd(runCallbacks, direction);
      }
      return false;
    }
    if (params.cssMode) {
      const isH = swiper2.isHorizontal();
      const t = rtl ? translate2 : -translate2;
      if (speed === 0) {
        const isVirtual = swiper2.virtual && swiper2.params.virtual.enabled;
        if (isVirtual) {
          swiper2.wrapperEl.style.scrollSnapType = "none";
          swiper2._immediateVirtual = true;
        }
        if (isVirtual && !swiper2._cssModeVirtualInitialSet && swiper2.params.initialSlide > 0) {
          swiper2._cssModeVirtualInitialSet = true;
          requestAnimationFrame(() => {
            wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
          });
        } else {
          wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
        }
        if (isVirtual) {
          requestAnimationFrame(() => {
            swiper2.wrapperEl.style.scrollSnapType = "";
            swiper2._immediateVirtual = false;
          });
        }
      } else {
        if (!swiper2.support.smoothScroll) {
          animateCSSModeScroll({
            swiper: swiper2,
            targetPosition: t,
            side: isH ? "left" : "top"
          });
          return true;
        }
        wrapperEl.scrollTo({
          [isH ? "left" : "top"]: t,
          behavior: "smooth"
        });
      }
      return true;
    }
    swiper2.setTransition(speed);
    swiper2.setTranslate(translate2);
    swiper2.updateActiveIndex(slideIndex);
    swiper2.updateSlidesClasses();
    swiper2.emit("beforeTransitionStart", speed, internal);
    swiper2.transitionStart(runCallbacks, direction);
    if (speed === 0) {
      swiper2.transitionEnd(runCallbacks, direction);
    } else if (!swiper2.animating) {
      swiper2.animating = true;
      if (!swiper2.onSlideToWrapperTransitionEnd) {
        swiper2.onSlideToWrapperTransitionEnd = function transitionEnd2(e) {
          if (!swiper2 || swiper2.destroyed)
            return;
          if (e.target !== this)
            return;
          swiper2.wrapperEl.removeEventListener("transitionend", swiper2.onSlideToWrapperTransitionEnd);
          swiper2.onSlideToWrapperTransitionEnd = null;
          delete swiper2.onSlideToWrapperTransitionEnd;
          swiper2.transitionEnd(runCallbacks, direction);
        };
      }
      swiper2.wrapperEl.addEventListener("transitionend", swiper2.onSlideToWrapperTransitionEnd);
    }
    return true;
  }
  function slideToLoop(index, speed, runCallbacks, internal) {
    if (index === void 0) {
      index = 0;
    }
    if (speed === void 0) {
      speed = this.params.speed;
    }
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    if (typeof index === "string") {
      const indexAsNumber = parseInt(index, 10);
      index = indexAsNumber;
    }
    const swiper2 = this;
    const gridEnabled = swiper2.grid && swiper2.params.grid && swiper2.params.grid.rows > 1;
    let newIndex = index;
    if (swiper2.params.loop) {
      if (swiper2.virtual && swiper2.params.virtual.enabled) {
        newIndex = newIndex + swiper2.virtual.slidesBefore;
      } else {
        let targetSlideIndex;
        if (gridEnabled) {
          const slideIndex = newIndex * swiper2.params.grid.rows;
          targetSlideIndex = swiper2.slides.filter((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex)[0].column;
        } else {
          targetSlideIndex = swiper2.getSlideIndexByData(newIndex);
        }
        const cols = gridEnabled ? Math.ceil(swiper2.slides.length / swiper2.params.grid.rows) : swiper2.slides.length;
        const {
          centeredSlides
        } = swiper2.params;
        let slidesPerView = swiper2.params.slidesPerView;
        if (slidesPerView === "auto") {
          slidesPerView = swiper2.slidesPerViewDynamic();
        } else {
          slidesPerView = Math.ceil(parseFloat(swiper2.params.slidesPerView, 10));
          if (centeredSlides && slidesPerView % 2 === 0) {
            slidesPerView = slidesPerView + 1;
          }
        }
        let needLoopFix = cols - targetSlideIndex < slidesPerView;
        if (centeredSlides) {
          needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
        }
        if (needLoopFix) {
          const direction = centeredSlides ? targetSlideIndex < swiper2.activeIndex ? "prev" : "next" : targetSlideIndex - swiper2.activeIndex - 1 < swiper2.params.slidesPerView ? "next" : "prev";
          swiper2.loopFix({
            direction,
            slideTo: true,
            activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
            slideRealIndex: direction === "next" ? swiper2.realIndex : void 0
          });
        }
        if (gridEnabled) {
          const slideIndex = newIndex * swiper2.params.grid.rows;
          newIndex = swiper2.slides.filter((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex)[0].column;
        } else {
          newIndex = swiper2.getSlideIndexByData(newIndex);
        }
      }
    }
    requestAnimationFrame(() => {
      swiper2.slideTo(newIndex, speed, runCallbacks, internal);
    });
    return swiper2;
  }
  function slideNext(speed, runCallbacks, internal) {
    if (speed === void 0) {
      speed = this.params.speed;
    }
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    const swiper2 = this;
    const {
      enabled,
      params,
      animating
    } = swiper2;
    if (!enabled)
      return swiper2;
    let perGroup = params.slidesPerGroup;
    if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      perGroup = Math.max(swiper2.slidesPerViewDynamic("current", true), 1);
    }
    const increment = swiper2.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
    const isVirtual = swiper2.virtual && params.virtual.enabled;
    if (params.loop) {
      if (animating && !isVirtual && params.loopPreventsSliding)
        return false;
      swiper2.loopFix({
        direction: "next"
      });
      swiper2._clientLeft = swiper2.wrapperEl.clientLeft;
      if (swiper2.activeIndex === swiper2.slides.length - 1 && params.cssMode) {
        requestAnimationFrame(() => {
          swiper2.slideTo(swiper2.activeIndex + increment, speed, runCallbacks, internal);
        });
        return true;
      }
    }
    if (params.rewind && swiper2.isEnd) {
      return swiper2.slideTo(0, speed, runCallbacks, internal);
    }
    return swiper2.slideTo(swiper2.activeIndex + increment, speed, runCallbacks, internal);
  }
  function slidePrev(speed, runCallbacks, internal) {
    if (speed === void 0) {
      speed = this.params.speed;
    }
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    const swiper2 = this;
    const {
      params,
      snapGrid,
      slidesGrid,
      rtlTranslate,
      enabled,
      animating
    } = swiper2;
    if (!enabled)
      return swiper2;
    const isVirtual = swiper2.virtual && params.virtual.enabled;
    if (params.loop) {
      if (animating && !isVirtual && params.loopPreventsSliding)
        return false;
      swiper2.loopFix({
        direction: "prev"
      });
      swiper2._clientLeft = swiper2.wrapperEl.clientLeft;
    }
    const translate2 = rtlTranslate ? swiper2.translate : -swiper2.translate;
    function normalize(val) {
      if (val < 0)
        return -Math.floor(Math.abs(val));
      return Math.floor(val);
    }
    const normalizedTranslate = normalize(translate2);
    const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
    let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
    if (typeof prevSnap === "undefined" && params.cssMode) {
      let prevSnapIndex;
      snapGrid.forEach((snap, snapIndex) => {
        if (normalizedTranslate >= snap) {
          prevSnapIndex = snapIndex;
        }
      });
      if (typeof prevSnapIndex !== "undefined") {
        prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
      }
    }
    let prevIndex = 0;
    if (typeof prevSnap !== "undefined") {
      prevIndex = slidesGrid.indexOf(prevSnap);
      if (prevIndex < 0)
        prevIndex = swiper2.activeIndex - 1;
      if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
        prevIndex = prevIndex - swiper2.slidesPerViewDynamic("previous", true) + 1;
        prevIndex = Math.max(prevIndex, 0);
      }
    }
    if (params.rewind && swiper2.isBeginning) {
      const lastIndex = swiper2.params.virtual && swiper2.params.virtual.enabled && swiper2.virtual ? swiper2.virtual.slides.length - 1 : swiper2.slides.length - 1;
      return swiper2.slideTo(lastIndex, speed, runCallbacks, internal);
    } else if (params.loop && swiper2.activeIndex === 0 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper2.slideTo(prevIndex, speed, runCallbacks, internal);
      });
      return true;
    }
    return swiper2.slideTo(prevIndex, speed, runCallbacks, internal);
  }
  function slideReset(speed, runCallbacks, internal) {
    if (speed === void 0) {
      speed = this.params.speed;
    }
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    const swiper2 = this;
    return swiper2.slideTo(swiper2.activeIndex, speed, runCallbacks, internal);
  }
  function slideToClosest(speed, runCallbacks, internal, threshold) {
    if (speed === void 0) {
      speed = this.params.speed;
    }
    if (runCallbacks === void 0) {
      runCallbacks = true;
    }
    if (threshold === void 0) {
      threshold = 0.5;
    }
    const swiper2 = this;
    let index = swiper2.activeIndex;
    const skip = Math.min(swiper2.params.slidesPerGroupSkip, index);
    const snapIndex = skip + Math.floor((index - skip) / swiper2.params.slidesPerGroup);
    const translate2 = swiper2.rtlTranslate ? swiper2.translate : -swiper2.translate;
    if (translate2 >= swiper2.snapGrid[snapIndex]) {
      const currentSnap = swiper2.snapGrid[snapIndex];
      const nextSnap = swiper2.snapGrid[snapIndex + 1];
      if (translate2 - currentSnap > (nextSnap - currentSnap) * threshold) {
        index += swiper2.params.slidesPerGroup;
      }
    } else {
      const prevSnap = swiper2.snapGrid[snapIndex - 1];
      const currentSnap = swiper2.snapGrid[snapIndex];
      if (translate2 - prevSnap <= (currentSnap - prevSnap) * threshold) {
        index -= swiper2.params.slidesPerGroup;
      }
    }
    index = Math.max(index, 0);
    index = Math.min(index, swiper2.slidesGrid.length - 1);
    return swiper2.slideTo(index, speed, runCallbacks, internal);
  }
  function slideToClickedSlide() {
    const swiper2 = this;
    const {
      params,
      slidesEl
    } = swiper2;
    const slidesPerView = params.slidesPerView === "auto" ? swiper2.slidesPerViewDynamic() : params.slidesPerView;
    let slideToIndex = swiper2.clickedIndex;
    let realIndex;
    const slideSelector = swiper2.isElement ? `swiper-slide` : `.${params.slideClass}`;
    if (params.loop) {
      if (swiper2.animating)
        return;
      realIndex = parseInt(swiper2.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
      if (params.centeredSlides) {
        if (slideToIndex < swiper2.loopedSlides - slidesPerView / 2 || slideToIndex > swiper2.slides.length - swiper2.loopedSlides + slidesPerView / 2) {
          swiper2.loopFix();
          slideToIndex = swiper2.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
          nextTick(() => {
            swiper2.slideTo(slideToIndex);
          });
        } else {
          swiper2.slideTo(slideToIndex);
        }
      } else if (slideToIndex > swiper2.slides.length - slidesPerView) {
        swiper2.loopFix();
        slideToIndex = swiper2.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
        nextTick(() => {
          swiper2.slideTo(slideToIndex);
        });
      } else {
        swiper2.slideTo(slideToIndex);
      }
    } else {
      swiper2.slideTo(slideToIndex);
    }
  }
  var slide = {
    slideTo,
    slideToLoop,
    slideNext,
    slidePrev,
    slideReset,
    slideToClosest,
    slideToClickedSlide
  };
  function loopCreate(slideRealIndex) {
    const swiper2 = this;
    const {
      params,
      slidesEl
    } = swiper2;
    if (!params.loop || swiper2.virtual && swiper2.params.virtual.enabled)
      return;
    const initSlides = () => {
      const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
      slides.forEach((el, index) => {
        el.setAttribute("data-swiper-slide-index", index);
      });
    };
    const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
    const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
    const shouldFillGroup = swiper2.slides.length % slidesPerGroup !== 0;
    const shouldFillGrid = gridEnabled && swiper2.slides.length % params.grid.rows !== 0;
    const addBlankSlides = (amountOfSlides) => {
      for (let i = 0; i < amountOfSlides; i += 1) {
        const slideEl = swiper2.isElement ? createElement("swiper-slide", [params.slideBlankClass]) : createElement("div", [params.slideClass, params.slideBlankClass]);
        swiper2.slidesEl.append(slideEl);
      }
    };
    if (shouldFillGroup) {
      if (params.loopAddBlankSlides) {
        const slidesToAdd = slidesPerGroup - swiper2.slides.length % slidesPerGroup;
        addBlankSlides(slidesToAdd);
        swiper2.recalcSlides();
        swiper2.updateSlides();
      } else {
        showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
      }
      initSlides();
    } else if (shouldFillGrid) {
      if (params.loopAddBlankSlides) {
        const slidesToAdd = params.grid.rows - swiper2.slides.length % params.grid.rows;
        addBlankSlides(slidesToAdd);
        swiper2.recalcSlides();
        swiper2.updateSlides();
      } else {
        showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
      }
      initSlides();
    } else {
      initSlides();
    }
    swiper2.loopFix({
      slideRealIndex,
      direction: params.centeredSlides ? void 0 : "next"
    });
  }
  function loopFix(_temp) {
    let {
      slideRealIndex,
      slideTo: slideTo2 = true,
      direction,
      setTranslate: setTranslate2,
      activeSlideIndex,
      byController,
      byMousewheel
    } = _temp === void 0 ? {} : _temp;
    const swiper2 = this;
    if (!swiper2.params.loop)
      return;
    swiper2.emit("beforeLoopFix");
    const {
      slides,
      allowSlidePrev,
      allowSlideNext,
      slidesEl,
      params
    } = swiper2;
    const {
      centeredSlides
    } = params;
    swiper2.allowSlidePrev = true;
    swiper2.allowSlideNext = true;
    if (swiper2.virtual && params.virtual.enabled) {
      if (slideTo2) {
        if (!params.centeredSlides && swiper2.snapIndex === 0) {
          swiper2.slideTo(swiper2.virtual.slides.length, 0, false, true);
        } else if (params.centeredSlides && swiper2.snapIndex < params.slidesPerView) {
          swiper2.slideTo(swiper2.virtual.slides.length + swiper2.snapIndex, 0, false, true);
        } else if (swiper2.snapIndex === swiper2.snapGrid.length - 1) {
          swiper2.slideTo(swiper2.virtual.slidesBefore, 0, false, true);
        }
      }
      swiper2.allowSlidePrev = allowSlidePrev;
      swiper2.allowSlideNext = allowSlideNext;
      swiper2.emit("loopFix");
      return;
    }
    let slidesPerView = params.slidesPerView;
    if (slidesPerView === "auto") {
      slidesPerView = swiper2.slidesPerViewDynamic();
    } else {
      slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
      if (centeredSlides && slidesPerView % 2 === 0) {
        slidesPerView = slidesPerView + 1;
      }
    }
    const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
    let loopedSlides = slidesPerGroup;
    if (loopedSlides % slidesPerGroup !== 0) {
      loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
    }
    loopedSlides += params.loopAdditionalSlides;
    swiper2.loopedSlides = loopedSlides;
    const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
    if (slides.length < slidesPerView + loopedSlides) {
      showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
    } else if (gridEnabled && params.grid.fill === "row") {
      showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
    }
    const prependSlidesIndexes = [];
    const appendSlidesIndexes = [];
    let activeIndex = swiper2.activeIndex;
    if (typeof activeSlideIndex === "undefined") {
      activeSlideIndex = swiper2.getSlideIndex(slides.filter((el) => el.classList.contains(params.slideActiveClass))[0]);
    } else {
      activeIndex = activeSlideIndex;
    }
    const isNext = direction === "next" || !direction;
    const isPrev = direction === "prev" || !direction;
    let slidesPrepended = 0;
    let slidesAppended = 0;
    const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
    const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
    const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate2 === "undefined" ? -slidesPerView / 2 + 0.5 : 0);
    if (activeColIndexWithShift < loopedSlides) {
      slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
      for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
        const index = i - Math.floor(i / cols) * cols;
        if (gridEnabled) {
          const colIndexToPrepend = cols - index - 1;
          for (let i2 = slides.length - 1; i2 >= 0; i2 -= 1) {
            if (slides[i2].column === colIndexToPrepend)
              prependSlidesIndexes.push(i2);
          }
        } else {
          prependSlidesIndexes.push(cols - index - 1);
        }
      }
    } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
      slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
      for (let i = 0; i < slidesAppended; i += 1) {
        const index = i - Math.floor(i / cols) * cols;
        if (gridEnabled) {
          slides.forEach((slide2, slideIndex) => {
            if (slide2.column === index)
              appendSlidesIndexes.push(slideIndex);
          });
        } else {
          appendSlidesIndexes.push(index);
        }
      }
    }
    swiper2.__preventObserver__ = true;
    requestAnimationFrame(() => {
      swiper2.__preventObserver__ = false;
    });
    if (isPrev) {
      prependSlidesIndexes.forEach((index) => {
        slides[index].swiperLoopMoveDOM = true;
        slidesEl.prepend(slides[index]);
        slides[index].swiperLoopMoveDOM = false;
      });
    }
    if (isNext) {
      appendSlidesIndexes.forEach((index) => {
        slides[index].swiperLoopMoveDOM = true;
        slidesEl.append(slides[index]);
        slides[index].swiperLoopMoveDOM = false;
      });
    }
    swiper2.recalcSlides();
    if (params.slidesPerView === "auto") {
      swiper2.updateSlides();
    } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
      swiper2.slides.forEach((slide2, slideIndex) => {
        swiper2.grid.updateSlide(slideIndex, slide2, swiper2.slides);
      });
    }
    if (params.watchSlidesProgress) {
      swiper2.updateSlidesOffset();
    }
    if (slideTo2) {
      if (prependSlidesIndexes.length > 0 && isPrev) {
        if (typeof slideRealIndex === "undefined") {
          const currentSlideTranslate = swiper2.slidesGrid[activeIndex];
          const newSlideTranslate = swiper2.slidesGrid[activeIndex + slidesPrepended];
          const diff = newSlideTranslate - currentSlideTranslate;
          if (byMousewheel) {
            swiper2.setTranslate(swiper2.translate - diff);
          } else {
            swiper2.slideTo(activeIndex + slidesPrepended, 0, false, true);
            if (setTranslate2) {
              swiper2.touchEventsData.startTranslate = swiper2.touchEventsData.startTranslate - diff;
              swiper2.touchEventsData.currentTranslate = swiper2.touchEventsData.currentTranslate - diff;
            }
          }
        } else {
          if (setTranslate2) {
            const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
            swiper2.slideTo(swiper2.activeIndex + shift, 0, false, true);
            swiper2.touchEventsData.currentTranslate = swiper2.translate;
          }
        }
      } else if (appendSlidesIndexes.length > 0 && isNext) {
        if (typeof slideRealIndex === "undefined") {
          const currentSlideTranslate = swiper2.slidesGrid[activeIndex];
          const newSlideTranslate = swiper2.slidesGrid[activeIndex - slidesAppended];
          const diff = newSlideTranslate - currentSlideTranslate;
          if (byMousewheel) {
            swiper2.setTranslate(swiper2.translate - diff);
          } else {
            swiper2.slideTo(activeIndex - slidesAppended, 0, false, true);
            if (setTranslate2) {
              swiper2.touchEventsData.startTranslate = swiper2.touchEventsData.startTranslate - diff;
              swiper2.touchEventsData.currentTranslate = swiper2.touchEventsData.currentTranslate - diff;
            }
          }
        } else {
          const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
          swiper2.slideTo(swiper2.activeIndex - shift, 0, false, true);
        }
      }
    }
    swiper2.allowSlidePrev = allowSlidePrev;
    swiper2.allowSlideNext = allowSlideNext;
    if (swiper2.controller && swiper2.controller.control && !byController) {
      const loopParams = {
        slideRealIndex,
        direction,
        setTranslate: setTranslate2,
        activeSlideIndex,
        byController: true
      };
      if (Array.isArray(swiper2.controller.control)) {
        swiper2.controller.control.forEach((c) => {
          if (!c.destroyed && c.params.loop)
            c.loopFix({
              ...loopParams,
              slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo2 : false
            });
        });
      } else if (swiper2.controller.control instanceof swiper2.constructor && swiper2.controller.control.params.loop) {
        swiper2.controller.control.loopFix({
          ...loopParams,
          slideTo: swiper2.controller.control.params.slidesPerView === params.slidesPerView ? slideTo2 : false
        });
      }
    }
    swiper2.emit("loopFix");
  }
  function loopDestroy() {
    const swiper2 = this;
    const {
      params,
      slidesEl
    } = swiper2;
    if (!params.loop || swiper2.virtual && swiper2.params.virtual.enabled)
      return;
    swiper2.recalcSlides();
    const newSlidesOrder = [];
    swiper2.slides.forEach((slideEl) => {
      const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
      newSlidesOrder[index] = slideEl;
    });
    swiper2.slides.forEach((slideEl) => {
      slideEl.removeAttribute("data-swiper-slide-index");
    });
    newSlidesOrder.forEach((slideEl) => {
      slidesEl.append(slideEl);
    });
    swiper2.recalcSlides();
    swiper2.slideTo(swiper2.realIndex, 0);
  }
  var loop = {
    loopCreate,
    loopFix,
    loopDestroy
  };
  function setGrabCursor(moving) {
    const swiper2 = this;
    if (!swiper2.params.simulateTouch || swiper2.params.watchOverflow && swiper2.isLocked || swiper2.params.cssMode)
      return;
    const el = swiper2.params.touchEventsTarget === "container" ? swiper2.el : swiper2.wrapperEl;
    if (swiper2.isElement) {
      swiper2.__preventObserver__ = true;
    }
    el.style.cursor = "move";
    el.style.cursor = moving ? "grabbing" : "grab";
    if (swiper2.isElement) {
      requestAnimationFrame(() => {
        swiper2.__preventObserver__ = false;
      });
    }
  }
  function unsetGrabCursor() {
    const swiper2 = this;
    if (swiper2.params.watchOverflow && swiper2.isLocked || swiper2.params.cssMode) {
      return;
    }
    if (swiper2.isElement) {
      swiper2.__preventObserver__ = true;
    }
    swiper2[swiper2.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
    if (swiper2.isElement) {
      requestAnimationFrame(() => {
        swiper2.__preventObserver__ = false;
      });
    }
  }
  var grabCursor = {
    setGrabCursor,
    unsetGrabCursor
  };
  function closestElement(selector, base) {
    if (base === void 0) {
      base = this;
    }
    function __closestFrom(el) {
      if (!el || el === getDocument() || el === getWindow())
        return null;
      if (el.assignedSlot)
        el = el.assignedSlot;
      const found = el.closest(selector);
      if (!found && !el.getRootNode) {
        return null;
      }
      return found || __closestFrom(el.getRootNode().host);
    }
    return __closestFrom(base);
  }
  function preventEdgeSwipe(swiper2, event, startX) {
    const window2 = getWindow();
    const {
      params
    } = swiper2;
    const edgeSwipeDetection = params.edgeSwipeDetection;
    const edgeSwipeThreshold = params.edgeSwipeThreshold;
    if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window2.innerWidth - edgeSwipeThreshold)) {
      if (edgeSwipeDetection === "prevent") {
        event.preventDefault();
        return true;
      }
      return false;
    }
    return true;
  }
  function onTouchStart(event) {
    const swiper2 = this;
    const document2 = getDocument();
    let e = event;
    if (e.originalEvent)
      e = e.originalEvent;
    const data = swiper2.touchEventsData;
    if (e.type === "pointerdown") {
      if (data.pointerId !== null && data.pointerId !== e.pointerId) {
        return;
      }
      data.pointerId = e.pointerId;
    } else if (e.type === "touchstart" && e.targetTouches.length === 1) {
      data.touchId = e.targetTouches[0].identifier;
    }
    if (e.type === "touchstart") {
      preventEdgeSwipe(swiper2, e, e.targetTouches[0].pageX);
      return;
    }
    const {
      params,
      touches,
      enabled
    } = swiper2;
    if (!enabled)
      return;
    if (!params.simulateTouch && e.pointerType === "mouse")
      return;
    if (swiper2.animating && params.preventInteractionOnTransition) {
      return;
    }
    if (!swiper2.animating && params.cssMode && params.loop) {
      swiper2.loopFix();
    }
    let targetEl = e.target;
    if (params.touchEventsTarget === "wrapper") {
      if (!swiper2.wrapperEl.contains(targetEl))
        return;
    }
    if ("which" in e && e.which === 3)
      return;
    if ("button" in e && e.button > 0)
      return;
    if (data.isTouched && data.isMoved)
      return;
    const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
    const eventPath = e.composedPath ? e.composedPath() : e.path;
    if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
      targetEl = eventPath[0];
    }
    const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
    const isTargetShadow = !!(e.target && e.target.shadowRoot);
    if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
      swiper2.allowClick = true;
      return;
    }
    if (params.swipeHandler) {
      if (!targetEl.closest(params.swipeHandler))
        return;
    }
    touches.currentX = e.pageX;
    touches.currentY = e.pageY;
    const startX = touches.currentX;
    const startY = touches.currentY;
    if (!preventEdgeSwipe(swiper2, e, startX)) {
      return;
    }
    Object.assign(data, {
      isTouched: true,
      isMoved: false,
      allowTouchCallbacks: true,
      isScrolling: void 0,
      startMoving: void 0
    });
    touches.startX = startX;
    touches.startY = startY;
    data.touchStartTime = now();
    swiper2.allowClick = true;
    swiper2.updateSize();
    swiper2.swipeDirection = void 0;
    if (params.threshold > 0)
      data.allowThresholdMove = false;
    let preventDefault = true;
    if (targetEl.matches(data.focusableElements)) {
      preventDefault = false;
      if (targetEl.nodeName === "SELECT") {
        data.isTouched = false;
      }
    }
    if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== targetEl) {
      document2.activeElement.blur();
    }
    const shouldPreventDefault = preventDefault && swiper2.allowTouchMove && params.touchStartPreventDefault;
    if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
      e.preventDefault();
    }
    if (params.freeMode && params.freeMode.enabled && swiper2.freeMode && swiper2.animating && !params.cssMode) {
      swiper2.freeMode.onTouchStart();
    }
    swiper2.emit("touchStart", e);
  }
  function onTouchMove(event) {
    const document2 = getDocument();
    const swiper2 = this;
    const data = swiper2.touchEventsData;
    const {
      params,
      touches,
      rtlTranslate: rtl,
      enabled
    } = swiper2;
    if (!enabled)
      return;
    if (!params.simulateTouch && event.pointerType === "mouse")
      return;
    let e = event;
    if (e.originalEvent)
      e = e.originalEvent;
    if (e.type === "pointermove") {
      if (data.touchId !== null)
        return;
      const id = e.pointerId;
      if (id !== data.pointerId)
        return;
    }
    let targetTouch;
    if (e.type === "touchmove") {
      targetTouch = [...e.changedTouches].filter((t) => t.identifier === data.touchId)[0];
      if (!targetTouch || targetTouch.identifier !== data.touchId)
        return;
    } else {
      targetTouch = e;
    }
    if (!data.isTouched) {
      if (data.startMoving && data.isScrolling) {
        swiper2.emit("touchMoveOpposite", e);
      }
      return;
    }
    const pageX = targetTouch.pageX;
    const pageY = targetTouch.pageY;
    if (e.preventedByNestedSwiper) {
      touches.startX = pageX;
      touches.startY = pageY;
      return;
    }
    if (!swiper2.allowTouchMove) {
      if (!e.target.matches(data.focusableElements)) {
        swiper2.allowClick = false;
      }
      if (data.isTouched) {
        Object.assign(touches, {
          startX: pageX,
          startY: pageY,
          currentX: pageX,
          currentY: pageY
        });
        data.touchStartTime = now();
      }
      return;
    }
    if (params.touchReleaseOnEdges && !params.loop) {
      if (swiper2.isVertical()) {
        if (pageY < touches.startY && swiper2.translate <= swiper2.maxTranslate() || pageY > touches.startY && swiper2.translate >= swiper2.minTranslate()) {
          data.isTouched = false;
          data.isMoved = false;
          return;
        }
      } else if (pageX < touches.startX && swiper2.translate <= swiper2.maxTranslate() || pageX > touches.startX && swiper2.translate >= swiper2.minTranslate()) {
        return;
      }
    }
    if (document2.activeElement) {
      if (e.target === document2.activeElement && e.target.matches(data.focusableElements)) {
        data.isMoved = true;
        swiper2.allowClick = false;
        return;
      }
    }
    if (data.allowTouchCallbacks) {
      swiper2.emit("touchMove", e);
    }
    touches.previousX = touches.currentX;
    touches.previousY = touches.currentY;
    touches.currentX = pageX;
    touches.currentY = pageY;
    const diffX = touches.currentX - touches.startX;
    const diffY = touches.currentY - touches.startY;
    if (swiper2.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper2.params.threshold)
      return;
    if (typeof data.isScrolling === "undefined") {
      let touchAngle;
      if (swiper2.isHorizontal() && touches.currentY === touches.startY || swiper2.isVertical() && touches.currentX === touches.startX) {
        data.isScrolling = false;
      } else {
        if (diffX * diffX + diffY * diffY >= 25) {
          touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
          data.isScrolling = swiper2.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
        }
      }
    }
    if (data.isScrolling) {
      swiper2.emit("touchMoveOpposite", e);
    }
    if (typeof data.startMoving === "undefined") {
      if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
        data.startMoving = true;
      }
    }
    if (data.isScrolling) {
      data.isTouched = false;
      return;
    }
    if (!data.startMoving) {
      return;
    }
    swiper2.allowClick = false;
    if (!params.cssMode && e.cancelable) {
      e.preventDefault();
    }
    if (params.touchMoveStopPropagation && !params.nested) {
      e.stopPropagation();
    }
    let diff = swiper2.isHorizontal() ? diffX : diffY;
    let touchesDiff = swiper2.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
    if (params.oneWayMovement) {
      diff = Math.abs(diff) * (rtl ? 1 : -1);
      touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
    }
    touches.diff = diff;
    diff *= params.touchRatio;
    if (rtl) {
      diff = -diff;
      touchesDiff = -touchesDiff;
    }
    const prevTouchesDirection = swiper2.touchesDirection;
    swiper2.swipeDirection = diff > 0 ? "prev" : "next";
    swiper2.touchesDirection = touchesDiff > 0 ? "prev" : "next";
    const isLoop = swiper2.params.loop && !params.cssMode;
    const allowLoopFix = swiper2.touchesDirection === "next" && swiper2.allowSlideNext || swiper2.touchesDirection === "prev" && swiper2.allowSlidePrev;
    if (!data.isMoved) {
      if (isLoop && allowLoopFix) {
        swiper2.loopFix({
          direction: swiper2.swipeDirection
        });
      }
      data.startTranslate = swiper2.getTranslate();
      swiper2.setTransition(0);
      if (swiper2.animating) {
        const evt = new window.CustomEvent("transitionend", {
          bubbles: true,
          cancelable: true
        });
        swiper2.wrapperEl.dispatchEvent(evt);
      }
      data.allowMomentumBounce = false;
      if (params.grabCursor && (swiper2.allowSlideNext === true || swiper2.allowSlidePrev === true)) {
        swiper2.setGrabCursor(true);
      }
      swiper2.emit("sliderFirstMove", e);
    }
    let loopFixed;
    (/* @__PURE__ */ new Date()).getTime();
    if (data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper2.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY,
        startTranslate: data.currentTranslate
      });
      data.loopSwapReset = true;
      data.startTranslate = data.currentTranslate;
      return;
    }
    swiper2.emit("sliderMove", e);
    data.isMoved = true;
    data.currentTranslate = diff + data.startTranslate;
    let disableParentSwiper = true;
    let resistanceRatio = params.resistanceRatio;
    if (params.touchReleaseOnEdges) {
      resistanceRatio = 0;
    }
    if (diff > 0) {
      if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper2.minTranslate() - swiper2.slidesSizesGrid[swiper2.activeIndex + 1] : swiper2.minTranslate())) {
        swiper2.loopFix({
          direction: "prev",
          setTranslate: true,
          activeSlideIndex: 0
        });
      }
      if (data.currentTranslate > swiper2.minTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) {
          data.currentTranslate = swiper2.minTranslate() - 1 + (-swiper2.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
        }
      }
    } else if (diff < 0) {
      if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper2.maxTranslate() + swiper2.slidesSizesGrid[swiper2.slidesSizesGrid.length - 1] : swiper2.maxTranslate())) {
        swiper2.loopFix({
          direction: "next",
          setTranslate: true,
          activeSlideIndex: swiper2.slides.length - (params.slidesPerView === "auto" ? swiper2.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
        });
      }
      if (data.currentTranslate < swiper2.maxTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) {
          data.currentTranslate = swiper2.maxTranslate() + 1 - (swiper2.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
        }
      }
    }
    if (disableParentSwiper) {
      e.preventedByNestedSwiper = true;
    }
    if (!swiper2.allowSlideNext && swiper2.swipeDirection === "next" && data.currentTranslate < data.startTranslate) {
      data.currentTranslate = data.startTranslate;
    }
    if (!swiper2.allowSlidePrev && swiper2.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) {
      data.currentTranslate = data.startTranslate;
    }
    if (!swiper2.allowSlidePrev && !swiper2.allowSlideNext) {
      data.currentTranslate = data.startTranslate;
    }
    if (params.threshold > 0) {
      if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
        if (!data.allowThresholdMove) {
          data.allowThresholdMove = true;
          touches.startX = touches.currentX;
          touches.startY = touches.currentY;
          data.currentTranslate = data.startTranslate;
          touches.diff = swiper2.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
          return;
        }
      } else {
        data.currentTranslate = data.startTranslate;
        return;
      }
    }
    if (!params.followFinger || params.cssMode)
      return;
    if (params.freeMode && params.freeMode.enabled && swiper2.freeMode || params.watchSlidesProgress) {
      swiper2.updateActiveIndex();
      swiper2.updateSlidesClasses();
    }
    if (params.freeMode && params.freeMode.enabled && swiper2.freeMode) {
      swiper2.freeMode.onTouchMove();
    }
    swiper2.updateProgress(data.currentTranslate);
    swiper2.setTranslate(data.currentTranslate);
  }
  function onTouchEnd(event) {
    const swiper2 = this;
    const data = swiper2.touchEventsData;
    let e = event;
    if (e.originalEvent)
      e = e.originalEvent;
    let targetTouch;
    const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
    if (!isTouchEvent) {
      if (data.touchId !== null)
        return;
      if (e.pointerId !== data.pointerId)
        return;
      targetTouch = e;
    } else {
      targetTouch = [...e.changedTouches].filter((t) => t.identifier === data.touchId)[0];
      if (!targetTouch || targetTouch.identifier !== data.touchId)
        return;
    }
    if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
      const proceed = ["pointercancel", "contextmenu"].includes(e.type) && (swiper2.browser.isSafari || swiper2.browser.isWebView);
      if (!proceed) {
        return;
      }
    }
    data.pointerId = null;
    data.touchId = null;
    const {
      params,
      touches,
      rtlTranslate: rtl,
      slidesGrid,
      enabled
    } = swiper2;
    if (!enabled)
      return;
    if (!params.simulateTouch && e.pointerType === "mouse")
      return;
    if (data.allowTouchCallbacks) {
      swiper2.emit("touchEnd", e);
    }
    data.allowTouchCallbacks = false;
    if (!data.isTouched) {
      if (data.isMoved && params.grabCursor) {
        swiper2.setGrabCursor(false);
      }
      data.isMoved = false;
      data.startMoving = false;
      return;
    }
    if (params.grabCursor && data.isMoved && data.isTouched && (swiper2.allowSlideNext === true || swiper2.allowSlidePrev === true)) {
      swiper2.setGrabCursor(false);
    }
    const touchEndTime = now();
    const timeDiff = touchEndTime - data.touchStartTime;
    if (swiper2.allowClick) {
      const pathTree = e.path || e.composedPath && e.composedPath();
      swiper2.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
      swiper2.emit("tap click", e);
      if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
        swiper2.emit("doubleTap doubleClick", e);
      }
    }
    data.lastClickTime = now();
    nextTick(() => {
      if (!swiper2.destroyed)
        swiper2.allowClick = true;
    });
    if (!data.isTouched || !data.isMoved || !swiper2.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
      data.isTouched = false;
      data.isMoved = false;
      data.startMoving = false;
      return;
    }
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    let currentPos;
    if (params.followFinger) {
      currentPos = rtl ? swiper2.translate : -swiper2.translate;
    } else {
      currentPos = -data.currentTranslate;
    }
    if (params.cssMode) {
      return;
    }
    if (params.freeMode && params.freeMode.enabled) {
      swiper2.freeMode.onTouchEnd({
        currentPos
      });
      return;
    }
    let stopIndex = 0;
    let groupSize = swiper2.slidesSizesGrid[0];
    for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
      const increment2 = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
      if (typeof slidesGrid[i + increment2] !== "undefined") {
        if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment2]) {
          stopIndex = i;
          groupSize = slidesGrid[i + increment2] - slidesGrid[i];
        }
      } else if (currentPos >= slidesGrid[i]) {
        stopIndex = i;
        groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
      }
    }
    let rewindFirstIndex = null;
    let rewindLastIndex = null;
    if (params.rewind) {
      if (swiper2.isBeginning) {
        rewindLastIndex = params.virtual && params.virtual.enabled && swiper2.virtual ? swiper2.virtual.slides.length - 1 : swiper2.slides.length - 1;
      } else if (swiper2.isEnd) {
        rewindFirstIndex = 0;
      }
    }
    const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
    const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (timeDiff > params.longSwipesMs) {
      if (!params.longSwipes) {
        swiper2.slideTo(swiper2.activeIndex);
        return;
      }
      if (swiper2.swipeDirection === "next") {
        if (ratio >= params.longSwipesRatio)
          swiper2.slideTo(params.rewind && swiper2.isEnd ? rewindFirstIndex : stopIndex + increment);
        else
          swiper2.slideTo(stopIndex);
      }
      if (swiper2.swipeDirection === "prev") {
        if (ratio > 1 - params.longSwipesRatio) {
          swiper2.slideTo(stopIndex + increment);
        } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
          swiper2.slideTo(rewindLastIndex);
        } else {
          swiper2.slideTo(stopIndex);
        }
      }
    } else {
      if (!params.shortSwipes) {
        swiper2.slideTo(swiper2.activeIndex);
        return;
      }
      const isNavButtonTarget = swiper2.navigation && (e.target === swiper2.navigation.nextEl || e.target === swiper2.navigation.prevEl);
      if (!isNavButtonTarget) {
        if (swiper2.swipeDirection === "next") {
          swiper2.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
        }
        if (swiper2.swipeDirection === "prev") {
          swiper2.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
        }
      } else if (e.target === swiper2.navigation.nextEl) {
        swiper2.slideTo(stopIndex + increment);
      } else {
        swiper2.slideTo(stopIndex);
      }
    }
  }
  function onResize() {
    const swiper2 = this;
    const {
      params,
      el
    } = swiper2;
    if (el && el.offsetWidth === 0)
      return;
    if (params.breakpoints) {
      swiper2.setBreakpoint();
    }
    const {
      allowSlideNext,
      allowSlidePrev,
      snapGrid
    } = swiper2;
    const isVirtual = swiper2.virtual && swiper2.params.virtual.enabled;
    swiper2.allowSlideNext = true;
    swiper2.allowSlidePrev = true;
    swiper2.updateSize();
    swiper2.updateSlides();
    swiper2.updateSlidesClasses();
    const isVirtualLoop = isVirtual && params.loop;
    if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper2.isEnd && !swiper2.isBeginning && !swiper2.params.centeredSlides && !isVirtualLoop) {
      swiper2.slideTo(swiper2.slides.length - 1, 0, false, true);
    } else {
      if (swiper2.params.loop && !isVirtual) {
        swiper2.slideToLoop(swiper2.realIndex, 0, false, true);
      } else {
        swiper2.slideTo(swiper2.activeIndex, 0, false, true);
      }
    }
    if (swiper2.autoplay && swiper2.autoplay.running && swiper2.autoplay.paused) {
      clearTimeout(swiper2.autoplay.resizeTimeout);
      swiper2.autoplay.resizeTimeout = setTimeout(() => {
        if (swiper2.autoplay && swiper2.autoplay.running && swiper2.autoplay.paused) {
          swiper2.autoplay.resume();
        }
      }, 500);
    }
    swiper2.allowSlidePrev = allowSlidePrev;
    swiper2.allowSlideNext = allowSlideNext;
    if (swiper2.params.watchOverflow && snapGrid !== swiper2.snapGrid) {
      swiper2.checkOverflow();
    }
  }
  function onClick(e) {
    const swiper2 = this;
    if (!swiper2.enabled)
      return;
    if (!swiper2.allowClick) {
      if (swiper2.params.preventClicks)
        e.preventDefault();
      if (swiper2.params.preventClicksPropagation && swiper2.animating) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }
  function onScroll() {
    const swiper2 = this;
    const {
      wrapperEl,
      rtlTranslate,
      enabled
    } = swiper2;
    if (!enabled)
      return;
    swiper2.previousTranslate = swiper2.translate;
    if (swiper2.isHorizontal()) {
      swiper2.translate = -wrapperEl.scrollLeft;
    } else {
      swiper2.translate = -wrapperEl.scrollTop;
    }
    if (swiper2.translate === 0)
      swiper2.translate = 0;
    swiper2.updateActiveIndex();
    swiper2.updateSlidesClasses();
    let newProgress;
    const translatesDiff = swiper2.maxTranslate() - swiper2.minTranslate();
    if (translatesDiff === 0) {
      newProgress = 0;
    } else {
      newProgress = (swiper2.translate - swiper2.minTranslate()) / translatesDiff;
    }
    if (newProgress !== swiper2.progress) {
      swiper2.updateProgress(rtlTranslate ? -swiper2.translate : swiper2.translate);
    }
    swiper2.emit("setTranslate", swiper2.translate, false);
  }
  function onLoad(e) {
    const swiper2 = this;
    processLazyPreloader(swiper2, e.target);
    if (swiper2.params.cssMode || swiper2.params.slidesPerView !== "auto" && !swiper2.params.autoHeight) {
      return;
    }
    swiper2.update();
  }
  function onDocumentTouchStart() {
    const swiper2 = this;
    if (swiper2.documentTouchHandlerProceeded)
      return;
    swiper2.documentTouchHandlerProceeded = true;
    if (swiper2.params.touchReleaseOnEdges) {
      swiper2.el.style.touchAction = "auto";
    }
  }
  const events = (swiper2, method) => {
    const document2 = getDocument();
    const {
      params,
      el,
      wrapperEl,
      device
    } = swiper2;
    const capture = !!params.nested;
    const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
    const swiperMethod = method;
    document2[domMethod]("touchstart", swiper2.onDocumentTouchStart, {
      passive: false,
      capture
    });
    el[domMethod]("touchstart", swiper2.onTouchStart, {
      passive: false
    });
    el[domMethod]("pointerdown", swiper2.onTouchStart, {
      passive: false
    });
    document2[domMethod]("touchmove", swiper2.onTouchMove, {
      passive: false,
      capture
    });
    document2[domMethod]("pointermove", swiper2.onTouchMove, {
      passive: false,
      capture
    });
    document2[domMethod]("touchend", swiper2.onTouchEnd, {
      passive: true
    });
    document2[domMethod]("pointerup", swiper2.onTouchEnd, {
      passive: true
    });
    document2[domMethod]("pointercancel", swiper2.onTouchEnd, {
      passive: true
    });
    document2[domMethod]("touchcancel", swiper2.onTouchEnd, {
      passive: true
    });
    document2[domMethod]("pointerout", swiper2.onTouchEnd, {
      passive: true
    });
    document2[domMethod]("pointerleave", swiper2.onTouchEnd, {
      passive: true
    });
    document2[domMethod]("contextmenu", swiper2.onTouchEnd, {
      passive: true
    });
    if (params.preventClicks || params.preventClicksPropagation) {
      el[domMethod]("click", swiper2.onClick, true);
    }
    if (params.cssMode) {
      wrapperEl[domMethod]("scroll", swiper2.onScroll);
    }
    if (params.updateOnWindowResize) {
      swiper2[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true);
    } else {
      swiper2[swiperMethod]("observerUpdate", onResize, true);
    }
    el[domMethod]("load", swiper2.onLoad, {
      capture: true
    });
  };
  function attachEvents() {
    const swiper2 = this;
    const {
      params
    } = swiper2;
    swiper2.onTouchStart = onTouchStart.bind(swiper2);
    swiper2.onTouchMove = onTouchMove.bind(swiper2);
    swiper2.onTouchEnd = onTouchEnd.bind(swiper2);
    swiper2.onDocumentTouchStart = onDocumentTouchStart.bind(swiper2);
    if (params.cssMode) {
      swiper2.onScroll = onScroll.bind(swiper2);
    }
    swiper2.onClick = onClick.bind(swiper2);
    swiper2.onLoad = onLoad.bind(swiper2);
    events(swiper2, "on");
  }
  function detachEvents() {
    const swiper2 = this;
    events(swiper2, "off");
  }
  var events$1 = {
    attachEvents,
    detachEvents
  };
  const isGridEnabled = (swiper2, params) => {
    return swiper2.grid && params.grid && params.grid.rows > 1;
  };
  function setBreakpoint() {
    const swiper2 = this;
    const {
      realIndex,
      initialized,
      params,
      el
    } = swiper2;
    const breakpoints2 = params.breakpoints;
    if (!breakpoints2 || breakpoints2 && Object.keys(breakpoints2).length === 0)
      return;
    const breakpoint = swiper2.getBreakpoint(breakpoints2, swiper2.params.breakpointsBase, swiper2.el);
    if (!breakpoint || swiper2.currentBreakpoint === breakpoint)
      return;
    const breakpointOnlyParams = breakpoint in breakpoints2 ? breakpoints2[breakpoint] : void 0;
    const breakpointParams = breakpointOnlyParams || swiper2.originalParams;
    const wasMultiRow = isGridEnabled(swiper2, params);
    const isMultiRow = isGridEnabled(swiper2, breakpointParams);
    const wasEnabled = params.enabled;
    if (wasMultiRow && !isMultiRow) {
      el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
      swiper2.emitContainerClasses();
    } else if (!wasMultiRow && isMultiRow) {
      el.classList.add(`${params.containerModifierClass}grid`);
      if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") {
        el.classList.add(`${params.containerModifierClass}grid-column`);
      }
      swiper2.emitContainerClasses();
    }
    ["navigation", "pagination", "scrollbar"].forEach((prop) => {
      if (typeof breakpointParams[prop] === "undefined")
        return;
      const wasModuleEnabled = params[prop] && params[prop].enabled;
      const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
      if (wasModuleEnabled && !isModuleEnabled) {
        swiper2[prop].disable();
      }
      if (!wasModuleEnabled && isModuleEnabled) {
        swiper2[prop].enable();
      }
    });
    const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
    const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
    const wasLoop = params.loop;
    if (directionChanged && initialized) {
      swiper2.changeDirection();
    }
    extend(swiper2.params, breakpointParams);
    const isEnabled = swiper2.params.enabled;
    const hasLoop = swiper2.params.loop;
    Object.assign(swiper2, {
      allowTouchMove: swiper2.params.allowTouchMove,
      allowSlideNext: swiper2.params.allowSlideNext,
      allowSlidePrev: swiper2.params.allowSlidePrev
    });
    if (wasEnabled && !isEnabled) {
      swiper2.disable();
    } else if (!wasEnabled && isEnabled) {
      swiper2.enable();
    }
    swiper2.currentBreakpoint = breakpoint;
    swiper2.emit("_beforeBreakpoint", breakpointParams);
    if (initialized) {
      if (needsReLoop) {
        swiper2.loopDestroy();
        swiper2.loopCreate(realIndex);
        swiper2.updateSlides();
      } else if (!wasLoop && hasLoop) {
        swiper2.loopCreate(realIndex);
        swiper2.updateSlides();
      } else if (wasLoop && !hasLoop) {
        swiper2.loopDestroy();
      }
    }
    swiper2.emit("breakpoint", breakpointParams);
  }
  function getBreakpoint(breakpoints2, base, containerEl) {
    if (base === void 0) {
      base = "window";
    }
    if (!breakpoints2 || base === "container" && !containerEl)
      return void 0;
    let breakpoint = false;
    const window2 = getWindow();
    const currentHeight = base === "window" ? window2.innerHeight : containerEl.clientHeight;
    const points = Object.keys(breakpoints2).map((point) => {
      if (typeof point === "string" && point.indexOf("@") === 0) {
        const minRatio = parseFloat(point.substr(1));
        const value = currentHeight * minRatio;
        return {
          value,
          point
        };
      }
      return {
        value: point,
        point
      };
    });
    points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
    for (let i = 0; i < points.length; i += 1) {
      const {
        point,
        value
      } = points[i];
      if (base === "window") {
        if (window2.matchMedia(`(min-width: ${value}px)`).matches) {
          breakpoint = point;
        }
      } else if (value <= containerEl.clientWidth) {
        breakpoint = point;
      }
    }
    return breakpoint || "max";
  }
  var breakpoints = {
    setBreakpoint,
    getBreakpoint
  };
  function prepareClasses(entries, prefix) {
    const resultClasses = [];
    entries.forEach((item) => {
      if (typeof item === "object") {
        Object.keys(item).forEach((classNames) => {
          if (item[classNames]) {
            resultClasses.push(prefix + classNames);
          }
        });
      } else if (typeof item === "string") {
        resultClasses.push(prefix + item);
      }
    });
    return resultClasses;
  }
  function addClasses() {
    const swiper2 = this;
    const {
      classNames,
      params,
      rtl,
      el,
      device
    } = swiper2;
    const suffixes = prepareClasses(["initialized", params.direction, {
      "free-mode": swiper2.params.freeMode && params.freeMode.enabled
    }, {
      "autoheight": params.autoHeight
    }, {
      "rtl": rtl
    }, {
      "grid": params.grid && params.grid.rows > 1
    }, {
      "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
    }, {
      "android": device.android
    }, {
      "ios": device.ios
    }, {
      "css-mode": params.cssMode
    }, {
      "centered": params.cssMode && params.centeredSlides
    }, {
      "watch-progress": params.watchSlidesProgress
    }], params.containerModifierClass);
    classNames.push(...suffixes);
    el.classList.add(...classNames);
    swiper2.emitContainerClasses();
  }
  function removeClasses() {
    const swiper2 = this;
    const {
      el,
      classNames
    } = swiper2;
    el.classList.remove(...classNames);
    swiper2.emitContainerClasses();
  }
  var classes = {
    addClasses,
    removeClasses
  };
  function checkOverflow() {
    const swiper2 = this;
    const {
      isLocked: wasLocked,
      params
    } = swiper2;
    const {
      slidesOffsetBefore
    } = params;
    if (slidesOffsetBefore) {
      const lastSlideIndex = swiper2.slides.length - 1;
      const lastSlideRightEdge = swiper2.slidesGrid[lastSlideIndex] + swiper2.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
      swiper2.isLocked = swiper2.size > lastSlideRightEdge;
    } else {
      swiper2.isLocked = swiper2.snapGrid.length === 1;
    }
    if (params.allowSlideNext === true) {
      swiper2.allowSlideNext = !swiper2.isLocked;
    }
    if (params.allowSlidePrev === true) {
      swiper2.allowSlidePrev = !swiper2.isLocked;
    }
    if (wasLocked && wasLocked !== swiper2.isLocked) {
      swiper2.isEnd = false;
    }
    if (wasLocked !== swiper2.isLocked) {
      swiper2.emit(swiper2.isLocked ? "lock" : "unlock");
    }
  }
  var checkOverflow$1 = {
    checkOverflow
  };
  var defaults = {
    init: true,
    direction: "horizontal",
    oneWayMovement: false,
    touchEventsTarget: "wrapper",
    initialSlide: 0,
    speed: 300,
    cssMode: false,
    updateOnWindowResize: true,
    resizeObserver: true,
    nested: false,
    createElements: false,
    eventsPrefix: "swiper",
    enabled: true,
    focusableElements: "input, select, option, textarea, button, video, label",
    // Overrides
    width: null,
    height: null,
    //
    preventInteractionOnTransition: false,
    // ssr
    userAgent: null,
    url: null,
    // To support iOS's swipe-to-go-back gesture (when being used in-app).
    edgeSwipeDetection: false,
    edgeSwipeThreshold: 20,
    // Autoheight
    autoHeight: false,
    // Set wrapper width
    setWrapperSize: false,
    // Virtual Translate
    virtualTranslate: false,
    // Effects
    effect: "slide",
    // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
    // Breakpoints
    breakpoints: void 0,
    breakpointsBase: "window",
    // Slides grid
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerGroup: 1,
    slidesPerGroupSkip: 0,
    slidesPerGroupAuto: false,
    centeredSlides: false,
    centeredSlidesBounds: false,
    slidesOffsetBefore: 0,
    // in px
    slidesOffsetAfter: 0,
    // in px
    normalizeSlideIndex: true,
    centerInsufficientSlides: false,
    // Disable swiper and hide navigation when container not overflow
    watchOverflow: true,
    // Round length
    roundLengths: false,
    // Touches
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: true,
    shortSwipes: true,
    longSwipes: true,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,
    followFinger: true,
    allowTouchMove: true,
    threshold: 5,
    touchMoveStopPropagation: false,
    touchStartPreventDefault: true,
    touchStartForcePreventDefault: false,
    touchReleaseOnEdges: false,
    // Unique Navigation Elements
    uniqueNavElements: true,
    // Resistance
    resistance: true,
    resistanceRatio: 0.85,
    // Progress
    watchSlidesProgress: false,
    // Cursor
    grabCursor: false,
    // Clicks
    preventClicks: true,
    preventClicksPropagation: true,
    slideToClickedSlide: false,
    // loop
    loop: false,
    loopAddBlankSlides: true,
    loopAdditionalSlides: 0,
    loopPreventsSliding: true,
    // rewind
    rewind: false,
    // Swiping/no swiping
    allowSlidePrev: true,
    allowSlideNext: true,
    swipeHandler: null,
    // '.swipe-handler',
    noSwiping: true,
    noSwipingClass: "swiper-no-swiping",
    noSwipingSelector: null,
    // Passive Listeners
    passiveListeners: true,
    maxBackfaceHiddenSlides: 10,
    // NS
    containerModifierClass: "swiper-",
    // NEW
    slideClass: "swiper-slide",
    slideBlankClass: "swiper-slide-blank",
    slideActiveClass: "swiper-slide-active",
    slideVisibleClass: "swiper-slide-visible",
    slideFullyVisibleClass: "swiper-slide-fully-visible",
    slideNextClass: "swiper-slide-next",
    slidePrevClass: "swiper-slide-prev",
    wrapperClass: "swiper-wrapper",
    lazyPreloaderClass: "swiper-lazy-preloader",
    lazyPreloadPrevNext: 0,
    // Callbacks
    runCallbacksOnInit: true,
    // Internals
    _emitClasses: false
  };
  function moduleExtendParams(params, allModulesParams) {
    return function extendParams(obj) {
      if (obj === void 0) {
        obj = {};
      }
      const moduleParamName = Object.keys(obj)[0];
      const moduleParams = obj[moduleParamName];
      if (typeof moduleParams !== "object" || moduleParams === null) {
        extend(allModulesParams, obj);
        return;
      }
      if (params[moduleParamName] === true) {
        params[moduleParamName] = {
          enabled: true
        };
      }
      if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
        params[moduleParamName].auto = true;
      }
      if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
        params[moduleParamName].auto = true;
      }
      if (!(moduleParamName in params && "enabled" in moduleParams)) {
        extend(allModulesParams, obj);
        return;
      }
      if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) {
        params[moduleParamName].enabled = true;
      }
      if (!params[moduleParamName])
        params[moduleParamName] = {
          enabled: false
        };
      extend(allModulesParams, obj);
    };
  }
  const prototypes = {
    eventsEmitter,
    update,
    translate,
    transition,
    slide,
    loop,
    grabCursor,
    events: events$1,
    breakpoints,
    checkOverflow: checkOverflow$1,
    classes
  };
  const extendedDefaults = {};
  class Swiper {
    constructor() {
      let el;
      let params;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") {
        params = args[0];
      } else {
        [el, params] = args;
      }
      if (!params)
        params = {};
      params = extend({}, params);
      if (el && !params.el)
        params.el = el;
      const document2 = getDocument();
      if (params.el && typeof params.el === "string" && document2.querySelectorAll(params.el).length > 1) {
        const swipers = [];
        document2.querySelectorAll(params.el).forEach((containerEl) => {
          const newParams = extend({}, params, {
            el: containerEl
          });
          swipers.push(new Swiper(newParams));
        });
        return swipers;
      }
      const swiper2 = this;
      swiper2.__swiper__ = true;
      swiper2.support = getSupport();
      swiper2.device = getDevice({
        userAgent: params.userAgent
      });
      swiper2.browser = getBrowser();
      swiper2.eventsListeners = {};
      swiper2.eventsAnyListeners = [];
      swiper2.modules = [...swiper2.__modules__];
      if (params.modules && Array.isArray(params.modules)) {
        swiper2.modules.push(...params.modules);
      }
      const allModulesParams = {};
      swiper2.modules.forEach((mod) => {
        mod({
          params,
          swiper: swiper2,
          extendParams: moduleExtendParams(params, allModulesParams),
          on: swiper2.on.bind(swiper2),
          once: swiper2.once.bind(swiper2),
          off: swiper2.off.bind(swiper2),
          emit: swiper2.emit.bind(swiper2)
        });
      });
      const swiperParams = extend({}, defaults, allModulesParams);
      swiper2.params = extend({}, swiperParams, extendedDefaults, params);
      swiper2.originalParams = extend({}, swiper2.params);
      swiper2.passedParams = extend({}, params);
      if (swiper2.params && swiper2.params.on) {
        Object.keys(swiper2.params.on).forEach((eventName) => {
          swiper2.on(eventName, swiper2.params.on[eventName]);
        });
      }
      if (swiper2.params && swiper2.params.onAny) {
        swiper2.onAny(swiper2.params.onAny);
      }
      Object.assign(swiper2, {
        enabled: swiper2.params.enabled,
        el,
        // Classes
        classNames: [],
        // Slides
        slides: [],
        slidesGrid: [],
        snapGrid: [],
        slidesSizesGrid: [],
        // isDirection
        isHorizontal() {
          return swiper2.params.direction === "horizontal";
        },
        isVertical() {
          return swiper2.params.direction === "vertical";
        },
        // Indexes
        activeIndex: 0,
        realIndex: 0,
        //
        isBeginning: true,
        isEnd: false,
        // Props
        translate: 0,
        previousTranslate: 0,
        progress: 0,
        velocity: 0,
        animating: false,
        cssOverflowAdjustment() {
          return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
        },
        // Locks
        allowSlideNext: swiper2.params.allowSlideNext,
        allowSlidePrev: swiper2.params.allowSlidePrev,
        // Touch Events
        touchEventsData: {
          isTouched: void 0,
          isMoved: void 0,
          allowTouchCallbacks: void 0,
          touchStartTime: void 0,
          isScrolling: void 0,
          currentTranslate: void 0,
          startTranslate: void 0,
          allowThresholdMove: void 0,
          // Form elements to match
          focusableElements: swiper2.params.focusableElements,
          // Last click time
          lastClickTime: 0,
          clickTimeout: void 0,
          // Velocities
          velocities: [],
          allowMomentumBounce: void 0,
          startMoving: void 0,
          pointerId: null,
          touchId: null
        },
        // Clicks
        allowClick: true,
        // Touches
        allowTouchMove: swiper2.params.allowTouchMove,
        touches: {
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          diff: 0
        },
        // Images
        imagesToLoad: [],
        imagesLoaded: 0
      });
      swiper2.emit("_swiper");
      if (swiper2.params.init) {
        swiper2.init();
      }
      return swiper2;
    }
    getDirectionLabel(property) {
      if (this.isHorizontal()) {
        return property;
      }
      return {
        "width": "height",
        "margin-top": "margin-left",
        "margin-bottom ": "margin-right",
        "margin-left": "margin-top",
        "margin-right": "margin-bottom",
        "padding-left": "padding-top",
        "padding-right": "padding-bottom",
        "marginRight": "marginBottom"
      }[property];
    }
    getSlideIndex(slideEl) {
      const {
        slidesEl,
        params
      } = this;
      const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
      const firstSlideIndex = elementIndex(slides[0]);
      return elementIndex(slideEl) - firstSlideIndex;
    }
    getSlideIndexByData(index) {
      return this.getSlideIndex(this.slides.filter((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === index)[0]);
    }
    recalcSlides() {
      const swiper2 = this;
      const {
        slidesEl,
        params
      } = swiper2;
      swiper2.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    }
    enable() {
      const swiper2 = this;
      if (swiper2.enabled)
        return;
      swiper2.enabled = true;
      if (swiper2.params.grabCursor) {
        swiper2.setGrabCursor();
      }
      swiper2.emit("enable");
    }
    disable() {
      const swiper2 = this;
      if (!swiper2.enabled)
        return;
      swiper2.enabled = false;
      if (swiper2.params.grabCursor) {
        swiper2.unsetGrabCursor();
      }
      swiper2.emit("disable");
    }
    setProgress(progress, speed) {
      const swiper2 = this;
      progress = Math.min(Math.max(progress, 0), 1);
      const min = swiper2.minTranslate();
      const max = swiper2.maxTranslate();
      const current = (max - min) * progress + min;
      swiper2.translateTo(current, typeof speed === "undefined" ? 0 : speed);
      swiper2.updateActiveIndex();
      swiper2.updateSlidesClasses();
    }
    emitContainerClasses() {
      const swiper2 = this;
      if (!swiper2.params._emitClasses || !swiper2.el)
        return;
      const cls = swiper2.el.className.split(" ").filter((className) => {
        return className.indexOf("swiper") === 0 || className.indexOf(swiper2.params.containerModifierClass) === 0;
      });
      swiper2.emit("_containerClasses", cls.join(" "));
    }
    getSlideClasses(slideEl) {
      const swiper2 = this;
      if (swiper2.destroyed)
        return "";
      return slideEl.className.split(" ").filter((className) => {
        return className.indexOf("swiper-slide") === 0 || className.indexOf(swiper2.params.slideClass) === 0;
      }).join(" ");
    }
    emitSlidesClasses() {
      const swiper2 = this;
      if (!swiper2.params._emitClasses || !swiper2.el)
        return;
      const updates = [];
      swiper2.slides.forEach((slideEl) => {
        const classNames = swiper2.getSlideClasses(slideEl);
        updates.push({
          slideEl,
          classNames
        });
        swiper2.emit("_slideClass", slideEl, classNames);
      });
      swiper2.emit("_slideClasses", updates);
    }
    slidesPerViewDynamic(view, exact) {
      if (view === void 0) {
        view = "current";
      }
      if (exact === void 0) {
        exact = false;
      }
      const swiper2 = this;
      const {
        params,
        slides,
        slidesGrid,
        slidesSizesGrid,
        size: swiperSize,
        activeIndex
      } = swiper2;
      let spv = 1;
      if (typeof params.slidesPerView === "number")
        return params.slidesPerView;
      if (params.centeredSlides) {
        let slideSize = slides[activeIndex] ? slides[activeIndex].swiperSlideSize : 0;
        let breakLoop;
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          if (slides[i] && !breakLoop) {
            slideSize += slides[i].swiperSlideSize;
            spv += 1;
            if (slideSize > swiperSize)
              breakLoop = true;
          }
        }
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          if (slides[i] && !breakLoop) {
            slideSize += slides[i].swiperSlideSize;
            spv += 1;
            if (slideSize > swiperSize)
              breakLoop = true;
          }
        }
      } else {
        if (view === "current") {
          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
            if (slideInView) {
              spv += 1;
            }
          }
        } else {
          for (let i = activeIndex - 1; i >= 0; i -= 1) {
            const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
            if (slideInView) {
              spv += 1;
            }
          }
        }
      }
      return spv;
    }
    update() {
      const swiper2 = this;
      if (!swiper2 || swiper2.destroyed)
        return;
      const {
        snapGrid,
        params
      } = swiper2;
      if (params.breakpoints) {
        swiper2.setBreakpoint();
      }
      [...swiper2.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
        if (imageEl.complete) {
          processLazyPreloader(swiper2, imageEl);
        }
      });
      swiper2.updateSize();
      swiper2.updateSlides();
      swiper2.updateProgress();
      swiper2.updateSlidesClasses();
      function setTranslate2() {
        const translateValue = swiper2.rtlTranslate ? swiper2.translate * -1 : swiper2.translate;
        const newTranslate = Math.min(Math.max(translateValue, swiper2.maxTranslate()), swiper2.minTranslate());
        swiper2.setTranslate(newTranslate);
        swiper2.updateActiveIndex();
        swiper2.updateSlidesClasses();
      }
      let translated;
      if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
        setTranslate2();
        if (params.autoHeight) {
          swiper2.updateAutoHeight();
        }
      } else {
        if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper2.isEnd && !params.centeredSlides) {
          const slides = swiper2.virtual && params.virtual.enabled ? swiper2.virtual.slides : swiper2.slides;
          translated = swiper2.slideTo(slides.length - 1, 0, false, true);
        } else {
          translated = swiper2.slideTo(swiper2.activeIndex, 0, false, true);
        }
        if (!translated) {
          setTranslate2();
        }
      }
      if (params.watchOverflow && snapGrid !== swiper2.snapGrid) {
        swiper2.checkOverflow();
      }
      swiper2.emit("update");
    }
    changeDirection(newDirection, needUpdate) {
      if (needUpdate === void 0) {
        needUpdate = true;
      }
      const swiper2 = this;
      const currentDirection = swiper2.params.direction;
      if (!newDirection) {
        newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
      }
      if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") {
        return swiper2;
      }
      swiper2.el.classList.remove(`${swiper2.params.containerModifierClass}${currentDirection}`);
      swiper2.el.classList.add(`${swiper2.params.containerModifierClass}${newDirection}`);
      swiper2.emitContainerClasses();
      swiper2.params.direction = newDirection;
      swiper2.slides.forEach((slideEl) => {
        if (newDirection === "vertical") {
          slideEl.style.width = "";
        } else {
          slideEl.style.height = "";
        }
      });
      swiper2.emit("changeDirection");
      if (needUpdate)
        swiper2.update();
      return swiper2;
    }
    changeLanguageDirection(direction) {
      const swiper2 = this;
      if (swiper2.rtl && direction === "rtl" || !swiper2.rtl && direction === "ltr")
        return;
      swiper2.rtl = direction === "rtl";
      swiper2.rtlTranslate = swiper2.params.direction === "horizontal" && swiper2.rtl;
      if (swiper2.rtl) {
        swiper2.el.classList.add(`${swiper2.params.containerModifierClass}rtl`);
        swiper2.el.dir = "rtl";
      } else {
        swiper2.el.classList.remove(`${swiper2.params.containerModifierClass}rtl`);
        swiper2.el.dir = "ltr";
      }
      swiper2.update();
    }
    mount(element) {
      const swiper2 = this;
      if (swiper2.mounted)
        return true;
      let el = element || swiper2.params.el;
      if (typeof el === "string") {
        el = document.querySelector(el);
      }
      if (!el) {
        return false;
      }
      el.swiper = swiper2;
      if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === "SWIPER-CONTAINER") {
        swiper2.isElement = true;
      }
      const getWrapperSelector = () => {
        return `.${(swiper2.params.wrapperClass || "").trim().split(" ").join(".")}`;
      };
      const getWrapper = () => {
        if (el && el.shadowRoot && el.shadowRoot.querySelector) {
          const res = el.shadowRoot.querySelector(getWrapperSelector());
          return res;
        }
        return elementChildren(el, getWrapperSelector())[0];
      };
      let wrapperEl = getWrapper();
      if (!wrapperEl && swiper2.params.createElements) {
        wrapperEl = createElement("div", swiper2.params.wrapperClass);
        el.append(wrapperEl);
        elementChildren(el, `.${swiper2.params.slideClass}`).forEach((slideEl) => {
          wrapperEl.append(slideEl);
        });
      }
      Object.assign(swiper2, {
        el,
        wrapperEl,
        slidesEl: swiper2.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
        hostEl: swiper2.isElement ? el.parentNode.host : el,
        mounted: true,
        // RTL
        rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
        rtlTranslate: swiper2.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
        wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
      });
      return true;
    }
    init(el) {
      const swiper2 = this;
      if (swiper2.initialized)
        return swiper2;
      const mounted = swiper2.mount(el);
      if (mounted === false)
        return swiper2;
      swiper2.emit("beforeInit");
      if (swiper2.params.breakpoints) {
        swiper2.setBreakpoint();
      }
      swiper2.addClasses();
      swiper2.updateSize();
      swiper2.updateSlides();
      if (swiper2.params.watchOverflow) {
        swiper2.checkOverflow();
      }
      if (swiper2.params.grabCursor && swiper2.enabled) {
        swiper2.setGrabCursor();
      }
      if (swiper2.params.loop && swiper2.virtual && swiper2.params.virtual.enabled) {
        swiper2.slideTo(swiper2.params.initialSlide + swiper2.virtual.slidesBefore, 0, swiper2.params.runCallbacksOnInit, false, true);
      } else {
        swiper2.slideTo(swiper2.params.initialSlide, 0, swiper2.params.runCallbacksOnInit, false, true);
      }
      if (swiper2.params.loop) {
        swiper2.loopCreate();
      }
      swiper2.attachEvents();
      const lazyElements = [...swiper2.el.querySelectorAll('[loading="lazy"]')];
      if (swiper2.isElement) {
        lazyElements.push(...swiper2.hostEl.querySelectorAll('[loading="lazy"]'));
      }
      lazyElements.forEach((imageEl) => {
        if (imageEl.complete) {
          processLazyPreloader(swiper2, imageEl);
        } else {
          imageEl.addEventListener("load", (e) => {
            processLazyPreloader(swiper2, e.target);
          });
        }
      });
      preload(swiper2);
      swiper2.initialized = true;
      preload(swiper2);
      swiper2.emit("init");
      swiper2.emit("afterInit");
      return swiper2;
    }
    destroy(deleteInstance, cleanStyles) {
      if (deleteInstance === void 0) {
        deleteInstance = true;
      }
      if (cleanStyles === void 0) {
        cleanStyles = true;
      }
      const swiper2 = this;
      const {
        params,
        el,
        wrapperEl,
        slides
      } = swiper2;
      if (typeof swiper2.params === "undefined" || swiper2.destroyed) {
        return null;
      }
      swiper2.emit("beforeDestroy");
      swiper2.initialized = false;
      swiper2.detachEvents();
      if (params.loop) {
        swiper2.loopDestroy();
      }
      if (cleanStyles) {
        swiper2.removeClasses();
        el.removeAttribute("style");
        wrapperEl.removeAttribute("style");
        if (slides && slides.length) {
          slides.forEach((slideEl) => {
            slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
            slideEl.removeAttribute("style");
            slideEl.removeAttribute("data-swiper-slide-index");
          });
        }
      }
      swiper2.emit("destroy");
      Object.keys(swiper2.eventsListeners).forEach((eventName) => {
        swiper2.off(eventName);
      });
      if (deleteInstance !== false) {
        swiper2.el.swiper = null;
        deleteProps(swiper2);
      }
      swiper2.destroyed = true;
      return null;
    }
    static extendDefaults(newDefaults) {
      extend(extendedDefaults, newDefaults);
    }
    static get extendedDefaults() {
      return extendedDefaults;
    }
    static get defaults() {
      return defaults;
    }
    static installModule(mod) {
      if (!Swiper.prototype.__modules__)
        Swiper.prototype.__modules__ = [];
      const modules = Swiper.prototype.__modules__;
      if (typeof mod === "function" && modules.indexOf(mod) < 0) {
        modules.push(mod);
      }
    }
    static use(module) {
      if (Array.isArray(module)) {
        module.forEach((m) => Swiper.installModule(m));
        return Swiper;
      }
      Swiper.installModule(module);
      return Swiper;
    }
  }
  Object.keys(prototypes).forEach((prototypeGroup) => {
    Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
      Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
    });
  });
  Swiper.use([Resize, Observer]);
  function createElementIfNotDefined(swiper2, originalParams, params, checkProps) {
    if (swiper2.params.createElements) {
      Object.keys(checkProps).forEach((key) => {
        if (!params[key] && params.auto === true) {
          let element = elementChildren(swiper2.el, `.${checkProps[key]}`)[0];
          if (!element) {
            element = createElement("div", checkProps[key]);
            element.className = checkProps[key];
            swiper2.el.append(element);
          }
          params[key] = element;
          originalParams[key] = element;
        }
      });
    }
    return params;
  }
  function Navigation(_ref) {
    let {
      swiper: swiper2,
      extendParams,
      on,
      emit
    } = _ref;
    extendParams({
      navigation: {
        nextEl: null,
        prevEl: null,
        hideOnClick: false,
        disabledClass: "swiper-button-disabled",
        hiddenClass: "swiper-button-hidden",
        lockClass: "swiper-button-lock",
        navigationDisabledClass: "swiper-navigation-disabled"
      }
    });
    swiper2.navigation = {
      nextEl: null,
      prevEl: null
    };
    const makeElementsArray = (el) => (Array.isArray(el) ? el : [el]).filter((e) => !!e);
    function getEl(el) {
      let res;
      if (el && typeof el === "string" && swiper2.isElement) {
        res = swiper2.el.querySelector(el);
        if (res)
          return res;
      }
      if (el) {
        if (typeof el === "string")
          res = [...document.querySelectorAll(el)];
        if (swiper2.params.uniqueNavElements && typeof el === "string" && res.length > 1 && swiper2.el.querySelectorAll(el).length === 1) {
          res = swiper2.el.querySelector(el);
        }
      }
      if (el && !res)
        return el;
      return res;
    }
    function toggleEl(el, disabled) {
      const params = swiper2.params.navigation;
      el = makeElementsArray(el);
      el.forEach((subEl) => {
        if (subEl) {
          subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
          if (subEl.tagName === "BUTTON")
            subEl.disabled = disabled;
          if (swiper2.params.watchOverflow && swiper2.enabled) {
            subEl.classList[swiper2.isLocked ? "add" : "remove"](params.lockClass);
          }
        }
      });
    }
    function update2() {
      const {
        nextEl,
        prevEl
      } = swiper2.navigation;
      if (swiper2.params.loop) {
        toggleEl(prevEl, false);
        toggleEl(nextEl, false);
        return;
      }
      toggleEl(prevEl, swiper2.isBeginning && !swiper2.params.rewind);
      toggleEl(nextEl, swiper2.isEnd && !swiper2.params.rewind);
    }
    function onPrevClick(e) {
      e.preventDefault();
      if (swiper2.isBeginning && !swiper2.params.loop && !swiper2.params.rewind)
        return;
      swiper2.slidePrev();
      emit("navigationPrev");
    }
    function onNextClick(e) {
      e.preventDefault();
      if (swiper2.isEnd && !swiper2.params.loop && !swiper2.params.rewind)
        return;
      swiper2.slideNext();
      emit("navigationNext");
    }
    function init() {
      const params = swiper2.params.navigation;
      swiper2.params.navigation = createElementIfNotDefined(swiper2, swiper2.originalParams.navigation, swiper2.params.navigation, {
        nextEl: "swiper-button-next",
        prevEl: "swiper-button-prev"
      });
      if (!(params.nextEl || params.prevEl))
        return;
      let nextEl = getEl(params.nextEl);
      let prevEl = getEl(params.prevEl);
      Object.assign(swiper2.navigation, {
        nextEl,
        prevEl
      });
      nextEl = makeElementsArray(nextEl);
      prevEl = makeElementsArray(prevEl);
      const initButton = (el, dir) => {
        if (el) {
          el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
        }
        if (!swiper2.enabled && el) {
          el.classList.add(...params.lockClass.split(" "));
        }
      };
      nextEl.forEach((el) => initButton(el, "next"));
      prevEl.forEach((el) => initButton(el, "prev"));
    }
    function destroy() {
      let {
        nextEl,
        prevEl
      } = swiper2.navigation;
      nextEl = makeElementsArray(nextEl);
      prevEl = makeElementsArray(prevEl);
      const destroyButton = (el, dir) => {
        el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
        el.classList.remove(...swiper2.params.navigation.disabledClass.split(" "));
      };
      nextEl.forEach((el) => destroyButton(el, "next"));
      prevEl.forEach((el) => destroyButton(el, "prev"));
    }
    on("init", () => {
      if (swiper2.params.navigation.enabled === false) {
        disable();
      } else {
        init();
        update2();
      }
    });
    on("toEdge fromEdge lock unlock", () => {
      update2();
    });
    on("destroy", () => {
      destroy();
    });
    on("enable disable", () => {
      let {
        nextEl,
        prevEl
      } = swiper2.navigation;
      nextEl = makeElementsArray(nextEl);
      prevEl = makeElementsArray(prevEl);
      if (swiper2.enabled) {
        update2();
        return;
      }
      [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper2.params.navigation.lockClass));
    });
    on("click", (_s, e) => {
      let {
        nextEl,
        prevEl
      } = swiper2.navigation;
      nextEl = makeElementsArray(nextEl);
      prevEl = makeElementsArray(prevEl);
      const targetEl = e.target;
      if (swiper2.params.navigation.hideOnClick && !prevEl.includes(targetEl) && !nextEl.includes(targetEl)) {
        if (swiper2.pagination && swiper2.params.pagination && swiper2.params.pagination.clickable && (swiper2.pagination.el === targetEl || swiper2.pagination.el.contains(targetEl)))
          return;
        let isHidden2;
        if (nextEl.length) {
          isHidden2 = nextEl[0].classList.contains(swiper2.params.navigation.hiddenClass);
        } else if (prevEl.length) {
          isHidden2 = prevEl[0].classList.contains(swiper2.params.navigation.hiddenClass);
        }
        if (isHidden2 === true) {
          emit("navigationShow");
        } else {
          emit("navigationHide");
        }
        [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper2.params.navigation.hiddenClass));
      }
    });
    const enable = () => {
      swiper2.el.classList.remove(...swiper2.params.navigation.navigationDisabledClass.split(" "));
      init();
      update2();
    };
    const disable = () => {
      swiper2.el.classList.add(...swiper2.params.navigation.navigationDisabledClass.split(" "));
      destroy();
    };
    Object.assign(swiper2.navigation, {
      enable,
      disable,
      update: update2,
      init,
      destroy
    });
  }
  function Autoplay(_ref) {
    let {
      swiper: swiper2,
      extendParams,
      on,
      emit,
      params
    } = _ref;
    swiper2.autoplay = {
      running: false,
      paused: false,
      timeLeft: 0
    };
    extendParams({
      autoplay: {
        enabled: false,
        delay: 3e3,
        waitForTransition: true,
        disableOnInteraction: false,
        stopOnLastSlide: false,
        reverseDirection: false,
        pauseOnMouseEnter: false
      }
    });
    let timeout;
    let raf;
    let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3e3;
    let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3e3;
    let autoplayTimeLeft;
    let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    let wasPaused;
    let isTouched;
    let pausedByTouch;
    let touchStartTimeout;
    let slideChanged;
    let pausedByInteraction;
    let pausedByPointerEnter;
    function onTransitionEnd(e) {
      if (!swiper2 || swiper2.destroyed || !swiper2.wrapperEl)
        return;
      if (e.target !== swiper2.wrapperEl)
        return;
      swiper2.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
      if (pausedByPointerEnter) {
        return;
      }
      resume();
    }
    const calcTimeLeft = () => {
      if (swiper2.destroyed || !swiper2.autoplay.running)
        return;
      if (swiper2.autoplay.paused) {
        wasPaused = true;
      } else if (wasPaused) {
        autoplayDelayCurrent = autoplayTimeLeft;
        wasPaused = false;
      }
      const timeLeft = swiper2.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
      swiper2.autoplay.timeLeft = timeLeft;
      emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
      raf = requestAnimationFrame(() => {
        calcTimeLeft();
      });
    };
    const getSlideDelay = () => {
      let activeSlideEl;
      if (swiper2.virtual && swiper2.params.virtual.enabled) {
        activeSlideEl = swiper2.slides.filter((slideEl) => slideEl.classList.contains("swiper-slide-active"))[0];
      } else {
        activeSlideEl = swiper2.slides[swiper2.activeIndex];
      }
      if (!activeSlideEl)
        return void 0;
      const currentSlideDelay = parseInt(activeSlideEl.getAttribute("data-swiper-autoplay"), 10);
      return currentSlideDelay;
    };
    const run = (delayForce) => {
      if (swiper2.destroyed || !swiper2.autoplay.running)
        return;
      cancelAnimationFrame(raf);
      calcTimeLeft();
      let delay2 = typeof delayForce === "undefined" ? swiper2.params.autoplay.delay : delayForce;
      autoplayDelayTotal = swiper2.params.autoplay.delay;
      autoplayDelayCurrent = swiper2.params.autoplay.delay;
      const currentSlideDelay = getSlideDelay();
      if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0 && typeof delayForce === "undefined") {
        delay2 = currentSlideDelay;
        autoplayDelayTotal = currentSlideDelay;
        autoplayDelayCurrent = currentSlideDelay;
      }
      autoplayTimeLeft = delay2;
      const speed = swiper2.params.speed;
      const proceed = () => {
        if (!swiper2 || swiper2.destroyed)
          return;
        if (swiper2.params.autoplay.reverseDirection) {
          if (!swiper2.isBeginning || swiper2.params.loop || swiper2.params.rewind) {
            swiper2.slidePrev(speed, true, true);
            emit("autoplay");
          } else if (!swiper2.params.autoplay.stopOnLastSlide) {
            swiper2.slideTo(swiper2.slides.length - 1, speed, true, true);
            emit("autoplay");
          }
        } else {
          if (!swiper2.isEnd || swiper2.params.loop || swiper2.params.rewind) {
            swiper2.slideNext(speed, true, true);
            emit("autoplay");
          } else if (!swiper2.params.autoplay.stopOnLastSlide) {
            swiper2.slideTo(0, speed, true, true);
            emit("autoplay");
          }
        }
        if (swiper2.params.cssMode) {
          autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
          requestAnimationFrame(() => {
            run();
          });
        }
      };
      if (delay2 > 0) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          proceed();
        }, delay2);
      } else {
        requestAnimationFrame(() => {
          proceed();
        });
      }
      return delay2;
    };
    const start = () => {
      autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
      swiper2.autoplay.running = true;
      run();
      emit("autoplayStart");
    };
    const stop = () => {
      swiper2.autoplay.running = false;
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      emit("autoplayStop");
    };
    const pause = (internal, reset) => {
      if (swiper2.destroyed || !swiper2.autoplay.running)
        return;
      clearTimeout(timeout);
      if (!internal) {
        pausedByInteraction = true;
      }
      const proceed = () => {
        emit("autoplayPause");
        if (swiper2.params.autoplay.waitForTransition) {
          swiper2.wrapperEl.addEventListener("transitionend", onTransitionEnd);
        } else {
          resume();
        }
      };
      swiper2.autoplay.paused = true;
      if (reset) {
        if (slideChanged) {
          autoplayTimeLeft = swiper2.params.autoplay.delay;
        }
        slideChanged = false;
        proceed();
        return;
      }
      const delay2 = autoplayTimeLeft || swiper2.params.autoplay.delay;
      autoplayTimeLeft = delay2 - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
      if (swiper2.isEnd && autoplayTimeLeft < 0 && !swiper2.params.loop)
        return;
      if (autoplayTimeLeft < 0)
        autoplayTimeLeft = 0;
      proceed();
    };
    const resume = () => {
      if (swiper2.isEnd && autoplayTimeLeft < 0 && !swiper2.params.loop || swiper2.destroyed || !swiper2.autoplay.running)
        return;
      autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
      if (pausedByInteraction) {
        pausedByInteraction = false;
        run(autoplayTimeLeft);
      } else {
        run();
      }
      swiper2.autoplay.paused = false;
      emit("autoplayResume");
    };
    const onVisibilityChange = () => {
      if (swiper2.destroyed || !swiper2.autoplay.running)
        return;
      const document2 = getDocument();
      if (document2.visibilityState === "hidden") {
        pausedByInteraction = true;
        pause(true);
      }
      if (document2.visibilityState === "visible") {
        resume();
      }
    };
    const onPointerEnter = (e) => {
      if (e.pointerType !== "mouse")
        return;
      pausedByInteraction = true;
      pausedByPointerEnter = true;
      if (swiper2.animating || swiper2.autoplay.paused)
        return;
      pause(true);
    };
    const onPointerLeave = (e) => {
      if (e.pointerType !== "mouse")
        return;
      pausedByPointerEnter = false;
      if (swiper2.autoplay.paused) {
        resume();
      }
    };
    const attachMouseEvents = () => {
      if (swiper2.params.autoplay.pauseOnMouseEnter) {
        swiper2.el.addEventListener("pointerenter", onPointerEnter);
        swiper2.el.addEventListener("pointerleave", onPointerLeave);
      }
    };
    const detachMouseEvents = () => {
      swiper2.el.removeEventListener("pointerenter", onPointerEnter);
      swiper2.el.removeEventListener("pointerleave", onPointerLeave);
    };
    const attachDocumentEvents = () => {
      const document2 = getDocument();
      document2.addEventListener("visibilitychange", onVisibilityChange);
    };
    const detachDocumentEvents = () => {
      const document2 = getDocument();
      document2.removeEventListener("visibilitychange", onVisibilityChange);
    };
    on("init", () => {
      if (swiper2.params.autoplay.enabled) {
        attachMouseEvents();
        attachDocumentEvents();
        start();
      }
    });
    on("destroy", () => {
      detachMouseEvents();
      detachDocumentEvents();
      if (swiper2.autoplay.running) {
        stop();
      }
    });
    on("_freeModeStaticRelease", () => {
      if (pausedByTouch || pausedByInteraction) {
        resume();
      }
    });
    on("_freeModeNoMomentumRelease", () => {
      if (!swiper2.params.autoplay.disableOnInteraction) {
        pause(true, true);
      } else {
        stop();
      }
    });
    on("beforeTransitionStart", (_s, speed, internal) => {
      if (swiper2.destroyed || !swiper2.autoplay.running)
        return;
      if (internal || !swiper2.params.autoplay.disableOnInteraction) {
        pause(true, true);
      } else {
        stop();
      }
    });
    on("sliderFirstMove", () => {
      if (swiper2.destroyed || !swiper2.autoplay.running)
        return;
      if (swiper2.params.autoplay.disableOnInteraction) {
        stop();
        return;
      }
      isTouched = true;
      pausedByTouch = false;
      pausedByInteraction = false;
      touchStartTimeout = setTimeout(() => {
        pausedByInteraction = true;
        pausedByTouch = true;
        pause(true);
      }, 200);
    });
    on("touchEnd", () => {
      if (swiper2.destroyed || !swiper2.autoplay.running || !isTouched)
        return;
      clearTimeout(touchStartTimeout);
      clearTimeout(timeout);
      if (swiper2.params.autoplay.disableOnInteraction) {
        pausedByTouch = false;
        isTouched = false;
        return;
      }
      if (pausedByTouch && swiper2.params.cssMode)
        resume();
      pausedByTouch = false;
      isTouched = false;
    });
    on("slideChange", () => {
      if (swiper2.destroyed || !swiper2.autoplay.running)
        return;
      slideChanged = true;
    });
    Object.assign(swiper2.autoplay, {
      start,
      stop,
      pause,
      resume
    });
  }
  const swiper = "";
  const navigation = "";
  const autoplay = "";
  class Slider {
    constructor() {
      __privateAdd(this, _sliderInstances, void 0);
      __privateSet(this, _sliderInstances, {});
      this.init = () => {
        const sliderElements = document.querySelectorAll('[data-thq="slider"]');
        for (const sliderElement of sliderElements) {
          const identifier = Array.from(sliderElement.classList).join(".");
          const properties = sliderElement.dataset;
          const nextButton = sliderElement.querySelector(
            '[data-thq="slider-button-next"]'
          );
          const prevButton = sliderElement.querySelector(
            '[data-thq="slider-button-prev"]'
          );
          const autoplay2 = Boolean(properties == null ? void 0 : properties.autoplay);
          const modules = [Navigation, Autoplay];
          const swiperInstance = new Swiper(sliderElement, {
            modules,
            navigation: {
              nextEl: nextButton,
              prevEl: prevButton
            },
            autoplay: autoplay2
          });
          __privateGet(this, _sliderInstances)[identifier] = swiperInstance;
        }
      };
    }
  }
  _sliderInstances = new WeakMap();
  new Dropdown().init();
  new Menu().init();
  new Accordion().init();
  new Slider().init();
  let url = location.href;
  document.body.addEventListener(
    "click",
    () => {
      requestAnimationFrame(() => {
        if (url !== location.href) {
          new Menu().init();
          new Accordion().init();
          new Dropdown().init();
          new Slider().init();
          url = location.href;
        }
      });
    },
    true
  );
});
