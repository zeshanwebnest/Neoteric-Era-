# Neoteric ERA — Website Front-End

A production-quality, multi-page static front-end for **Neoteric ERA IT Services**,
a digital agency providing website development, SEO, Google Ads and digital
marketing to businesses in the United States.

Built with HTML5, CSS3, vanilla JavaScript (ES6+) and Bootstrap 5. No build step,
no framework, no dependencies to install.

> **Status: front-end complete, backend pending.** Every page is finished and
> functional. The portfolio is real: 33 client projects, 24 of them showing a
> screenshot verified by eye against the live site. The forms are not yet
> connected to a backend, and the remaining unverified claims are visibly
> flagged.
> See [Remaining production tasks](#remaining-production-tasks).

---

## Contents

1. [Overview](#overview)
2. [Technology stack](#technology-stack)
3. [Folder structure](#folder-structure)
4. [Running locally](#running-locally)
5. [Page list](#page-list)
6. [Design system](#design-system)
7. [The logo system](#the-logo-system)
8. [Imagery](#imagery)
9. [Responsive behaviour](#responsive-behaviour)
10. [Component list](#component-list)
11. [Template architecture](#template-architecture)
12. [Data integration](#data-integration)
13. [Form backend integration](#form-backend-integration)
14. [SEO implementation](#seo-implementation)
15. [Accessibility](#accessibility)
16. [Performance](#performance)
17. [Deployment](#deployment)
18. [Remaining production tasks](#remaining-production-tasks)

---

## Overview

**Client:** Neoteric ERA IT Services
**Audience:** Businesses in the United States
**Office:** Muslim Town, Lahore, Pakistan
**Phone:** +92 309 0155045
**Email:** `hello@neotericera.com` — **placeholder, must be confirmed**

| Priority  | Conversion                      | Where                                   |
|-----------|---------------------------------|-----------------------------------------|
| Primary   | Consultation / proposal request | `contact.html`, CTA band on every page   |
| Secondary | WhatsApp conversation           | Floating button, drawer, every CTA band |
| Tertiary  | Portfolio engagement            | `portfolio.html`                         |

**Positioning:** a strategic digital growth partner, not a low-cost outsourcing
supplier. The homepage leads with the four disciplines the business actually
sells — website development, SEO, Google Ads and digital marketing — and the copy
consistently states what the company will *not* do. That specificity is what
separates this from a commodity agency site.

**Portfolio is deliberately secondary.** It is proof, reachable in one click from
anywhere, but it is not the argument. The argument is the service pages.

---

## Technology stack

| Layer         | Choice                                 | Notes                                        |
|---------------|----------------------------------------|----------------------------------------------|
| Markup        | HTML5, semantic                        | No framework; viewable with no build step    |
| Styling       | CSS3 with custom properties            | Five stylesheets, cascade-ordered            |
| Layout        | Bootstrap 5.3.3 **(CSS only)**         | Grid, containers, utilities, breakpoints     |
| Scripting     | Vanilla JavaScript ES6+                | Five modules, zero dependencies              |
| Icons         | Bootstrap Icons 1.11.3                 | CDN                                          |
| Display font  | Plus Jakarta Sans (500–800)            | Headings, display, UI                        |
| Body font     | Inter (400–700)                        | Body copy, forms, small text                 |
| Animation     | CSS transforms + Intersection Observer | No animation library                         |
| Imagery       | 72 files                               | 24 verified client screenshots + licensed stock |

### Deliberate omissions

**Bootstrap's JavaScript bundle is not loaded.** The header, mobile drawer, mega
menu, accordions, testimonial slider and form validation are all custom vanilla
implementations. Loading the ~80KB bundle to duplicate existing functionality
would be dead weight on every page. The overrides in `bootstrap-overrides.css`
already style Bootstrap's JS components if you later introduce one.

No jQuery, GSAP, AOS, Swiper or Slick. No React, Vue, Angular or Tailwind.

---

## Folder structure

```text
Neoteric-era/
│
├── index.html                        Homepage (11 sections)
├── about.html
├── services.html                     Services hub
├── service-web-development.html      Pillar service page
├── service-seo.html                  Pillar service page
├── service-google-ads.html           Pillar service page
├── service-digital-marketing.html    Pillar service page
├── service-detail.html               ★ Template — 26 child services
├── portfolio.html                    33 projects, filterable
├── blog.html                         Listing with search + filters
├── blog-detail.html                  Single article
├── faq.html                          Four topics, FAQPage schema
├── contact.html
├── privacy-policy.html
├── terms.html
├── 404.html
│
├── robots.txt · sitemap.xml · site.webmanifest · README.md
│
└── assets/
    ├── css/
    │   ├── bootstrap-overrides.css   Bootstrap remap + re-skin
    │   ├── style.css                 Tokens, surfaces, base, header, hero, footer
    │   ├── components.css            Component library
    │   ├── animations.css            Reveal system, keyframes, reduced motion
    │   └── responsive.css            Breakpoint layer (loaded last)
    │
    ├── js/
    │   ├── main.js                   Header, nav, accordions, slider, TOC, share
    │   ├── animations.js             Reveals, counters, process stepper
    │   ├── portfolio-filter.js       Portfolio + blog filtering, project data
    │   ├── form-validation.js        Validation, submission states
    │   └── location-data.js          Service taxonomy + template hydration
    │
    ├── images/
    │   ├── branding/    (4)          Logo suite — dark, light, mark, favicon
    │   ├── work/       (24)          Verified screenshots of live client sites
    │   ├── team/       (15)          Team, author and client portraits
    │   ├── services/   (12)          Service and process imagery
    │   ├── hero/        (9)          Page heroes and CTA backgrounds
    │   └── blog/        (8)          Article imagery
    │
    └── fonts/                        Reserved for self-hosted fonts
```

★ = one file serves many URLs. See [Template architecture](#template-architecture).

**CSS load order matters** and is identical on every page:

```text
bootstrap.min.css → bootstrap-overrides.css → style.css
                  → components.css → animations.css → responsive.css
```

`responsive.css` loads last so breakpoint rules win without `!important`.

---

## Running locally

No build step. No `npm install`.

**Open directly:** double-click `index.html`. Everything works except the
query-string template (`service-detail.html?service=…`), which some browsers
restrict on `file://`.

**Local server (recommended):**

```bash
python -m http.server 8000     # Python 3
npx serve .                    # Node
php -S localhost:8000          # PHP
```

Then open `http://localhost:8000`.

---

## Page list

**16 HTML pages · 72 images · 4 logo files · 5 stylesheets · 5 JS modules**

### Homepage — 11 sections

| # | Section        | Surface       | Purpose                                            |
|---|----------------|---------------|----------------------------------------------------|
| 1 | Hero           | ink gradient  | Who we are, what we do, why choose us; dual CTA    |
| 2 | Trusted by     | white         | Client logo marquee                                 |
| 3 | Services       | tint          | The four disciplines, one card each                 |
| 4 | Why us + stats | ink gradient  | Differentiators with animated counters              |
| 5 | Selected work  | white         | Six real project screenshots                        |
| 6 | Process        | tint          | Six steps, sticky stepper                           |
| 7 | Technology     | white         | Stacks we build on, grouped                         |
| 8 | Testimonials   | brand tint    | Slider — prev/next, dots, keyboard, swipe           |
| 9 | Insights       | white         | Latest articles                                     |
| 10| FAQ            | tint          | Accordion, backed by `FAQPage` schema               |
| 11| CTA band       | ink           | Proposal, WhatsApp, phone, email                    |

The hero states the offer, the four service chips link straight to the pillar
pages, and a trust row carries four verifiable facts. Everything above the fold
answers *what do you do* and *why you*.

### Other pages

| Page                             | Notes                                                   |
|----------------------------------|---------------------------------------------------------|
| `about.html`                     | Story, philosophy, method, team, global reach           |
| `services.html`                  | Hub — all four disciplines with child-service listings  |
| `service-web-development.html`   | Pillar — 10 sections including real work evidence       |
| `service-seo.html`               | Pillar — same structure, SEO-specific                   |
| `service-google-ads.html`        | Pillar — same structure, paid-specific                  |
| `service-digital-marketing.html` | Pillar — same structure, marketing-specific             |
| `service-detail.html`            | Template — hydrates 26 child services from a query string |
| `portfolio.html`                 | 33 projects, filter by platform and sector              |
| `blog.html` / `blog-detail.html` | Listing with live search; one complete article          |
| `faq.html`                       | 14 questions across four topics, with `FAQPage` schema  |
| `contact.html`                   | Consultation form, contact detail, FAQ                  |
| `privacy-policy.html`            | **Template — requires legal review**                    |
| `terms.html`                     | **Template — requires legal review**                    |
| `404.html`                       | `noindex`; signposts to the four services               |

**Pages deliberately removed:** `case-studies.html`, `case-study-detail.html`,
`industries.html`, `industry-detail.html`, `locations.html`,
`state-detail.html`, `city-detail.html`, `service-location.html`,
`portfolio-detail.html`.

They described work and coverage the business could not yet evidence. Every
inbound link was repointed rather than left to 404 — the sector lists became
descriptive labels, and case-study links now point at the real portfolio.

`faq.html` was removed in that same pass and has since been **reinstated** as a
first-class page. It earns its place: it carries `FAQPage` schema and is
eligible for rich results, and the questions it answers — price, timeline,
lock-in, ownership — are the ones that decide whether an enquiry is sent.

---

## Design system

Everything is driven by CSS custom properties in `style.css`. Change a token,
change the whole site.

### It is a light theme with dark punctuation

The site is light-dominant: white, cool tint and brand tint carry the reading.
Dark bands appear deliberately — the hero, one mid-page proof band, the CTA — to
break the page into chapters and to make the light sections feel lighter. A
uniformly white site reads as a template; alternating surfaces is most of what
makes a page feel designed.

### Colour

```css
/* Ink — dark surfaces and text */
--ink-950: #05070F;   --ink-900: #0A0E1C;   --ink-800: #111729;
--ink-700: #1B2338;   --ink-600: #2A3450;

/* Slate — light surfaces and body copy */
--slate-900: #0F172A;  --slate-700: #334155;  --slate-500: #64748B;
--slate-50:  #F8FAFC;  --white:     #FFFFFF;

/* Brand — indigo, the primary identity colour */
--brand-500: #4F46E5;  --brand-600: #4338CA;
--brand-300: #818CF8;  --brand-50:  #EEF2FF;

/* Support */
--violet-500: #7C3AED;  --cyan-400: #22D3EE;

/* Accent — coral, reserved for conversion */
--accent-500: #FF6B35;  --accent-600: #E14E1D;  --accent-100: #FFE8DF;

/* Gradients */
--grad-brand:      linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #22D3EE 100%);
--grad-brand-soft: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
--grad-accent:     linear-gradient(135deg, #FF6B35 0%, #FF4E88 100%);
--grad-ink:        linear-gradient(165deg, #0A0E1C 0%, #141B33 55%, #0A0E1C 100%);
```

**Indigo is the brand; coral is the conversion.** Coral appears only on primary
CTAs and on the single most important tag in a group. If it starts appearing
everywhere it stops meaning anything.

**Two-value accent for contrast.** `--brand-600` is used for small text on light
surfaces (meets 4.5:1); `--brand-500` and `--brand-300` are reserved for large
text, icons and fills. This is why `--accent-contextual` exists per surface
rather than as a single global value.

### Surface contexts

The core idea of the system. A section declares a palette; every component
inside it reads contextual tokens rather than hard-coded colours. One set of card
markup therefore works on any background.

```html
<section class="section surface-ink">
  <article class="card-base">…</article>   <!-- inverts automatically -->
</section>
```

| Class                | Background      | Body text      | Accent        |
|----------------------|-----------------|----------------|---------------|
| `.surface-white`     | white           | slate-900      | brand-600     |
| `.surface-tint`      | slate-50        | slate-900      | brand-600     |
| `.surface-brand-tint`| brand-50        | slate-900      | brand-600     |
| `.surface-ink`       | ink-900         | white          | brand-300     |
| `.surface-gradient`  | ink gradient    | white          | brand-300     |

Each context sets `--surface`, `--surface-raised`, `--surface-sunken`,
`--on-surface`, `--on-surface-soft`, `--on-surface-muted`, `--border`,
`--border-strong`, `--accent-contextual`, `--btn-solid-bg`, `--btn-solid-fg`,
`--field-bg` and the two card shadows.

Adding a dark mode later means adding a sixth context and applying it at `:root`.

### Background treatments

Layered inside `.bg-decor` (which is `overflow: hidden`, so nothing it contains
can widen the page):

- `.orb` — large blurred colour fields; variants `orb-brand`, `orb-violet`,
  `orb-cyan`, `orb-accent`, positioned by `orb-1/2/3`
- `.bg-grid` — fine grid lines that pick up the surface's line colour
- `.bg-rings` — concentric rings
- `.bg-topglow` — a soft glow behind the header on dark heroes
- `.bg-noise` — a very low-opacity grain that stops large gradients banding

Both `.orb` and `.bg-rings` are dropped below 600px: the blur is expensive and
neither is visible at that size.

### Typography

**Plus Jakarta Sans** for display and headings — geometric, slightly humanist,
holds tight even colour at large sizes. **Inter** for body and UI — designed for
screen reading at small sizes.

```css
--font-display: 'Plus Jakarta Sans', …;
--font-body:    'Inter', …;
```

The scale is fluid and has **no typography media queries** — every size is a
`clamp()`, so text scales continuously rather than jumping at breakpoints.

| Token         | Range              | Use                        |
|---------------|--------------------|----------------------------|
| `--t-display` | 2.75 → 4.75rem     | Hero H1                    |
| `--t-h1`      | 2.25 → 3.5rem      | Page titles                |
| `--t-h2`      | 1.85 → 2.65rem     | Section headings           |
| `--t-h3`      | 1.35 → 1.65rem     | Card and sub headings      |
| `--t-lead`    | 1.05 → 1.25rem     | Lead paragraphs            |
| `--t-body`    | 1rem               | Body copy                  |
| `--t-small`   | 0.875rem           | Meta, captions             |
| `--t-label`   | 0.75rem            | Eyebrows, tags (uppercase) |

Headings are tightly tracked (`-0.03em` at display sizes) and set at
`line-height: 1.08–1.2`. Body copy runs at `1.7` with a `68ch` measure cap.

Gradient-filled words inside headings use `.heading-accent`, which applies
`--grad-brand` with `background-clip: text`.

### Spacing and motion

```css
--section-space: clamp(3.5rem, 2.4rem + 3.6vw, 6rem);
--gutter:        clamp(1.25rem, 0.6rem + 2.2vw, 2.75rem);
--content-max:   1280px;
--header-h:      80px;
--topbar-h:      40px;
```

`--section-space` is deliberately tighter than the previous revision. Excess
vertical whitespace reads as unfinished rather than premium; the separation now
comes from surface changes and dividers, not from empty space.

Motion: `--d-micro: 180ms`, `--d-component: 340ms`, `--d-reveal: 720ms`, with
`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. Only `transform`, `opacity` and
`clip-path` are animated.

---

## The logo system

Four files in `assets/images/branding/`:

| File             | Use                                                        |
|------------------|------------------------------------------------------------|
| `logo-dark.svg`  | **Primary.** Full lockup for light backgrounds             |
| `logo-light.svg` | White version for dark backgrounds and the ink hero        |
| `logo-mark.svg`  | Symbol alone — app icons, avatars, watermarks, small sizes |
| `favicon.svg`    | Browser tab, bookmarks, PWA icon                           |

### The mark — "The Aperture"

Six tapered blades rotated at 0°, 60°, 120°, 180°, 240° and 300°, each scaled
progressively from 1.0 down to 0.60 with opacity falling from 1.0 to 0.40,
filled with the brand gradient and centred on a dark dot.

It reads three ways, all of them on-message: a camera aperture (focus), a
rotating system (technology), and forward motion (growth). It survives at 16px,
where a literal illustration would not.

### The wordmark

Reads **NEOTERIC** in ink, **ERA** in the brand gradient, with **IT SERVICES**
below as a spaced-out descriptor. Two weights of information in one lockup: the
name, and what the company actually does. A visitor who sees only the logo still
learns the business.

The letterforms are drawn as outlined geometric monoline paths on a 64×100 grid
with a 13-unit stroke — **not live `<text>`**. The logo therefore renders
identically everywhere regardless of installed fonts or a failed webfont load,
which is the whole point of a logo file.

### Header behaviour

Both the dark and light lockups are present in the header markup, stacked, and
cross-faded with CSS opacity. The transparent-over-dark header shows the white
version; once condensed on scroll, it swaps to the dark one. No JavaScript, no
flash, no second network request.

---

## Imagery

### Real client work

`assets/images/work/` holds screenshots captured from the client's own live
sites, sourced from the project spreadsheet. Every one is a real, currently-live
site, and every card links to it.

Captured at 1000×750 and served as WebP, roughly 20–75KB each. They are
displayed inside a browser-chrome frame (`.work-card`) so they read
unambiguously as *a website we built* rather than as decorative photography. On
hover, the screenshot scrolls from top to bottom over 2.2s, revealing the full
page.

#### The capture recipe, and why it matters

Screenshots go through `image.thum.io` and are converted to WebP by
`images.weserv.nl`. The option string is not arbitrary:

```text
viewportWidth/1400/width/1400/crop/1050/wait/12/maxAge/1/noanimate/
```

- **`viewportWidth`** separate from `width` — Shopify themes serve a mobile
  layout to a narrow viewport, and several simply refuse to paint. Every Shopify
  store in the sheet failed until this was set.
- **`wait/12`** — Shopify hydrates client-side. Without a wait, the renderer
  captures an empty shell.
- **`maxAge/1`** — thum.io caches failures. Without this, a URL that failed once
  keeps being served the same placeholder from cache no matter how many times
  you retry.

#### Verify captures by size, always

**The renderer returns HTTP 200 for its own error pages.** A "site can't be
reached" screen, a Cloudflare bot interstitial and a thum.io placeholder all
arrive as a perfectly valid image with a success status.

Six such images shipped in an earlier round before this was caught — including
one on the live portfolio page showing Chrome's error screen under a client's
name. That is worse than having no card at all.

The gate is now a size floor, because those pages are near-white with a little
text and compress to a distinctive band:

| Kind | Size as WebP |
|------|--------------|
| thum.io placeholder | exactly 13,527 bytes |
| Chrome error page | ~8,000–8,300 bytes |
| Cloudflare interstitial | ~12,000 bytes |
| **Genuine screenshot** | **19,000 bytes and up** |

`shots3.sh` rejects anything under 17KB after conversion and deletes the file.
`gen-portfolio2.sh` then skips any row without a surviving image, so a failed
capture removes the card rather than publishing a broken one.

**If you add projects, spot-check the new images by eye.** The size floor
catches the known failure modes; it cannot catch a site that renders a cookie
wall or a "coming soon" page, both of which are large enough to pass.

#### What is not captured

Password-gated stores, `*.myshopify.com` test shops, staging URLs and sites that
block automated renderers outright are absent rather than substituted. The
portfolio page says so explicitly in a closing note, and invites the visitor to
ask for specific work.

### Stock imagery — 44 files

Team portraits, service illustrations, page heroes and article imagery come from
Unsplash under the Unsplash License (free for commercial use, no attribution
required). All are WebP, sized to their display dimensions.

Every one is topically constrained to the business: web development, SEO,
analytics, advertising, marketing, UI/UX, technology and IT services. Nothing
generic-corporate.

### Replacing an image

1. Export as WebP at the exact display size (see `width`/`height` in the markup).
2. Keep the same filename to avoid touching the HTML.
3. Update the `alt` text — it must describe the image, not repeat the heading.
4. If the dimensions change, update `width` and `height` too, or you reintroduce
   layout shift.

### Rules already applied — keep them

- Every `<img>` carries explicit `width` and `height`
- Hero images use `fetchpriority="high"` and are never lazy-loaded
- Everything below the fold is `loading="lazy" decoding="async"`
- Decorative images have `alt=""`; meaningful ones describe content
- The lazy-fade is gated behind a class `animations.js` adds on boot, so a
  blocked script can never leave images stuck invisible

### Client logos

There are none, deliberately. The homepage marquee names ten real clients as
text rather than reproducing their marks. Client logos are trademarks: do not
publish one without written permission on file. The six generic placeholder
SVGs that used to sit in `assets/images/logos/` were removed once it was clear
nothing referenced them.

---

## Responsive behaviour

| Breakpoint | Change                                                           |
|------------|------------------------------------------------------------------|
| 1800px     | Container widens; hero display size increases                    |
| 1280px     | Container caps; grid gaps tighten                                |
| 1180px     | Mega menu feature panel reflows to a single column               |
| 1080px     | **Drawer takes over.** Desktop nav and mega menu hidden          |
| 900px      | Editorial two-column layouts stack; process stepper unsticks     |
| 768px      | Card grids to one column; CTA band stacks                        |
| 600px      | Orbs and rings removed; hero visual simplifies                   |
| 480px      | Type floors reached; buttons full-width                          |
| 380/340px  | Final compressions for small Android devices                     |

Plus landscape-phone rules, a `pointer: coarse` block, and print styles.

### The mega menu

The previous revision's mega menu overflowed on laptops. Fixed by:

```css
.mega-menu { width: min(100vw, 1280px); }
.mega-menu__columns { grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }
```

`min(100vw, …)` means it can never be wider than the viewport, and `auto-fit`
means the column count follows the available width instead of being asserted.

Opens on hover with a close delay so diagonal mouse paths survive, and on
click/Enter for keyboard users. `Escape` closes and returns focus to the trigger.

### The mobile drawer

Full-screen, focus-trapped, `Escape` to close, focus restored to the toggle on
close. Scroll locking is reference-counted so the drawer and any future modal
cannot unlock each other prematurely. Contains the full navigation, collapsible
service groups, contact details and both CTAs — it is not a reduced menu.

---

## Component list

**Navigation** — topbar (session-dismissable) · sticky header with
transparent-over-dark and solid modes · services mega menu · full-screen mobile
drawer · breadcrumbs · back-to-top · floating WhatsApp · skip link

**Content** — service cards (standard + wide feature) · capability pillars ·
work cards (browser-chrome screenshot frame) · post cards · team cards · value
tiles · timeline · advantage list · comparison table · spec list · check list ·
callout · pull quote · statement band

**Data** — statistics strip with animated counters · metric comparison bars ·
data tables · tech stack groups · logo marquee

**Interactive** — sticky process stepper · testimonial slider (prev/next, dots,
keyboard, swipe, autoplay with pause) · FAQ accordion · portfolio filters
(chips + selects, AND across groups, live counts, deep linking) · blog search ·
reading progress · auto-generated sticky table of contents · share + copy link

**Forms** — consultation form (10 fields, per-field rules, inline errors, loading
and success states) · newsletter form

---

## Template architecture

`service-detail.html` serves 26 child-service URLs from one file. This maps
one-to-one onto how a CMS will render these routes.

| Template              | Serves      | Query string                   | Data source      |
|-----------------------|-------------|--------------------------------|------------------|
| `service-detail.html` | 26 services | `?service=shopify-development` | `SERVICE_DETAIL` |

Data lives in `assets/js/location-data.js`. Hydration fills `[data-svc-field]`
slots and updates the title, canonical, meta description and breadcrumb.

**Opened with no query string it renders a complete, readable, indexable page.**
There is no empty shell.

`robots.txt` blocks the parameterised forms so one template is not indexed
twenty-six times over. When these become real paths
(`/services/website-development/shopify-development/`), add each to
`sitemap.xml` and drop the matching `Disallow`.

---

## Data integration

### Portfolio — done

The portfolio is built from the client's project spreadsheet, which is a
**reference list, not a display format**. It is not rendered as a table. Each
project is a card with a screenshot, name, platform, sector, description and a
link to the live site.

Two representations are kept in sync:

1. **The cards in `portfolio.html`** — written into the HTML, not generated by
   JavaScript, so the portfolio stays crawlable with scripts disabled.
2. **`PORTFOLIO_PROJECTS`** at the foot of `portfolio-filter.js` — the
   machine-readable twin, and the target shape for a CMS migration.

Both are generated from the same source list. **Regenerate rather than
hand-edit**, or they drift.

Filter attributes on each card are `data-platform` (wordpress / shopify) and
`data-sector`. Keep these in sync with the filter chips and the select.

**Regenerate with:**

```bash
bash scratchpad/gen-portfolio2.sh   # rewrites portfolio.html AND the JS mirror
pwsh scratchpad/build.ps1           # assembles the page from partials
```

#### Cards with and without a screenshot

Of the 33 projects, **24 carry a verified screenshot** and 9 do not. The nine
are real, live client sites whose stores block automated renderers; rather than
drop them or fake an image, they get a gradient tile carrying the domain
(`.work-card__shot--none`) and the same "Visit site" link as every other card.
Rows with screenshots sort first, so the grid opens with real work.

The generator sets `hasScreenshot: true|false` on each entry in
`PORTFOLIO_PROJECTS`, so a future import knows exactly which ones still need a
capture.

#### Do not trust the platform column blindly

Several descriptions in the first pass were written from the domain name and
were simply wrong — `corva.co.uk` was described as a technology consultancy and
is a plumbing and heating company; `industrialpalm.com` was described as an
industrial supplier and is a vape buying guide. Every description now in the
generator was written **after looking at the captured screenshot**.

Three sites were also dropped after inspection, and it is worth knowing why,
because the same checks apply next time:

| Site | Why it was dropped |
|------|--------------------|
| `pakistanstories.pk` | Serving injected casino spam in Dutch — the site is compromised |
| `snrentp.com` | Domain expired; now a GoDaddy for-sale parking page |
| `earcare.dynamasstech.com` | Duplicate of Clear Ear on a dev subdomain |
| `autofocuss.co.uk` / `.in` | Byte-identical to `autofocuss.com`; three cards for one site is padding |

**Check a client's site still belongs in the portfolio before publishing it.**
A domain that lapsed or got compromised is worse on a portfolio page than an
absence, and neither shows up in any automated check.

### Remaining placeholders

34 visible `.placeholder-note` badges remain across the site, in these
categories:

| Marker                  | Count | Meaning                                     |
|-------------------------|-------|---------------------------------------------|
| Legal review required   | 6     | Privacy policy and terms clauses            |
| Confirm                 | 5     | Email address, contact details              |
| Approval needed         | 4     | Testimonials and named quotes               |
| Verify                  | 3     | Statistics not yet reconciled to analytics  |
| Name provider           | 3     | Third-party services named in the policy    |
| Others                  | 13    | Author bios, backend hooks, map placeholder |

These render as small dashed badges. Remove `class="is-annotated"` from `<body>`
to hide them for a client presentation. **Delete the markers themselves before
launch — hiding is not removing.**

---

## Form backend integration

**Both forms are inert. Nothing is transmitted anywhere.**

Search `assets/js/form-validation.js` for `TODO: BACKEND` — two locations.

Consultation form payload (from `contact.html`):

```json
{
  "fullName": "", "workEmail": "", "phone": "", "company": "",
  "websiteUrl": "", "service": "", "budget": "", "startDate": "",
  "projectDescription": "", "consent": "on"
}
```

### Mandatory before accepting live traffic

1. **Server-side validation.** The client-side rules are a convenience for the
   visitor, never a security control.
2. **Spam mitigation** — CAPTCHA, rate limiting, or a signed nonce.
3. **HTTPS-only** submission.
4. **Record consent state and timestamp.**
5. **Notification recipient and autoresponder** configured.
6. **On failure, show an inline error and keep the visitor's input.** Never clear
   a completed form on a network error.

Newsletter: use **double opt-in**. The privacy policy states consent as the
lawful basis.

---

## SEO implementation

Per page: unique title and meta description (verified unique across all 15),
canonical, Open Graph, Twitter Card, exactly one `<h1>`, correct heading order,
semantic landmarks, breadcrumbs, descriptive alt text, deep internal linking.

**JSON-LD provided:** `Organization` · `ProfessionalService` · `WebSite` +
`SearchAction` · `BreadcrumbList` (every internal page) · `Service` +
`OfferCatalog` · `FAQPage` · `Article` · `Blog` / `CollectionPage` ·
`ContactPage` · `AboutPage` · `ItemList`. All blocks are verified to parse.

**No `AggregateRating` or `Review` schema is present** — adding it without
verified review data risks a manual action and is dishonest regardless.

`sitemap.xml` lists **only pages that exist**. A sitemap advertising URLs that
404 is discounted as a discovery signal, so the aspirational location and
industry URLs from the previous revision have been removed along with the pages.

### Before launch

1. Replace `www.neotericera.com` in every canonical, `og:url`, JSON-LD `@id`,
   `robots.txt` and `sitemap.xml`.
2. Replace `.html` URLs with clean paths and configure server rewrites.
3. Regenerate `sitemap.xml` with real `lastmod` dates.
4. On staging, serve `Disallow: /` **and** HTTP auth — a robots directive is a
   request, not a lock.
5. Ensure `404.html` returns a genuine **HTTP 404**, not 200.

---

## Accessibility

Targets WCAG 2.2 AA.

- Skip-to-content link; full keyboard operability; visible `:focus-visible` rings
- Mobile drawer traps focus, closes on `Escape`, restores focus to the trigger
- Mega menu opens on hover *and* click/Enter; closes on `Escape` and focus-out
- Accordions use real `<button>` elements with `aria-expanded` / `aria-controls`
  and arrow/Home/End key traversal
- Slider: inert slides are `aria-hidden` and removed from the tab order; state
  announced via a live region; autoplay pauses on hover and focus
- Every form control has a `<label>`; errors use `role="alert"`; `aria-invalid`
  reflects state
- Filters announce result counts through a live region
- Reduced motion honoured — reveals resolve instantly, ambient loops and autoplay
  stop, the custom cursor is removed
- No hover-only functionality; coarse-pointer devices get persistent affordances
- Accent text meets 4.5:1 on light surfaces via the two-value accent system;
  focus rings switch to `--brand-300` on dark surfaces so they stay visible

**Still to verify manually:** screen-reader passes (NVDA, VoiceOver) and a full
keyboard walkthrough on real devices. Automated tooling misses most real barriers.

---

## Performance

### Already implemented

- Hero image `fetchpriority="high"`, never lazy-loaded
- Every `<img>` has `width` and `height` — layout shift is designed out
- All scripts `defer`red
- Bootstrap JS bundle deliberately not loaded (~80KB saved per page)
- Only the weights actually used are requested from Google Fonts
- Animations use only `transform`, `opacity` and `clip-path`
- Scroll and pointer handlers throttled with `requestAnimationFrame`
- Event delegation instead of per-element listeners
- Observers unobserve after firing
- Expensive blur effects removed below 600px
- Screenshots converted to WebP: ~40KB each rather than ~400KB as PNG

### To do before launch

1. **Self-host the fonts** — removes two DNS lookups. Subset to Latin.
2. **Subset Bootstrap Icons** — only ~60 glyphs are used; an SVG sprite would be
   far smaller than the full icon font.
3. **Add `srcset` + `sizes`** to the largest images.
4. **Minify** CSS and JS for production; keep readable sources in version control.
5. **Consider trimming Bootstrap** — only the grid, containers, utilities and
   breakpoints are used.
6. **Enable Brotli**, long cache headers on `assets/`, HTTP/2.
7. **Re-audit** with Lighthouse and real field data.

### Lazy-load the map

`contact.html` contains a map **placeholder**, not a live iframe. Load on
interaction or after consent — an eager map iframe costs LCP and sets
third-party cookies before the visitor has agreed.

---

## Deployment

Any static host. No build step, no server runtime.

**Netlify / Vercel / Cloudflare Pages:** drag the folder in or connect the repo.
Build command: none. Publish directory: project root. `404.html` is automatic.

**Apache:**

```apache
ErrorDocument 404 /404.html

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^\.]+)$ $1.html [NC,L]

RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
</IfModule>
```

**Nginx:**

```nginx
error_page 404 /404.html;
location / { try_files $uri $uri.html $uri/ =404; }
location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

**Security headers (recommended):**

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

A CSP is worth adding, but note the markup uses a small number of inline `style`
attributes for animation delays — allow them or move those to utility classes.

---

## Remaining production tasks

### Blocking — before launch

- [ ] **Confirm the company email.** `hello@neotericera.com` is a placeholder in
      ~40 locations.
- [ ] **Replace the placeholder domain** in canonicals, Open Graph, JSON-LD,
      `robots.txt`, `sitemap.xml`.
- [ ] **Verify the remaining statistics** against real data. Remove anything
      unevidenced rather than softening it.
- [ ] **Obtain written permission** for every client name, logo, screenshot and
      testimonial used. The portfolio shows real client sites; confirm each
      client is content to be listed publicly.
- [ ] **Legal review** of `privacy-policy.html` and `terms.html`. Both are
      templates and both say so.
- [ ] **Cookie consent banner** that blocks non-essential scripts until consent.
- [ ] **Connect the forms to a backend** with server-side validation.
- [ ] **Ensure `404.html` returns HTTP 404**, not 200.
- [ ] **Remove `class="is-annotated"`** and delete the `.placeholder-note` spans.

### High priority

- [ ] Replace the six placeholder client logos with real, permitted ones — or
      remove the marquee.
- [ ] Real team names, photographs and biographies, with consent.
- [ ] Self-host fonts and subset Bootstrap Icons.
- [ ] Add a live Google Map, loaded on interaction.
- [ ] Screen-reader and real-device keyboard testing.
- [ ] Set up Google Analytics 4, Tag Manager and Search Console.
- [ ] Retry the 26 uncaptured portfolio screenshots with a renderer those sites
      do not block, or capture them manually.

### Medium priority

- [ ] Migrate to a CMS. The `[data-*]` hydration slots map directly onto template
      variables, and `PORTFOLIO_PROJECTS` becomes the content collection.
- [ ] Build the clean URL structure and 301 the `.html` paths.
- [ ] Write the remaining blog articles (one is complete as the template).
- [ ] Minification and a production asset pipeline.
- [ ] Automated sitemap generation.

### Nice to have

- [ ] Dark mode toggle — the surface-context token system makes this
      straightforward, since a dark theme is just a sixth context applied at
      `:root`.
- [ ] Blog RSS feed.
- [ ] Per-project detail pages, once there is a written case study behind each.

---

## A note on the placeholder markers

Small dashed badges reading *Verify*, *Approval needed* and *Legal review
required* appear throughout. They are deliberate.

The site's positioning rests on being the agency that reports honestly. Publishing
invented statistics while claiming that positioning would undermine the whole
proposition. Every unverified figure is therefore visibly flagged rather than
quietly presented as fact.

This is also why the fabricated case studies from the previous revision are gone.
Named clients with specific percentage uplifts, none of whom existed, were the
single largest credibility risk in the build. Twenty-eight real sites a visitor
can open and judge are worth more than any invented number.

Remove the markers as real data arrives. If a figure cannot be evidenced, delete
the claim rather than soften it.

---

**Neoteric ERA IT Services** · Muslim Town, Lahore, Pakistan · +92 309 0155045
Serving businesses across the United States.
