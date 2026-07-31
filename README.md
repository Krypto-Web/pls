# Prince Lanre Sanusi (PLS) — Official Portfolio Website

A premium, content-rich portfolio website for **Prince Lanre Sanusi**, Executive
Chairman of Amuwo-Odofin Local Government, Lagos State — built with semantic
HTML5, hand-written CSS3 (Flexbox + Grid, mobile-first), vanilla JavaScript,
and Supabase for form handling.

No frameworks, no build step, no npm install required. Open `index.html` (via
a local server — see below) and it works.

---

## 1. What's grounded in fact vs. placeholder

This site was built using **verified, publicly reported information** wherever
possible (his July 2025 election, the Road 23 and Mile 2/Agboju rehabilitation
work, the August 2025 sanitation exercise, the July 2026 NUJ Media Games
Ambassador honour, Vice Chairman Maureen Chika Ashara, the real ward/LCDA
structure, and the Secretariat address). **Before publishing, please review:**

| Area | Status | Action needed |
|---|---|---|
| Election facts, dates, NUJ award, VC identity | ✅ Verified via public reporting | Spot-check against your own records |
| Secretariat address (41 Road, Festac Town) | ✅ Verified via multiple sources | Confirm suite/wing if applicable |
| "11 roads in 11 months," specific empowerment numbers | ⚠️ Sample figures | Confirm against official project records |
| Bill/bye-law titles and statuses (Legislative Work page) | ⚠️ Illustrative, themed to real priorities | Replace with actual Legislative Council records, or retitle the page/tracker to match your council's real process if it doesn't formally "pass bills" the way a state/national legislature does |
| Education history, family details | ⚠️ Placeholder / intentionally general | Add only verified, approved details |
| Phone number, email address | ⚠️ Placeholder format | Replace with real office contact details |
| Social media links (`href="#"`) | ⚠️ Placeholder | Replace with real, verified profile URLs |
| Press article links in News & Media | ⚠️ Partial — one confirmed link included | Add confirmed direct URLs for the others |
| All photos and the gallery | ⚠️ Original placeholder graphics | Replace with real, rights-cleared photography |

**Why placeholder images instead of photos pulled from the web:** photos found
via search belong to the photographer or publication that took them, and
reusing them without a licence — even on the subject's own site — is a
copyright risk, and there's no reliable way to confirm a given search result
really is a rights-cleared, correctly-identified photo. Instead, every image
slot uses a clean, on-brand placeholder graphic (SVG, no external files) so
the site still looks complete. Swapping them for real photos is simple —
see Section 6.

---

## 2. Folder structure

```
pls-portfolio/
├── index.html                  Home
├── about.html                  About
├── legislative-work.html       Legislative Work
├── achievements.html           Achievements & Impact
├── issues-policy.html          Issues & Policy Positions
├── news-media.html             News & Media
├── engagement.html             Committees & Public Engagement
├── get-involved.html           Get Involved / Volunteer
├── contact.html                Contact
├── 404.html                    Not-found page (used automatically by Netlify/GitHub Pages)
├── robots.txt
├── sitemap.xml
├── .gitignore
├── README.md                   You are here
└── assets/
    ├── css/
    │   ├── variables.css       Design tokens (colors, type, spacing) — edit theme here
    │   ├── base.css            Reset, typography, accessibility helpers
    │   ├── layout.css          Header, nav, footer, hero, grids
    │   ├── components.css      Buttons, cards, badges, forms, modal, gallery…
    │   └── animations.css      Scroll-reveal + motion utilities
    ├── js/
    │   ├── supabase-client.js  Minimal fetch-based Supabase insert helper
    │   ├── components.js       Injects shared header/footer, mobile nav, toast()
    │   ├── forms.js             Contact / Volunteer / Newsletter form logic
    │   └── main.js              Scroll-reveal, counters, accordion, gallery, video modal
    └── images/
        ├── favicon.svg
        └── placeholders/        4 reusable placeholder graphics (see Section 6)
```

Every page shares the same `<head>` block and loads the same 5 CSS + 4 JS
files, in the same order. Copy that block exactly if you add a new page.

---

## 3. Local preview

Because the Contact/Volunteer/Newsletter forms use `fetch()`, some browsers
block those requests if you just double-click `index.html` (the `file://`
origin). Use a tiny local server instead:

```bash
# Option A — Python (already on most machines)
cd pls-portfolio
python3 -m http.server 8000
# then open http://localhost:8000

# Option B — Node
npx serve .

# Option C — VS Code
# Install the "Live Server" extension, right-click index.html → "Open with Live Server"
```

---

## 4. Deployment

Any static host works — there's no build step.

- **Netlify:** drag the `pls-portfolio` folder onto app.netlify.com/drop, or connect the GitHub repo (Build command: none; Publish directory: `/`).
- **GitHub Pages:** push to a repo, then Settings → Pages → deploy from the `main` branch, root folder. `404.html` is picked up automatically.
- **Vercel:** import the repo; framework preset "Other"; no build command needed.
- **Shared hosting / cPanel:** upload the contents of `pls-portfolio/` to `public_html` via FTP or File Manager.

After deploying, update `robots.txt` and `sitemap.xml` with your real domain
(they currently use `your-domain-here.ng` as a placeholder).

---

## 5. Supabase setup

The site already points at your project:

```
URL: https://boremnendxebtivsgazw.supabase.co
Key: sb_publishable_nZ4KIgw-TStt-XsMsLu6pA_NlfvK8jI   (safe to expose client-side)
```

### 5.1 Create the tables

Run this in the Supabase SQL editor (Dashboard → SQL Editor). Adjust column
names only if you also update the matching field names in `assets/js/forms.js`.

```sql
create extension if not exists pgcrypto;

-- Contact form
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null
);

-- Volunteer sign-up form
create table if not exists volunteer_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  ward_area text,
  interests text[],
  availability text,
  message text
);

-- Newsletter (page form + footer mini-form both write here)
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  full_name text
);
```

### 5.2 Row Level Security — required, do not skip

By default, a new table has RLS enabled with **no policies**, which means
every insert will fail with a permissions error. The publishable key
authenticates as the `anon` role, which starts with zero privileges — access
comes entirely from the policies you add:

```sql
alter table contact_messages enable row level security;
create policy "Public can submit contact messages"
  on contact_messages for insert to anon with check (true);

alter table volunteer_signups enable row level security;
create policy "Public can submit volunteer signups"
  on volunteer_signups for insert to anon with check (true);

alter table newsletter_subscribers enable row level security;
create policy "Public can subscribe to the newsletter"
  on newsletter_subscribers for insert to anon with check (true);
```

Deliberately **do not** add a `select` policy for `anon` — that would let
anyone read every message ever submitted through your API. View submissions
in the Supabase Table Editor (which uses your own authenticated access), not
through the public site.

### 5.3 A note on the key format (read this if forms stop working)

This project uses Supabase's newer `sb_publishable_...` key format. Per
Supabase's current documentation, this key must be sent on the **`apikey`
header only** — unlike the older `anon` (JWT) key, it should *not* also be
sent as `Authorization: Bearer …`, or the gateway may try to parse it as a
JWT and reject the request. `assets/js/supabase-client.js` already does this
correctly; if you ever swap in an older JWT-style `anon` key, both headers
are fine to send, but the `apikey`-only approach still works either way.

### 5.4 Duplicate newsletter emails

The `email` column on `newsletter_subscribers` is `unique`, so a repeat
sign-up returns a `409` — `forms.js` already catches this and shows a
friendly "you're already subscribed" message instead of an error.

---

## 6. Replacing placeholder images

All image slots use one of four reusable SVGs in `assets/images/placeholders/`.
Replace the files directly (keep the same filenames) to update every instance
at once, or change individual `src` attributes to point at new files.

| Placeholder file | Used for | Recommended real-photo specs |
|---|---|---|
| `placeholder-portrait.svg` | Hero photo, About/Leadership Team photos | 800×1000px JPG, portrait orientation |
| `placeholder-landscape.svg` | News cards, achievement photos | 1280×800px JPG |
| `placeholder-square.svg` | Photo gallery grid | 800×800px JPG |
| `placeholder-video.svg` | Video teaser thumbnail | 1280×720px JPG, or leave as-is and just set the video ID (below) |

**To add a real video:** find the button with `data-video-trigger` in
`index.html` and set `data-video-id="YOUR_YOUTUBE_ID"` (the part of a YouTube
URL after `v=`). Until you do, the button politely shows a "coming soon" toast
instead of a broken embed.

**Favicon:** `assets/images/favicon.svg` is an SVG monogram, supported by all
modern browsers. For older-browser fallback support, generate a `.ico`/`.png`
set at realfavicongenerator.net and add the extra `<link>` tags it gives you.

---

## 7. Editing content (for non-technical editors)

- **Page text:** open the relevant `.html` file in any text editor and edit
  the words between tags — e.g. change `<h1>Prince Lanre Sanusi</h1>` freely.
  Avoid deleting the tags themselves (`<h1>`, `</h1>`, etc.).
- **Navigation menu (all pages at once):** edit the `NAV_ITEMS` array near the
  top of `assets/js/components.js`. This one file controls the header menu on
  every page.
- **Footer links, social links, phone/email in the top bar:** also in
  `assets/js/components.js` (`SOCIAL_LINKS` array and the `renderHeader`/
  `renderFooter` functions).
- **Bill status badges:** each bill card in `legislative-work.html` has a
  `<div class="tracker" data-status="...">` — change `data-status` to
  `reading`, `committee`, `passed`, or `assented` and the tracker updates
  itself. Also update the `<span class="badge badge--...">` label just above it.
- **Stats on the homepage:** the three numbers under the hero are in
  `index.html` inside `<span class="stat-strip__value" data-target="20" ...>`
  — change the `data-target` number and it will animate to the new value.

---

## 8. Accessibility & SEO

- Semantic landmarks (`header`, `nav`, `main`, `footer`), a "Skip to main
  content" link, and visible focus outlines throughout.
- The header/footer are injected by JavaScript for easy maintenance (edit
  once, updates everywhere), but every page also includes a plain `<noscript>`
  navigation fallback so the site stays usable — and crawlable — even without
  JavaScript.
- Forms use associated `<label>` elements; toast feedback uses `aria-live`
  so screen readers announce success/error messages.
- All animations respect `prefers-reduced-motion`.
- Each page has a unique `<title>` and meta description; the homepage
  includes Person/GovernmentOrganization structured data (JSON-LD).
- Update `sitemap.xml` and `robots.txt` with your live domain after deployment.

---

## 9. Browser support

Built with standard, broadly-supported CSS (Grid, Flexbox, custom properties,
`aspect-ratio`) and JavaScript (`fetch`, `IntersectionObserver`, ES2017
async/await). Works in all current versions of Chrome, Firefox, Safari, and
Edge, plus their mobile equivalents.

---

## 10. Credits

Built with hand-written HTML5, CSS3, and vanilla JavaScript — no frameworks,
no build tools, no third-party JS dependencies beyond the Google Fonts
(Fraunces + Public Sans) stylesheet link. Form handling uses Supabase's REST
API directly via `fetch()`.
