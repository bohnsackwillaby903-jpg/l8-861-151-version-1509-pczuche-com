(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (navButton && nav) {
        navButton.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("open");
            navButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
        var target = input.getAttribute("data-filter-input") || "[data-filter-card]";
        var cards = Array.prototype.slice.call(document.querySelectorAll(target));
        var empty = document.querySelector(input.getAttribute("data-empty-target") || "");
        var counter = document.querySelector(input.getAttribute("data-count-target") || "");

        function filterCards() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var content = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                var matched = !keyword || content.indexOf(keyword) !== -1;
                card.classList.toggle("hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("active", visible === 0);
            }

            if (counter) {
                counter.textContent = String(visible);
            }
        }

        input.addEventListener("input", filterCards);
        filterCards();
    });
})();

function initMoviePlayer(source) {
    var video = document.querySelector("[data-video-player]");
    var overlay = document.querySelector("[data-player-overlay]");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function bindSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function startPlayback() {
        bindSource();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        video.controls = true;
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (!loaded) {
            startPlayback();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
}
