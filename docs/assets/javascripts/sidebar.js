// Collapsible navigation sidebar on wide screens (narrow screens already use
// Material's drawer). A button at the bottom of the sidebar collapses it to a
// thin rail; the choice is kept in localStorage. main.html applies a saved
// choice before first paint so the page does not jump.
(function () {
  var KEY = "kv-sidebar";
  var root = document.documentElement;

  function saved() {
    try {
      return window.localStorage.getItem(KEY);
    } catch (error) {
      return null;
    }
  }

  function save(state) {
    try {
      window.localStorage.setItem(KEY, state);
    } catch (error) {
      // Storage can be blocked (private windows); the toggle still works per page.
    }
  }

  function apply(state) {
    var hidden = state === "hidden";
    if (hidden) {
      root.setAttribute("data-kv-sidebar", "hidden");
    } else {
      root.removeAttribute("data-kv-sidebar");
    }
    var button = document.querySelector(".kv-sidebar-toggle");
    if (button) {
      var label = hidden ? "Expand sidebar" : "Collapse sidebar";
      button.setAttribute("aria-expanded", String(!hidden));
      button.setAttribute("aria-label", label);
      button.title = label;
    }
  }

  function mount() {
    var wrap = document.querySelector(".md-sidebar--primary .md-sidebar__scrollwrap");
    if (wrap && !wrap.querySelector(".kv-sidebar-toggle")) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "kv-sidebar-toggle";
      button.innerHTML = '<span aria-hidden="true">&laquo;</span>';
      button.addEventListener("click", function () {
        var next = root.getAttribute("data-kv-sidebar") === "hidden" ? "shown" : "hidden";
        save(next);
        apply(next);
      });
      wrap.appendChild(button);
    }
    apply(saved() === "hidden" ? "hidden" : "shown");
  }

  // document$ emits on the first load and after every instant navigation.
  if (window.document$) {
    window.document$.subscribe(mount);
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
