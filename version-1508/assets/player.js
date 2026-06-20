function setupPlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-video') : '';
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }
        loaded = true;

        var Hls = window.Hls;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function startPlay() {
        loadSource();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlay();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
