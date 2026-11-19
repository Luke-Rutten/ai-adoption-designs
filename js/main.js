// AI Adoption Designs — shared client-side behavior (sub-tabs, copy buttons)
(function () {
  "use strict";

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

      // "Next Topic" control at the bottom of each panel, cycling to the next sub-tab
      if (panels.length > 1) {
        panels.forEach(function (panel, idx) {
          var nav = document.createElement("div");
          nav.className = "next-topic";
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "next-topic-btn";
          btn.textContent = "Next Topic →";
          btn.addEventListener("click", function () {
            var nextIdx = (idx + 1) % buttons.length;
            activate(buttons[nextIdx].getAttribute("data-tab"), true);
            buttons[nextIdx].scrollIntoView({ inline: "nearest", block: "nearest" });
          });
          nav.appendChild(btn);
          panel.appendChild(nav);
        });
      }

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
    initTabs();
    initCopyButtons();
  });
})();
