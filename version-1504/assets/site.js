(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupCardFilter() {
    var input = document.querySelector('[data-card-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var count = document.querySelector('[data-result-count]');
    if (!input || cards.length === 0) {
      return;
    }

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = '共显示 ' + shown + ' 部影片';
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback);
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.onload = callback;
    document.head.appendChild(script);
  }

  function setupPlayer() {
    var video = document.querySelector('.movie-video[data-src]');
    var trigger = document.querySelector('[data-player-trigger]');
    if (!video || !trigger) {
      return;
    }

    var hasStarted = false;
    var source = video.getAttribute('data-src');

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          trigger.classList.remove('is-hidden');
        });
      }
    }

    function start() {
      if (hasStarted || !source) {
        return;
      }
      hasStarted = true;
      trigger.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
        return;
      }

      loadHlsScript(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(window.Hls.Events.ERROR, function () {
            if (!video.src) {
              video.src = source;
            }
          });
        } else {
          video.src = source;
          playVideo();
        }
      });
    }

    trigger.addEventListener('click', start);
  }

  function movieCardTemplate(movie) {
    var cover = './' + movie.cover + '.jpg';
    return [
      '<article class="movie-card compact-card">',
      '  <a href="' + movie.url + '" class="movie-cover-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <div class="cover-frame cover-poster">',
      '      <div class="cover-fallback">',
      '        <span>' + escapeHtml(movie.title) + '</span>',
      '        <small>' + escapeHtml(movie.genre) + '</small>',
      '      </div>',
      '      <img src="' + cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove();">',
      '    </div>',
      '    <span class="play-badge">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('site-search-input');
    var region = document.getElementById('site-search-region');
    var year = document.getElementById('site-search-year');
    var count = document.getElementById('search-count');
    if (!results || !input || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render() {
      var q = input.value.trim().toLowerCase();
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var matched = window.MOVIE_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        var qMatch = !q || haystack.indexOf(q) !== -1;
        var regionMatch = !regionValue || movie.region.indexOf(regionValue) !== -1 || movie.tags.indexOf(regionValue) !== -1;
        var yearMatch = !yearValue || movie.year === yearValue;
        return qMatch && regionMatch && yearMatch;
      });

      var limited = matched.slice(0, 240);
      results.innerHTML = limited.map(movieCardTemplate).join('');
      count.textContent = '找到 ' + matched.length + ' 部影片，当前显示 ' + limited.length + ' 部';
    }

    input.addEventListener('input', render);
    if (region) {
      region.addEventListener('change', render);
    }
    if (year) {
      year.addEventListener('change', render);
    }
    render();
  }

  function setupHeroSlides() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    window.setInterval(function () {
      slides[index].classList.remove('is-active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('is-active');
    }, 3600);
  }

  ready(function () {
    setupMenu();
    setupCardFilter();
    setupPlayer();
    setupSearchPage();
    setupHeroSlides();
  });
})();
