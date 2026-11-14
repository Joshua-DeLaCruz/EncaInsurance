# Enca Insurance website

The website for Enca Insurance (encainsurance.com), in English and Spanish.

- English: `/` · Spanish: `/es/` · Privacy: `/privacy` and `/es/privacidad`
- All text lives in three files in `src/content/`:
  - `settings.json` for phone, address, email, licenses, social links and the form key
  - `en.json` for the English text
  - `es.json` for the Spanish text
- `node build.mjs` turns those files into the finished site in `dist/`. It needs Node 18 or newer and nothing else (no `npm install`).

Text written in square brackets, like `[License #]`, is a placeholder. It shows with a yellow highlight on the site so nobody misses it.

## 1. Preview it

Open `dist/index.html` in a browser. Everything works except the map, which needs the site to be online.

## 2. Put a preview online today (2 minutes)

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Get started** → **Drag and drop your files**.
2. Name the project (for example `enca-preview`) and drop the `dist` folder.
3. Click **Deploy site**. You get a link like `enca-preview.pages.dev` to share with the owner.

A drag-and-drop project can't be connected to GitHub later, so use it only for the preview. For the real launch, follow step 3.

## 3. Launch on encainsurance.com (with editing for the staff)

1. Create a GitHub account for the agency with enca070326@gmail.com, create a private repository called `enca-website`, and upload everything in this folder **except** `dist/`.
2. Cloudflare → **Workers & Pages** → **Create application** → Pages → **Connect to Git** → choose the repository.
   - Framework preset: **None**
   - Build command: `node build.mjs`
   - Build output directory: `dist`
3. After the first deploy: **Custom domains** → add `encainsurance.com`, then add `www.encainsurance.com` too. Cloudflare sets up the DNS and HTTPS by itself because the domain is already in this Cloudflare account.
4. Every change saved to GitHub (by you or through Pages CMS) now rebuilds the site in about a minute.

## 4. Make the quote form send emails

Until this is done, the form opens the visitor's own email app with the request filled in. That works, but it's not ideal.

1. Go to web3forms.com, enter the email that should receive requests (enca070326@gmail.com), and you'll get an access key by email. The free plan covers 250 requests a month.
2. Paste the key into `form_access_key` in `src/content/settings.json` and rebuild (or save it in Pages CMS).

Each request arrives with a subject like "New quote request: Health (Spanish)", so the agent knows which language to call back in.

## 5. Set up info@encainsurance.com

**Receiving (free, Cloudflare Email Routing):**

1. Cloudflare → encainsurance.com → **Email** → **Email Routing** → **Get started**.
2. Custom address: `info` → destination: enca070326@gmail.com.
3. Cloudflare sends a verification email to the Gmail. Someone at Enca clicks the link.
4. Let Cloudflare add the DNS records it asks for. Mail sent to info@ now lands in the Gmail inbox.

**Sending as info@ from Gmail:**

1. Turn on 2-Step Verification on the Gmail account, then create an **App password** (Google Account → Security).
2. Gmail → Settings → **Accounts and Import** → **Send mail as** → **Add another email address** → `info@encainsurance.com`.
3. SMTP server `smtp.gmail.com`, port `587`, username `enca070326@gmail.com`, password = the app password, TLS.
4. Gmail sends a code to info@ (which forwards to the same inbox). Enter it.
5. In Cloudflare DNS, edit the SPF (TXT) record on `encainsurance.com` so it reads:
   `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all`

The site already shows info@encainsurance.com as the contact email, so set up the receiving part before the site goes public.

## 6. Placeholders to fill in before launch

| Where | What |
|---|---|
| settings.json → `agency_license` | Florida agency license number |
| settings.json → `agent_in_charge` | Agent in charge, with license number |
| settings.json → `facebook_url`, `instagram_url` | Real links (or empty them to hide) |
| settings.json → `google_reviews_url` | Google review link, once the Google Business Profile is set up |
| settings.json → `whatsapp_number` | Keep only if (786) 728-1828 is on WhatsApp, otherwise leave empty |
| en.json / es.json → `contact.hours` | Confirm the opening hours (now Mon–Fri 9–5) |
| en.json / es.json → `about.paragraphs` | The short history paragraph |
| en.json / es.json → `enrollment` | Update the dates each year. The section hides itself after the last date and before the first one. |

Customer reviews are left out on purpose. Add them only when there are real ones.

## 7. Let the staff edit the text (Pages CMS)

1. Go to pagescms.org and sign in with the agency's GitHub account.
2. Open the `enca-website` repository. The `.pages.yml` file already describes every field.
3. Invite staff by email (they don't need a GitHub account).

They'll see "Business details", "Website text (English)" and "Website text (Español)". After they save, the site updates in about a minute.

## 8. Handover checklist (after the first 3 months)

- Cloudflare: add enca070326@gmail.com as an account member with full access, so the agency controls the domain.
- GitHub and Pages CMS: the agency's account owns the repository. You stay as a collaborator only if they want a backup.
- Web3Forms key is registered to the agency's email.
- Show the staff how to change the phone, hours and Open Enrollment dates in Pages CMS.

## Photos

- `office-*.webp`: the real Enca office.
- `health-*.webp` and `about-*.webp`: stock photos. Check their license. Free Freepik photos, for example, need a credit line on the site.

To replace a photo, keep the same file name and size (3:2 for the section photos, portrait for the office photo) and rebuild.
