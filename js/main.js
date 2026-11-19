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
          if (match && focus) p.focus({ preventScroll: true });
        });
      }

      // scroll back to the top of the subtabs so a newly activated panel is
      // read from its start, instead of staying wherever the trigger button was.
      // Accounts for the sticky header so the subtabs row isn't hidden under it.
      function scrollToTabsTop(activeBtn) {
        activeBtn.scrollIntoView({ inline: "nearest", block: "nearest" });
        var header = document.querySelector(".site-header");
        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        var targetY = window.scrollY + group.getBoundingClientRect().top - headerHeight - 12;
        window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
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

      // "Previous Topic" / "Next Topic" controls at the bottom of each panel,
      // cycling between sub-tabs. Previous is omitted on the first (Overview) panel.
      if (panels.length > 1) {
        panels.forEach(function (panel, idx) {
          var nav = document.createElement("div");
          nav.className = "next-topic";

          if (idx > 0) {
            var prevBtn = document.createElement("button");
            prevBtn.type = "button";
            prevBtn.className = "prev-topic-btn";
            prevBtn.textContent = "← Previous Topic";
            prevBtn.addEventListener("click", function () {
              var prevIdx = (idx - 1 + buttons.length) % buttons.length;
              activate(buttons[prevIdx].getAttribute("data-tab"), true);
              scrollToTabsTop(buttons[prevIdx]);
            });
            nav.appendChild(prevBtn);
          }

          var nextBtn = document.createElement("button");
          nextBtn.type = "button";
          nextBtn.className = "next-topic-btn";
          nextBtn.textContent = "Next Topic →";
          nextBtn.addEventListener("click", function () {
            var nextIdx = (idx + 1) % buttons.length;
            activate(buttons[nextIdx].getAttribute("data-tab"), true);
            scrollToTabsTop(buttons[nextIdx]);
          });
          nav.appendChild(nextBtn);

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
