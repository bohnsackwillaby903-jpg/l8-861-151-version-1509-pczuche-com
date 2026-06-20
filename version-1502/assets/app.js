(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var panelImage = document.querySelector('[data-hero-panel-image]');
  var panelTitle = document.querySelector('[data-hero-panel-title]');
  var panelText = document.querySelector('[data-hero-panel-text]');
  var panelLink = document.querySelector('[data-hero-panel-link]');
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });

    var selected = slides[activeSlide];

    if (panelImage) {
      panelImage.src = selected.getAttribute('data-cover') || panelImage.src;
      panelImage.alt = selected.getAttribute('data-title') || panelImage.alt;
    }

    if (panelTitle) {
      panelTitle.textContent = selected.getAttribute('data-title') || panelTitle.textContent;
    }

    if (panelText) {
      panelText.textContent = selected.getAttribute('data-text') || panelText.textContent;
    }

    if (panelLink) {
      panelLink.href = selected.getAttribute('data-link') || panelLink.href;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var keyword = form.querySelector('[data-filter-keyword]');
    var kind = form.querySelector('[data-filter-kind]');
    var year = form.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var word = normalize(keyword && keyword.value);
      var kindValue = normalize(kind && kind.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardKind = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matchedWord = !word || haystack.indexOf(word) !== -1;
        var matchedKind = !kindValue || cardKind === kindValue;
        var matchedYear = !yearValue || cardYear === yearValue;
        card.style.display = matchedWord && matchedKind && matchedYear ? '' : 'none';
      });
    }

    [keyword, kind, year].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hlsInstance = null;
    var hasLoaded = false;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (hasLoaded) {
        return;
      }

      hasLoaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startPlayback() {
      attachStream();
      video.controls = true;

      if (cover) {
        cover.hidden = true;
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.hidden = false;
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
