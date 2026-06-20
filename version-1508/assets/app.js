(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 6200);
        }
    }

    var filterArea = document.querySelector('[data-filter-area]');
    if (filterArea) {
        var filterInput = filterArea.querySelector('[data-filter-input]');
        var typeSelect = filterArea.querySelector('[data-filter-type]');
        var yearSelect = filterArea.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(filterInput && filterInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var visible = true;

                if (query && haystack.indexOf(query) === -1) {
                    visible = false;
                }
                if (type && cardType !== type) {
                    visible = false;
                }
                if (year && cardYear !== year) {
                    visible = false;
                }

                card.classList.toggle('is-hidden', !visible);
            });
        }

        [filterInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var searchResults = document.querySelector('[data-search-results]');
    if (searchResults && window.SITE_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';
        var input = document.querySelector('[data-search-page-input]');
        var title = document.querySelector('[data-search-title]');
        var intro = document.querySelector('[data-search-intro]');

        if (input) {
            input.value = queryValue;
        }

        function createCard(movie) {
            var tags = movie.tags.slice(0, 4).map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a class="poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
                '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="play-chip">播放</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                '<h2 class="movie-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        var query = normalize(queryValue.trim());
        if (query) {
            var results = window.SITE_MOVIES.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags.join(' '),
                    movie.oneLine
                ].join(' ')).indexOf(query) !== -1;
            }).slice(0, 96);

            searchResults.innerHTML = results.map(createCard).join('');
            if (title) {
                title.textContent = '“' + queryValue.trim() + '”的搜索结果';
            }
            if (intro) {
                intro.textContent = results.length ? '已为你匹配相关剧集内容。' : '暂未匹配到相关内容，可以更换关键词继续搜索。';
            }
        }
    }
})();
