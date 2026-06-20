import { H as Hls } from './hls.js';

(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.cinema-player'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var stream = player.getAttribute('data-stream');
        var started = false;
        var hls = null;

        var begin = function () {
            if (!video || !stream) {
                return;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (!started) {
                started = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (Hls && Hls.isSupported()) {
                    hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
