// AI Adoption Designs — shared client-side behavior (theme toggle, sub-tabs, copy buttons)
(function () {
  "use strict";

  var STORAGE_KEY = "aad-theme";

  function initTheme() {
    var root = document.documentElement;
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* storage unavailable (private mode etc.) — fall back to system preference */
    }
    if (stored === "light" || stored === "dark") {
      root.setAttribute("data-theme", stored);
    }

    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    function label() {
      var current = root.getAttribute("data-theme");
      var isLight = current === "light" || (!current && window.matchMedia && !window.matchMedia("(prefers-color-scheme: dark)").matches && window.matchMedia("(prefers-color-scheme: light)").matches);
      toggle.textContent = isLight ? "[ dark mode ]" : "[ light mode ]";
    }
    label();

    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var isDarkNow = current === "dark" || (!current);
      var next = isDarkNow ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
      label();
    });
  }

  function initTabs() {
    var groups = document.querySelectorAll("[data-tabs]");
    groups.forEach(function (group) {
      var buttons = Array.prototype.slice.call(group.querySelectorAll(".tab-btn"));
      var panelContainer = document.querySelector(group.getAttribute("data-tabs"));
      if (!panelContainer) return;
      var panels = Array.prototype.slice.call(panelContainer.querySelectorAll(".tab-panel"));

      function activate(id, focus) {
        buttons.forEach(function (b) {
          var selected = b.getAttribute("data-tab") === id;
          b.setAttribute("aria-selected", selected ? "true" : "false");
          b.tabIndex = selected ? 0 : -1;
        });
        panels.forEach(function (p) {
          var match = p.getAttribute("id") === id;
          p.hidden = !match;
          if (match && focus) p.focus();
        });
      }

      buttons.forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          activate(btn.getAttribute("data-tab"), false);
        });
        btn.addEventListener("keydown", function (e) {
          var dir = 0;
          if (e.key === "ArrowRight") dir = 1;
          else if (e.key === "ArrowLeft") dir = -1;
          else return;
          e.preventDefault();
          var nextIdx = (idx + dir + buttons.length) % buttons.length;
          buttons[nextIdx].focus();
          activate(buttons[nextIdx].getAttribute("data-tab"), false);
        });
      });

      // activate whichever button is already marked selected in the markup
      var initial = group.querySelector('.tab-btn[aria-selected="true"]') || buttons[0];
      if (initial) activate(initial.getAttribute("data-tab"), false);
    });
  }

  function initCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var block = btn.closest(".code-block");
        var code = block && block.querySelector("pre code");
        if (!code) return;
        var text = code.textContent;
        var done = function () {
          var original = btn.textContent;
          btn.textContent = "copied";
          btn.classList.add("copied");
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove("copied");
          }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initTabs();
    initCopyButtons();
  });
})();
