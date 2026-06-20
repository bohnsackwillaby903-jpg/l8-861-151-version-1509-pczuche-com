(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function() {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function() {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            var show = function(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            var start = function() {
                window.clearInterval(timer);
                timer = window.setInterval(function() {
                    show(current + 1);
                }, 5200);
            };
            dots.forEach(function(dot) {
                dot.addEventListener("click", function() {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function() {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function() {
                    show(current + 1);
                    start();
                });
            }
            start();
        }

        var scopedAreas = Array.prototype.slice.call(document.querySelectorAll("[data-card-scope]"));
        scopedAreas.forEach(function(scope) {
            var area = scope.previousElementSibling;
            var input = null;
            var chips = [];
            if (area && (area.classList.contains("search-panel") || area.classList.contains("filter-bar"))) {
                input = area.querySelector("[data-search-input]");
                chips = Array.prototype.slice.call(area.querySelectorAll("[data-filter-chip]"));
            }
            if (!input) {
                input = document.querySelector("[data-search-input]");
            }
            var activeFilter = "all";
            var apply = function() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
                cards.forEach(function(card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-keywords") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var genre = card.getAttribute("data-genre") || "";
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchFilter = activeFilter === "all" || genre.indexOf(activeFilter) !== -1;
                    card.hidden = !(matchQuery && matchFilter);
                });
            };
            if (input) {
                input.addEventListener("input", apply);
            }
            chips.forEach(function(chip) {
                chip.addEventListener("click", function() {
                    chips.forEach(function(item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    activeFilter = chip.getAttribute("data-filter-chip") || "all";
                    apply();
                });
            });
        });
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("movie-play-button");
    var player = document.getElementById("movie-player");
    if (!video || !button || !streamUrl) {
        return;
    }
    var hlsInstance = null;
    var started = false;
    var begin = function() {
        if (!started) {
            started = true;
            button.hidden = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function() {});
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(function() {});
                });
            } else {
                video.src = streamUrl;
                video.play().catch(function() {});
            }
            return;
        }
        if (video.paused) {
            video.play().catch(function() {});
        } else {
            video.pause();
        }
    };
    button.addEventListener("click", begin);
    if (player) {
        player.addEventListener("click", function(event) {
            if (event.target === button || button.contains(event.target)) {
                return;
            }
            if (!started) {
                begin();
            }
        });
    }
    window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
