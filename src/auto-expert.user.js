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

    /** @type {boolean} Flag indicating if the user manually selected the Instant model. */
    let userChoseInstant = false;

    /** Switches to the Expert model unless the user explicitly chose the Instant model. */
    const switchToExpert = () => {
        if (userChoseInstant) return;
        const expert = document.querySelector('[data-model-type="expert"]');
        if (expert && expert.getAttribute("aria-checked") !== "true") {
            expert.click();
        }
    };

    /**
     * Listens for mousedown events to track manual model selections. Uses capture phase to register
     * before DOM updates.
     */
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

    /** Observes DOM changes to re-apply the Expert model during navigation or re-renders. */
    new MutationObserver(switchToExpert).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
    });

    // Initial application after page load
    switchToExpert();
})();
