// ==UserScript==
// @name         DSeek Quote Reply
// @namespace    https://github.com/ShenMian/deepseek-enhance
// @version      0.2.2
// @description  Adds a floating menu and top-bar card to quote selected text
// @author       ShenMian
// @license      Apache-2.0 OR MIT
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    const INPUT_SEL = 'textarea[name="search"], textarea#chat-input, textarea';
    const TARGET_SEL = ".ds-assistant-message-main-content, .ds-markdown";
    const ICON_QUOTE =
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v9a3 3 0 0 0 3 3h9"/><polyline points="15 13 18 16 15 19"/></svg>';
    const ICON_CLOSE =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    let activeQuote = "";
    let quoteBar = null;
    let quoteText = null;
    let floatBtn = null;
    let lastMousePos = { x: 0, y: 0 };
    let lastChatUrl = location.href;

    // Inject styles for floating quote trigger and seamless top quote bar, with light/dark theme support.
    const style = document.createElement("style");
    style.textContent = `
        /* Light theme (default) */
        .ds-quote-float-btn {
            position: fixed;
            display: none;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #1f2937;
            border: 1px solid rgba(0, 0, 0, 0.12);
            border-radius: 6px;
            font: 500 12.5px/1.2 system-ui, -apple-system, sans-serif;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            user-select: none;
            transition: background .15s, border-color .15s;
        }
        .ds-quote-float-btn:hover {
            background: rgba(245, 245, 245, 0.98);
            color: #000;
            border-color: rgba(0, 0, 0, 0.22);
        }
        .ds-quote-float-btn svg {
            color: #6b7280;
        }
        .ds-quote-float-btn:hover svg {
            color: #1f2937;
        }
        .ds-chat-quote-bar {
            display: none;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            box-sizing: border-box;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.05) !important;
            border-radius: 0 !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            margin-bottom: 4px;
            font: 450 13px/1.4 system-ui, -apple-system, sans-serif;
            color: #1f2937;
            user-select: none;
        }
        .ds-chat-quote-bar.show {
            display: flex;
        }
        .ds-chat-quote-left {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            flex: 1;
        }
        .ds-chat-quote-left svg {
            color: #6b7280;
            flex-shrink: 0;
        }
        .ds-chat-quote-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #1f2937;
        }
        .ds-chat-quote-close {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 3px;
            border-radius: 4px;
            margin-left: 10px;
            flex-shrink: 0;
            transition: color .15s, background .15s;
        }
        .ds-chat-quote-close:hover {
            color: #000;
            background: rgba(0, 0, 0, 0.1);
        }

        /* Dark theme overrides */
        body.dark .ds-quote-float-btn,
        body[data-ds-dark-theme="dark"] .ds-quote-float-btn {
            background: rgba(45, 45, 48, 0.96);
            color: #e4e4e7;
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }
        body.dark .ds-quote-float-btn:hover,
        body[data-ds-dark-theme="dark"] .ds-quote-float-btn:hover {
            background: rgba(60, 60, 64, 0.98);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.22);
        }
        body.dark .ds-quote-float-btn svg,
        body[data-ds-dark-theme="dark"] .ds-quote-float-btn svg {
            color: #a1a1aa;
        }
        body.dark .ds-quote-float-btn:hover svg,
        body[data-ds-dark-theme="dark"] .ds-quote-float-btn:hover svg {
            color: #e4e4e7;
        }
        body.dark .ds-chat-quote-bar,
        body[data-ds-dark-theme="dark"] .ds-chat-quote-bar {
            background: rgba(255, 255, 255, 0.08) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            color: #f1f5f9;
        }
        body.dark .ds-chat-quote-left svg,
        body[data-ds-dark-theme="dark"] .ds-chat-quote-left svg {
            color: #a1a1aa;
        }
        body.dark .ds-chat-quote-text,
        body[data-ds-dark-theme="dark"] .ds-chat-quote-text {
            color: #f1f5f9;
        }
        body.dark .ds-chat-quote-close,
        body[data-ds-dark-theme="dark"] .ds-chat-quote-close {
            color: #a1a1aa;
        }
        body.dark .ds-chat-quote-close:hover,
        body[data-ds-dark-theme="dark"] .ds-chat-quote-close:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
        }
    `;
    document.head.appendChild(style);

    // Resolve the current chat textarea element.
    const getTextarea = () => document.querySelector(INPUT_SEL);

    // Focus the textarea and position the caret at the end.
    function focusInput() {
        const textarea = getTextarea();
        if (!textarea) return;
        setTimeout(() => {
            textarea.focus();
            const len = textarea.value.length;
            textarea.setSelectionRange(len, len);
        }, 0);
    }

    // Initialize the floating quote button element.
    function initFloatingBtn() {
        if (floatBtn) return floatBtn;
        floatBtn = document.createElement("div");
        floatBtn.className = "ds-quote-float-btn";
        floatBtn.innerHTML = `${ICON_QUOTE}<span>Quote</span>`;
        floatBtn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        floatBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const text = window.getSelection()?.toString().trim();
            hideFloatingBtn();
            window.getSelection()?.removeAllRanges();
            if (text) setQuote(text);
        });
        document.body.appendChild(floatBtn);
        return floatBtn;
    }

    // Hide the floating quote button.
    const hideFloatingBtn = () => {
        if (floatBtn) floatBtn.style.display = "none";
    };

    // Resolve the outermost chatbox card container with rounded corners.
    function getOutermostCard(textarea) {
        let node = textarea.parentElement;
        let best = null;
        while (node && node !== document.body) {
            const r = parseFloat(window.getComputedStyle(node).borderRadius) || 0;
            if (r >= 12 && node.querySelector("button, [role='button']")) best = node;
            node = node.parentElement;
        }
        return best || textarea.closest("form") || textarea.parentElement;
    }

    // Ensure the quote preview bar is mounted at the very top of the outer card.
    function ensureQuoteBar() {
        if (quoteBar && document.body.contains(quoteBar)) return quoteBar;
        const textarea = getTextarea();
        if (!textarea) return null;

        const container = getOutermostCard(textarea);
        container.style.setProperty("overflow", "hidden", "important");

        quoteBar = document.createElement("div");
        quoteBar.className = "ds-chat-quote-bar";
        quoteBar.innerHTML = `<div class="ds-chat-quote-left">${ICON_QUOTE}<div class="ds-chat-quote-text"></div></div><button class="ds-chat-quote-close">${ICON_CLOSE}</button>`;
        quoteBar
            .querySelector(".ds-chat-quote-close")
            .addEventListener("click", () => clearQuote(true));
        quoteText = quoteBar.querySelector(".ds-chat-quote-text");

        container.insertBefore(quoteBar, container.firstChild);
        return quoteBar;
    }

    // Activate quote state and focus the input.
    function setQuote(text) {
        activeQuote = text;
        if (ensureQuoteBar()) {
            quoteText.textContent = `“${text.replace(/\s+/g, " ").trim()}”`;
            quoteBar.classList.add("show");
        }
        focusInput();
    }

    // Clear active quote state and optionally refocus the input.
    function clearQuote(shouldFocus = false) {
        activeQuote = "";
        quoteBar?.classList.remove("show");
        if (shouldFocus) focusInput();
    }

    // Reset quote state and remove DOM bar when switching chat conversations.
    function onConversationChange() {
        if (location.href !== lastChatUrl) {
            lastChatUrl = location.href;
            clearQuote(false);
            hideFloatingBtn();
            if (quoteBar && !document.body.contains(quoteBar)) {
                quoteBar = null;
                quoteText = null;
            }
        }
    }

    // Intercept SPA navigation to monitor chat switching.
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        onConversationChange();
    };
    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        onConversationChange();
    };
    window.addEventListener("popstate", onConversationChange);

    // Track cursor release position and show the floating button if inside assistant responses.
    document.addEventListener("mouseup", (e) => {
        lastMousePos = { x: e.clientX, y: e.clientY };
        setTimeout(() => {
            const sel = window.getSelection();
            const text = sel ? sel.toString().trim() : "";
            const isInside = !!sel?.anchorNode?.parentElement?.closest(TARGET_SEL);
            if (text && isInside) {
                const btn = initFloatingBtn();
                const x = Math.min(Math.max(lastMousePos.x + 8, 10), window.innerWidth - 80);
                const y = lastMousePos.y - 38 < 10 ? lastMousePos.y + 16 : lastMousePos.y - 38;
                btn.style.left = `${x}px`;
                btn.style.top = `${y}px`;
                btn.style.display = "inline-flex";
            } else {
                hideFloatingBtn();
            }
        }, 10);
    });

    // Hide floating button when selection collapses or on scroll.
    document.addEventListener("selectionchange", () => {
        if (!window.getSelection() || window.getSelection().isCollapsed) hideFloatingBtn();
    });
    window.addEventListener("scroll", hideFloatingBtn, true);

    // Insert Markdown quote block into textarea before submission.
    function injectQuoteIntoTextarea() {
        const textarea = getTextarea();
        if (!activeQuote || !textarea) return;
        const val = `> ${activeQuote.replace(/\n/g, "\n> ")}\n\n${textarea.value}`;
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
        setter ? setter.call(textarea, val) : (textarea.value = val);
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        clearQuote(false);
    }

    // Intercept Enter key to prepend quote block before submission.
    document.addEventListener(
        "keydown",
        (e) => {
            if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.isComposing &&
                activeQuote &&
                document.activeElement === getTextarea()
            ) {
                injectQuoteIntoTextarea();
            }
        },
        true,
    );

    // Intercept send button clicks to prepend quote block before submission.
    document.addEventListener(
        "click",
        (e) => {
            if (!activeQuote) return;
            const btn = e.target.closest("button, [role='button']");
            if (
                btn &&
                !btn.closest(".ds-chat-quote-bar") &&
                btn.querySelector("svg") &&
                !btn.innerText.match(/DeepThink|Search/i)
            ) {
                injectQuoteIntoTextarea();
            }
        },
        true,
    );
})();
