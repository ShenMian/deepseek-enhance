// ==UserScript==
// @name         DSeek Clone Conversation
// @namespace    https://github.com/ShenMian/deepseek-enhance
// @version      0.1.2
// @description  Add a clone option to the conversation menu
// @author       ShenMian
// @license      Apache-2.0 OR MIT
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  const BTN_SELECTOR = "._2090548";
  const LINK_SELECTOR = "._546d736";

  // Fix hover background overlap when hovering the custom clone option
  GM_addStyle(`
        .ds-dropdown-menu[data-clone-hovering] .ds-dropdown-menu-option:not(.ds-dropdown-menu-option--clone) {
            background-color: transparent !important;
        }
    `);

  // SVG icon for the Clone option
  const CLONE_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.14929 4.02032C7.11197 4.02032 7.87983 4.02016 8.49597 4.07598C9.12128 4.13269 9.65792 4.25188 10.1415 4.53106C10.7202 4.8653 11.2008 5.3459 11.535 5.92462C11.8142 6.40818 11.9334 6.94481 11.9901 7.57012C12.0459 8.18625 12.0458 8.95419 12.0458 9.9168C12.0458 10.8795 12.0459 11.6473 11.9901 12.2635C11.9334 12.8888 11.8142 13.4254 11.535 13.909C11.2008 14.4877 10.7202 14.9683 10.1415 15.3025C9.65792 15.5817 9.12128 15.7009 8.49597 15.7576C7.87984 15.8134 7.11196 15.8133 6.14929 15.8133C5.18667 15.8133 4.41874 15.8134 3.80261 15.7576C3.1773 15.7009 2.64067 15.5817 2.1571 15.3025C1.5784 14.9683 1.09778 14.4877 0.76355 13.909C0.484366 13.4254 0.365184 12.8888 0.308472 12.2635C0.252649 11.6473 0.252808 10.8795 0.252808 9.9168C0.252808 8.95418 0.252664 8.18625 0.308472 7.57012C0.365184 6.94481 0.484366 6.40818 0.76355 5.92462C1.09777 5.34589 1.57839 4.86529 2.1571 4.53106C2.64067 4.25188 3.1773 4.13269 3.80261 4.07598C4.41874 4.02017 5.18666 4.02032 6.14929 4.02032ZM6.14929 5.37774C5.16181 5.37774 4.46634 5.37761 3.92566 5.42657C3.39434 5.47472 3.07859 5.56574 2.83582 5.70587C2.4632 5.92106 2.15354 6.2307 1.93835 6.60333C1.79823 6.8461 1.70721 7.16185 1.65906 7.69317C1.6101 8.23385 1.61023 8.92933 1.61023 9.9168C1.61023 10.9043 1.61009 11.5998 1.65906 12.1404C1.70721 12.6717 1.79823 12.9875 1.93835 13.2303C2.15356 13.6029 2.46321 13.9126 2.83582 14.1277C3.07859 14.2679 3.39434 14.3589 3.92566 14.407C4.46634 14.456 5.16182 14.4559 6.14929 14.4559C7.13682 14.4559 7.83224 14.456 8.37292 14.407C8.90425 14.3589 9.21999 14.2679 9.46277 14.1277C9.83535 13.9126 10.145 13.6029 10.3602 13.2303C10.5004 12.9875 10.5914 12.6717 10.6395 12.1404C10.6885 11.5998 10.6884 10.9043 10.6884 9.9168C10.6884 8.92934 10.6885 8.23384 10.6395 7.69317C10.5914 7.16185 10.5004 6.8461 10.3602 6.60333C10.1451 6.23071 9.83536 5.92107 9.46277 5.70587C9.21999 5.56574 8.90424 5.47472 8.37292 5.42657C7.83224 5.3776 7.13682 5.37774 6.14929 5.37774ZM9.80164 0.367975C10.7638 0.367975 11.5314 0.36788 12.1473 0.423639C12.7726 0.480307 13.3093 0.598759 13.7928 0.877741C14.3717 1.21192 14.8521 1.69355 15.1864 2.27227C15.4655 2.75574 15.5857 3.29164 15.6425 3.9168C15.6983 4.53301 15.6971 5.3016 15.6971 6.26446V7.82989C15.6971 8.29264 15.6989 8.58993 15.6649 8.84844C15.4668 10.3525 14.401 11.5738 12.9833 11.9988V10.5467C13.6973 10.1903 14.2105 9.49662 14.3192 8.67169C14.3387 8.52347 14.3407 8.3358 14.3407 7.82989V6.26446C14.3407 5.27706 14.3398 4.58149 14.2909 4.04083C14.2428 3.50968 14.1526 3.19372 14.0126 2.95098C13.7974 2.57849 13.4876 2.26869 13.1151 2.05352C12.8724 1.91347 12.5564 1.82237 12.0253 1.77423C11.4847 1.72528 10.7888 1.7254 9.80164 1.7254H7.71472C6.7562 1.72558 5.92665 2.27697 5.52332 3.07891H4.07019C4.54221 1.51132 5.9932 0.368186 7.71472 0.367975H9.80164Z" fill="currentColor"></path></svg>`;

  const API_BASE = "https://chat.deepseek.com/api/v0";

  const LANG = {
    Rename: "Clone", // English
    重命名: "克隆", // Simplified Chinese
    重新命名: "複製", // Traditional Chinese
  };
  const RENAME_LABELS = Object.keys(LANG);
  const RENAME_REGEX = new RegExp(RENAME_LABELS.join("|"));

  let targetId = null; // Target conversation ID extracted from URL
  let targetTitle = ""; // Target conversation Title extracted from DOM
  let menuToggleBtn = null; // Reference to the button that opened the menu

  // ═══════════════════════════════════════════════════════════════════
  //  API Core Functions
  // ═══════════════════════════════════════════════════════════════════

  // Retrieve user token from localStorage
  function getToken() {
    try {
      const raw = localStorage.getItem("userToken");
      if (!raw) {
        return null;
      }
      const p = JSON.parse(raw);
      return typeof p === "object" ? p.value || p.token || p : p;
    } catch {
      return localStorage.getItem("userToken");
    }
  }

  // Generic API request wrapper
  async function api(path, method = "GET", body) {
    const token = getToken();
    if (!token) throw new Error("User token not found. Please log in.");

    // Use dynamic date for X-App-Version to prevent header expiration issues
    const today = new Date();
    const versionDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-App-Version": versionDate,
      },
    };
    if (body) {
      opts.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${API_BASE}${path}`, opts);
      const json = await res.json();

      if (json.code !== 0) {
        console.error(`API Logic Error (${path}):`, json);
        throw new Error(json.msg || `API error ${json.code}`);
      }
      return json.data;
    } catch (err) {
      console.error(`API Network/Parse Error (${path}):`, err);
      throw err;
    }
  }

  // API endpoints mapping
  const apiHistory = (id) => api(`/chat/history_messages?chat_session_id=${id}`);
  const apiCreateShare = (sid, mids) =>
    api("/share/create", "POST", { chat_session_id: sid, message_ids: mids });
  const apiForkShare = (shareId) => api("/share/fork", "POST", { share_id: shareId });
  const apiRename = (id, title) =>
    api("/chat_session/update_title", "POST", { chat_session_id: id, title });

  // Core logic: Fork messages by IDs
  async function coreForkMessages(sessionId, messageIds) {
    if (!messageIds || messageIds.length === 0) {
      throw new Error("No messages to clone");
    }

    const sd = await apiCreateShare(sessionId, messageIds);
    const shareId = sd?.biz_data?.share_id;

    if (!shareId) {
      console.error("Share creation success but no share_id returned. Raw data:", sd);
      throw new Error("Failed to create share link: API did not return share_id");
    }

    const fd = await apiForkShare(shareId);
    const newSessionId = fd?.biz_data?.chat_session_id;

    if (!newSessionId) {
      console.error("Fork success but no chat_session_id returned. Raw data:", fd);
      throw new Error("Failed to clone conversation: API did not return new session ID");
    }

    return newSessionId;
  }

  // Core logic: Clone entire session
  async function coreForkEntireSession(sessionId) {
    const hist = await apiHistory(sessionId);
    const msgs = hist?.biz_data?.chat_messages || [];

    if (!msgs.length) {
      console.warn("Target conversation returned 0 messages.", hist);
      throw new Error("Target conversation is empty");
    }

    const messageIds = msgs.map((m) => m.message_id);
    return await coreForkMessages(sessionId, messageIds);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  UI Helpers
  // ═══════════════════════════════════════════════════════════════════

  // Minimal toast notification
  function toast(msg, type = "info") {
    const colors = { info: "#2a2a3e", success: "#0d3320", error: "#3d0f0f" };
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:1000001;background:${colors[type]};color:#eee;padding:12px 22px;border-radius:10px;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,.5);font-family:system-ui;transition:opacity .3s;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  // Recursively replace text nodes within a DOM subtree
  function replaceText(el, from, to) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      node.textContent = node.textContent.replace(from, to);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  DOM Injection & Event Handling
  // ═══════════════════════════════════════════════════════════════════

  // Inject the Clone option into the dropdown menu
  function injectClone(menu) {
    if (!menu || menu.dataset.cloneInjected) {
      return; // Prevent duplicate injection
    }

    // Collect all known "Rename" labels across languages
    const rename = [...menu.children].find((c) => RENAME_LABELS.includes(c.textContent.trim()));
    if (!rename || menu.querySelector(".ds-dropdown-menu-option--clone")) {
      return;
    }

    // Determine the target label for the "Clone" button based on the current language
    const renameText = rename.textContent.trim();
    const cloneLabel = LANG[renameText];

    // Clone the 'Rename' element as a structural template
    const clone = rename.cloneNode(true);
    clone.className = "ds-dropdown-menu-option ds-dropdown-menu-option--clone";
    // Replace the original text with the language-appropriate label
    replaceText(clone, RENAME_REGEX, cloneLabel);

    const icon = clone.querySelector(".ds-dropdown-menu-option__icon");
    if (icon) icon.innerHTML = CLONE_ICON;

    // Handle click: execute async clone logic
    clone.addEventListener("click", async () => {
      // Re-trigger the original toggle button to close the menu gracefully
      if (menuToggleBtn) {
        menuToggleBtn.click();
      }

      if (!targetId) {
        toast("Error: No conversation ID found", "error");
        return;
      }

      try {
        toast("Cloning conversation...", "info");

        // Fork conversation
        const newId = await coreForkEntireSession(targetId);

        // Rename cloned conversation
        try {
          await apiRename(newId, targetTitle);
        } catch (renameErr) {
          console.warn("Auto-rename failed, but clone succeeded.", renameErr);
        }

        toast("Clone successful! Redirecting...", "success");
        // Redirect to the cloned conversation tab
        setTimeout(() => {
          location.href = `/a/chat/s/${newId}`;
        }, 800);
      } catch (e) {
        toast(`Clone failed: ${e.message}`, "error");
        console.error("Top level error caught:", e);
      }
    });

    // Manage hover state for custom CSS isolation
    clone.addEventListener("mouseenter", () => menu.setAttribute("data-clone-hovering", ""));
    clone.addEventListener("mouseleave", () => menu.removeAttribute("data-clone-hovering"));

    // Insert after 'Rename' and mark menu as processed
    rename.parentElement.insertBefore(clone, rename.nextSibling);
    menu.dataset.cloneInjected = "true";
  }

  // Global click listener to intercept menu open events
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(BTN_SELECTOR); // Menu toggle button selector
    if (!btn) {
      return;
    }

    menuToggleBtn = btn; // Cache reference for later menu closing
    const link = btn.closest(LINK_SELECTOR);

    if (link?.href) {
      // Extract conversation ID
      targetId = link.href.split("/").pop();
      // Extract the conversation title from the DOM element directly
      // Splitting by newline prevents grabbing button tooltips like "Pin/Delete"
      targetTitle = (link.innerText || "").split("\n")[0].trim();
    }
  });

  // Use MutationObserver for reliable detection of the dropdown menu
  const observer = new MutationObserver(() => {
    const menu = document.querySelector('.ds-dropdown-menu[role="menu"]');
    if (menu && !menu.dataset.cloneInjected) {
      // Validate this is a sidebar menu by checking its contents against known LANG keys
      if (RENAME_REGEX.test(menu.textContent)) {
        injectClone(menu);
      }
    }
  });

  // Start observing DOM changes on body
  observer.observe(document.body, { childList: true, subtree: true });
})();
