/* ==========================================================================
   Neoteric ERA — Core Interaction Layer
   --------------------------------------------------------------------------
   Every module is independent and guards its own DOM. A page that does not
   contain a given component simply skips that module — no console errors,
   no thrown exceptions, no ordering requirements.

   Modules
   01. Boot / feature detection
   02. Sticky header state
   03. Desktop mega menu
   04. Mobile navigation drawer
   05. Announcement bar
   06. Active navigation state
   07. Back-to-top
   08. Smooth anchor scrolling
   09. FAQ accordion
   10. Testimonial slider
   11. Reading progress
   12. Table of contents
   13. Copy-link / share
   14. Pointer-responsive detail
   15. Custom cursor
   16. Dynamic year & misc
   ========================================================================== */

(function () {
    'use strict';

    /* ======================================================================
       UTILITIES
       ====================================================================== */

    const $  = (selector, scope) => (scope || document).querySelector(selector);
    const $$ = (selector, scope) => Array.prototype.slice.call((scope || document).querySelectorAll(selector));

    const prefersReducedMotion = () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isDesktopNav = () => window.matchMedia('(min-width: 1025px)').matches;

    /** Trailing-edge throttle built on requestAnimationFrame. */
    function rafThrottle(fn) {
        let queued = false;
        return function throttled() {
            if (queued) return;
            queued = true;
            const args = arguments;
            window.requestAnimationFrame(() => {
                queued = false;
                fn.apply(null, args);
            });
        };
    }

    function debounce(fn, wait) {
        let timer = null;
        return function debounced() {
            const args = arguments;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => fn.apply(null, args), wait || 150);
        };
    }

    /** Elements that can receive keyboard focus, for focus trapping. */
    const FOCUSABLE = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    /* Scroll locking is reference-counted so the drawer and any future modal
       cannot unlock each other prematurely. */
    const scrollLock = (function () {
        let depth = 0;
        let savedTop = 0;

        return {
            lock() {
                if (depth === 0) {
                    savedTop = window.scrollY;
                    const barWidth = window.innerWidth - document.documentElement.clientWidth;
                    if (barWidth > 0) {
                        document.body.style.paddingRight = barWidth + 'px';
                    }
                    document.body.classList.add('is-scroll-locked');
                }
                depth += 1;
            },
            unlock() {
                depth = Math.max(0, depth - 1);
                if (depth === 0) {
                    document.body.classList.remove('is-scroll-locked');
                    document.body.style.paddingRight = '';
                    // Restoring position avoids the jump some browsers introduce
                    window.scrollTo({ top: savedTop, behavior: 'auto' });
                }
            }
        };
    })();

    /* ======================================================================
       01. BOOT / FEATURE DETECTION
       ====================================================================== */

    function boot() {
        const root = document.documentElement;
        root.classList.remove('no-js');
        root.classList.add('js');

        if ('IntersectionObserver' in window) {
            root.classList.add('has-io');
        }
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            root.classList.add('has-fine-pointer');
        }
    }

    /* ======================================================================
       02. STICKY HEADER STATE
       ====================================================================== */

    function initHeader() {
        const header = $('.site-header');
        if (!header) return;

        // A page can opt into a permanently solid header; otherwise the header
        // condenses on scroll. Both the transparent-over-dark and the default
        // light modes share this behaviour.
        const alwaysSolid = header.classList.contains('site-header--solid');
        const threshold = 24;

        const update = rafThrottle(() => {
            if (alwaysSolid) return;
            header.classList.toggle('is-condensed', window.scrollY > threshold);
        });

        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    /* ======================================================================
       03. DESKTOP MEGA MENU
       ----------------------------------------------------------------------
       Opens on hover (with a close delay so diagonal mouse paths survive) and
       on click/Enter for keyboard users. Escape closes and returns focus.
       ====================================================================== */

    function initMegaMenu() {
        const items = $$('.primary-nav__item[data-mega]');
        if (!items.length) return;

        const header = $('.site-header');
        let closeTimer = null;
        let openItem = null;

        function panelFor(item) {
            return $('.mega-menu', item);
        }

        function open(item) {
            if (openItem && openItem !== item) close(openItem, { immediate: true });

            const panel = panelFor(item);
            const trigger = $('.primary-nav__link', item);
            if (!panel || !trigger) return;

            window.clearTimeout(closeTimer);
            item.classList.add('is-open');
            panel.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            if (header) header.classList.add('is-mega-open');
            openItem = item;
        }

        function close(item, options) {
            const opts = options || {};
            const panel = panelFor(item);
            const trigger = $('.primary-nav__link', item);
            if (!panel || !trigger) return;

            const doClose = () => {
                item.classList.remove('is-open');
                panel.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
                if (openItem === item) openItem = null;
                if (header && !$('.mega-menu.is-open')) {
                    header.classList.remove('is-mega-open');
                }
            };

            if (opts.immediate) {
                window.clearTimeout(closeTimer);
                doClose();
            } else {
                closeTimer = window.setTimeout(doClose, 180);
            }
        }

        function closeAll(options) {
            items.forEach((item) => close(item, options));
        }

        items.forEach((item) => {
            const trigger = $('.primary-nav__link', item);
            const panel = panelFor(item);
            if (!trigger || !panel) return;

            // Wire up ARIA from markup so the HTML stays declarative.
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-haspopup', 'true');

            item.addEventListener('mouseenter', () => {
                if (isDesktopNav()) open(item);
            });

            item.addEventListener('mouseleave', () => {
                if (isDesktopNav()) close(item);
            });

            // Click toggles — required for touch-capable laptops and keyboards.
            trigger.addEventListener('click', (event) => {
                if (!isDesktopNav()) return;
                event.preventDefault();
                if (item.classList.contains('is-open')) {
                    close(item, { immediate: true });
                } else {
                    open(item);
                }
            });

            // Closing when focus leaves the whole item keeps tab order sane.
            item.addEventListener('focusout', (event) => {
                if (!item.contains(event.relatedTarget)) {
                    close(item, { immediate: true });
                }
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape' || !openItem) return;
            const trigger = $('.primary-nav__link', openItem);
            close(openItem, { immediate: true });
            if (trigger) trigger.focus();
        });

        // A click anywhere outside the navigation dismisses the panel.
        document.addEventListener('click', (event) => {
            if (!openItem) return;
            if (!event.target.closest('.primary-nav__item[data-mega]')) {
                closeAll({ immediate: true });
            }
        });

        window.addEventListener('resize', debounce(() => {
            if (!isDesktopNav()) closeAll({ immediate: true });
        }, 200));
    }

    /* ======================================================================
       04. MOBILE NAVIGATION DRAWER
       ====================================================================== */

    function initMobileNav() {
        const drawer = $('#mobileNav');
        const toggle = $('.nav-toggle');
        if (!drawer || !toggle) return;

        const closeButton = $('.mobile-nav__close', drawer);
        let lastFocused = null;

        function openDrawer() {
            lastFocused = document.activeElement;
            drawer.classList.add('is-open');
            drawer.removeAttribute('aria-hidden');
            toggle.setAttribute('aria-expanded', 'true');
            scrollLock.lock();

            // Move focus into the drawer so screen readers follow the context.
            const target = closeButton || $(FOCUSABLE, drawer);
            if (target) window.setTimeout(() => target.focus(), 60);
        }

        function closeDrawer() {
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            scrollLock.unlock();

            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }
        }

        function isOpen() {
            return drawer.classList.contains('is-open');
        }

        toggle.addEventListener('click', () => {
            if (isOpen()) closeDrawer(); else openDrawer();
        });

        if (closeButton) closeButton.addEventListener('click', closeDrawer);

        // Following any link should dismiss the drawer.
        drawer.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (link && !link.getAttribute('href').startsWith('#')) closeDrawer();
        });

        document.addEventListener('keydown', (event) => {
            if (!isOpen()) return;

            if (event.key === 'Escape') {
                closeDrawer();
                return;
            }

            // Trap focus inside the drawer while it is open.
            if (event.key !== 'Tab') return;
            const focusable = $$(FOCUSABLE, drawer).filter((el) => el.offsetParent !== null);
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        // Returning to desktop width while open would leave a stranded overlay.
        window.addEventListener('resize', debounce(() => {
            if (isOpen() && isDesktopNav()) closeDrawer();
        }, 200));

        initMobileAccordions(drawer);
    }

    /** Accordion submenus inside the mobile drawer. */
    function initMobileAccordions(scope) {
        const triggers = $$('.mobile-nav__trigger', scope);
        if (!triggers.length) return;

        triggers.forEach((trigger) => {
            const panelId = trigger.getAttribute('aria-controls');
            const panel = panelId ? document.getElementById(panelId) : null;
            if (!panel) return;

            trigger.setAttribute('aria-expanded', 'false');

            trigger.addEventListener('click', () => {
                const expanded = trigger.getAttribute('aria-expanded') === 'true';

                // Single-open behaviour keeps the drawer navigable.
                triggers.forEach((other) => {
                    if (other === trigger) return;
                    const otherId = other.getAttribute('aria-controls');
                    const otherPanel = otherId ? document.getElementById(otherId) : null;
                    if (otherPanel) otherPanel.classList.remove('is-open');
                    other.setAttribute('aria-expanded', 'false');
                });

                trigger.setAttribute('aria-expanded', String(!expanded));
                panel.classList.toggle('is-open', !expanded);
            });
        });
    }

    /* ======================================================================
       05. ANNOUNCEMENT BAR
       ----------------------------------------------------------------------
       Dismissal persists for the session only, so returning visitors still
       see campaign messaging on a later visit.
       ====================================================================== */

    function initAnnouncementBar() {
        const bar = $('.topbar');
        if (!bar) return;

        const close = $('.topbar__close', bar);
        const KEY = 'ne-topbar-dismissed';

        let dismissed = false;
        try {
            dismissed = window.sessionStorage.getItem(KEY) === '1';
        } catch (error) {
            // Private browsing modes can throw on storage access — ignore.
            dismissed = false;
        }

        if (dismissed) {
            bar.hidden = true;
            return;
        }

        if (!close) return;

        close.addEventListener('click', () => {
            bar.hidden = true;
            try {
                window.sessionStorage.setItem(KEY, '1');
            } catch (error) {
                /* Storage unavailable — dismissal simply does not persist. */
            }
        });
    }

    /* ======================================================================
       06. ACTIVE NAVIGATION STATE
       ----------------------------------------------------------------------
       Pages set `aria-current="page"` in their own markup. This pass is a
       safety net for template pages reached via a differently named file.
       ====================================================================== */

    function initActiveNav() {
        const current = window.location.pathname.split('/').pop() || 'index.html';

        $$('.primary-nav__link[href], .mobile-nav__link[href]').forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            const target = href.split('/').pop().split('#')[0].split('?')[0];
            if (target && target === current && !link.hasAttribute('aria-current')) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    /* ======================================================================
       07. BACK-TO-TOP
       ====================================================================== */

    function initBackToTop() {
        const button = $('.back-to-top');
        if (!button) return;

        const update = rafThrottle(() => {
            button.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
        });

        update();
        window.addEventListener('scroll', update, { passive: true });

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
            // Return focus to the top of the document for keyboard users.
            const skip = $('.skip-link');
            if (skip) skip.focus({ preventScroll: true });
        });
    }

    /* ======================================================================
       08. SMOOTH ANCHOR SCROLLING
       ----------------------------------------------------------------------
       CSS `scroll-behavior` handles most cases; this exists to apply the
       sticky-header offset and to move focus for accessibility.
       ====================================================================== */

    function initAnchorScroll() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (!link) return;

            const id = link.getAttribute('href');
            if (!id || id === '#' || id.length < 2) return;

            // Never hijack Bootstrap's own toggles.
            if (link.hasAttribute('data-bs-toggle')) return;

            let target;
            try {
                target = document.querySelector(id);
            } catch (error) {
                return; // Not a valid selector — let the browser handle it.
            }
            if (!target) return;

            event.preventDefault();

            const header = $('.site-header');
            const offset = (header ? header.offsetHeight : 0) + 20;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: Math.max(0, top),
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });

            // Make the destination focusable without adding a permanent tabstop.
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: true });

            if (history.pushState) history.pushState(null, '', id);
        });
    }

    /* ======================================================================
       09. FAQ ACCORDION
       ----------------------------------------------------------------------
       Progressive enhancement over semantic button + region markup. Panels
       are open in the DOM by default so answers remain indexable if JS fails.
       ====================================================================== */

    function initAccordions() {
        const groups = $$('.faq-accordion');
        if (!groups.length) return;

        groups.forEach((group) => {
            const triggers = $$('.faq-item__trigger', group);
            // `data-multiple` allows several panels open at once.
            const allowMultiple = group.hasAttribute('data-multiple');

            triggers.forEach((trigger, index) => {
                const panelId = trigger.getAttribute('aria-controls');
                const panel = panelId ? document.getElementById(panelId) : null;
                if (!panel) return;

                // First item may be pre-opened via data-open in the markup.
                const startOpen = trigger.hasAttribute('data-open');
                trigger.setAttribute('aria-expanded', String(startOpen));
                panel.classList.toggle('is-open', startOpen);

                trigger.addEventListener('click', () => {
                    const expanded = trigger.getAttribute('aria-expanded') === 'true';

                    if (!allowMultiple) {
                        triggers.forEach((other) => {
                            if (other === trigger) return;
                            const otherId = other.getAttribute('aria-controls');
                            const otherPanel = otherId ? document.getElementById(otherId) : null;
                            if (otherPanel) otherPanel.classList.remove('is-open');
                            other.setAttribute('aria-expanded', 'false');
                        });
                    }

                    trigger.setAttribute('aria-expanded', String(!expanded));
                    panel.classList.toggle('is-open', !expanded);
                });

                // Arrow-key traversal between questions.
                trigger.addEventListener('keydown', (event) => {
                    let next = null;
                    if (event.key === 'ArrowDown') next = triggers[index + 1];
                    else if (event.key === 'ArrowUp') next = triggers[index - 1];
                    else if (event.key === 'Home') next = triggers[0];
                    else if (event.key === 'End') next = triggers[triggers.length - 1];

                    if (next) {
                        event.preventDefault();
                        next.focus();
                    }
                });
            });
        });
    }

    /* ======================================================================
       10. TESTIMONIAL SLIDER
       ----------------------------------------------------------------------
       Transform-based track with previous/next, dots, keyboard, touch swipe,
       autoplay that pauses on hover and focus, and full reduced-motion
       compliance (autoplay never starts when motion is reduced).
       ====================================================================== */

    function initTestimonialSlider() {
        const slider = $('.testimonial-slider');
        if (!slider) return;

        const track = $('.testimonial-track', slider);
        const slides = $$('.testimonial-slide', slider);
        if (!track || slides.length < 1) return;

        const prevButton = $('[data-slider-prev]', slider);
        const nextButton = $('[data-slider-next]', slider);
        const dots = $$('.slider-dot', slider);
        const currentOut = $('[data-slider-current]', slider);
        const totalOut = $('[data-slider-total]', slider);
        const live = $('[data-slider-live]', slider);

        const AUTOPLAY_MS = 7000;
        let index = 0;
        let timer = null;
        let paused = false;

        if (totalOut) totalOut.textContent = String(slides.length);

        function render() {
            track.style.transform = 'translate3d(-' + index * 100 + '%, 0, 0)';

            slides.forEach((slide, i) => {
                const active = i === index;
                // Inert slides must not be reachable by keyboard.
                slide.setAttribute('aria-hidden', String(!active));
                $$(FOCUSABLE, slide).forEach((el) => {
                    if (active) el.removeAttribute('tabindex');
                    else el.setAttribute('tabindex', '-1');
                });
            });

            dots.forEach((dot, i) => {
                dot.setAttribute('aria-selected', String(i === index));
                dot.setAttribute('tabindex', i === index ? '0' : '-1');
            });

            if (currentOut) currentOut.textContent = String(index + 1);
            if (live) live.textContent = 'Testimonial ' + (index + 1) + ' of ' + slides.length;
        }

        function goTo(next) {
            const count = slides.length;
            index = ((next % count) + count) % count;
            render();
        }

        const next = () => goTo(index + 1);
        const prev = () => goTo(index - 1);

        function startAutoplay() {
            // Autoplay is a motion effect — respect the user's preference.
            if (prefersReducedMotion() || slides.length < 2) return;
            stopAutoplay();
            timer = window.setInterval(() => {
                if (!paused && !document.hidden) next();
            }, AUTOPLAY_MS);
        }

        function stopAutoplay() {
            if (timer) window.clearInterval(timer);
            timer = null;
        }

        if (nextButton) nextButton.addEventListener('click', () => { next(); startAutoplay(); });
        if (prevButton) prevButton.addEventListener('click', () => { prev(); startAutoplay(); });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
        });

        // Keyboard: arrow keys traverse when focus is inside the slider.
        slider.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
            else if (event.key === 'ArrowLeft') { event.preventDefault(); prev(); }
        });

        // Pause on hover and while focus sits inside the component.
        slider.addEventListener('mouseenter', () => { paused = true; });
        slider.addEventListener('mouseleave', () => { paused = false; });
        slider.addEventListener('focusin', () => { paused = true; });
        slider.addEventListener('focusout', (event) => {
            if (!slider.contains(event.relatedTarget)) paused = false;
        });

        // Touch swipe — horizontal intent only, so vertical scrolling is safe.
        let startX = 0;
        let startY = 0;
        let swiping = false;

        slider.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            swiping = true;
            paused = true;
        }, { passive: true });

        slider.addEventListener('touchend', (event) => {
            if (!swiping) return;
            swiping = false;
            paused = false;

            const touch = event.changedTouches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;

            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) next(); else prev();
                startAutoplay();
            }
        }, { passive: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoplay(); else startAutoplay();
        });

        render();
        startAutoplay();
    }

    /* ======================================================================
       11. READING PROGRESS
       ====================================================================== */

    function initReadingProgress() {
        const bar = $('.reading-progress__bar');
        const article = $('[data-reading-target]');
        if (!bar || !article) return;

        const update = rafThrottle(() => {
            const rect = article.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            if (total <= 0) {
                bar.style.width = '100%';
                return;
            }
            const progress = Math.min(1, Math.max(0, -rect.top / total));
            bar.style.width = (progress * 100).toFixed(2) + '%';
        });

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', debounce(update, 150));
    }

    /* ======================================================================
       12. TABLE OF CONTENTS
       ----------------------------------------------------------------------
       Builds itself from the article's own headings so authors never maintain
       the list by hand, then highlights the section currently in view.
       ====================================================================== */

    function initTableOfContents() {
        const toc = $('[data-toc]');
        const article = $('[data-reading-target]');
        if (!toc || !article) return;

        const list = $('.toc__list', toc) || toc;
        const headings = $$('h2[id], h3[id]', article);

        if (!headings.length) {
            toc.hidden = true;
            return;
        }

        // Build the list.
        const fragment = document.createDocumentFragment();
        headings.forEach((heading) => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent.trim();
            if (heading.tagName === 'H3') {
                link.style.paddingLeft = '1.6rem';
            }
            item.appendChild(link);
            fragment.appendChild(item);
        });
        list.innerHTML = '';
        list.appendChild(fragment);

        const links = $$('a', list);

        if (!('IntersectionObserver' in window)) return;

        // A negative top margin biases "current" toward the heading that has
        // just passed under the sticky header.
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                links.forEach((link) => {
                    link.classList.toggle('is-current', link.getAttribute('href') === '#' + id);
                });
            });
        }, {
            rootMargin: '-25% 0px -70% 0px',
            threshold: 0
        });

        headings.forEach((heading) => observer.observe(heading));
    }

    /* ======================================================================
       13. COPY-LINK / SHARE
       ====================================================================== */

    function initShare() {
        $$('[data-share]').forEach((button) => {
            const network = button.getAttribute('data-share');

            button.addEventListener('click', async () => {
                const url = window.location.href;
                const title = document.title;

                if (network === 'copy') {
                    const original = button.getAttribute('aria-label') || 'Copy link';
                    try {
                        await navigator.clipboard.writeText(url);
                        button.setAttribute('aria-label', 'Link copied');
                        button.classList.add('is-copied');
                    } catch (error) {
                        // Clipboard API needs a secure context; fall back quietly.
                        button.setAttribute('aria-label', 'Copy unavailable — select the address bar');
                    }
                    window.setTimeout(() => {
                        button.setAttribute('aria-label', original);
                        button.classList.remove('is-copied');
                    }, 2400);
                    return;
                }

                if (network === 'native') {
                    if (navigator.share) {
                        try {
                            await navigator.share({ title: title, url: url });
                        } catch (error) {
                            /* User dismissed the share sheet. */
                        }
                    }
                    return;
                }

                const targets = {
                    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
                    x: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title),
                    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)
                };

                if (targets[network]) {
                    window.open(targets[network], '_blank', 'noopener,noreferrer,width=640,height=560');
                }
            });
        });
    }

    /* ======================================================================
       14. POINTER-RESPONSIVE DETAIL
       ----------------------------------------------------------------------
       Publishes normalised pointer offsets as CSS custom properties. CSS
       decides what (if anything) to do with them.
       ====================================================================== */

    function initPointerParallax() {
        if (prefersReducedMotion()) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const scopes = $$('[data-pointer-scope]');
        if (!scopes.length) return;

        scopes.forEach((scope) => {
            const strength = parseFloat(scope.getAttribute('data-pointer-strength')) || 18;

            const onMove = rafThrottle((event) => {
                const rect = scope.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                scope.style.setProperty('--pointer-x', (x * strength).toFixed(2) + 'px');
                scope.style.setProperty('--pointer-y', (y * strength).toFixed(2) + 'px');
            });

            scope.addEventListener('mousemove', onMove);
            scope.addEventListener('mouseleave', () => {
                scope.style.setProperty('--pointer-x', '0px');
                scope.style.setProperty('--pointer-y', '0px');
            });
        });
    }

    /* ======================================================================
       15. CUSTOM CURSOR
       ----------------------------------------------------------------------
       A single accent dot that grows into a ring over interactive targets.
       Desktop-only, disabled under reduced-motion, and purely decorative.
       ====================================================================== */

    function initCursor() {
        if (prefersReducedMotion()) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.innerWidth < 1025) return;

        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dot);

        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;
        let running = false;

        function frame() {
            // Light easing keeps the dot from feeling glued to the pointer.
            x += (targetX - x) * 0.2;
            y += (targetY - y) * 0.2;
            dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, 0) translate(-50%, -50%)';

            if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1) {
                window.requestAnimationFrame(frame);
            } else {
                running = false;
            }
        }

        document.addEventListener('mousemove', (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
            dot.classList.add('is-active');
            if (!running) {
                running = true;
                window.requestAnimationFrame(frame);
            }
        }, { passive: true });

        document.addEventListener('mouseleave', () => dot.classList.remove('is-active'));

        // Event delegation — no per-element listeners.
        document.addEventListener('mouseover', (event) => {
            const interactive = event.target.closest('a, button, [role="button"], input, select, textarea, .filter-chip');
            dot.classList.toggle('is-hovering', Boolean(interactive));
        }, { passive: true });
    }

    /* ======================================================================
       16. DYNAMIC YEAR & MISC
       ====================================================================== */

    function initMisc() {
        // Copyright year
        $$('[data-current-year]').forEach((el) => {
            el.textContent = String(new Date().getFullYear());
        });

        // External links get safe rel attributes automatically.
        $$('a[target="_blank"]').forEach((link) => {
            const rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
            if (rel.indexOf('noopener') === -1) rel.push('noopener');
            if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
            link.setAttribute('rel', rel.join(' '));
        });

        // Shorten the header CTA on very narrow viewports.
        const cta = $('[data-cta-responsive]');
        if (cta) {
            const long = cta.getAttribute('data-label-long') || cta.textContent.trim();
            const short = cta.getAttribute('data-label-short') || long;

            const applyLabel = () => {
                cta.textContent = window.innerWidth < 480 ? short : long;
            };

            applyLabel();
            window.addEventListener('resize', debounce(applyLabel, 200));
        }
    }

    /* ======================================================================
       INITIALISATION
       ----------------------------------------------------------------------
       Each module is wrapped so a failure in one cannot prevent the rest of
       the page from becoming interactive.
       ====================================================================== */

    function safely(name, fn) {
        try {
            fn();
        } catch (error) {
            // Surfaced for developers without breaking the visitor experience.
            if (window.console && console.warn) {
                console.warn('[Neoteric ERA] ' + name + ' failed to initialise:', error);
            }
        }
    }

    function start() {
        safely('boot', boot);
        safely('header', initHeader);
        safely('megaMenu', initMegaMenu);
        safely('mobileNav', initMobileNav);
        safely('announcementBar', initAnnouncementBar);
        safely('activeNav', initActiveNav);
        safely('backToTop', initBackToTop);
        safely('anchorScroll', initAnchorScroll);
        safely('accordions', initAccordions);
        safely('testimonialSlider', initTestimonialSlider);
        safely('readingProgress', initReadingProgress);
        safely('tableOfContents', initTableOfContents);
        safely('share', initShare);
        safely('pointerParallax', initPointerParallax);
        safely('cursor', initCursor);
        safely('misc', initMisc);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    /* Expose a tiny namespace for the other modules to share utilities. */
    window.NeotericERA = window.NeotericERA || {};
    window.NeotericERA.utils = {
        $: $,
        $$: $$,
        rafThrottle: rafThrottle,
        debounce: debounce,
        prefersReducedMotion: prefersReducedMotion,
        scrollLock: scrollLock
    };
})();
