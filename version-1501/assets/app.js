import { H as Hls } from './hls-vendor-dru42stk.js';

const navButton = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-site-nav]');

if (navButton && nav) {
  navButton.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let activeSlide = 0;

function showSlide(index) {
  if (!slides.length) {
    return;
  }
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === activeSlide);
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === activeSlide);
  });
}

if (slides.length) {
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });
  window.setInterval(() => showSlide(activeSlide + 1), 5600);
}

const filterPanel = document.querySelector('[data-filter-panel]');

if (filterPanel) {
  const input = filterPanel.querySelector('[data-filter-input]');
  const clearButton = filterPanel.querySelector('[data-filter-clear]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

  const applyFilter = () => {
    const keyword = (input.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre
      ].join(' ').toLowerCase();
      const matched = !keyword || haystack.includes(keyword);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    document.body.classList.toggle('has-empty-filter', cards.length > 0 && visible === 0);
  };

  if (input) {
    input.addEventListener('input', applyFilter);
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      input.value = '';
      applyFilter();
      input.focus();
    });
  }
}

const playerBox = document.querySelector('[data-video-box]');

if (playerBox) {
  const video = playerBox.querySelector('video');
  const button = playerBox.querySelector('[data-play-trigger]');
  const mediaUrl = playerBox.dataset.video;
  let hlsInstance = null;
  let started = false;

  const start = () => {
    if (!video || !mediaUrl) {
      return;
    }

    if (!started) {
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }

      video.setAttribute('controls', 'controls');
      playerBox.classList.add('is-playing');
    }

    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
