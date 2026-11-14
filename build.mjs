// Enca Insurance website build script.
// No dependencies: run `node build.mjs` and the finished site is written to ./dist
// Text lives in src/content/*.json (edited by staff through Pages CMS).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(SRC, 'content', f), 'utf8'));
const S = readJSON('settings.json');
const T = { en: readJSON('en.json'), es: readJSON('es.json') };
const YEAR = new Date().getFullYear();

// Section anchors per language (Spanish visitors see Spanish anchors in the address bar)
const IDS = {
  en: { health: 'health', other: 'other-insurance', about: 'about', quote: 'quote', contact: 'contact', main: 'main' },
  es: { health: 'salud', other: 'otros-seguros', about: 'nosotros', quote: 'cotizar', contact: 'contacto', main: 'main' },
};

// ---------- helpers ----------
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fill = (s = '') => String(s)
  .replaceAll('{phone}', S.phone_display)
  .replaceAll('{email}', S.email);

// Text that is still a placeholder is written as [like this] and gets highlighted
const isPlaceholder = (s = '') => /^\s*\[.*\]\s*$/.test(String(s));
const t = (s = '') => {
  const v = esc(fill(s));
  return isPlaceholder(s) ? `<span class="placeholder">${v}</span>` : v;
};
const attr = (s = '') => esc(fill(s));
const isSet = (v) => v && v !== '#' && !isPlaceholder(v);
const initials = (name = '') => {
  const w = name.trim().split(/\s+/);
  return ((w[0] || '')[0] || '') + (w.length > 1 ? w[w.length - 1][0] : '');
};
const linkOrHash = (v) => (v ? esc(v) : '#');

const fullAddress = `${S.street}, ${S.city}, ${S.state} ${S.zip}`;
const mapsQuery = encodeURIComponent(`${S.business_name}, ${fullAddress}`);
const hasFormKey = S.form_access_key && !/YOUR_|^\s*$/.test(S.form_access_key);

const icon = {
  check: '<svg class="icon icon-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l4.5 4.5L19.5 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.6l1.5 4.2-1.9 1.4a12 12 0 0 0 6.1 6.1l1.4-1.9 4.2 1.5v2.6a2.1 2.1 0 0 1-2.3 2.1A16.8 16.8 0 0 1 4.5 5.8 2.1 2.1 0 0 1 6.6 3.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  chat: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18.5l1.2-3.6A7.8 7.8 0 1 1 8.6 18z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  mail: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 7l8.5 6.5L20.5 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  pin: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  clock: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Life: '<svg class="kind-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27s-10-6.2-10-13.3A5.6 5.6 0 0 1 16 10a5.6 5.6 0 0 1 10 3.7C26 20.8 16 27 16 27z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  Auto: '<svg class="kind-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 20v-4l2.6-6.2A2 2 0 0 1 9.4 8.5h13.2a2 2 0 0 1 1.8 1.3L27 16v4a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 5 20zM5.5 16h21" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="10" cy="21.5" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2.2"/><circle cx="22" cy="21.5" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2.2"/></svg>',
  Home: '<svg class="kind-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 15L16 6l11 9M8 13v13h16V13M13.5 26v-7h5v7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
};

// ---------- page pieces ----------
function head({ lang, title, description, canonical, alternates, root, jsonld }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${canonical}">
${alternates.map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${a.href}">`).join('\n')}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${S.site_url}/assets/images/share.jpg">
<meta property="og:locale" content="${lang === 'es' ? 'es_US' : 'en_US'}">
<meta name="theme-color" content="#294AAE">
<link rel="icon" type="image/png" href="${root}assets/images/favicon.png">
<link rel="apple-touch-icon" href="${root}assets/images/apple-touch-icon.png">
<link rel="preload" href="${root}assets/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/css/site.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>`;
}

function header({ lang, root, home, ids, altHref }) {
  const L = T[lang];
  const other = lang === 'en' ? 'es' : 'en';
  const onHome = home === '';
  const sec = (id) => `${home}#${id}`;
  return `<a class="skip-link" href="#${ids.main}">${t(L.nav.skip)}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${onHome ? '#top' : home}" aria-label="Enca Insurance">
      <img src="${root}assets/images/logo.png" alt="Enca Insurance" width="480" height="182">
    </a>
    <nav class="main-nav" aria-label="${lang === 'en' ? 'Main' : 'Principal'}">
      <a href="${sec(ids.health)}">${t(L.nav.health)}</a>
      <a href="${sec(ids.other)}">${t(L.nav.other)}</a>
      <a href="${sec(ids.about)}">${t(L.nav.about)}</a>
      <a href="${sec(ids.contact)}">${t(L.nav.contact)}</a>
    </nav>
    <div class="header-actions">
      <div class="lang-switch">
        <span class="lang-current" aria-current="true">${esc(L.language_name)}</span>
        <a href="${altHref}" hreflang="${other}" lang="${other}">${esc(T[other].language_name)}</a>
      </div>
      <a class="btn btn-primary btn-call" href="tel:${S.phone_link}">${icon.phone}<span>${esc(S.phone_display)}</span></a>
    </div>
  </div>
</header>`;
}

function footer({ lang, root, privacyHref }) {
  const L = T[lang];
  const socials = [
    ['Facebook', S.facebook_url],
    ['Instagram', S.instagram_url],
    ['Google', S.google_reviews_url],
  ].filter(([, url]) => url);
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <img src="${root}assets/images/logo.png" alt="Enca Insurance" width="480" height="182" loading="lazy">
      <p>${t(L.footer.tagline)}</p>
    </div>
    <div class="footer-contact">
      <p>${esc(fullAddress)}</p>
      <p><a href="tel:${S.phone_link}">${esc(S.phone_display)}</a><br><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></p>
      ${socials.length ? `<p class="footer-social">${t(L.footer.follow)}: ${socials.map(([n, u]) => `<a href="${linkOrHash(u)}" rel="noopener">${n}</a>`).join(', ')}</p>` : ''}
    </div>
    <div class="footer-legal">
      <p>${t(L.footer.license_label)}: ${t(S.agency_license)}<br>${t(L.footer.agent_label)}: ${t(S.agent_in_charge)}</p>
      <p class="disclaimer">${t(L.footer.disclaimer)}</p>
      <p><a href="${privacyHref}">${t(L.footer.privacy)}</a></p>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>© ${YEAR} ${esc(S.legal_name)}. ${t(L.footer.rights)}</p>
  </div>
</footer>`;
}

function mobileBar({ lang, ids, home }) {
  const L = T[lang];
  return `<div class="mobile-bar">
  <a class="btn btn-primary" href="tel:${S.phone_link}">${icon.phone}<span>${t(L.mobile_bar.call)}</span></a>
  <a class="btn btn-light" href="${home}#${ids.quote}">${t(L.mobile_bar.quote)}</a>
</div>`;
}

function homeBody(lang) {
  const L = T[lang];
  const ids = IDS[lang];
  const waText = encodeURIComponent(L.contact.whatsapp_prefill);
  const hasWA = isSet(S.whatsapp_number);
  const q = L.quote;

  const enrollment = S.show_open_enrollment ? `
  <section class="enrollment" aria-labelledby="oe-title" data-enrollment>
    <div class="wrap">
      <div class="enrollment-head">
        <h2 id="oe-title">${t(L.enrollment.title)}</h2>
        <p>${t(L.enrollment.text)}</p>
      </div>
      <ol class="timeline" data-next-label="${attr(L.enrollment.next_label)}">
        ${L.enrollment.steps.map((s) => `<li class="timeline-step" data-date="${esc(s.date)}">
          <span class="timeline-node">${icon.check}</span>
          <span class="timeline-date"><time datetime="${esc(s.date)}">${t(s.label)}</time></span>
          <span class="timeline-text">${t(s.text)}</span>
        </li>`).join('\n        ')}
      </ol>
      <a class="btn btn-gold" href="#${ids.quote}" data-type="Health">${t(L.enrollment.cta)}</a>
    </div>
  </section>` : '';

  return `<main id="${ids.main}">
  <section class="hero" id="top">
    <div class="wrap hero-grid">
      <div class="hero-text">
        <h1>${t(L.hero.title)}</h1>
        <p class="lead">${t(L.hero.text)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="tel:${S.phone_link}">${icon.phone}<span>${t(L.hero.cta_call)}</span></a>
          <a class="btn btn-outline btn-lg" href="#${ids.quote}" data-type="Health">${t(L.hero.cta_quote)}</a>
        </div>
        <ul class="checks">
          ${L.hero.checks.map((c) => `<li>${icon.check}<span>${t(c)}</span></li>`).join('\n          ')}
        </ul>
      </div>
      <figure class="hero-photo">
        <img src="assets/images/office-900.webp" srcset="assets/images/office-600.webp 600w, assets/images/office-900.webp 900w" sizes="(max-width: 760px) 92vw, 34vw" width="900" height="1200" alt="${attr(L.hero.photo_alt)}" fetchpriority="high">
        <figcaption>${icon.pin}<span>${t(L.hero.photo_caption)}</span></figcaption>
      </figure>
    </div>
  </section>
${enrollment}
  <section class="section health" id="${ids.health}" aria-labelledby="health-title">
    <div class="wrap health-grid">
      <div>
        <h2 id="health-title">${t(L.health.title)}</h2>
        <p class="lead">${t(L.health.text)}</p>
        <h3>${t(L.health.steps_title)}</h3>
        <ol class="steps">
          ${L.health.steps.map((s) => `<li><h4>${t(s.title)}</h4><p>${t(s.text)}</p></li>`).join('\n          ')}
        </ol>
        <p class="note">${t(L.health.note)}</p>
        <a class="btn btn-primary" href="#${ids.quote}" data-type="Health">${t(L.health.cta)}</a>
      </div>
      <img class="section-photo" src="assets/images/health-1200.webp" srcset="assets/images/health-700.webp 700w, assets/images/health-1200.webp 1200w" sizes="(max-width: 900px) 92vw, 40vw" width="1200" height="800" alt="${attr(L.health.image_alt)}" loading="lazy">
    </div>
  </section>

  <section class="section other" id="${ids.other}" aria-labelledby="other-title">
    <div class="wrap">
      <h2 id="other-title">${t(L.other.title)}</h2>
      <div class="kinds">
        ${L.other.items.map((it) => `<article class="kind">
          ${icon[it.type] || ''}
          <h3>${t(it.title)}</h3>
          <p>${t(it.text)}</p>
          <a class="text-link" href="#${ids.quote}" data-type="${esc(it.type)}">${t(it.link)}</a>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section about" id="${ids.about}" aria-labelledby="about-title">
    <div class="wrap about-grid">
      <img class="section-photo" src="assets/images/about-1200.webp" srcset="assets/images/about-700.webp 700w, assets/images/about-1200.webp 1200w" sizes="(max-width: 900px) 92vw, 40vw" width="1200" height="800" alt="${attr(L.about.image_alt)}" loading="lazy">
      <div>
        <h2 id="about-title">${t(L.about.title)}</h2>
        ${L.about.paragraphs.map((p) => `<p>${t(p)}</p>`).join('\n        ')}
        <h3>${t(L.about.team_title)}</h3>
        <ul class="team">
          ${L.about.team.map((m) => `<li><span class="initials" aria-hidden="true">${esc(initials(m.name))}</span><span><strong>${t(m.name)}</strong><br>${t(m.role)}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </section>

  <section class="section reach" aria-label="${attr(L.quote.title)}">
    <div class="wrap reach-grid">
      <div class="quote-panel" id="${ids.quote}">
        <h2>${t(q.title)}</h2>
        <p>${t(q.text)}</p>
        <form class="quote-form" ${hasFormKey ? 'action="https://api.web3forms.com/submit" method="POST"' : `action="mailto:${esc(S.email)}" method="POST" enctype="text/plain"`}
          data-key="${hasFormKey ? esc(S.form_access_key) : ''}" data-email="${esc(S.email)}" data-lang="${lang}"
          data-sending="${attr(q.sending)}" data-success="${attr(q.success)}" data-error="${attr(q.error)}" data-mailto-note="${attr(q.mailto_note)}">
          ${hasFormKey ? `<input type="hidden" name="access_key" value="${esc(S.form_access_key)}">` : ''}
          <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="field">
            <label for="f-name-${lang}">${t(q.name)}</label>
            <input id="f-name-${lang}" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f-phone-${lang}">${t(q.phone)}</label>
              <input id="f-phone-${lang}" name="phone" type="tel" autocomplete="tel" inputmode="tel" required>
            </div>
            <div class="field">
              <label for="f-email-${lang}">${t(q.email)}</label>
              <input id="f-email-${lang}" name="email" type="email" autocomplete="email">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f-type-${lang}">${t(q.type)}</label>
              <select id="f-type-${lang}" name="insurance_type">
                ${q.types.map((o) => `<option value="${esc(o.value)}">${t(o.label)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="f-lang-${lang}">${t(q.language)}</label>
              <select id="f-lang-${lang}" name="preferred_language">
                ${q.languages.map((o) => `<option value="${esc(o.value)}">${t(o.label)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="field">
            <label for="f-msg-${lang}">${t(q.message)}</label>
            <textarea id="f-msg-${lang}" name="message" rows="4" aria-describedby="f-msg-hint-${lang}"></textarea>
            <p class="hint" id="f-msg-hint-${lang}">${t(q.message_hint)}</p>
          </div>
          <p class="consent">${t(q.consent)}</p>
          <button class="btn btn-primary btn-lg" type="submit">${t(q.submit)}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>

      <div class="contact-panel" id="${ids.contact}">
        <h2>${t(L.contact.title)}</h2>
        <dl class="contact-list">
          <div>${icon.phone}<dt>${t(L.contact.phone)}</dt><dd><a href="tel:${S.phone_link}">${esc(S.phone_display)}</a></dd></div>
          ${hasWA ? `<div>${icon.chat}<dt>${t(L.contact.whatsapp)}</dt><dd><a href="https://wa.me/${esc(S.whatsapp_number)}?text=${waText}" rel="noopener">${t(L.contact.whatsapp_text)}</a></dd></div>` : ''}
          <div>${icon.mail}<dt>${t(L.contact.email)}</dt><dd><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></dd></div>
          <div>${icon.pin}<dt>${t(L.contact.address)}</dt><dd>${esc(S.street)}<br>${esc(`${S.city}, ${S.state} ${S.zip}`)}<br><a href="https://www.google.com/maps/dir/?api=1&amp;destination=${mapsQuery}" rel="noopener">${t(L.contact.directions)}</a></dd></div>
          <div>${icon.clock}<dt>${t(L.contact.hours_title)}</dt><dd>${L.contact.hours.map((h) => `${t(h.days)}: ${t(h.time)}`).join('<br>')}</dd></div>
        </dl>
        <iframe class="map" title="${attr(L.contact.map_title)}" src="https://maps.google.com/maps?q=${mapsQuery}&amp;z=15&amp;output=embed&amp;hl=${lang}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </section>
</main>`;
}

function privacyBody(lang, home) {
  const P = T[lang].privacy;
  return `<main id="main" class="section privacy">
  <div class="wrap narrow">
    <h1>${t(P.title)}</h1>
    <p class="updated">${t(P.updated)}</p>
    ${P.sections.map((s) => `<h2>${t(s.title)}</h2>\n    <p>${t(s.text)}</p>`).join('\n    ')}
    <p><a class="text-link" href="${home}">${t(P.back)}</a></p>
  </div>
</main>`;
}

function jsonld(lang, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'InsuranceAgency',
    name: S.business_name,
    legalName: S.legal_name,
    url,
    telephone: S.phone_link,
    email: S.email,
    image: `${S.site_url}/assets/images/share.jpg`,
    logo: `${S.site_url}/assets/images/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: S.street,
      addressLocality: S.city,
      addressRegion: S.state,
      postalCode: S.zip,
      addressCountry: 'US',
    },
    openingHours: S.opening_hours_schema,
    knowsLanguage: ['en', 'es'],
    inLanguage: lang,
  };
}

// ---------- pages ----------
const URLS = {
  enHome: `${S.site_url}/`,
  esHome: `${S.site_url}/es/`,
  enPrivacy: `${S.site_url}/privacy`,
  esPrivacy: `${S.site_url}/es/privacidad`,
};

const pages = [
  { file: 'index.html', lang: 'en', kind: 'home', root: '', home: '', altHref: 'es/index.html', privacyHref: 'privacy.html', canonical: URLS.enHome, alts: [['en', URLS.enHome], ['es', URLS.esHome], ['x-default', URLS.enHome]] },
  { file: 'es/index.html', lang: 'es', kind: 'home', root: '../', home: '', altHref: '../index.html', privacyHref: 'privacidad.html', canonical: URLS.esHome, alts: [['en', URLS.enHome], ['es', URLS.esHome], ['x-default', URLS.enHome]] },
  { file: 'privacy.html', lang: 'en', kind: 'privacy', root: '', home: 'index.html', altHref: 'es/privacidad.html', privacyHref: 'privacy.html', canonical: URLS.enPrivacy, alts: [['en', URLS.enPrivacy], ['es', URLS.esPrivacy]] },
  { file: 'es/privacidad.html', lang: 'es', kind: 'privacy', root: '../', home: 'index.html', altHref: '../privacy.html', privacyHref: 'privacidad.html', canonical: URLS.esPrivacy, alts: [['en', URLS.enPrivacy], ['es', URLS.esPrivacy]] },
];

function render(p) {
  const L = T[p.lang];
  const ids = IDS[p.lang];
  const title = p.kind === 'home' ? L.meta.title : `${L.privacy.title} | ${S.business_name}`;
  // Home pages reference images relative to their own folder
  let body = p.kind === 'home' ? homeBody(p.lang) : privacyBody(p.lang, p.home);
  if (p.kind === 'home' && p.root) body = body.replaceAll('src="assets/', `src="${p.root}assets/`).replaceAll(/srcset="([^"]+)"/g, (m, v) => `srcset="${v.replaceAll('assets/', `${p.root}assets/`)}"`);
  return `${head({
    lang: p.lang,
    title,
    description: L.meta.description,
    canonical: p.canonical,
    alternates: p.alts.map(([lang, href]) => ({ lang, href })),
    root: p.root,
    jsonld: p.kind === 'home' ? jsonld(p.lang, p.canonical) : null,
  })}
<body>
${header({ lang: p.lang, root: p.root, home: p.home, ids, altHref: p.altHref })}
${body}
${footer({ lang: p.lang, root: p.root, privacyHref: p.privacyHref })}
${mobileBar({ lang: p.lang, ids, home: p.home })}
<script src="${p.root}assets/js/site.js" defer></script>
</body>
</html>
`;
}

function notFound() {
  const en = T.en.not_found;
  const es = T.es.not_found;
  return `${head({ lang: 'en', title: `${en.title} | ${S.business_name}`, description: T.en.meta.description, canonical: URLS.enHome, alternates: [], root: '/' })}
<body>
<main id="main" class="section not-found">
  <div class="wrap narrow">
    <img src="/assets/images/logo.png" alt="Enca Insurance" width="240" height="91">
    <h1>${t(en.title)}</h1>
    <p>${t(en.text)} <a class="text-link" href="/">${t(en.link)}</a></p>
    <h2 lang="es">${t(es.title)}</h2>
    <p lang="es">${t(es.text)} <a class="text-link" href="/es/">${t(es.link)}</a></p>
  </div>
</main>
</body>
</html>
`;
}

function sitemap() {
  const groups = [
    [URLS.enHome, URLS.esHome],
    [URLS.enPrivacy, URLS.esPrivacy],
  ];
  const entries = groups.flatMap(([en, es]) => [en, es].map((loc) => `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${es}"/>
  </url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

// ---------- write ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'es'), { recursive: true });
fs.cpSync(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true });
for (const p of pages) fs.writeFileSync(path.join(DIST, p.file), render(p));
fs.writeFileSync(path.join(DIST, '404.html'), notFound());
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap());
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${S.site_url}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=604800
`);
console.log(`Built ${pages.length + 1} pages into dist/ (form: ${hasFormKey ? 'Web3Forms' : 'email fallback until a Web3Forms key is added'})`);
