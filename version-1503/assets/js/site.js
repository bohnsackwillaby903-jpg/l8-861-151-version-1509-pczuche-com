document.addEventListener("DOMContentLoaded", function () {
    var navToggle = document.querySelector(".nav-toggle");
    var siteNav = document.querySelector(".site-nav");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            var open = siteNav.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.from(hero.querySelectorAll(".hero-slide"));
        var dots = Array.from(hero.querySelectorAll(".hero-dot"));
        var next = hero.querySelector(".hero-next");
        var prev = hero.querySelector(".hero-prev");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    });

    document.querySelectorAll("[data-filter]").forEach(function (panel) {
        var section = panel.closest("section");
        var results = section ? section.querySelector(".filter-results") : null;
        var cards = results ? Array.from(results.children) : [];
        var keyword = panel.querySelector("[data-filter-keyword]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var region = panel.querySelector("[data-filter-region]");
        var category = panel.querySelector("[data-filter-category]");

        function includesValue(text, value) {
            return !value || String(text || "").indexOf(value) !== -1;
        }

        function apply() {
            var key = keyword ? keyword.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedType = type ? type.value : "";
            var selectedRegion = region ? region.value : "";
            var selectedCategory = category ? category.value : "";

            cards.forEach(function (card) {
                var text = String(card.getAttribute("data-search") || "").toLowerCase();
                var matchKeyword = !key || text.indexOf(key) !== -1;
                var matchYear = includesValue(card.getAttribute("data-year"), selectedYear);
                var matchType = includesValue(card.getAttribute("data-type"), selectedType);
                var matchRegion = includesValue(card.getAttribute("data-region"), selectedRegion);
                var matchCategory = includesValue(card.getAttribute("data-category"), selectedCategory);
                card.hidden = !(matchKeyword && matchYear && matchType && matchRegion && matchCategory);
            });
        }

        [keyword, year, type, region, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
});
