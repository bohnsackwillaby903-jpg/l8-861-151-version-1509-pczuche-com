(function () {
    window.initMoviePlayer = function (streamUrl) {
        var player = document.getElementById('movie-player');
        var trigger = document.getElementById('play-trigger');
        var wrap = document.getElementById('player-wrap');
        var ready = false;
        var hls = null;

        if (!player || !streamUrl) {
            return;
        }

        function preparePlayer() {
            if (ready) {
                return;
            }

            ready = true;

            if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(player);
                return;
            }

            player.src = streamUrl;
        }

        function playMovie() {
            preparePlayer();

            if (trigger) {
                trigger.classList.add('is-hidden');
            }

            var playRequest = player.play();

            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    if (trigger) {
                        trigger.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playMovie();
            });
        }

        if (wrap) {
            wrap.addEventListener('click', function (event) {
                if (event.target === wrap) {
                    playMovie();
                }
            });
        }

        player.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        });

        player.addEventListener('click', function () {
            if (player.paused) {
                playMovie();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
