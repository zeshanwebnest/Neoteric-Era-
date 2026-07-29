/* ==========================================================================
   Neoteric ERA — Portfolio & Case-Study Filtering
   --------------------------------------------------------------------------
   Design decision: the cards are written into the HTML, not generated here.
   A JavaScript-rendered grid would leave the portfolio invisible to crawlers
   and to visitors with scripts blocked — unacceptable for the pages most
   likely to be linked and shared.

   This module therefore *filters existing DOM* using data attributes:

     <article class="project-card"
              data-category="website-development ecommerce"
              data-technology="wordpress woocommerce"
              data-industry="healthcare"
              data-type="new-build">

   Filters combine with AND across groups and OR within a group.

   `PORTFOLIO_PROJECTS` at the foot of this file is the machine-readable
   mirror of that markup. It exists so the spreadsheet import has an obvious
   target shape and so a future CMS migration is mechanical.
   ========================================================================== */

(function () {
    'use strict';

    const utils = (window.NeotericERA && window.NeotericERA.utils) || {};
    const $  = utils.$  || ((s, c) => (c || document).querySelector(s));
    const $$ = utils.$$ || ((s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s)));

    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ======================================================================
       FILTER CONTROLLER
       ====================================================================== */

    function initFilter(root) {
        const grid = $('[data-filter-grid]', root);
        if (!grid) return;

        const cards = $$('.work-card, .project-card, [data-category], [data-industry], [data-technology], [data-platform], [data-sector]', grid);
        if (!cards.length) return;

        const chips = $$('.filter-chip[data-filter-group]', root);
        const selects = $$('.filter-select[data-filter-group]', root);
        const resetButton = $('[data-filter-reset]', root);
        const emptyState = $('[data-filter-empty]', root);
        const statusOut = $('[data-filter-status]', root);
        const countOut = $$('[data-filter-count]', root);

        /* Active selection per group. 'all' means "no constraint". */
        const state = {};

        function groupsInUse() {
            const groups = {};
            chips.forEach((chip) => { groups[chip.getAttribute('data-filter-group')] = true; });
            selects.forEach((sel) => { groups[sel.getAttribute('data-filter-group')] = true; });
            return Object.keys(groups);
        }

        groupsInUse().forEach((group) => { state[group] = 'all'; });

        /** Tokens a card exposes for a given group. */
        function cardTokens(card, group) {
            const raw = card.getAttribute('data-' + group) || '';
            return raw.toLowerCase().split(/\s+/).filter(Boolean);
        }

        function cardMatches(card) {
            return Object.keys(state).every((group) => {
                const value = state[group];
                if (!value || value === 'all') return true;
                return cardTokens(card, group).indexOf(value.toLowerCase()) > -1;
            });
        }

        /** Count of visible cards under a hypothetical selection. */
        function countFor(group, value) {
            const trial = Object.assign({}, state);
            trial[group] = value;

            return cards.filter((card) =>
                Object.keys(trial).every((key) => {
                    const v = trial[key];
                    if (!v || v === 'all') return true;
                    return cardTokens(card, key).indexOf(v.toLowerCase()) > -1;
                })
            ).length;
        }

        function syncControls() {
            chips.forEach((chip) => {
                const group = chip.getAttribute('data-filter-group');
                const value = chip.getAttribute('data-filter-value');
                const active = state[group] === value;

                chip.setAttribute('aria-pressed', String(active));
                chip.classList.toggle('is-active', active);

                // Live counts help visitors avoid dead-end combinations.
                const counter = $('.filter-chip__count', chip);
                if (counter) counter.textContent = '(' + countFor(group, value) + ')';
            });

            selects.forEach((select) => {
                const group = select.getAttribute('data-filter-group');
                if (select.value !== state[group]) select.value = state[group];
            });

            const anyActive = Object.keys(state).some((group) => state[group] !== 'all');
            if (resetButton) {
                resetButton.hidden = !anyActive;
            }
        }

        function apply(options) {
            const opts = options || {};
            const instant = opts.instant || reduceMotion();

            let visible = 0;

            cards.forEach((card) => {
                const shouldShow = cardMatches(card);
                if (shouldShow) visible += 1;

                if (instant) {
                    card.classList.toggle('is-hidden', !shouldShow);
                    card.classList.remove('is-filtering-out');
                    return;
                }

                if (shouldShow) {
                    card.classList.remove('is-hidden');
                    // Next frame so the browser registers the display change
                    // before the opacity transition begins.
                    window.requestAnimationFrame(() => {
                        card.classList.remove('is-filtering-out');
                    });
                } else if (!card.classList.contains('is-hidden')) {
                    card.classList.add('is-filtering-out');
                    window.setTimeout(() => {
                        if (!cardMatches(card)) card.classList.add('is-hidden');
                    }, 260);
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }

            // Announce the result set to assistive technology.
            if (statusOut) {
                statusOut.textContent = visible === 0
                    ? 'No projects match the selected filters.'
                    : 'Showing ' + visible + ' of ' + cards.length + ' projects.';
            }

            countOut.forEach((el) => { el.textContent = String(visible); });

            syncControls();
        }

        /* --- Events ------------------------------------------------------ */

        // Event delegation: one listener covers every chip, including any
        // added later by a CMS or pagination.
        root.addEventListener('click', (event) => {
            const chip = event.target.closest('.filter-chip[data-filter-group]');
            if (!chip || !root.contains(chip)) return;

            const group = chip.getAttribute('data-filter-group');
            const value = chip.getAttribute('data-filter-value');

            // Clicking the active chip clears that group.
            state[group] = (state[group] === value && value !== 'all') ? 'all' : value;
            apply();
        });

        selects.forEach((select) => {
            select.addEventListener('change', () => {
                state[select.getAttribute('data-filter-group')] = select.value;
                apply();
            });
        });

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                Object.keys(state).forEach((group) => { state[group] = 'all'; });
                apply();

                // Return focus to the first chip so keyboard users stay oriented.
                const first = chips[0];
                if (first) first.focus();
            });
        }

        /* --- Deep linking ----------------------------------------------- */
        // ?category=ecommerce pre-selects a filter, so campaign links and
        // internal cross-links can land on a filtered view.
        const params = new URLSearchParams(window.location.search);
        Object.keys(state).forEach((group) => {
            const value = params.get(group);
            if (value) state[group] = value;
        });

        apply({ instant: true });
    }

    /* ======================================================================
       BLOG / GENERIC SEARCH + CATEGORY FILTER
       ----------------------------------------------------------------------
       Reused on blog.html. Matches a text query against a card's searchable
       text and combines it with the category chips.
       ====================================================================== */

    function initSearchFilter(root) {
        const grid = $('[data-search-grid]', root);
        const input = $('[data-search-input]', root);
        if (!grid) return;

        const items = $$('[data-search-text]', grid);
        if (!items.length) return;

        const chips = $$('.filter-chip[data-search-category]', root);
        const emptyState = $('[data-search-empty]', root);
        const statusOut = $('[data-search-status]', root);

        let query = '';
        let category = 'all';

        function apply() {
            let visible = 0;
            const needle = query.trim().toLowerCase();

            items.forEach((item) => {
                const text = (item.getAttribute('data-search-text') || '').toLowerCase();
                const cats = (item.getAttribute('data-search-category') || '').toLowerCase();

                const matchesQuery = !needle || text.indexOf(needle) > -1;
                const matchesCategory = category === 'all' || cats.indexOf(category.toLowerCase()) > -1;
                const show = matchesQuery && matchesCategory;

                item.classList.toggle('is-hidden', !show);
                if (show) visible += 1;
            });

            chips.forEach((chip) => {
                const active = chip.getAttribute('data-search-category') === category;
                chip.setAttribute('aria-pressed', String(active));
                chip.classList.toggle('is-active', active);
            });

            if (emptyState) emptyState.classList.toggle('is-visible', visible === 0);

            if (statusOut) {
                statusOut.textContent = visible === 0
                    ? 'No articles match your search.'
                    : 'Showing ' + visible + ' of ' + items.length + ' articles.';
            }
        }

        if (input) {
            input.addEventListener('input', (utils.debounce || ((f) => f))(() => {
                query = input.value;
                apply();
            }, 180));

            // Enter must not submit and reload the static page.
            const form = input.closest('form');
            if (form) {
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    query = input.value;
                    apply();
                });
            }
        }

        root.addEventListener('click', (event) => {
            const chip = event.target.closest('.filter-chip[data-search-category]');
            if (!chip || !root.contains(chip)) return;
            category = chip.getAttribute('data-search-category');
            apply();
        });

        apply();
    }

    /* ======================================================================
       INITIALISATION
       ====================================================================== */

    function start() {
        try {
            $$('[data-filter-root]').forEach(initFilter);
        } catch (error) {
            if (window.console && console.warn) {
                console.warn('[Neoteric ERA] portfolio filter failed:', error);
            }
            // Failure must never hide work — reveal every card.
            $$('.work-card, .project-card').forEach((card) => {
                card.classList.remove('is-hidden', 'is-filtering-out');
            });
        }

        try {
            $$('[data-search-root]').forEach(initSearchFilter);
        } catch (error) {
            if (window.console && console.warn) {
                console.warn('[Neoteric ERA] search filter failed:', error);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    /* ======================================================================
       PORTFOLIO DATA MIRROR
       ----------------------------------------------------------------------
       The machine-readable twin of the cards in portfolio.html. Every entry
       is a real, live client site; `image` points at a screenshot captured
       from that site, and `liveUrl` is the site itself.

       Nothing here renders. It exists so the spreadsheet import has an
       obvious target shape, and so a future CMS migration is mechanical:
       this array becomes the content collection and the cards become a loop.

       GENERATED by gen-portfolio2.sh from the same source rows as the markup.
       Regenerate rather than hand-edit, or the two will drift.
       ====================================================================== */

    const PORTFOLIO_PROJECTS = [
        {
            title: 'Workstaff360',
            slug: 'workstaff360',
            platform: 'wordpress',
            sector: 'staffing',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Virtual assistant platform with talent-solution and sector pages, built to scale.|1',
            image: 'assets/images/work/workstaff360.webp',
            liveUrl: 'https://workstaff360.com/'
        },
        {
            title: 'Electric Miles',
            slug: 'electricmiles',
            platform: 'wordpress',
            sector: 'clean-energy',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'EV charging operations platform marketed to operators, installers and drivers at once.|1',
            image: 'assets/images/work/electricmiles.webp',
            liveUrl: 'https://electricmiles.com/'
        },
        {
            title: 'Corva Plumbing and Heating',
            slug: 'corva',
            platform: 'wordpress',
            sector: 'home-services',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'North Wales trade site with a genuine page for every town it serves.|1',
            image: 'assets/images/work/corva.webp',
            liveUrl: 'https://corva.co.uk/'
        },
        {
            title: 'Titan Landscape Improvement',
            slug: 'titan-landscape',
            platform: 'wordpress',
            sector: 'home-services',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Landscaping contractor site built around a single free-quote path.|1',
            image: 'assets/images/work/titan-landscape.webp',
            liveUrl: 'https://titanlandscapeimprovement.com/'
        },
        {
            title: 'Quranio Academy',
            slug: 'quranio',
            platform: 'wordpress',
            sector: 'education',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Online academy with course selection and a trial signup form in the hero.|1',
            image: 'assets/images/work/quranio.webp',
            liveUrl: 'https://quranio.com/'
        },
        {
            title: 'iTechSole',
            slug: 'itechsole',
            platform: 'wordpress',
            sector: 'marketing',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Growth-systems consultancy site with one consultation CTA and no dead ends.|1',
            image: 'assets/images/work/itechsole.webp',
            liveUrl: 'https://itechsole.com/'
        },
        {
            title: 'Micro Data Technologies',
            slug: 'microdata-technologies',
            platform: 'wordpress',
            sector: 'marketing',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Social media agency site led by proof points rather than by service lists.|1',
            image: 'assets/images/work/microdata-technologies.webp',
            liveUrl: 'https://microdatatechnologies.com/'
        },
        {
            title: 'Step Up',
            slug: 'step-up',
            platform: 'wordpress',
            sector: 'sustainability',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Sustainability venture with a business-model and media-led content structure.|1',
            image: 'assets/images/work/step-up.webp',
            liveUrl: 'https://step-up.earth/'
        },
        {
            title: 'Islamic Schoolers',
            slug: 'islamic-schoolers',
            platform: 'wordpress',
            sector: 'education',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Online homeschooling platform with admissions journeys and an integrated shop.|1',
            image: 'assets/images/work/islamic-schoolers.webp',
            liveUrl: 'https://islamicschoolers.com/'
        },
        {
            title: 'Pak Report',
            slug: 'pak-report',
            platform: 'wordpress',
            sector: 'media',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Urdu news platform built for publishing volume and fast category browsing.|1',
            image: 'assets/images/work/pak-report.webp',
            liveUrl: 'https://pakreport.pk/'
        },
        {
            title: 'Sabaku Tours',
            slug: 'sabaku-tours',
            platform: 'wordpress',
            sector: 'travel',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Multilingual Morocco tour operator with itinerary and excursion templates.|1',
            image: 'assets/images/work/sabaku-tours.webp',
            liveUrl: 'https://sabakutours.com/'
        },
        {
            title: 'Easy Boba',
            slug: 'easy-boba',
            platform: 'wordpress',
            sector: 'food-beverage',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Boba franchise site combining a store locator with a franchise enquiry flow.|1',
            image: 'assets/images/work/easy-boba.webp',
            liveUrl: 'https://easyboba.in/'
        },
        {
            title: 'SheSecure',
            slug: 'shesecure',
            platform: 'wordpress',
            sector: 'technology',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Women\'s health vending technology, with product, CSR and how-it-works sections.|1',
            image: 'assets/images/work/shesecure.webp',
            liveUrl: 'https://shesecure.co.in/'
        },
        {
            title: 'Shreeji Bottle',
            slug: 'shreejii-bottle',
            platform: 'wordpress',
            sector: 'manufacturing',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Fifty-year-old glass manufacturer with a specification-led product catalogue.|1',
            image: 'assets/images/work/shreejii-bottle.webp',
            liveUrl: 'https://shreejiibottle.in/'
        },
        {
            title: 'Clear Ear',
            slug: 'clear-ear-services',
            platform: 'wordpress',
            sector: 'healthcare',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'At-home ear wax removal clinic where booking is the only call to action.|1',
            image: 'assets/images/work/clear-ear-services.webp',
            liveUrl: 'https://clearearservices.co.uk/'
        },
        {
            title: 'Dr Vivek Gaur',
            slug: 'dr-vivek-gaur',
            platform: 'wordpress',
            sector: 'healthcare',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Dental implant specialist site built around one high-intent treatment.|1',
            image: 'assets/images/work/dr-vivek-gaur.webp',
            liveUrl: 'https://www.doctorvivekgaur.com/'
        },
        {
            title: 'Doctor Lavine',
            slug: 'doctor-lavine',
            platform: 'wordpress',
            sector: 'healthcare',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Therapy practice site with specialty, therapy and resource sections.|1',
            image: 'assets/images/work/doctor-lavine.webp',
            liveUrl: 'https://doctorlavine.com/'
        },
        {
            title: 'Tambi',
            slug: 'tambi',
            platform: 'wordpress',
            sector: 'food-beverage',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Coffee shop brand site with a menu and a strongly art-directed identity.|1',
            image: 'assets/images/work/tambi.webp',
            liveUrl: 'https://tambi.in/'
        },
        {
            title: 'Autofocuss',
            slug: 'autofocuss',
            platform: 'wordpress',
            sector: 'marketing',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Growth consultancy with an ROI simulator and niche-specific journeys.|1',
            image: 'assets/images/work/autofocuss.webp',
            liveUrl: 'https://autofocuss.com/'
        },
        {
            title: 'Nazir Estate',
            slug: 'nazir-estate',
            platform: 'wordpress',
            sector: 'real-estate',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Lahore property agency covering plots, rentals and housing projects.|1',
            image: 'assets/images/work/nazir-estate.webp',
            liveUrl: 'https://nazirestate.com/'
        },
        {
            title: 'Personal Injury Law Firm',
            slug: 'advokat-dolda-fel',
            platform: 'wordpress',
            sector: 'legal',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'SEO-driven legal website built to generate consistent organic case enquiries.|1',
            image: 'assets/images/work/advokat-dolda-fel.webp',
            liveUrl: 'https://advokatdoldafel.se/'
        },
        {
            title: 'Sapphire Hair',
            slug: 'sapphire-hair',
            platform: 'shopify',
            sector: 'ecommerce',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Canadian hair extension storefront with category-led navigation.|1',
            image: 'assets/images/work/sapphire-hair.webp',
            liveUrl: 'https://sapphire-hair.ca/'
        },
        {
            title: 'EcoPure Reinigungen',
            slug: 'ecopure-reinigungen',
            platform: 'shopify',
            sector: 'home-services',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Basel cleaning service with a photo-based instant quote flow.|1',
            image: 'assets/images/work/ecopure-reinigungen.webp',
            liveUrl: 'https://ecopure-reinigungen.ch/'
        },
        {
            title: 'Daniel Raz Coaching',
            slug: 'daniel-raz-coaching',
            platform: 'shopify',
            sector: 'health-fitness',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Coaching funnel built around a low-ticket entry offer.|1',
            image: 'assets/images/work/daniel-raz-coaching.webp',
            liveUrl: 'https://danielrazcoaching.com/'
        },
        {
            title: 'Family Law Website',
            slug: 'family-law-website',
            platform: 'wordpress',
            sector: 'legal',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Modern website redesign focused on improving trust, local visibility, and consultation bookings.|1',
            image: 'assets/images/work/family-law-website.webp',
            liveUrl: 'https://advantage.se/'
        },
        {
            title: 'Criminal Defense Firm',
            slug: 'criminal-defense-firm',
            platform: 'custom',
            sector: 'legal',
            technology: ['laravel', 'php', 'mysql'],
            summary: 'Conversion-focused website with Google Ads landing pages designed for high-intent legal searches.|1',
            image: 'assets/images/work/criminal-defense-firm.webp',
            liveUrl: 'https://www.opsahllaw.com/'
        },
        {
            title: 'Estate Planning Law Firm',
            slug: 'estate-planning-law-firm',
            platform: 'wordpress',
            sector: 'legal',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Professional legal website designed to educate prospective clients and increase appointment requests.|1',
            image: 'assets/images/work/estate-planning-law-firm.webp',
            liveUrl: 'https://zallp.com/'
        },
        {
            title: 'Immigration Law Firm',
            slug: 'immigration-law-firm',
            platform: 'custom',
            sector: 'legal',
            technology: ['laravel', 'php', 'mysql'],
            summary: 'Multilingual legal website supported by local SEO and AI-assisted content workflows.|1',
            image: 'assets/images/work/immigration-law-firm.webp',
            liveUrl: 'https://darianlaw.com/aosdiscovery.html'
        },
        {
            title: 'Corporate Law Practice',
            slug: 'corporate-law-practice',
            platform: 'wordpress',
            sector: 'legal',
            technology: ['wordpress', 'php', 'javascript'],
            summary: 'Professional branding, technical SEO, and ongoing law firm internet marketing strategy for long-term growth.|1',
            image: 'assets/images/work/corporate-law-practice.webp',
            liveUrl: 'https://www.winwinlawfirm.com/'
        },
        {
            title: '1105 Social',
            slug: '1105social',
            platform: 'shopify',
            sector: 'ecommerce',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Lifestyle brand storefront with a curated collection structure.|0',
            image: 'assets/images/work/1105social.webp',
            liveUrl: 'https://1105social.com/'
        },
        {
            title: 'Evoptix',
            slug: 'evoptix',
            platform: 'shopify',
            sector: 'ecommerce',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Optical retail storefront with a guided product selection flow.|0',
            image: 'assets/images/work/evoptix.webp',
            liveUrl: 'https://evoptix.com/'
        },
        {
            title: 'Rooted State',
            slug: 'rooted-state',
            platform: 'shopify',
            sector: 'ecommerce',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Direct-to-consumer brand store with an editorial homepage.|0',
            image: 'assets/images/work/rooted-state.webp',
            liveUrl: 'https://rooted-state.com/'
        },
        {
            title: 'Elegant Libaas',
            slug: 'elegant-libaas',
            platform: 'shopify',
            sector: 'fashion',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Fashion storefront with collection filtering and a short checkout.|0',
            image: 'assets/images/work/elegant-libaas.webp',
            liveUrl: 'https://elegantlibaas.com/'
        },
        {
            title: 'The Organic Shilajit',
            slug: 'organic-shilajit',
            platform: 'shopify',
            sector: 'health',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Supplement brand store with education-led product pages.|0',
            image: 'assets/images/work/organic-shilajit.webp',
            liveUrl: 'https://theorganicshilajit.com/'
        },
        {
            title: 'Mazi Supplements',
            slug: 'mazi-supplements',
            platform: 'shopify',
            sector: 'health',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Supplement storefront with subscription and bundle options.|0',
            image: 'assets/images/work/mazi-supplements.webp',
            liveUrl: 'https://www.mazisupplements.com/'
        },
        {
            title: 'The World of HSY',
            slug: 'world-of-hsy',
            platform: 'shopify',
            sector: 'fashion',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Designer fashion storefront with a lookbook-led browse.|0',
            image: 'assets/images/work/world-of-hsy.webp',
            liveUrl: 'https://theworldofhsy.com/'
        },
        {
            title: 'Fuzzl Pet',
            slug: 'fuzzlpet',
            platform: 'shopify',
            sector: 'ecommerce',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Pet products store with category-led navigation.|0',
            image: 'assets/images/work/fuzzlpet.webp',
            liveUrl: 'https://www.fuzzlpet.com/'
        },
        {
            title: 'Anchilex',
            slug: 'anchilex',
            platform: 'shopify',
            sector: 'ecommerce',
            technology: ['shopify', 'liquid', 'javascript'],
            summary: 'Product storefront with a clean, conversion-focused layout.|0',
            image: 'assets/images/work/anchilex.webp',
            liveUrl: 'https://anchilex.com/'
        },
        {
            title: 'Scoutcourt',
            slug: 'scoutcourt',
            platform: 'custom',
            sector: 'sports',
            technology: ['laravel', 'php', 'mysql'],
            summary: 'Custom Laravel application with a bespoke back end and user accounts.|0',
            image: 'assets/images/work/scoutcourt.webp',
            liveUrl: 'https://scoutcourt.com/'
        },
    ];

    /* Exposed for the console and for any future template that wants the set
       without re-parsing the DOM. */
    window.NeotericERA = window.NeotericERA || {};
    window.NeotericERA.portfolio = PORTFOLIO_PROJECTS;
})();
