// ==UserScript==
// @name         DSeek Quote Reply
// @namespace    https://github.com/ShenMian/deepseek-enhance
// @version      0.1.1
// @description  Adds a floating menu to quote selected text
// @author       ShenMian
// @license      Apache-2.0 OR MIT
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    const INPUT_SELECTOR = 'textarea[name="search"]';

    // Track mouse position for menu placement
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Create floating menu element
    const menu = document.createElement("div");
    menu.textContent = "↩ Quote Reply";
    Object.assign(menu.style, {
        position: "fixed",
        background: "#2a2a35",
        color: "#e5e5e5",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        zIndex: "9999",
        display: "none",
        userSelect: "none",
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "background 0.15s",
    });
    document.body.appendChild(menu);

    // Hover effects
    menu.addEventListener("mouseenter", () => (menu.style.background = "#363645"));
    menu.addEventListener("mouseleave", () => (menu.style.background = "#2a2a35"));

    let selectedText = "";

    /**
     * Sync menu visibility with the actual selection state. Uses the last known mouse position for
     * placement.
     */
    function updateMenuFromSelection() {
        const selection = window.getSelection();
        const text = selection ? selection.toString().trim() : "";

        if (text) {
            selectedText = text;
            menu.style.display = "block";
            // Prevent viewport overflow
            const x = Math.min(mouseX + 10, window.innerWidth - 120);
            const y = Math.min(mouseY + 10, window.innerHeight - 40);
            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
        } else {
            selectedText = "";
            menu.style.display = "none";
        }
    }

    /** Inserts quoted text into the chat input, bypassing React's controlled component. */
    function insertQuote() {
        const textarea = document.querySelector(INPUT_SELECTOR);
        if (!textarea || !selectedText) return;

        // Format multi-line text with Markdown quote prefix
        const quote = `> ${selectedText.replace(/\n/g, "\n> ")}\n\n`;
        const nativeSetter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            "value",
        ).set;

        // Bypass React state management and trigger UI update
        nativeSetter.call(textarea, quote + textarea.value);
        textarea.dispatchEvent(new Event("input", { bubbles: true }));

        // Clear selection and hide menu (selectionchange will also trigger hide)
        window.getSelection().removeAllRanges();

        // Delay focus to ensure React re-renders and UI transitions complete
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(quote.length, quote.length);
        }, 50);
    }

    /** Hide menu when scrolling or resizing, because the fixed position may be stale. */
    function hideMenuOnScrollOrResize() {
        menu.style.display = "none";
        selectedText = "";
    }

    // Event listeners
    document.addEventListener("selectionchange", updateMenuFromSelection);
    menu.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent any document‑level mousedown handlers from firing
        insertQuote();
    });
    window.addEventListener("scroll", hideMenuOnScrollOrResize, true);
    window.addEventListener("resize", hideMenuOnScrollOrResize);
})();
