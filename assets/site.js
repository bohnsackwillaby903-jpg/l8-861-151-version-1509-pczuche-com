(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var siteNav = document.querySelector("#siteNav");

    if (menuButton && siteNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = siteNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    document.querySelectorAll(".top-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        stopHero();
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var searchInput = document.querySelector("#movieSearchInput");
    var searchCards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var emptyState = document.querySelector("#emptyState");

    function applySearch(value) {
      var query = normalize(value);
      var visible = 0;

      searchCards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput && searchCards.length) {
      var params = new URLSearchParams(window.location.search);
      var preset = params.get("q") || "";
      searchInput.value = preset;
      applySearch(preset);
      searchInput.addEventListener("input", function () {
        applySearch(searchInput.value);
      });
      var panelForm = searchInput.closest("form");
      if (panelForm) {
        panelForm.addEventListener("submit", function (event) {
          event.preventDefault();
          applySearch(searchInput.value);
          if (history.replaceState) {
            var next = searchInput.value.trim() ? "./search.html?q=" + encodeURIComponent(searchInput.value.trim()) : "./search.html";
            history.replaceState(null, "", next);
          }
        });
      }
    }
  });
})();
