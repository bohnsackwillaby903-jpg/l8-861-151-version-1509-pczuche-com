(function () {
  function bindPlayer(videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var attached = false;
    var hls = null;

    if (!video || !cover || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      attached = true;
    }

    function startPlayback() {
      attachSource();
      cover.classList.add("is-hidden");
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    cover.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        startPlayback();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = bindPlayer;
})();
