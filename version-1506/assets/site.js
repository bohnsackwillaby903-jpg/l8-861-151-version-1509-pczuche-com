(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        var show = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        var start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterYear = document.querySelector('[data-filter-year]');
    var filterRegion = document.querySelector('[data-filter-region]');
    var filterType = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-filter-text]'));

    var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    var applyFilters = function () {
        var keyword = normalize(filterInput && filterInput.value);
        var year = normalize(filterYear && filterYear.value);
        var region = normalize(filterRegion && filterRegion.value);
        var type = normalize(filterType && filterType.value);

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-filter-text'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (region && cardRegion.indexOf(region) === -1) {
                matched = false;
            }

            if (type && cardType.indexOf(type) === -1) {
                matched = false;
            }

            card.classList.toggle('is-hidden', !matched);
        });
    };

    [filterInput, filterYear, filterRegion, filterType].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchNote = document.querySelector('[data-search-note]');

    if (searchInput && searchResults && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        var createCard = function (movie) {
            var article = document.createElement('article');
            article.className = 'movie-card';
            article.innerHTML = [
                '<a class="movie-poster" href="' + movie.url + '" aria-label="' + movie.safeTitle + ' 在线观看">',
                '<img src="' + movie.cover + '" alt="' + movie.safeTitle + ' 在线观看" loading="lazy">',
                '<span class="poster-glow"></span>',
                '<span class="year-badge">' + movie.year + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<a class="movie-card-title" href="' + movie.url + '">' + movie.safeTitle + '</a>',
                '<p>' + movie.safeLine + '</p>',
                '<div class="movie-meta"><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
                '<div class="tag-line"><span>' + movie.genre + '</span></div>',
                '</div>'
            ].join('');
            return article;
        };

        var renderSearch = function () {
            var query = normalize(searchInput.value);
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return !query || movie.searchText.indexOf(query) !== -1;
            }).slice(0, 120);

            searchResults.innerHTML = '';
            matched.forEach(function (movie) {
                searchResults.appendChild(createCard(movie));
            });

            if (searchNote) {
                searchNote.textContent = matched.length ? '为你匹配到相关影片，点击卡片即可进入播放页。' : '没有找到匹配影片，可尝试更换关键词。';
            }
        };

        searchInput.addEventListener('input', renderSearch);
        renderSearch();
    }
})();
