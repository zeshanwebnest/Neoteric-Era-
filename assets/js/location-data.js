/* ==========================================================================
   Neoteric ERA — Data Layer & Location Architecture Demonstration
   --------------------------------------------------------------------------
   This file is the single source of truth for the taxonomies that drive the
   site's scalable page architecture:

       country → state → city → service
       /usa/california/los-angeles/wordpress-development/

   The static prototype ships a small number of representative templates
   (locations.html, state-detail.html, city-detail.html, service-location.html)
   rather than hundreds of hand-built files. This module proves the model works
   by generating link sets and page copy from data at runtime.

   ── PRODUCTION NOTE ──────────────────────────────────────────────────────
   When the site moves to a CMS or static-site generator, these objects become
   the content collections. The rendering functions below map one-to-one onto
   template loops, so the migration is mechanical rather than a rewrite.

   ── SPREADSHEET INTEGRATION ──────────────────────────────────────────────
   KEYWORD PRIORITY PLACEHOLDER: `searchDemand` and `priority` values are
   provisional. Replace them with figures from the approved keyword-research
   spreadsheet before deciding which location × service pages to build first.
   ========================================================================== */

(function () {
    'use strict';

    const utils = (window.NeotericERA && window.NeotericERA.utils) || {};
    const $  = utils.$  || ((s, c) => (c || document).querySelector(s));
    const $$ = utils.$$ || ((s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s)));

    /* ======================================================================
       01. SERVICE TAXONOMY
       ----------------------------------------------------------------------
       `slug` drives URLs. `parent` groups child services under a pillar page.
       ====================================================================== */

    const SERVICE_GROUPS = [
        {
            slug: 'website-development',
            name: 'Website Development',
            page: 'service-web-development.html',
            summary: 'Fast, accessible, search-ready websites and storefronts built to convert.',
            icon: 'bi-code-slash',
            children: [
                { slug: 'wordpress-development',        name: 'WordPress Development' },
                { slug: 'shopify-development',          name: 'Shopify Development' },
                { slug: 'custom-website-development',   name: 'Custom Website Development' },
                { slug: 'laravel-development',          name: 'Laravel Development' },
                { slug: 'react-development',            name: 'React Development' },
                { slug: 'nextjs-development',           name: 'Next.js Development' },
                { slug: 'ecommerce-development',        name: 'Ecommerce Development' },
                { slug: 'website-redesign',             name: 'Website Redesign' },
                { slug: 'website-maintenance',          name: 'Website Maintenance' }
            ]
        },
        {
            slug: 'seo',
            name: 'Search Engine Optimization',
            page: 'service-seo.html',
            summary: 'Compounding organic visibility built on technical health and commercial intent.',
            icon: 'bi-graph-up-arrow',
            children: [
                { slug: 'local-seo',       name: 'Local SEO' },
                { slug: 'ecommerce-seo',   name: 'Ecommerce SEO' },
                { slug: 'technical-seo',   name: 'Technical SEO' },
                { slug: 'on-page-seo',     name: 'On-Page SEO' },
                { slug: 'off-page-seo',    name: 'Off-Page SEO' },
                { slug: 'enterprise-seo',  name: 'Enterprise SEO' }
            ]
        },
        {
            slug: 'google-ads',
            name: 'Google Ads',
            page: 'service-google-ads.html',
            summary: 'Paid search managed against cost per qualified lead, not impressions.',
            icon: 'bi-bullseye',
            children: [
                { slug: 'search-ads',       name: 'Search Ads' },
                { slug: 'shopping-ads',     name: 'Shopping Ads' },
                { slug: 'display-ads',      name: 'Display Ads' },
                { slug: 'performance-max',  name: 'Performance Max' },
                { slug: 'youtube-ads',      name: 'YouTube Ads' },
                { slug: 'ppc-management',   name: 'PPC Management' }
            ]
        },
        {
            slug: 'digital-marketing',
            name: 'Digital Marketing',
            page: 'service-digital-marketing.html',
            summary: 'Demand, content and conversion work that compounds the value of every visit.',
            icon: 'bi-broadcast',
            children: [
                { slug: 'social-media-marketing',      name: 'Social Media Marketing' },
                { slug: 'content-marketing',           name: 'Content Marketing' },
                { slug: 'branding',                    name: 'Branding' },
                { slug: 'email-marketing',             name: 'Email Marketing' },
                { slug: 'conversion-rate-optimization', name: 'Conversion Rate Optimisation' }
            ]
        }
    ];

    /** Flat lookup of every service, pillar and child alike. */
    const ALL_SERVICES = SERVICE_GROUPS.reduce((acc, group) => {
        acc.push({ slug: group.slug, name: group.name, parent: null, page: group.page });
        group.children.forEach((child) => {
            acc.push({
                slug: child.slug,
                name: child.name,
                parent: group.slug,
                page: 'service-detail.html'
            });
        });
        return acc;
    }, []);

    /* ======================================================================
       02. LOCATION TAXONOMY
       ----------------------------------------------------------------------
       Only four states are populated in the prototype. The shape supports any
       number of countries, states and cities without structural change.

       `economy` and `sectors` exist so generated location pages can carry
       genuinely differentiated copy rather than a swapped city name — thin
       location pages are a liability, not an asset.
       ====================================================================== */

    const LOCATIONS = [
        {
            slug: 'usa',
            name: 'United States',
            type: 'country',
            page: 'locations.html',
            image: 'assets/images/locations/united-states.svg',
            states: [
                {
                    slug: 'california',
                    name: 'California',
                    abbr: 'CA',
                    page: 'state-detail.html',
                    image: 'assets/images/locations/california.svg',
                    timezone: 'Pacific Time (PT)',
                    economy: 'The largest state economy in the country, weighted toward technology, ' +
                             'media, healthcare systems and direct-to-consumer retail.',
                    sectors: ['SaaS and Technology', 'Healthcare', 'Ecommerce', 'Professional Services'],
                    searchNote: 'Competition on commercial service terms is among the highest nationally, ' +
                                'so technical quality and topical depth carry more weight than volume of pages.',
                    cities: [
                        {
                            slug: 'los-angeles', name: 'Los Angeles', page: 'city-detail.html',
                            image: 'assets/images/locations/los-angeles.svg',
                            population: '3.8M',
                            context: 'A fragmented market where buyers compare a long shortlist before ' +
                                     'making contact, which puts unusual weight on proof of work.',
                            sectors: ['Entertainment and Media', 'Healthcare', 'Real Estate', 'Hospitality'],
                            areas: ['Downtown LA', 'Santa Monica', 'Pasadena', 'Glendale', 'Long Beach', 'Burbank']
                        },
                        {
                            slug: 'san-diego', name: 'San Diego', page: 'city-detail.html',
                            image: 'assets/images/locations/san-diego.svg',
                            population: '1.4M',
                            context: 'Life sciences and defence contracting create a market where ' +
                                     'credibility signals and compliance-aware content matter more than volume.',
                            sectors: ['Life Sciences', 'Healthcare', 'Defence and Aerospace', 'Tourism'],
                            areas: ['Downtown', 'La Jolla', 'Sorrento Valley', 'Carlsbad', 'Chula Vista']
                        },
                        {
                            slug: 'san-francisco', name: 'San Francisco', page: 'city-detail.html',
                            image: 'assets/images/locations/san-francisco.svg',
                            population: '810K',
                            context: 'Buyers are technically literate and evaluate performance metrics ' +
                                     'directly, so Core Web Vitals and accessibility become sales arguments.',
                            sectors: ['SaaS and Technology', 'Financial Services', 'Professional Services'],
                            areas: ['SoMa', 'Financial District', 'Mission', 'Oakland', 'Berkeley']
                        }
                    ]
                },
                {
                    slug: 'texas',
                    name: 'Texas',
                    abbr: 'TX',
                    page: 'state-detail.html',
                    image: 'assets/images/locations/texas.svg',
                    timezone: 'Central Time (CT)',
                    economy: 'Rapid in-migration has produced fast-growing service, construction and ' +
                             'energy sectors, with several distinct metros rather than one dominant hub.',
                    sectors: ['Construction', 'Home Services', 'Real Estate', 'Professional Services'],
                    searchNote: 'Multi-metro coverage matters more here than in single-hub states: a ' +
                                'Dallas presence does not earn visibility in Houston or Austin.',
                    cities: [
                        {
                            slug: 'dallas', name: 'Dallas', page: 'city-detail.html',
                            image: 'assets/images/locations/dallas.svg',
                            population: '1.3M',
                            context: 'A dense corporate services market where B2B buyers research ' +
                                     'extensively and expect a proposal that quantifies return.',
                            sectors: ['Professional Services', 'Construction', 'Logistics', 'Financial Services'],
                            areas: ['Downtown Dallas', 'Plano', 'Frisco', 'Irving', 'Arlington', 'Fort Worth']
                        },
                        {
                            slug: 'houston', name: 'Houston', page: 'city-detail.html',
                            image: 'assets/images/locations/houston.svg',
                            population: '2.3M',
                            context: 'Energy and industrial supply chains mean longer sales cycles and ' +
                                     'a heavier emphasis on technical credibility than consumer polish.',
                            sectors: ['Energy', 'Healthcare', 'Construction', 'Logistics'],
                            areas: ['Downtown', 'The Woodlands', 'Sugar Land', 'Katy', 'Pearland']
                        },
                        {
                            slug: 'austin', name: 'Austin', page: 'city-detail.html',
                            image: 'assets/images/locations/austin.svg',
                            population: '975K',
                            context: 'A high concentration of venture-backed companies raises the ' +
                                     'baseline expectation for design quality and page speed.',
                            sectors: ['SaaS and Technology', 'Hospitality', 'Real Estate', 'Education'],
                            areas: ['Downtown', 'East Austin', 'Round Rock', 'Cedar Park', 'San Marcos']
                        }
                    ]
                },
                {
                    slug: 'florida',
                    name: 'Florida',
                    abbr: 'FL',
                    page: 'state-detail.html',
                    image: 'assets/images/locations/florida.svg',
                    timezone: 'Eastern Time (ET)',
                    economy: 'Tourism, healthcare, property and cross-border trade dominate, with ' +
                             'strong seasonality that changes how budgets should be paced.',
                    sectors: ['Hospitality', 'Real Estate', 'Healthcare', 'Home Services'],
                    searchNote: 'Demand swings sharply by season. Paid budgets and content calendars ' +
                                'should be planned against that curve rather than spread evenly.',
                    cities: [
                        {
                            slug: 'miami', name: 'Miami', page: 'city-detail.html',
                            image: 'assets/images/locations/miami.svg',
                            population: '450K',
                            context: 'A bilingual, international market where Spanish-language search ' +
                                     'coverage is a genuine competitive gap for most local businesses.',
                            sectors: ['Real Estate', 'Hospitality', 'Ecommerce', 'Professional Services'],
                            areas: ['Brickell', 'Coral Gables', 'Wynwood', 'Miami Beach', 'Doral']
                        },
                        {
                            slug: 'orlando', name: 'Orlando', page: 'city-detail.html',
                            image: 'assets/images/locations/orlando.svg',
                            population: '320K',
                            context: 'Hospitality and attractions traffic is highly seasonal, rewarding ' +
                                     'booking-flow optimisation over broad brand campaigns.',
                            sectors: ['Hospitality', 'Education', 'Home Services', 'Healthcare'],
                            areas: ['Downtown Orlando', 'Winter Park', 'Kissimmee', 'Lake Mary', 'Altamonte Springs']
                        },
                        {
                            slug: 'tampa', name: 'Tampa', page: 'city-detail.html',
                            image: 'assets/images/locations/tampa.svg',
                            population: '400K',
                            context: 'A growing professional services base with less saturated search ' +
                                     'competition than Miami, so organic gains arrive sooner.',
                            sectors: ['Professional Services', 'Healthcare', 'Construction', 'Real Estate'],
                            areas: ['Downtown Tampa', 'St. Petersburg', 'Clearwater', 'Brandon', 'Wesley Chapel']
                        }
                    ]
                },
                {
                    slug: 'new-york',
                    name: 'New York',
                    abbr: 'NY',
                    page: 'state-detail.html',
                    image: 'assets/images/locations/new-york.svg',
                    timezone: 'Eastern Time (ET)',
                    economy: 'Finance, legal, media and premium retail concentrate in one metro, ' +
                             'producing the most competitive commercial search market in the country.',
                    sectors: ['Financial Services', 'Professional Services', 'Ecommerce', 'Real Estate'],
                    searchNote: 'Neighbourhood-level intent is unusually strong. Borough and district ' +
                                'targeting often outperforms city-wide terms on cost per enquiry.',
                    cities: [
                        {
                            slug: 'new-york-city', name: 'New York City', page: 'city-detail.html',
                            image: 'assets/images/locations/new-york-city.svg',
                            population: '8.3M',
                            context: 'Buyers shortlist quickly and judge credibility in seconds, which ' +
                                     'makes above-the-fold proof and load speed decisive.',
                            sectors: ['Financial Services', 'Legal', 'Ecommerce', 'Hospitality'],
                            areas: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Jersey City', 'Long Island City']
                        }
                    ]
                }
            ]
        }
    ];

    /* ======================================================================
       03. SERVICE × LOCATION PRIORITY
       ----------------------------------------------------------------------
       Which combinations justify a dedicated page. Building every possible
       permutation produces thin, cannibalising pages; this list is the gate.

       KEYWORD PRIORITY PLACEHOLDER — replace `searchDemand` with real data.
       ====================================================================== */

    const PRIORITY_COMBINATIONS = [
        { city: 'los-angeles',   service: 'wordpress-development', searchDemand: 'high',   priority: 1 },
        { city: 'los-angeles',   service: 'local-seo',             searchDemand: 'high',   priority: 1 },
        { city: 'los-angeles',   service: 'shopify-development',   searchDemand: 'medium', priority: 2 },
        { city: 'dallas',        service: 'wordpress-development', searchDemand: 'high',   priority: 1 },
        { city: 'dallas',        service: 'ppc-management',        searchDemand: 'medium', priority: 2 },
        { city: 'miami',         service: 'ecommerce-development', searchDemand: 'high',   priority: 1 },
        { city: 'miami',         service: 'local-seo',             searchDemand: 'high',   priority: 1 },
        { city: 'new-york-city', service: 'technical-seo',         searchDemand: 'high',   priority: 1 },
        { city: 'new-york-city', service: 'custom-website-development', searchDemand: 'medium', priority: 2 },
        { city: 'austin',        service: 'nextjs-development',    searchDemand: 'medium', priority: 2 },
        { city: 'houston',       service: 'website-redesign',      searchDemand: 'medium', priority: 3 },
        { city: 'tampa',         service: 'search-ads',            searchDemand: 'low',    priority: 3 }
    ];

    /* ======================================================================
       04. LOOKUP HELPERS
       ====================================================================== */

    const country = LOCATIONS[0];

    /** Every city across every state, each carrying a back-reference. */
    function allCities() {
        const list = [];
        country.states.forEach((state) => {
            state.cities.forEach((city) => {
                list.push(Object.assign({}, city, {
                    stateName: state.name,
                    stateSlug: state.slug,
                    stateAbbr: state.abbr
                }));
            });
        });
        return list;
    }

    function findState(slug) {
        return country.states.filter((s) => s.slug === slug)[0] || null;
    }

    function findCity(slug) {
        return allCities().filter((c) => c.slug === slug)[0] || null;
    }

    function findService(slug) {
        return ALL_SERVICES.filter((s) => s.slug === slug)[0] || null;
    }

    /**
     * Clean URL the production site should serve, e.g.
     *   /usa/california/los-angeles/wordpress-development/
     * The static prototype maps these onto query-parameterised templates.
     */
    function cleanUrl(parts) {
        return '/' + parts.filter(Boolean).join('/') + '/';
    }

    function templateUrl(page, params) {
        const query = Object.keys(params || {})
            .filter((key) => params[key])
            .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            .join('&');
        return page + (query ? '?' + query : '');
    }

    /* ======================================================================
       05. RENDERERS
       ----------------------------------------------------------------------
       Each renderer targets an opt-in container. Pages that do not include
       the container simply skip it.
       ====================================================================== */

    /** `[data-render="state-cities"]` — dense city link columns. */
    function renderStateCities() {
        $$('[data-render="state-cities"]').forEach((container) => {
            const stateSlug = container.getAttribute('data-state') || 'california';
            const state = findState(stateSlug);
            if (!state) return;

            container.innerHTML = state.cities.map((city) =>
                '<a href="' + templateUrl(city.page, { city: city.slug, state: state.slug }) + '">' +
                    city.name + ', ' + state.abbr +
                '</a>'
            ).join('');
        });
    }

    /** `[data-render="all-cities"]` — every city we publish pages for. */
    function renderAllCities() {
        $$('[data-render="all-cities"]').forEach((container) => {
            container.innerHTML = allCities().map((city) =>
                '<a href="' + templateUrl(city.page, { city: city.slug, state: city.stateSlug }) + '">' +
                    city.name + ', ' + city.stateAbbr +
                '</a>'
            ).join('');
        });
    }

    /** `[data-render="service-locations"]` — priority service × city pages. */
    function renderServiceLocations() {
        $$('[data-render="service-locations"]').forEach((container) => {
            const maxPriority = parseInt(container.getAttribute('data-max-priority'), 10) || 3;

            const rows = PRIORITY_COMBINATIONS
                .filter((combo) => combo.priority <= maxPriority)
                .sort((a, b) => a.priority - b.priority)
                .map((combo) => {
                    const city = findCity(combo.city);
                    const service = findService(combo.service);
                    if (!city || !service) return '';

                    const url = templateUrl('service-location.html', {
                        city: city.slug,
                        service: service.slug,
                        state: city.stateSlug
                    });

                    return '<tr>' +
                        '<td><a class="link-inline" href="' + url + '">' +
                            service.name + ' in ' + city.name +
                        '</a></td>' +
                        '<td><code>' + cleanUrl(['usa', city.stateSlug, city.slug, service.slug]) + '</code></td>' +
                        '<td>' + city.stateName + '</td>' +
                        '<td><span class="tag ' + (combo.priority === 1 ? 'tag-accent' : '') + '">Tier ' +
                            combo.priority + '</span></td>' +
                    '</tr>';
                })
                .join('');

            container.innerHTML = rows;
        });
    }

    /** `[data-render="location-cards"]` — state cards on the locations hub. */
    function renderLocationCards() {
        $$('[data-render="location-cards"]').forEach((container) => {
            container.innerHTML = country.states.map((state) => {
                const cityNames = state.cities.map((c) => c.name).join(' · ');
                return '' +
                '<article class="location-card reveal-up">' +
                    '<div class="location-card__media">' +
                        '<img src="' + state.image + '" alt="Abstract skyline composition representing ' +
                            state.name + '" width="1280" height="720" loading="lazy" decoding="async">' +
                    '</div>' +
                    '<div class="location-card__body">' +
                        '<p class="location-card__region">United States · ' + state.abbr + '</p>' +
                        '<h3 class="location-card__name">' + state.name + '</h3>' +
                        '<p class="location-card__text">' + state.economy + '</p>' +
                        '<div class="location-card__services">' +
                            state.sectors.slice(0, 3).map((s) => '<span class="tag">' + s + '</span>').join('') +
                        '</div>' +
                        '<p class="text-small text-body-muted u-mt-4">' + cityNames + '</p>' +
                        '<a class="link-underline u-mt-4 stretched-link-custom" href="' +
                            templateUrl(state.page, { state: state.slug }) + '">' +
                            'Explore ' + state.name + ' <span class="arrow" aria-hidden="true">&rarr;</span>' +
                        '</a>' +
                    '</div>' +
                '</article>';
            }).join('');

            if (window.NeotericERA && window.NeotericERA.refreshReveals) {
                window.NeotericERA.refreshReveals();
            }
        });
    }

    /* ======================================================================
       06. TEMPLATE HYDRATION
       ----------------------------------------------------------------------
       The three location templates read `?state=`, `?city=` and `?service=`
       and fill in every `[data-loc-field]` slot. This is the prototype's
       stand-in for server-side rendering.

       The HTML always ships with a sensible default already written in, so a
       template opened with no query string is still a complete, readable page.
       ====================================================================== */

    function currentParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            state: params.get('state'),
            city: params.get('city'),
            service: params.get('service')
        };
    }

    function setField(name, value, scope) {
        if (!value) return;
        $$('[data-loc-field="' + name + '"]', scope).forEach((el) => {
            el.textContent = value;
        });
    }

    /** Same contract as setField, for the service-detail template's slots. */
    function setSvcField(name, value, scope) {
        if (!value) return;
        $$('[data-svc-field="' + name + '"]', scope).forEach((el) => {
            el.textContent = value;
        });
    }

    function hydrateTemplate() {
        const page = $('[data-location-template]');
        if (!page) return;

        const params = currentParams();
        const type = page.getAttribute('data-location-template');

        const state = params.state ? findState(params.state) : null;
        const city = params.city ? findCity(params.city) : null;
        const service = params.service ? findService(params.service) : null;

        // Nothing to hydrate — the authored defaults stand.
        if (!state && !city && !service) return;

        const resolvedState = state || (city ? findState(city.stateSlug) : null);

        if (resolvedState) {
            setField('state-name', resolvedState.name);
            setField('state-abbr', resolvedState.abbr);
            setField('state-economy', resolvedState.economy);
            setField('state-search-note', resolvedState.searchNote);
            setField('state-timezone', resolvedState.timezone);

            $$('[data-loc-image="state"]').forEach((img) => {
                img.setAttribute('src', resolvedState.image);
                img.setAttribute('alt', 'Abstract skyline composition representing ' + resolvedState.name);
            });

            // The city list renders before hydration runs, so it still holds the
            // authored default state. Re-point it and render again.
            $$('[data-render="state-cities"]').forEach((container) => {
                container.setAttribute('data-state', resolvedState.slug);
            });
            renderStateCities();
        }

        if (city) {
            setField('city-name', city.name);
            setField('city-context', city.context);
            setField('city-population', city.population);

            $$('[data-loc-image="city"]').forEach((img) => {
                img.setAttribute('src', city.image);
                img.setAttribute('alt', 'Abstract skyline composition representing ' + city.name);
            });

            // Nearby service areas
            $$('[data-loc-list="areas"]').forEach((list) => {
                list.innerHTML = city.areas.map((area) =>
                    '<a href="' + templateUrl('city-detail.html', { city: city.slug }) + '">' + area + '</a>'
                ).join('');
            });

            // Local sector emphasis
            $$('[data-loc-list="sectors"]').forEach((list) => {
                list.innerHTML = city.sectors.map((sector) =>
                    '<span class="tag">' + sector + '</span>'
                ).join('');
            });

            // "Other cities" lists should not link back to the page you are on.
            $$('[data-render="all-cities"]').forEach((container) => {
                container.innerHTML = allCities()
                    .filter((other) => other.slug !== city.slug)
                    .map((other) =>
                        '<a href="' + templateUrl(other.page, {
                            city: other.slug,
                            state: other.stateSlug
                        }) + '">' + other.name + ', ' + other.stateAbbr + '</a>'
                    ).join('');
            });
        }

        if (service) {
            setField('service-name', service.name);
            const parent = service.parent ? findService(service.parent) : null;
            if (parent) setField('service-parent', parent.name);
        }

        // Composite headings, e.g. "WordPress Development Company in Los Angeles"
        if (service && city) {
            const composite = service.name + ' Company in ' + city.name;
            setField('composite-title', composite);
            document.title = composite + ' | Neoteric ERA';

            const canonical = $('link[rel="canonical"]');
            if (canonical) {
                canonical.setAttribute(
                    'href',
                    'https://www.neotericera.com' +
                        cleanUrl(['usa', city.stateSlug, city.slug, service.slug])
                );
            }
        }

        // Breadcrumb trail reflects the resolved hierarchy.
        const trail = $('[data-loc-breadcrumb]');
        if (trail) {
            const crumbs = [
                { label: 'Home', href: 'index.html' },
                { label: 'Locations', href: 'locations.html' },
                { label: 'United States', href: 'locations.html' }
            ];
            if (resolvedState) {
                crumbs.push({
                    label: resolvedState.name,
                    href: templateUrl('state-detail.html', { state: resolvedState.slug })
                });
            }
            if (city) {
                crumbs.push({
                    label: city.name,
                    href: type === 'city' ? null : templateUrl('city-detail.html', { city: city.slug })
                });
            }
            if (service) {
                crumbs.push({ label: service.name, href: null });
            }

            trail.innerHTML = crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                const inner = (isLast || !crumb.href)
                    ? '<span aria-current="page">' + crumb.label + '</span>'
                    : '<a href="' + crumb.href + '">' + crumb.label + '</a>';
                return '<li class="breadcrumbs__item">' + inner + '</li>';
            }).join('');
        }
    }

    /* ======================================================================
       07. CHILD-SERVICE DETAIL DATA
       ----------------------------------------------------------------------
       Drives service-detail.html. Every child service in the taxonomy has an
       entry so the single template can serve all 26 without a thin page.

       Each entry supplies the four things that genuinely differ between
       services: what it is, the outcome it targets, who it suits, and what
       is included. Everything else on the template is shared and honest.
       ====================================================================== */

    const SERVICE_DETAIL = {
        /* --- Website Development ---------------------------------------- */
        'wordpress-development': {
            image: 'assets/images/services/wordpress.svg',
            blurb: 'Custom themes and structured content models, with a plugin set chosen ' +
                   'deliberately rather than accumulated over five years of quick fixes.',
            outcome: 'A site your marketing team can genuinely operate — publishing pages, ' +
                     'adjusting copy and launching campaign landing pages — without raising a ' +
                     'developer ticket for every change.',
            bestFor: [
                'Your team needs to publish and edit content without developer help',
                'You need a large number of structured pages — services, locations, resources',
                'Editorial and blog content is a meaningful part of your acquisition',
                'An existing WordPress site has become slow or fragile through plugin sprawl'
            ],
            notFor: [
                'You need a full transactional storefront with tax and fulfilment handled for you — consider <a class="link-inline" href="service-detail.html?service=shopify-development">Shopify</a>',
                'Your core requirement is complex application logic rather than content — consider <a class="link-inline" href="service-detail.html?service=laravel-development">Laravel</a>'
            ],
            includes: [
                'Custom theme built from your design system, no commercial multipurpose theme',
                'Structured content models and reusable block patterns',
                'Editor experience tested with the people who will actually use it',
                'Performance budget enforced, including plugin weight review',
                'Schema markup, clean URLs and Search Console verification',
                'Security hardening, backup configuration and update policy'
            ]
        },
        'shopify-development': {
            image: 'assets/images/services/shopify.svg',
            blurb: 'Custom themes, metafield-driven content and app integration audited for ' +
                   'weight and checkout impact.',
            outcome: 'A storefront where more of your existing traffic reaches checkout, and ' +
                     'where payments, tax and fulfilment are the platform\'s problem rather than yours.',
            bestFor: [
                'You sell physical products and want payment and tax handled by the platform',
                'The current theme is a heavily modified commercial template nobody wants to touch',
                'Catalogue navigation is losing customers between category and product',
                'You need Shopping campaigns and organic search to stop competing'
            ],
            notFor: [
                'Your pricing or ordering logic is genuinely bespoke — consider <a class="link-inline" href="service-detail.html?service=custom-website-development">a custom build</a>',
                'Content and editorial are the primary purpose — consider <a class="link-inline" href="service-detail.html?service=wordpress-development">WordPress</a>'
            ],
            includes: [
                'Custom theme built from your design system',
                'Metafield-driven content so merchandising does not need a developer',
                'App audit — every app assessed for performance and checkout impact',
                'Product, collection and variant architecture planned for search',
                'Merchant Center feed structure and product schema',
                'Checkout and cart testing across real devices'
            ]
        },
        'custom-website-development': {
            image: 'assets/images/services/website-development.svg',
            blurb: 'For workflows that genuinely do not fit an off-the-shelf CMS. We will tell ' +
                   'you plainly when they do.',
            outcome: 'A system built around how your business actually operates, rather than a ' +
                     'platform your team spends its time working around.',
            bestFor: [
                'Your process involves logic no CMS models well — quoting, scheduling, approvals',
                'You need deep integration with an ERP, CRM or industry-specific system',
                'Off-the-shelf platforms have been tried and abandoned',
                'Data ownership or compliance requirements rule out hosted platforms'
            ],
            notFor: [
                'A standard marketing site would serve you — a custom build costs more to maintain',
                'Your team is small and has no technical capacity for long-term ownership'
            ],
            includes: [
                'Requirements definition with the people who do the work daily',
                'Architecture and data model design, documented',
                'Front end and application logic built to the same accessibility baseline',
                'Third-party integrations with error handling and retry behaviour',
                'Admin interfaces designed for your team rather than for developers',
                'Written technical documentation and handover'
            ]
        },
        'laravel-development': {
            image: 'assets/images/services/website-development.svg',
            blurb: 'Portals, quoting tools, listing platforms and integrations sitting behind a ' +
                   'marketing front end.',
            outcome: 'Application functionality your customers or staff use daily, built on a ' +
                     'framework with a long support horizon and a large hiring pool.',
            bestFor: [
                'You need a customer or partner portal with authentication and permissions',
                'Listings, inventory or booking data must be searchable and filterable at scale',
                'Multiple systems need to exchange data reliably',
                'You want application logic separated from the marketing site'
            ],
            notFor: [
                'The requirement is content publishing — consider <a class="link-inline" href="service-detail.html?service=wordpress-development">WordPress</a>',
                'A heavily interactive browser interface is the core need — consider <a class="link-inline" href="service-detail.html?service=react-development">React</a>'
            ],
            includes: [
                'Database schema design and migrations',
                'Authentication, roles and permissions',
                'REST API design where other systems consume the data',
                'Queue and scheduled task configuration for background work',
                'Automated test coverage on business-critical paths',
                'Deployment pipeline and environment configuration'
            ]
        },
        'react-development': {
            image: 'assets/images/services/website-development.svg',
            blurb: 'Configurators, dashboards and interfaces with real state — kept accessible ' +
                   'rather than accessible-in-principle.',
            outcome: 'An interface that handles genuine complexity without becoming slow, ' +
                     'unusable by keyboard, or invisible to search engines.',
            bestFor: [
                'Users configure, filter or compare in ways a page reload cannot support',
                'You are building a dashboard or data-heavy internal tool',
                'An existing interface is functional but slow and hard to extend',
                'A design system needs to be shared across several products'
            ],
            notFor: [
                'A largely static marketing site — React adds weight without benefit here',
                'Full search indexability is critical and server rendering is not planned — consider <a class="link-inline" href="service-detail.html?service=nextjs-development">Next.js</a>'
            ],
            includes: [
                'Component architecture and state management appropriate to the scale',
                'Accessible interactive patterns — focus management, ARIA, keyboard operation',
                'Performance budgets on bundle size and interaction latency',
                'Reusable component library with documented props',
                'Error boundaries and graceful degradation',
                'Test coverage on interaction logic'
            ]
        },
        'nextjs-development': {
            image: 'assets/images/services/website-development.svg',
            blurb: 'Server rendering and static generation for when interactivity and full ' +
                   'indexability are both non-negotiable.',
            outcome: 'Application-grade interactivity that still ranks, loads fast on mobile, and ' +
                     'does not depend on JavaScript executing before content appears.',
            bestFor: [
                'You need React interactivity and organic search visibility together',
                'Content volume is large and build-time generation would help',
                'Core Web Vitals are a stated business requirement',
                'A marketing site and a product interface should share one codebase'
            ],
            notFor: [
                'A brochure site your team edits weekly — the operational overhead is not justified',
                'Nobody on your side can maintain a JavaScript deployment pipeline'
            ],
            includes: [
                'Rendering strategy chosen per route — static, server or client',
                'Content source integration, headless CMS or API',
                'Image optimisation and font loading strategy',
                'Metadata, canonical and structured data handling per route',
                'Core Web Vitals monitoring in production',
                'Deployment configuration and preview environments'
            ]
        },
        'ecommerce-development': {
            image: 'assets/images/services/ecommerce.svg',
            blurb: 'Catalogue taxonomy, faceted navigation that stays crawlable, and a checkout ' +
                   'tested under real load.',
            outcome: 'More revenue from the same traffic, because customers can find the product ' +
                     'and finish the purchase.',
            bestFor: [
                'A large or messy catalogue where customers cannot find what they want',
                'Cart or checkout abandonment is high and the cause is unclear',
                'Faceted navigation is generating crawl waste or duplicate URLs',
                'You are moving from a marketplace to your own storefront'
            ],
            notFor: [
                'You sell a handful of products — a simpler build will serve you better',
                'The real constraint is demand rather than conversion — start with <a class="link-inline" href="service-google-ads.html">paid search</a>'
            ],
            includes: [
                'Category and product taxonomy designed for search and for shoppers',
                'Faceted navigation rules — what is indexable and what is not',
                'Product schema, variants, stock and discontinued-line handling',
                'Checkout flow testing across devices and payment methods',
                'Merchant feed structure for Shopping campaigns',
                'Performance budget on product and collection templates'
            ]
        },
        'website-redesign': {
            image: 'assets/images/services/website-development.svg',
            blurb: 'Rebuilt without discarding the search authority you have spent years earning.',
            outcome: 'A site that reflects the business you are now, launched without the ranking ' +
                     'drop that makes most redesigns a net loss for two quarters.',
            bestFor: [
                'The site describes a business you have outgrown',
                'You have real organic visibility that must survive the migration',
                'The current platform blocks the pages you need to publish',
                'A previous redesign lost rankings and you want to avoid repeating it'
            ],
            notFor: [
                'The underlying issue is messaging rather than the site — start with <a class="link-inline" href="service-detail.html?service=branding">positioning</a>',
                'Nothing is wrong with the current site except that it feels dated'
            ],
            includes: [
                'Full crawl of the existing site and content inventory',
                'URL-by-URL redirect map, tested before launch',
                'Content parity check on every page that currently ranks',
                'Preserved or improved on-page targeting for ranking pages',
                'Post-launch indexation and error monitoring for four weeks',
                'Rollback plan agreed before deployment'
            ]
        },
        'website-maintenance': {
            image: 'assets/images/services/website-development.svg',
            blurb: 'Updates, patching, backup verification, uptime and performance monitoring on ' +
                   'a fixed monthly retainer.',
            outcome: 'A site that stays fast, secure and current — and a backup you have actually ' +
                     'confirmed can be restored.',
            bestFor: [
                'Nobody internally owns updates and patching',
                'You have backups but have never tested a restore',
                'Small content changes keep getting deferred for lack of capacity',
                'Performance has degraded gradually since launch'
            ],
            notFor: [
                'The site needs rebuilding rather than maintaining — we will say so after the audit',
                'You have in-house capacity and only need occasional advice'
            ],
            includes: [
                'Core, theme and plugin updates on a tested schedule',
                'Security patching and malware monitoring',
                'Backup configuration with verified restore tests',
                'Uptime monitoring with alerting',
                'Quarterly Core Web Vitals regression check',
                'A monthly allowance for small content and design changes'
            ]
        },

        /* --- SEO --------------------------------------------------------- */
        'local-seo': {
            image: 'assets/images/services/local-seo.svg',
            blurb: 'Map pack visibility, citation accuracy and location pages with genuine local ' +
                   'substance behind them.',
            outcome: 'More enquiries from people searching in the areas you actually serve, ' +
                     'without paying per click for them.',
            bestFor: [
                'You serve customers in defined cities or a service radius',
                'You operate several locations under one brand',
                'Competitors appear in the map pack and you do not',
                'Existing location pages are near-identical and rank for nothing'
            ],
            notFor: [
                'You sell nationally with no geographic relevance — consider <a class="link-inline" href="service-detail.html?service=on-page-seo">on-page SEO</a>',
                'You have no physical presence or defined service area at all'
            ],
            includes: [
                'Google Business Profile audit and optimisation per location',
                'Citation audit and cleanup across relevant directories',
                'Location page architecture with genuinely differentiated content',
                'LocalBusiness structured data per location',
                'Review generation process and response guidance',
                'Local rank tracking by area rather than a single national position'
            ]
        },
        'ecommerce-seo': {
            image: 'assets/images/services/ecommerce.svg',
            blurb: 'Category and product architecture that earns rankings at catalogue scale.',
            outcome: 'Organic revenue growth from category and product pages, reducing dependence ' +
                     'on paid Shopping traffic.',
            bestFor: [
                'A large catalogue where only a fraction of pages are indexed',
                'Category pages that do not rank for their obvious terms',
                'Faceted navigation creating duplicate or wasted crawl paths',
                'Heavy reliance on Shopping ads for revenue'
            ],
            notFor: [
                'A very small catalogue — general on-page work will cover it',
                'The store is not yet built — start with <a class="link-inline" href="service-detail.html?service=ecommerce-development">ecommerce development</a>'
            ],
            includes: [
                'Category taxonomy mapped to commercial search demand',
                'Faceted navigation indexation rules and canonical strategy',
                'Product page templates with schema, reviews and stock signals',
                'Handling for variants, out-of-stock and discontinued lines',
                'Internal linking between categories, products and content',
                'Crawl budget analysis on large catalogues'
            ]
        },
        'technical-seo': {
            image: 'assets/images/services/seo.svg',
            blurb: 'Crawlability, indexation, canonicalisation, Core Web Vitals and structured data.',
            outcome: 'A site search engines can crawl, understand and rank — the precondition for ' +
                     'every other SEO investment returning anything.',
            bestFor: [
                'Rankings dropped after a migration, redesign or platform change',
                'Pages are published but not appearing in the index',
                'Core Web Vitals are failing in Search Console',
                'A large site where crawl efficiency has become a real constraint'
            ],
            notFor: [
                'The site is technically sound and the gap is content — consider <a class="link-inline" href="service-detail.html?service=on-page-seo">on-page SEO</a>'
            ],
            includes: [
                'Full technical crawl with prioritised, effect-stated findings',
                'Indexation and canonicalisation strategy',
                'Core Web Vitals diagnosis and remediation plan',
                'Structured data implementation and validation',
                'XML sitemap and robots.txt architecture',
                'Log-file analysis where site scale justifies it'
            ]
        },
        'on-page-seo': {
            image: 'assets/images/services/seo.svg',
            blurb: 'Intent mapping, content depth against what actually ranks, and internal ' +
                   'linking that concentrates rather than dilutes authority.',
            outcome: 'Pages that rank for terms with commercial intent, and a site structure where ' +
                     'authority flows to the pages that earn revenue.',
            bestFor: [
                'You rank for your brand name and little else',
                'Traffic arrives but does not convert — likely an intent mismatch',
                'Several pages compete for the same term',
                'Content exists but is thinner than what ranks above it'
            ],
            notFor: [
                'The site cannot be crawled properly — fix <a class="link-inline" href="service-detail.html?service=technical-seo">technical SEO</a> first'
            ],
            includes: [
                'Keyword and intent map organised by commercial value',
                'Content gap analysis against pages currently ranking',
                'Page-level optimisation — titles, headings, depth, entities',
                'Cannibalisation identification and resolution',
                'Internal linking model designed rather than incidental',
                'Content briefs for gaps that need new pages'
            ]
        },
        'off-page-seo': {
            image: 'assets/images/services/seo.svg',
            blurb: 'Earned links via genuinely useful content and digital PR, plus accurate ' +
                   'citations. No networks, no purchased placements.',
            outcome: 'Increased domain authority that lifts every page, built in a way that will ' +
                     'not require a disavow file in two years.',
            bestFor: [
                'On-page and technical work is done and rankings have plateaued',
                'Competitors have materially stronger link profiles',
                'You have data, expertise or research worth citing',
                'A previous agency built links you now need to assess'
            ],
            notFor: [
                'Technical and on-page foundations are not yet in place — links will not compensate',
                'You want fast results — earned authority is the slowest part of SEO'
            ],
            includes: [
                'Link profile audit including toxic-link assessment',
                'Competitor gap analysis on referring domains',
                'Linkable asset identification and development',
                'Outreach to relevant publications and industry sites',
                'Citation and directory accuracy for local relevance',
                'A transparent placement log — every link, where and how'
            ]
        },
        'enterprise-seo': {
            image: 'assets/images/services/seo.svg',
            blurb: 'Governance for large sites: templating rules, cannibalisation control and ' +
                   'prioritisation across competing internal teams.',
            outcome: 'Consistent search performance across thousands of pages, and a process that ' +
                     'prevents each new internal project undoing the last one.',
            bestFor: [
                'Thousands of URLs across multiple templates and teams',
                'Several departments publish independently with no shared standard',
                'Crawl budget is a genuine constraint',
                'Migrations and replatforms happen regularly'
            ],
            notFor: [
                'A site under a few hundred pages — standard SEO covers it more cheaply'
            ],
            includes: [
                'Template-level SEO specifications developers can build against',
                'Governance documentation and publishing standards',
                'Site-wide cannibalisation and duplication analysis',
                'Crawl budget management and log-file review',
                'Migration planning and risk assessment',
                'Prioritisation framework for competing internal requests'
            ]
        },

        /* --- Google Ads -------------------------------------------------- */
        'search-ads': {
            image: 'assets/images/services/google-ads.svg',
            blurb: 'High-intent capture with genuine query control rather than broad-match drift.',
            outcome: 'A predictable cost per qualified enquiry from people actively looking for ' +
                     'what you sell, today.',
            bestFor: [
                'People search for your service by name and you need those enquiries now',
                'You need lead flow while SEO builds',
                'Cost per lead has been rising and nobody can explain why',
                'Geographic targeting is clear and definable'
            ],
            notFor: [
                'Nobody searches for your category yet — demand generation comes first',
                'Media budget is under roughly $2,000 a month — data will be too thin to optimise'
            ],
            includes: [
                'Conversion tracking verification before any bidding changes',
                'Campaign and ad group structure by intent',
                'Match type strategy and a maintained negative keyword framework',
                'Responsive search ads with structured copy testing',
                'Bid strategy selection and monitoring',
                'Monthly reporting on cost per qualified lead'
            ]
        },
        'shopping-ads': {
            image: 'assets/images/services/ecommerce.svg',
            blurb: 'Feed quality before bidding — most Shopping problems are product data problems.',
            outcome: 'Products shown for the searches that convert, at a return on ad spend you ' +
                     'can actually calculate.',
            bestFor: [
                'You sell physical products and Shopping underperforms',
                'Merchant Center shows disapprovals or warnings nobody has resolved',
                'Product titles and attributes were never written for search',
                'Return on ad spend varies wildly between categories'
            ],
            notFor: [
                'You sell services rather than products — <a class="link-inline" href="service-detail.html?service=search-ads">Search ads</a> apply instead'
            ],
            includes: [
                'Merchant Center audit and disapproval resolution',
                'Feed optimisation — titles, attributes, category mapping, imagery',
                'Campaign structure by product margin and performance tier',
                'Stock and price accuracy monitoring',
                'Bid strategy aligned to return on ad spend targets',
                'Competitive price positioning analysis'
            ]
        },
        'display-ads': {
            image: 'assets/images/services/google-ads.svg',
            blurb: 'Retargeting with frequency discipline and placement exclusions, rather than ' +
                   'broad untargeted prospecting.',
            outcome: 'Recovered conversions from people who already showed intent, without ' +
                     'annoying them or funding low-quality placements.',
            bestFor: [
                'Meaningful traffic that leaves without converting',
                'A considered purchase with a multi-visit decision cycle',
                'Cart or form abandonment worth recovering',
                'You want brand presence alongside a search campaign'
            ],
            notFor: [
                'Traffic volume is low — audiences will not reach useful size',
                'You expect Display to generate first-touch demand at search-like efficiency'
            ],
            includes: [
                'Audience segmentation by behaviour and recency',
                'Frequency capping so retargeting does not become harassment',
                'Placement exclusions and content suitability controls',
                'Responsive display creative with copy and asset testing',
                'View-through conversion analysis separated from click-through',
                'Regular placement report review and pruning'
            ]
        },
        'performance-max': {
            image: 'assets/images/services/google-ads.svg',
            blurb: 'Asset groups and audience signals structured so the automation has something ' +
                   'real to learn from.',
            outcome: 'Reach across Google inventory with the transparency to know what is working, ' +
                     'rather than a single unexplained spend figure.',
            bestFor: [
                'Existing search campaigns are efficient and you want incremental volume',
                'You have strong creative assets across formats',
                'Conversion volume is high enough for automation to learn',
                'An existing Performance Max campaign nobody can explain'
            ],
            notFor: [
                'Conversion tracking is not yet reliable — automation will optimise to the wrong signal',
                'Low conversion volume — the learning phase will never complete'
            ],
            includes: [
                'Asset group structure by theme rather than one undifferentiated pool',
                'Audience signal configuration and testing',
                'Brand exclusions so it does not cannibalise search campaigns',
                'Creative asset production and rotation',
                'Insight reporting extracted to the extent the platform allows',
                'Incrementality assessment against existing campaigns'
            ]
        },
        'youtube-ads': {
            image: 'assets/images/services/google-ads.svg',
            blurb: 'Demand generation where the offer genuinely benefits from demonstration.',
            outcome: 'Awareness and consideration among people who are not searching yet, measured ' +
                     'against a realistic attribution window.',
            bestFor: [
                'Your product is easier to show than to describe',
                'The category is new enough that search demand is limited',
                'You have or can produce credible video assets',
                'You can support a longer attribution window'
            ],
            notFor: [
                'You need measurable enquiries this month — <a class="link-inline" href="service-detail.html?service=search-ads">Search ads</a> are the honest answer',
                'No video assets exist and there is no budget to produce them'
            ],
            includes: [
                'Campaign objective and format selection',
                'Audience targeting by intent, affinity and custom segments',
                'Creative guidance — hook, length and framing per placement',
                'Sequential campaign structure where the message needs stages',
                'Brand lift and view-through measurement setup',
                'Attribution window guidance so results are read correctly'
            ]
        },
        'ppc-management': {
            image: 'assets/images/services/google-ads.svg',
            blurb: 'The ongoing discipline: query mining, negatives, bid strategy, creative testing ' +
                   'and honest budget recommendations.',
            outcome: 'A paid account that gets more efficient over time rather than gradually ' +
                     'leaking more budget to irrelevant queries.',
            bestFor: [
                'You have campaigns running with nobody actively managing them',
                'Cost per lead is drifting upward month over month',
                'An in-house team needs specialist support',
                'You have inherited an account with no documentation'
            ],
            notFor: [
                'Campaigns do not exist yet — start with the relevant campaign type',
                'Media budget is too small for management fees to make sense'
            ],
            includes: [
                'Weekly search term review and negative keyword additions',
                'Bid strategy monitoring and adjustment',
                'Ongoing ad copy and asset testing',
                'Landing page recommendations, built by our developers where agreed',
                'Budget pacing and reallocation between campaigns',
                'Monthly reporting including a recommendation to hold or reduce spend'
            ]
        },

        /* --- Digital Marketing ------------------------------------------- */
        'social-media-marketing': {
            image: 'assets/images/services/digital-marketing.svg',
            blurb: 'One or two channels maintained properly, chosen by where your buyers actually ' +
                   'make this kind of decision.',
            outcome: 'Credible presence on the channels that influence your sales cycle, and time ' +
                     'reclaimed from the ones that do not.',
            bestFor: [
                'Your buyers research suppliers socially before making contact',
                'You are spread across five channels with traction on none',
                'Recruitment and employer brand matter to the business',
                'You have expertise worth publishing regularly'
            ],
            notFor: [
                'You need measurable enquiries quickly — <a class="link-inline" href="service-google-ads.html">paid search</a> is the honest answer',
                'Nobody internally can contribute subject-matter input'
            ],
            includes: [
                'Channel audit and an explicit recommendation on what to stop',
                'Content pillars tied to commercial themes rather than filler',
                'Publishing calendar and asset production',
                'Community management guidance and response standards',
                'Reporting on referral traffic and assisted conversions, not follower counts'
            ]
        },
        'content-marketing': {
            image: 'assets/images/services/seo.svg',
            blurb: 'Briefs built from real buyer questions and sales objections, written to be ' +
                   'useful rather than to hit a word count.',
            outcome: 'Content that ranks, gets cited, and answers the objection before it reaches ' +
                     'a sales call.',
            bestFor: [
                'Sales calls repeat the same five questions every time',
                'Your category involves a considered, researched purchase',
                'You have expertise competitors have not published',
                'SEO needs content depth to progress'
            ],
            notFor: [
                'The site cannot be crawled properly — fix <a class="link-inline" href="service-detail.html?service=technical-seo">technical SEO</a> first',
                'You need results within a month'
            ],
            includes: [
                'Interviews with your sales and delivery teams',
                'Editorial calendar mapped to search intent and sales objections',
                'Briefs specifying angle, structure, entities and internal links',
                'Written articles and page copy in US English',
                'Refresh programme for existing content that is losing position',
                'Reporting on organic entrances and assisted conversions per piece'
            ]
        },
        'branding': {
            image: 'assets/images/services/digital-marketing.svg',
            blurb: 'Positioning before expression. Who you serve, what you are better at, and ' +
                   'what you will decline.',
            outcome: 'A clear market position that makes every subsequent marketing decision ' +
                     'easier, and a visual system that applies consistently.',
            bestFor: [
                'You have moved upmarket or narrowed focus and the messaging has not followed',
                'Prospects misunderstand what you do or who you are for',
                'Several sub-brands or service lines have drifted apart',
                'A redesign is planned and the messaging needs settling first'
            ],
            notFor: [
                'You want a logo without the positioning work — we do not sell that separately',
                'The real problem is a broken funnel — consider <a class="link-inline" href="service-detail.html?service=conversion-rate-optimization">CRO</a>'
            ],
            includes: [
                'Positioning workshop and competitive differentiation analysis',
                'Messaging framework — value proposition, proof points, objection handling',
                'Visual identity system: logo, type, colour, imagery direction',
                'Application guidance across website, campaigns and documents',
                'Tone of voice guidance with worked examples'
            ]
        },
        'email-marketing': {
            image: 'assets/images/services/digital-marketing.svg',
            blurb: 'Segmented lifecycle flows triggered by behaviour — welcome, abandonment, ' +
                   'post-purchase, reactivation — not a monthly broadcast.',
            outcome: 'Revenue from an audience you already own, at the highest margin of any ' +
                     'channel available to you.',
            bestFor: [
                'You have a customer list nobody is emailing systematically',
                'Cart or enquiry abandonment is recoverable',
                'Repeat purchase or renewal is a meaningful part of revenue',
                'A newsletter goes out with no segmentation behind it'
            ],
            notFor: [
                'You have no list and no traffic to build one from — start with acquisition',
                'You want to email a purchased list — we will not do that'
            ],
            includes: [
                'Lifecycle flow architecture mapped to the customer journey',
                'Segmentation strategy based on behaviour and value',
                'Template design and build, tested across major clients',
                'Deliverability review — authentication, list hygiene, reputation',
                'Subject line and content testing programme',
                'Reporting on revenue per email and per segment'
            ]
        },
        'conversion-rate-optimization': {
            image: 'assets/images/services/digital-marketing.svg',
            blurb: 'Research, hypothesis, test, measure — with session recordings and funnel ' +
                   'analysis where traffic is too low for valid A/B testing.',
            outcome: 'A higher share of existing visitors becoming enquiries, which raises the ' +
                     'return on every other channel simultaneously.',
            bestFor: [
                'Traffic is healthy and enquiries are flat',
                'Cart, checkout or form abandonment is high',
                'You are about to increase acquisition spend',
                'Nobody knows why visitors leave the key pages'
            ],
            notFor: [
                'Traffic is very low — acquisition work will return more first',
                'The site is being rebuilt shortly — test the new one instead'
            ],
            includes: [
                'Funnel analysis identifying where and how much is lost',
                'Session recordings and heatmapping on key journeys',
                'Heuristic audit against known conversion principles',
                'Prioritised, falsifiable hypothesis backlog',
                'Implementation by our own developers',
                'Result write-ups including every test that failed'
            ]
        }
    };

    /* ======================================================================
       08. SERVICE-DETAIL TEMPLATE HYDRATION
       ====================================================================== */

    function hydrateServiceDetail() {
        const page = document.querySelector('[data-service-template]');
        if (!page) return;

        const slug = new URLSearchParams(window.location.search).get('service');
        if (!slug) return; // Authored defaults stand.

        const service = findService(slug);
        const detail = SERVICE_DETAIL[slug];
        if (!service || !detail) return;

        const parent = service.parent ? findService(service.parent) : null;
        const group = service.parent
            ? SERVICE_GROUPS.filter((g) => g.slug === service.parent)[0]
            : null;

        /* --- Text slots ------------------------------------------------- */
        setSvcField('name', service.name, page);
        if (parent) setSvcField('parent', parent.name, page);
        setSvcField('blurb', detail.blurb, page);
        setSvcField('outcome', detail.outcome, page);

        /* --- Hero image ------------------------------------------------- */
        $$('[data-svc-image]', page).forEach((img) => {
            img.setAttribute('src', detail.image);
        });

        /* --- Document metadata ------------------------------------------ */
        document.title = service.name + ' | Neoteric ERA';

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute(
                'href',
                'https://www.neotericera.com/service-detail.html?service=' + slug
            );
        }

        const description = document.querySelector('meta[name="description"]');
        if (description) {
            description.setAttribute('content', service.name + '. ' + detail.blurb);
        }

        /* --- Parent discipline link ------------------------------------- */
        if (group) {
            $$('[data-svc-parent-link]', page).forEach((link) => {
                link.setAttribute('href', group.page);
                link.textContent = group.name;
            });
        }

        /* --- Breadcrumb -------------------------------------------------- */
        const trail = $('[data-svc-breadcrumb]', page);
        if (trail) {
            const crumbs = [
                '<li class="breadcrumbs__item"><a href="index.html">Home</a></li>',
                '<li class="breadcrumbs__item"><a href="services.html">Services</a></li>'
            ];
            if (group) {
                crumbs.push(
                    '<li class="breadcrumbs__item"><a href="' + group.page + '">' +
                    group.name + '</a></li>'
                );
            }
            crumbs.push(
                '<li class="breadcrumbs__item"><span aria-current="page">' +
                service.name + '</span></li>'
            );
            trail.innerHTML = crumbs.join('');
        }

        /* --- Lists ------------------------------------------------------- */
        const listIcons = {
            bestFor: '<i class="bi bi-check2-circle" aria-hidden="true"></i>',
            notFor: '<i class="bi bi-dash-circle" aria-hidden="true" style="color: var(--colour-muted-dark);"></i>',
            includes: '<i class="bi bi-dot" aria-hidden="true"></i>'
        };

        Object.keys(listIcons).forEach((key) => {
            const container = $('[data-svc-list="' + key + '"]', page);
            if (!container || !detail[key]) return;
            container.innerHTML = detail[key].map((item) =>
                '<li>' + listIcons[key] + '<span>' + item + '</span></li>'
            ).join('');
        });

        /* --- Sibling services ------------------------------------------- */
        const siblings = $('[data-svc-siblings]', page);
        if (siblings && group) {
            siblings.innerHTML = group.children
                .filter((child) => child.slug !== slug)
                .map((child) =>
                    '<a href="service-detail.html?service=' + child.slug + '">' +
                    child.name + '</a>'
                ).join('');
        }
    }

    /* ======================================================================
       09. INDUSTRY DATA
       ----------------------------------------------------------------------
       Drives industry-detail.html. Each sector carries the four things that
       genuinely differ: how buyers decide, what counts as proof, the problems
       we normally find, and the channel that usually leads.
       ====================================================================== */

    const INDUSTRY_DETAIL = {
        'professional-services': {
            name: 'Professional Services',
            image: 'assets/images/industries/professional-services.svg',
            headline: 'Digital growth for professional services firms.',
            blurb: 'Buyers shortlist on credibility and specialism before price enters the ' +
                   'conversation. A generalist positioning is the most common reason a good firm ' +
                   'loses to a narrower competitor.',
            factDecision: 'Weeks',
            factChannel: 'SEO',
            behaviour: 'Prospects research extensively and privately before making contact, often ' +
                       'reading four or five firms\' sites in one session. By the time they call they ' +
                       'have already formed a view on whether you handle work of their size.',
            proof: [
                'Named specialism rather than a list of everything you could do',
                'Engagement examples with scope and outcome, not just client logos',
                'Named individuals with relevant background, not a generic team page',
                'Clear signals about minimum engagement size and typical client profile',
                'Published thinking that demonstrates judgement rather than marketing'
            ],
            problem1Title: 'Positioning too broad to be chosen',
            problem1Text: 'Listing every service you can deliver reads as having no particular ' +
                          'strength. Narrowing loses some enquiries and wins better ones.',
            problem2Title: 'No qualification before the call',
            problem2Text: 'Nothing on the site indicates engagement size, so the enquiry inbox ' +
                          'fills with work below the minimum you can profitably take.',
            problem3Title: 'Invisible for practice-area terms',
            problem3Text: 'Ranking for the firm name only, while competitors hold the ' +
                          'commercial-intent searches that actually generate mandates.'
        },
        healthcare: {
            name: 'Healthcare',
            image: 'assets/images/industries/healthcare.svg',
            headline: 'Digital growth for healthcare providers.',
            blurb: 'Patients decide quickly and locally, and abandon booking flows that were ' +
                   'designed for a desktop. Accessibility is not optional in this sector — it is ' +
                   'both a legal exposure and a conversion problem.',
            factDecision: 'Days',
            factChannel: 'Local SEO',
            behaviour: 'Most healthcare searches carry immediate need and strong location intent. ' +
                       'The patient is comparing three or four nearby options on a phone, checking ' +
                       'whether you take their insurance, and looking for the soonest appointment.',
            proof: [
                'Practitioner credentials and specialisms, stated plainly',
                'Insurance and payment options listed before the booking form',
                'Genuine location detail — parking, access, transit, opening hours',
                'Recent patient reviews from a verifiable platform',
                'Appointment availability visible rather than promised'
            ],
            problem1Title: 'Locations competing with each other',
            problem1Text: 'Multiple sites or near-identical location pages splitting authority, so ' +
                          'none establishes itself as the relevant local result.',
            problem2Title: 'Booking flows nobody finishes',
            problem2Text: 'Multi-step forms asking for insurance details before showing ' +
                          'availability, on a phone screen they were never designed for.',
            problem3Title: 'Accessibility failures',
            problem3Text: 'Poor contrast, unlabelled fields and keyboard traps. Here that is both a ' +
                          'legal exposure and a direct loss of patients.'
        },
        'real-estate': {
            name: 'Real Estate',
            image: 'assets/images/industries/real-estate.svg',
            headline: 'Digital growth for real estate businesses.',
            blurb: 'Buyers and sellers judge agents on local knowledge, and portals have trained ' +
                   'them to expect fast, filterable listings. Both have to be true on your own site.',
            factDecision: 'Months',
            factChannel: 'Local SEO',
            behaviour: 'Searches start broad and narrow to neighbourhood level over weeks or ' +
                       'months. Visitors return repeatedly, compare listings across sites, and ' +
                       'select an agent based on demonstrated area expertise rather than advertising.',
            proof: [
                'Neighbourhood-level content that shows genuine local knowledge',
                'Recent transactions with real detail, not just a sold count',
                'Listing pages that load fast and filter without page reloads',
                'Named agents with the areas they actually cover',
                'Market data presented rather than claimed'
            ],
            problem1Title: 'Listings slower than the portals',
            problem1Text: 'Visitors compare your site directly against portals with large ' +
                          'engineering teams. A slow or clumsy search sends them back there.',
            problem2Title: 'No neighbourhood-level pages',
            problem2Text: 'Competing only on city-wide terms, while the high-intent searches ' +
                          'happen at district and suburb level.',
            problem3Title: 'Listings that vanish from the index',
            problem3Text: 'High listing turnover with no strategy for expired properties, wasting ' +
                          'accumulated authority and creating dead ends.'
        },
        ecommerce: {
            name: 'Ecommerce',
            image: 'assets/images/industries/ecommerce.svg',
            headline: 'Digital growth for ecommerce retailers.',
            blurb: 'Revenue per visitor is decided by catalogue architecture, page speed and feed ' +
                   'quality together. Treating them as three separate projects is why most stores ' +
                   'plateau.',
            factDecision: 'Minutes to days',
            factChannel: 'Shopping and SEO',
            behaviour: 'Shoppers arrive from a mix of Shopping ads, organic category results and ' +
                       'direct return visits. They compare on price, delivery and returns, and ' +
                       'abandon at any point where a cost or a delay appears unexpectedly.',
            proof: [
                'Reviews on the product page, from a source shoppers recognise',
                'Delivery cost and timing shown before checkout begins',
                'Returns policy stated in plain terms, not buried in a footer link',
                'Stock accuracy — nothing erodes trust faster than a false in-stock signal',
                'Payment options appropriate to the basket size'
            ],
            problem1Title: 'Customers cannot find the product',
            problem1Text: 'A taxonomy inherited from supplier categories rather than built around ' +
                          'how customers describe what they want.',
            problem2Title: 'Faceted navigation creating crawl waste',
            problem2Text: 'Every filter permutation generating an indexable URL, consuming crawl ' +
                          'budget meant for real category and product pages.',
            problem3Title: 'Paid and organic competing',
            problem3Text: 'Shopping campaigns bidding on head terms where the store already holds ' +
                          'first organic position — buying traffic it already had.'
        },
        'saas-technology': {
            name: 'SaaS and Technology',
            image: 'assets/images/industries/saas-technology.svg',
            headline: 'Digital growth for SaaS and technology companies.',
            blurb: 'Two audiences evaluate you: the technical evaluator who recommends, and the ' +
                   'budget holder who approves. Most sites are written entirely for the first.',
            factDecision: 'Months',
            factChannel: 'Content and paid search',
            behaviour: 'Long, multi-stakeholder evaluations with several return visits and ' +
                       'documentation read in detail. Trials often stall not because the product ' +
                       'failed but because nobody could articulate its value to the approver.',
            proof: [
                'Integration list and API documentation that is genuinely current',
                'Security and compliance posture stated, not implied',
                'Pricing visible, or at least the model explained honestly',
                'Migration path from whatever they use now',
                'Customer examples at a comparable scale to the prospect'
            ],
            problem1Title: 'Written only for engineers',
            problem1Text: 'Technical evaluators understand it; the person approving the budget ' +
                          'cannot explain internally what they are buying.',
            problem2Title: 'Trials that stall silently',
            problem2Text: 'Sign-up works and activation does not. The onboarding sequence assumes ' +
                          'context the new user has not been given.',
            problem3Title: 'Documentation outranking the marketing site',
            problem3Text: 'Buyers landing in developer docs before ever seeing a page that explains ' +
                          'the commercial value.'
        },
        hospitality: {
            name: 'Hospitality',
            image: 'assets/images/industries/hospitality.svg',
            headline: 'Digital growth for hospitality businesses.',
            blurb: 'Every booking taken through a third-party platform costs commission on a guest ' +
                   'who was often already looking for you by name. Direct booking is the whole game.',
            factDecision: 'Days to weeks',
            factChannel: 'Direct booking optimisation',
            behaviour: 'Guests discover on aggregators, then frequently search the property by ' +
                       'name before booking. That branded search is the moment a direct booking is ' +
                       'won or handed to a platform.',
            proof: [
                'Photography that shows the actual rooms and spaces, not stock imagery',
                'Rate parity or a stated direct-booking advantage',
                'Cancellation terms in plain language',
                'Reviews shown from platforms guests already trust',
                'Real availability rather than an enquiry form'
            ],
            problem1Title: 'Losing branded search to aggregators',
            problem1Text: 'Guests searching for the property by name are being intercepted, and ' +
                          'commission is paid on a booking that was already yours.',
            problem2Title: 'A booking engine that fights the guest',
            problem2Text: 'Slow, poorly integrated, or opening in a new window with different ' +
                          'branding — every one of those costs completed bookings.',
            problem3Title: 'Budget spread evenly across a seasonal year',
            problem3Text: 'Demand swings sharply by season. Flat monthly spend overpays in the ' +
                          'trough and underinvests at the peak.'
        },
        construction: {
            name: 'Construction',
            image: 'assets/images/industries/construction.svg',
            headline: 'Digital growth for construction firms.',
            blurb: 'Commercial buyers are building a shortlist. They need scope, sector experience ' +
                   'and capacity before they will make contact — and most construction sites show ' +
                   'photographs instead.',
            factDecision: 'Months',
            factChannel: 'SEO and structured project evidence',
            behaviour: 'Procurement teams and developers research quietly, assessing whether you ' +
                       'have delivered work of comparable value and type. The site\'s job is to ' +
                       'survive that assessment and get onto the shortlist.',
            proof: [
                'Project values and durations, within whatever confidentiality allows',
                'Sector experience stated explicitly — healthcare, education, industrial',
                'Certifications, insurance levels and safety record',
                'Named delivery leads with relevant project history',
                'Evidence of capacity for a project of the enquirer\'s size'
            ],
            problem1Title: 'A portfolio with no qualifying information',
            problem1Text: 'Excellent photography and no way for a buyer to establish scope, value ' +
                          'band or sector fit. Enquiries stay limited to referral.',
            problem2Title: 'No filterable project evidence',
            problem2Text: 'A single gallery instead of projects organised by sector, value and ' +
                          'delivery type — so buyers cannot find their own situation.',
            problem3Title: 'Invisible for service and sector terms',
            problem3Text: 'No pages targeting the specific commercial searches procurement teams ' +
                          'run when building a shortlist.'
        },
        education: {
            name: 'Education',
            image: 'assets/images/industries/education.svg',
            headline: 'Digital growth for education providers.',
            blurb: 'Admissions demand arrives in a compressed window, and the enrolment journey has ' +
                   'to hold up under that concentration. A form that leaks 30% is far more ' +
                   'expensive in March than in August.',
            factDecision: 'Weeks, strongly seasonal',
            factChannel: 'Paid search in season plus CRO',
            behaviour: 'Prospective students and parents research over weeks, often on different ' +
                       'devices, and complete applications in several sittings. Anything that ' +
                       'cannot be saved and resumed loses applicants.',
            proof: [
                'Outcomes data — completion, progression, employment',
                'Accreditation and recognition stated clearly',
                'Genuine cost information including what is and is not included',
                'Student experience shown rather than described',
                'Entry requirements clear enough to self-qualify against'
            ],
            problem1Title: 'Applications that cannot be resumed',
            problem1Text: 'Long forms with no save-and-return, completed across several sittings ' +
                          'on different devices. Abandonment is structural, not motivational.',
            problem2Title: 'Course information scattered',
            problem2Text: 'Cost, duration, entry requirements and start dates spread across four ' +
                          'pages, so nobody can assess fit in one view.',
            problem3Title: 'Budget pacing ignoring the admissions cycle',
            problem3Text: 'Even monthly spend against sharply seasonal demand — overpaying out of ' +
                          'season and running out of budget at the peak.'
        },
        automotive: {
            name: 'Automotive',
            image: 'assets/images/industries/automotive.svg',
            headline: 'Digital growth for automotive businesses.',
            blurb: 'Commercial fleet contracts and one-off consumer repairs are different ' +
                   'businesses with different economics. Most automotive sites and campaigns treat ' +
                   'them as one.',
            factDecision: 'Hours to weeks',
            factChannel: 'Paid search, segmented by buyer type',
            behaviour: 'Consumer demand is urgent, local and price-sensitive. Commercial fleet ' +
                       'demand is contract-driven, assessed on capacity and turnaround, and worth ' +
                       'many multiples per customer. They should not share a landing page.',
            proof: [
                'Turnaround times and capacity, stated specifically',
                'Manufacturer approvals and technician certifications',
                'Contract terms and SLA options for fleet buyers',
                'Transparent pricing or an honest pricing model for consumers',
                'Local reviews from a platform customers recognise'
            ],
            problem1Title: 'One funnel for two different buyers',
            problem1Text: 'Fleet managers and individual motorists arriving on the same page, so ' +
                          'neither sees the information that would convert them.',
            problem2Title: 'High-value enquiries under-prioritised',
            problem2Text: 'Paid budget consumed by consumer repair searches while the far more ' +
                          'valuable commercial contract terms go unbid.',
            problem3Title: 'No local visibility for service terms',
            problem3Text: 'Competing on brand rather than on the urgent, location-qualified ' +
                          'searches that actually drive bookings.'
        },
        'home-services': {
            name: 'Home Services',
            image: 'assets/images/industries/home-services.svg',
            headline: 'Digital growth for home services businesses.',
            blurb: 'Demand is urgent, local and seasonal. The winner is usually whoever appears ' +
                   'first and answers fastest — which makes both local visibility and response ' +
                   'time part of the marketing.',
            factDecision: 'Hours',
            factChannel: 'Local SEO plus paid search',
            behaviour: 'Customers search with immediate need, call two or three providers, and ' +
                       'book whoever can attend soonest. Very little research and almost no brand ' +
                       'loyalty at the point of need.',
            proof: [
                'Licensing, insurance and bonding, stated up front',
                'Genuine availability — same-day, emergency, or scheduled',
                'Service area described precisely enough to self-qualify',
                'Recent local reviews with volume as well as rating',
                'Pricing model explained, even where exact figures are impossible'
            ],
            problem1Title: 'Thin location pages across the service radius',
            problem1Text: 'Dozens of pages differing only by city name. They compete with each ' +
                          'other and rank for nothing.',
            problem2Title: 'Seasonal demand met with flat spend',
            problem2Text: 'Budget spread evenly across a year with sharp seasonal peaks, so the ' +
                          'high-demand weeks are under-funded.',
            problem3Title: 'Mobile calling friction',
            problem3Text: 'The phone number not tappable, or buried below content, when most ' +
                          'traffic is a mobile user who wants to call now.'
        }
    };

    function setIndField(name, value, scope) {
        if (!value) return;
        $$('[data-ind-field="' + name + '"]', scope).forEach((el) => {
            el.textContent = value;
        });
    }

    function hydrateIndustry() {
        const page = document.querySelector('[data-industry-template]');
        if (!page) return;

        const slug = new URLSearchParams(window.location.search).get('industry');
        if (!slug) return; // Authored Healthcare default stands.

        const industry = INDUSTRY_DETAIL[slug];
        if (!industry) return;

        [
            'name', 'headline', 'blurb', 'factDecision', 'factChannel', 'behaviour',
            'problem1Title', 'problem1Text',
            'problem2Title', 'problem2Text',
            'problem3Title', 'problem3Text'
        ].forEach((key) => setIndField(key, industry[key], page));

        $$('[data-ind-image]', page).forEach((img) => {
            img.setAttribute('src', industry.image);
        });

        document.title = industry.name + ' Digital Marketing & Web Development | Neoteric ERA';

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute(
                'href',
                'https://www.neotericera.com/industry-detail.html?industry=' + slug
            );
        }

        const description = document.querySelector('meta[name="description"]');
        if (description) {
            description.setAttribute('content', industry.blurb);
        }

        const trail = $('[data-ind-breadcrumb]', page);
        if (trail) {
            trail.innerHTML =
                '<li class="breadcrumbs__item"><a href="index.html">Home</a></li>' +
                '<li class="breadcrumbs__item"><a href="industries.html">Industries</a></li>' +
                '<li class="breadcrumbs__item"><span aria-current="page">' + industry.name + '</span></li>';
        }

        const proof = $('[data-ind-list="proof"]', page);
        if (proof && industry.proof) {
            proof.innerHTML = industry.proof.map((item) =>
                '<li><i class="bi bi-check2-circle" aria-hidden="true"></i><span>' + item + '</span></li>'
            ).join('');
        }

        // Cross-links to every other sector.
        const others = $('[data-ind-others]', page);
        if (others) {
            others.innerHTML = Object.keys(INDUSTRY_DETAIL)
                .filter((key) => key !== slug)
                .map((key) =>
                    '<a href="industry-detail.html?industry=' + key + '">' +
                    INDUSTRY_DETAIL[key].name + '</a>'
                ).join('');
        }
    }

    /* ======================================================================
       INITIALISATION
       ====================================================================== */

    function safely(name, fn) {
        try {
            fn();
        } catch (error) {
            if (window.console && console.warn) {
                console.warn('[Neoteric ERA] location module "' + name + '" failed:', error);
            }
        }
    }

    function start() {
        safely('stateCities', renderStateCities);
        safely('allCities', renderAllCities);
        safely('serviceLocations', renderServiceLocations);
        safely('locationCards', renderLocationCards);
        safely('hydrateTemplate', hydrateTemplate);
        safely('hydrateServiceDetail', hydrateServiceDetail);
        safely('hydrateIndustry', hydrateIndustry);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    /* Published for reuse by other modules and for console inspection. */
    window.NeotericERA = window.NeotericERA || {};
    window.NeotericERA.data = {
        serviceGroups: SERVICE_GROUPS,
        allServices: ALL_SERVICES,
        serviceDetail: SERVICE_DETAIL,
        industries: INDUSTRY_DETAIL,
        locations: LOCATIONS,
        priorityCombinations: PRIORITY_COMBINATIONS,
        allCities: allCities,
        findState: findState,
        findCity: findCity,
        findService: findService,
        cleanUrl: cleanUrl,
        templateUrl: templateUrl
    };
})();
