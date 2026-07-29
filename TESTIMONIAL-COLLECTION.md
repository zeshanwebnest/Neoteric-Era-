# Collecting real testimonials

The six quotes in the homepage testimonial slider are **sample copy**. They show
the shape of a good legal testimonial so that real ones can be collected against
the same brief. They are not attributed to any individual and are not paired
with a photograph, because a named quote or a portrait would turn sample copy
into a fabricated endorsement.

Replace them before launch. This file is how.

---

## Why this cannot be skipped

**FTC Rule on Consumer Reviews and Testimonials** (16 CFR Part 465, in force
since October 2024) prohibits creating, buying or disseminating testimonials
that misrepresent the reviewer. It carries civil penalties per violation, and it
applies to the agency that supplied the copy as well as the firm that published
it. Your stated market is US businesses, so it applies directly.

**State bar advertising rules** apply on top of that for legal services. Most
states regulate client testimonials in attorney advertising, several require
specific disclaimers, and a few restrict them heavily. The firm carries the
disciplinary risk; you carry the professional one for having drafted them.

The practical version: a fabricated testimonial is the single easiest thing for
a competitor to report, and the hardest thing to defend once reported.

---

## What to ask for

Send this after a measurable result lands — a ranking gain, a month of enquiry
volume, a completed launch. Not at handover, when nobody has results yet.

> **Subject:** Two minutes — would you be willing to say that in writing?
>
> Hi [name],
>
> [Specific result, e.g. "Now that the practice-area pages have been live a
> quarter and consultation requests are up from X to Y a month"] — would you be
> willing to put a couple of sentences to that we could use on our website?
>
> No need to write anything polished. If it is easier, just answer these:
>
> 1. What was the problem before you came to us?
> 2. What did we do that you did not expect, or that another firm had not done?
> 3. What has actually changed since — a number if you have one?
> 4. What would you say to a firm considering us?
>
> I will edit it for length only and send it back for your approval before
> anything goes live. If you would rather not be named, we can attribute it to
> your role and practice area instead, or skip it entirely — genuinely no
> problem either way.
>
> [signature]

---

## What makes a legal testimonial credible

Look at the sample copy in the slider. Every quote does three things:

1. **Names the specific problem**, not a generic one. "Our old site read like a
   corporate brochure" beats "we needed a better website."
2. **Describes something concrete that was done.** "Mapped every redirect before
   launch rather than after." A reader can picture it.
3. **Gives a change, ideally measurable.** "More signed cases than the ad account
   did." Vague praise reads as invented even when it is real.

A quote that only says "great team, highly recommend" is worse than no quote.
It occupies the space where proof should be.

---

## Before publishing each one

- [ ] **Written approval on file** — email is sufficient, keep it.
- [ ] Exact wording confirmed with the client after any editing.
- [ ] Name, role, firm and practice area confirmed as they want them shown.
- [ ] Photograph supplied by the client, or the icon badge retained.
- [ ] Any claim inside the quote is one the firm can evidence if challenged.
- [ ] Checked against the relevant **state bar** advertising rules — some
      require a disclaimer such as "results may vary" or prohibit statements
      about outcomes entirely.

## How to publish one

In `scratchpad/pages/index.html`, for that slide:

1. Replace the role in `.testimonial-card__name` with the real name.
2. Delete `<span class="placeholder-note">Sample copy</span>`.
3. Swap the icon badge for the client's photograph:

```html
<!-- from -->
<span class="testimonial-card__avatar testimonial-card__avatar--icon" aria-hidden="true"><i class="bi bi-people"></i></span>

<!-- to -->
<img class="testimonial-card__avatar" src="assets/images/team/client-01.webp"
     alt="" width="200" height="200" loading="lazy" decoding="async">
```

4. Rebuild: `pwsh scratchpad/build.ps1`

**Delete any slide still carrying "Sample copy" at launch.** Update the slide
count in `aria-label`, the number of `.slider-dot` buttons and
`data-slider-total` to match — the validator checks that they agree.

---

## Star ratings

None are rendered anywhere, and no `AggregateRating` or `Review` schema is
present. Do not add either until there is a verifiable public review source
(Google Business Profile, Clutch) with a real average behind it. Rating markup
without that data is the specific pattern Google issues manual actions for.

Once real reviews exist on Google, the honest route is to link to the profile
rather than restate the number on-site.
