// ==UserScript==
// @name         DSeek Auto Expert
// @namespace    https://github.com/ShenMian/deepseek-enhance
// @version      0.1.1
// @description  Automatically switches to the Expert model
// @author       ShenMian
// @license      Apache-2.0 OR MIT
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  // Flag to remember if user manually chose Instant model
  let userChoseInstant = false;

  // Switch to Expert model unless user deliberately chose Instant
  const switchToExpert = () => {
    if (userChoseInstant) return;
    const expert = document.querySelector('[data-model-type="expert"]');
    if (expert && expert.getAttribute("aria-checked") !== "true") {
      expert.click();
    }
  };

  // Detect user clicks on model selector (capture phase to beat DOM updates)
  document.addEventListener(
    "mousedown",
    (e) => {
      if (e.target.closest('[data-model-type="default"]')) {
        userChoseInstant = true;
      } else if (e.target.closest('[data-model-type="expert"]')) {
        userChoseInstant = false;
      }
    },
    true,
  );

  // Re-apply Expert on any DOM change (navigation, re-renders, etc.)
  new MutationObserver(switchToExpert).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  // Initial switch after page load
  switchToExpert();
})();
