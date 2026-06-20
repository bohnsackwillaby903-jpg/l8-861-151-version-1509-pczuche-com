(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            mobileToggle.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
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
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    searchInputs.forEach(function (input) {
        var container = input.closest('main') || document;
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        var clearButton = input.parentElement ? input.parentElement.querySelector('[data-clear-search]') : null;

        function applySearch() {
            var value = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();

                card.classList.toggle('hidden-by-search', value && haystack.indexOf(value) === -1);
            });
        }

        input.addEventListener('input', applySearch);

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                applySearch();
                input.focus();
            });
        }
    });

    var filterRows = Array.prototype.slice.call(document.querySelectorAll('[data-filter-row]'));

    filterRows.forEach(function (row) {
        var section = row.closest('main') || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll('.category-movie-grid [data-card]'));
        var chips = Array.prototype.slice.call(row.querySelectorAll('[data-filter-value]'));

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var value = chip.getAttribute('data-filter-value') || 'all';

                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });

                cards.forEach(function (card) {
                    var genre = card.getAttribute('data-genre') || '';
                    card.classList.toggle('hidden-by-filter', value !== 'all' && genre.indexOf(value) === -1);
                });
            });
        });
    });
})();
