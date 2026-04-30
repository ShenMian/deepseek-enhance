// ==UserScript==
// @name         DSeek Quote Reply
// @namespace    https://github.com/ShenMian/deepseek-enhance
// @version      0.1.0
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

    // Create floating menu element
    const menu = document.createElement("div");
    menu.textContent = "↩ Quote Reply";
    Object.assign(menu.style, {
        position: "fixed",
        background: "#2a2a35", // Matches DSeek dark popover
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
     * Handles mouse up events to detect text selection and position the menu.
     *
     * @param {MouseEvent} e - The mouse event.
     */
    function handleSelection(e) {
        if (e.target === menu) return;
        selectedText = window.getSelection().toString().trim();

        if (selectedText) {
            menu.style.display = "block";
            // Prevent viewport overflow
            const x = Math.min(e.clientX + 10, window.innerWidth - 120);
            const y = Math.min(e.clientY + 10, window.innerHeight - 40);
            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
        } else {
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

        menu.style.display = "none";
        window.getSelection().removeAllRanges();

        // Delay focus to ensure React re-renders and UI transitions complete
        setTimeout(() => {
            textarea.focus();
            // Place cursor at the end of the inserted quote for immediate typing
            textarea.setSelectionRange(quote.length, quote.length);
        }, 50);
    }

    /** Hides the menu when interacting outside of it. */
    function hideMenu(e) {
        if (e && e.target === menu) return;
        menu.style.display = "none";
    }

    // Event listeners
    document.addEventListener("mouseup", handleSelection);
    menu.addEventListener("mousedown", (e) => {
        e.preventDefault();
        insertQuote();
    });
    document.addEventListener("mousedown", hideMenu);
    window.addEventListener("scroll", hideMenu, true);
    window.addEventListener("resize", hideMenu);
})();
