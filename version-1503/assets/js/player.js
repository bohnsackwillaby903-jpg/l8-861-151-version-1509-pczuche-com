document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play]");
        var stream = player.getAttribute("data-stream");
        var hls = null;

        function attach() {
            if (!video || !stream || video.getAttribute("data-ready") === "true") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute("data-ready", "true");
        }

        function start() {
            attach();
            player.classList.add("is-playing");
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (button && video) {
            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
        }
    });
});
