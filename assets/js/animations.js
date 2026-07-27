/* ==========================================================================
   Neoteric ERA — Animation Engine
   --------------------------------------------------------------------------
   Intersection Observer drives every entrance. CSS owns the actual motion;
   this file only decides *when* a class is applied and prepares markup that
   CSS cannot generate on its own (split text lines).

   Modules
   01. Reveal observer (with stagger)
   02. Text-line / word splitting
   03. Animated counters
   04. Metric comparison bars
   05. Sticky process stepper
   06. Lazy-loaded image fade-in
   ========================================================================== */

(function () {
    'use strict';

    /* Arm the reveal system.
       ----------------------------------------------------------------------
       animations.css keeps every hidden resting state behind `.has-reveal`, so
       nothing on the page is hidden until this line runs. It is deliberately
       the first statement in the module and sits outside every try/catch:
       until the browser has confirmed it can execute this file, no content is
       allowed to be invisible.

       main.js removes `.no-js` on its own, so that class cannot be relied on
       to cover a failure of THIS file specifically. If animations.js 404s, is
       blocked, or throws on parse, `.has-reveal` is simply never added and the
       whole site renders as static, fully visible HTML. */
    document.documentElement.classList.add('has-reveal');

    const utils = (window.NeotericERA && window.NeotericERA.utils) || {};
    const $  = utils.$  || ((s, c) => (c || document).querySelector(s));
    const $$ = utils.$$ || ((s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s)));

    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasObserver = 'IntersectionObserver' in window;

    /** Reveals everything immediately — used as the universal fallback. */
    function revealAll(selector) {
        $$(selector).forEach((el) => el.classList.add('is-revealed'));
    }

    /* ======================================================================
       01. REVEAL OBSERVER
       ----------------------------------------------------------------------
       Any element carrying a `reveal-*` class is observed once and then
       released. Containers marked `.reveal-stagger` hand incremental delays
       to their revealable children.
       ====================================================================== */

    function initReveals() {
        const items = $$('[class*="reveal-"]:not(.is-revealed)');
        if (!items.length) return;

        if (!hasObserver || reduceMotion()) {
            items.forEach((el) => el.classList.add('is-revealed'));
            return;
        }

        // Assign stagger delays from the container so markup stays clean.
        $$('.reveal-stagger, .reveal-stagger-tight').forEach((group) => {
            const step = group.classList.contains('reveal-stagger-tight') ? 55 : 90;
            const children = $$(':scope > *', group).filter((child) =>
                /(^|\s)reveal-/.test(child.className)
            );

            children.forEach((child, index) => {
                // An author-set delay always wins.
                if (!child.style.getPropertyValue('--reveal-delay')) {
                    child.style.setProperty('--reveal-delay', (index * step) + 'ms');
                }
            });
        });

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                obs.unobserve(entry.target);
            });
        }, {
            // Fires a little before the element edge enters the viewport so
            // motion has already settled by the time it is properly visible.
            rootMargin: '0px 0px -12% 0px',

            // threshold 0, deliberately. A ratio-based threshold is a trap for
            // reveal work: an element taller than the viewport, or one whose
            // rendered area is reduced by its own styling, may never reach a
            // given ratio, and a reveal that never fires leaves content
            // permanently invisible. The rootMargin above already provides the
            // "wait until it is properly on screen" behaviour that a threshold
            // would otherwise be doing.
            threshold: 0
        });

        items.forEach((el) => {
            // Anything already in view on load should not animate in late.
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
                // Still staggered, but started immediately.
                window.requestAnimationFrame(() => el.classList.add('is-revealed'));
                return;
            }
            observer.observe(el);
        });
    }

    /* ======================================================================
       02. TEXT-LINE / WORD SPLITTING
       ----------------------------------------------------------------------
       Splits a heading into visual lines by measuring where words wrap, then
       wraps each line in the clip/slide structure animations.css expects.

       Rules:
         • Only runs on elements whose text has no child elements other than
           inline spans, so markup like <em> is preserved by bailing out.
         • Re-splits on resize (debounced) because line breaks change.
         • The original text is retained so the operation is reversible.
       ====================================================================== */

    function splitLines(element) {
        const original = element.getAttribute('data-original-text') || element.textContent;
        element.setAttribute('data-original-text', original);

        const words = original.trim().split(/\s+/);
        if (!words.length) return;

        // Lay every word out individually so their offsets can be measured.
        element.textContent = '';
        const probes = words.map((word, index) => {
            const span = document.createElement('span');
            span.textContent = word;
            span.style.display = 'inline-block';
            element.appendChild(span);
            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
            return span;
        });

        // Group words by their vertical offset — that is a visual line.
        const lines = [];
        let currentTop = null;
        probes.forEach((probe, index) => {
            const top = probe.offsetTop;
            if (currentTop === null || Math.abs(top - currentTop) > 2) {
                currentTop = top;
                lines.push([]);
            }
            lines[lines.length - 1].push(words[index]);
        });

        // Rebuild as clip-and-slide line structures.
        element.textContent = '';
        lines.forEach((lineWords, index) => {
            const line = document.createElement('span');
            line.className = 'line';

            const inner = document.createElement('span');
            inner.className = 'line__inner';
            inner.textContent = lineWords.join(' ');
            inner.style.setProperty('--line-delay', (index * 90) + 'ms');

            line.appendChild(inner);
            element.appendChild(line);
        });
    }

    function splitWords(element) {
        const original = element.getAttribute('data-original-text') || element.textContent;
        element.setAttribute('data-original-text', original);

        const words = original.trim().split(/\s+/);
        element.textContent = '';

        words.forEach((word, index) => {
            const outer = document.createElement('span');
            outer.className = 'word';

            const inner = document.createElement('span');
            inner.className = 'word__inner';
            inner.textContent = word;
            inner.style.setProperty('--word-delay', (index * 55) + 'ms');

            outer.appendChild(inner);
            element.appendChild(outer);

            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });
    }

    function initTextSplitting() {
        const lineTargets = $$('.reveal-lines');
        const wordTargets = $$('.reveal-words');

        if (!lineTargets.length && !wordTargets.length) return;

        // Reduced motion: leave the text exactly as authored.
        if (reduceMotion()) {
            lineTargets.concat(wordTargets).forEach((el) => el.classList.add('is-revealed'));
            return;
        }

        /** Bail out on anything containing element children we would destroy. */
        function isSafeToSplit(el) {
            return Array.prototype.every.call(el.childNodes, (node) => node.nodeType === 3);
        }

        const safeLineTargets = lineTargets.filter(isSafeToSplit);
        const safeWordTargets = wordTargets.filter(isSafeToSplit);

        // Elements we cannot split still need to become visible.
        lineTargets.filter((el) => !isSafeToSplit(el)).forEach((el) => {
            el.classList.remove('reveal-lines');
            el.classList.add('reveal-up', 'is-revealed');
        });
        wordTargets.filter((el) => !isSafeToSplit(el)).forEach((el) => {
            el.classList.remove('reveal-words');
            el.classList.add('reveal-up', 'is-revealed');
        });

        safeLineTargets.forEach(splitLines);
        safeWordTargets.forEach(splitWords);

        // Re-measure after webfonts land — metrics change the wrap points.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                safeLineTargets.forEach((el) => {
                    if (el.classList.contains('is-revealed')) return;
                    splitLines(el);
                });
            }).catch(() => { /* Font loading API unavailable — ignore. */ });
        }

        let lastWidth = window.innerWidth;
        window.addEventListener('resize', (utils.debounce || ((f) => f))(() => {
            // Only a width change alters line breaks.
            if (window.innerWidth === lastWidth) return;
            lastWidth = window.innerWidth;

            safeLineTargets.forEach((el) => {
                const wasRevealed = el.classList.contains('is-revealed');
                splitLines(el);
                if (wasRevealed) {
                    // Restore the resolved state without replaying the motion.
                    $$('.line__inner', el).forEach((inner) => {
                        inner.style.setProperty('--line-delay', '0ms');
                    });
                    el.classList.add('is-revealed');
                }
            });
        }, 250));
    }

    /* ======================================================================
       03. ANIMATED COUNTERS
       ----------------------------------------------------------------------
       Markup contract:
         <span data-counter="162" data-counter-suffix="%" data-counter-decimals="0">0</span>
       The final value is rendered on load and only then animated, so the
       correct number is present for crawlers and non-JS visitors alike.
       ====================================================================== */

    function formatNumber(value, decimals) {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function runCounter(el) {
        const target = parseFloat(el.getAttribute('data-counter'));
        if (isNaN(target)) return;

        const decimals = parseInt(el.getAttribute('data-counter-decimals'), 10) || 0;
        const prefix = el.getAttribute('data-counter-prefix') || '';
        const suffix = el.getAttribute('data-counter-suffix') || '';
        const duration = parseInt(el.getAttribute('data-counter-duration'), 10) || 1600;

        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);
            // Ease-out cubic — fast start, settled finish.
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + formatNumber(target * eased, decimals) + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(tick);
            } else {
                el.textContent = prefix + formatNumber(target, decimals) + suffix;
            }
        }

        window.requestAnimationFrame(tick);
    }

    function initCounters() {
        const counters = $$('[data-counter]');
        if (!counters.length) return;

        /** Render the resolved value — the honest default state. */
        function setFinal(el) {
            const target = parseFloat(el.getAttribute('data-counter'));
            if (isNaN(target)) return;
            const decimals = parseInt(el.getAttribute('data-counter-decimals'), 10) || 0;
            const prefix = el.getAttribute('data-counter-prefix') || '';
            const suffix = el.getAttribute('data-counter-suffix') || '';
            el.textContent = prefix + formatNumber(target, decimals) + suffix;
        }

        if (!hasObserver || reduceMotion()) {
            counters.forEach(setFinal);
            return;
        }

        counters.forEach(setFinal);

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                runCounter(entry.target);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.4 });

        counters.forEach((el) => observer.observe(el));
    }

    /* ======================================================================
       04. METRIC COMPARISON BARS
       ----------------------------------------------------------------------
       Markup contract: <span class="metric-bar__fill" data-bar="72"></span>
       Value is a percentage of the track width.
       ====================================================================== */

    function initMetricBars() {
        const bars = $$('[data-bar]');
        if (!bars.length) return;

        function fill(el) {
            const value = Math.max(0, Math.min(100, parseFloat(el.getAttribute('data-bar')) || 0));
            el.style.width = value + '%';
        }

        if (!hasObserver || reduceMotion()) {
            bars.forEach(fill);
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                fill(entry.target);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.3 });

        bars.forEach((el) => observer.observe(el));
    }

    /* ======================================================================
       05. STICKY PROCESS STEPPER
       ----------------------------------------------------------------------
       As each step scrolls into the reading zone, the matching image in the
       sticky figure becomes current and the progress rule advances.

       On narrow viewports the sticky column is disabled in CSS; this module
       still runs so the correct image is shown, which is a graceful outcome.
       ====================================================================== */

    function initProcessStepper() {
        const process = $('[data-process]');
        if (!process) return;

        const steps = $$('.process-step', process);
        const figures = $$('.process__figure img', process);
        const progressBar = $('.process__progress-bar', process);
        const label = $('[data-process-label]', process);
        const counter = $('[data-process-counter]', process);

        if (!steps.length) return;

        function activate(index) {
            steps.forEach((step, i) => {
                step.classList.toggle('is-active', i === index);
            });

            figures.forEach((figure, i) => {
                figure.classList.toggle('is-current', i === index);
            });

            if (progressBar) {
                progressBar.style.width = (((index + 1) / steps.length) * 100).toFixed(2) + '%';
            }

            if (label) {
                const title = $('.process-step__title', steps[index]);
                if (title) label.textContent = title.textContent.trim();
            }

            if (counter) {
                counter.textContent = String(index + 1).padStart(2, '0') + ' / ' +
                    String(steps.length).padStart(2, '0');
            }
        }

        activate(0);

        if (!hasObserver) return;

        // A narrow band across the middle of the viewport decides "current".
        const observer = new IntersectionObserver((entries) => {
            // Pick the entry closest to the band centre for stable switching.
            let best = null;
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                if (!best || entry.intersectionRatio > best.intersectionRatio) {
                    best = entry;
                }
            });
            if (!best) return;

            const index = steps.indexOf(best.target);
            if (index > -1) activate(index);
        }, {
            rootMargin: '-40% 0px -40% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        });

        steps.forEach((step) => observer.observe(step));
    }

    /* ======================================================================
       06. LAZY-LOADED IMAGE FADE-IN
       ----------------------------------------------------------------------
       Native `loading="lazy"` handles fetching; this only smooths the paint
       so late-arriving images do not snap into place.
       ====================================================================== */

    function initImageFade() {
        if (reduceMotion()) return;

        // Opt the document in only once this module is definitely running.
        // The CSS fade is gated on this class, so a blocked or failed script
        // can never leave images stuck at opacity 0.
        document.documentElement.classList.add('has-imgfade');

        $$('img[loading="lazy"]').forEach((img) => {
            if (img.complete) {
                img.classList.add('is-loaded');
                return;
            }
            img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
            img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
        });
    }

    /* ======================================================================
       INITIALISATION
       ====================================================================== */

    function safely(name, fn) {
        try {
            fn();
        } catch (error) {
            if (window.console && console.warn) {
                console.warn('[Neoteric ERA] animation module "' + name + '" failed:', error);
            }
            // Never leave content hidden because an animation broke.
            revealAll('[class*="reveal-"]');
        }
    }

    function start() {
        // Text must be split before the reveal observer measures anything.
        safely('textSplitting', initTextSplitting);
        safely('reveals', initReveals);
        safely('counters', initCounters);
        safely('metricBars', initMetricBars);
        safely('processStepper', initProcessStepper);
        safely('imageFade', initImageFade);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // Re-run reveals when new cards are injected (e.g. portfolio filtering).
    window.NeotericERA = window.NeotericERA || {};
    window.NeotericERA.refreshReveals = function () {
        safely('reveals', initReveals);
        safely('counters', initCounters);
    };
})();
