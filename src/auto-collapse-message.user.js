// ==UserScript==
// @name         DSeek Auto Collapse Message
// @namespace    https://github.com/ShenMian/deepseek-enhance
// @version      0.1.0
// @description  Auto-collapse user messages in conversations
// @author       ShenMian
// @license      Apache-2.0 OR MIT
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    const USER_MSG_CONTAINER_SELECTOR = "._9663006";
    const MSG_CONTENT_SELECTOR = ".fbb737a4";
    const ACTION_BAR_SELECTOR = "._425ea0b .ds-flex";

    // The threshold for collapsing messages in em units
    const COLLAPSE_THRESHOLD_EM = 9;

    /** Injects the necessary CSS styles into the document. */
    function injectStyles() {
        if (document.getElementById("dseek-msg-collapse-styles")) return;

        const style = document.createElement("style");
        style.id = "dseek-msg-collapse-styles";
        style.textContent = `
            .fbb737a4.collapsed-msg {
                max-height: ${COLLAPSE_THRESHOLD_EM}em !important;
                overflow: hidden !important;
                mask-image: linear-gradient(180deg, #000 30%, transparent 100%);
                -webkit-mask-image: linear-gradient(180deg, #000 30%, transparent 100%);
                transition: max-height 0.3s ease;
            }
            .ds-toggle-fold-btn {
                display: inline-flex;
                align-items: center;
                cursor: pointer;
                padding: 2px 10px;
                margin-right: 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                color: var(--dsw-alias-label-tertiary);
                background: transparent;
                border: 1px solid var(--dsw-alias-border-subtle);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
            }
            .ds-toggle-fold-btn:hover {
                background-color: var(--ds-rgb-hover);
                color: var(--dsw-alias-brand-primary);
                border-color: var(--dsw-alias-brand-primary);
            }
            ._425ea0b {
                margin-top: 8px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Collapses a single user message block and adds a toggle button.
     *
     * @param {Element} container - The container element to process.
     */
    function collapseMessage(container) {
        if (container.hasAttribute("data-dseek-folded")) {
            return; // Prevent redundant processing
        }

        const content = container.querySelector(MSG_CONTENT_SELECTOR);
        const actionBar = container.querySelector(ACTION_BAR_SELECTOR);

        // Skip if required elements are not found
        if (!content || !actionBar) {
            return;
        }

        // Calculate the threshold in pixels based on the current font size
        const fontSize = parseFloat(window.getComputedStyle(content).fontSize);
        const thresholdPx = fontSize * COLLAPSE_THRESHOLD_EM;

        // Only collapse if the content height exceeds the threshold
        if (content.scrollHeight <= thresholdPx) {
            container.setAttribute("data-dseek-folded", "true");
            return;
        }

        // Apply collapsed state
        content.classList.add("collapsed-msg");

        // Create toggle button
        const btn = document.createElement("div");
        btn.className = "ds-toggle-fold-btn";
        btn.textContent = "Expand";

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const isCollapsing = content.classList.toggle("collapsed-msg");
            btn.textContent = isCollapsing ? "Expand" : "Collapse";
        });

        // Insert button and mark as processed
        actionBar.prepend(btn);
        container.setAttribute("data-dseek-folded", "true");
    }

    /** Processes and collapses all existing user message blocks in the DOM. */
    function processExisting() {
        document.querySelectorAll(USER_MSG_CONTAINER_SELECTOR).forEach(collapseMessage);
    }

    /** Observes DOM mutations to handle dynamically inserted user messages. */
    function observeMutations() {
        const observer = new MutationObserver((mutations) => {
            for (const { addedNodes } of mutations) {
                for (const node of addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        continue; // Ignore non-element nodes
                    }
                    // Directly appended container
                    if (node.matches(USER_MSG_CONTAINER_SELECTOR)) {
                        collapseMessage(node);
                    }
                    // Nested containers within the subtree
                    node.querySelectorAll(USER_MSG_CONTAINER_SELECTOR).forEach(collapseMessage);
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize
    injectStyles();
    processExisting();
    observeMutations();
})();
