// ==UserScript==
// @name         DSeek Auto Collapse
// @namespace    https://github.com/ShenMian/deepseek-enhance
// @version      0.1.1
// @description  Auto-collapse thinking blocks in conversations
// @author       ShenMian
// @license      Apache-2.0 OR MIT
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    const THINK_CONTAINER_SELECTOR = "._74c0879";
    const THINK_CONTENT_SELECTOR = ".e1675d8b.ds-think-content";
    const HEADER_SELECTOR = "._5ab5d64";

    /**
     * Collapses a single thinking block.
     *
     * @param {Element} container - The container element to collapse.
     */
    function collapseThinking(container) {
        if (container.hasAttribute("data-dseek-folded")) {
            return; // Prevent redundant processing
        }

        const think = container.querySelector(THINK_CONTENT_SELECTOR);
        // Skip if no thinking content or already hidden
        if (!think || getComputedStyle(think).display === "none") {
            return;
        }

        const header = container.querySelector(HEADER_SELECTOR);
        if (header) {
            header.click(); // Trigger native toggle
            container.setAttribute("data-dseek-folded", "true"); // Mark as processed
        }
    }

    /** Processes and collapses all existing thinking blocks in the DOM. */
    function processExisting() {
        document.querySelectorAll(THINK_CONTAINER_SELECTOR).forEach(collapseThinking);
    }

    /** Observes DOM mutations to handle dynamically inserted thinking blocks. */
    function observeMutations() {
        const observer = new MutationObserver((mutations) => {
            for (const { addedNodes } of mutations) {
                for (const node of addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        continue; // Ignore non-element nodes
                    }
                    // Directly appended container
                    if (node.matches(THINK_CONTAINER_SELECTOR)) {
                        collapseThinking(node);
                    }
                    // Nested containers within the subtree
                    node.querySelectorAll(THINK_CONTAINER_SELECTOR).forEach(collapseThinking);
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize by processing existing blocks and setting up the observer
    processExisting();
    observeMutations();
})();
