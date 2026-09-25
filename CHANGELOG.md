# SUTRA-GEO — Update changelog

This update adds the highest-impact, genuinely working items from our "what
else can be added before grand finale" review. Everything below runs
client-side in this browser prototype, same as the rest of the app — nothing
here is a fake/stubbed demo of a feature that doesn't work.

## Added

- **Heritage dataset expanded from 5 to 25 nodes** (`js/heritageData.js`),
  covering Delhi, UP, Maharashtra, MP, Tamil Nadu, Karnataka, Punjab, Assam
  and Rajasthan in addition to the original 5. Each node has a quiz, a
  source link and artisan info, consistent with the existing schema.
- **Badges / achievements** (`js/badges.js`) — 12 badges computed from data
  the app already tracks (nodes discovered, quests completed, states
  visited, stories submitted/verified, artisan experiences, coins, streak).
  Rendered on the Passport page.
- **Daily-quiz streak counter** — `app.js` now tracks consecutive daily
  claims per account and shows a 🔥 streak pill on Profile and Passport.
- **Leaderboard** (`js/leaderboard.js`) — added to the Community page.
  Explicitly labeled: other rows are fixed demo profiles (no shared
  backend exists in this prototype), only your ⭐ row is real.
- **Dynamic offline Heritage Pack** — `downloadHeritagePack()` previously
  always said "Hyderabad Heritage Pack" regardless of context; it now names
  the pack after whichever city the traveller is actually exploring.
- **Dataset-load fallback banner** — if `heritageData.js` fails to load on a
  data-dependent page, the user now sees a visible warning instead of a
  silently empty page.
- **Optional camera-view overlay** on the Heritage Micro-Quest page
  (`js/ar.js`, reusing pre-existing unused `.ar-stage`/`#cameraFeed` CSS) —
  a real `getUserMedia()` camera preview with the node's story overlaid.
  Explicitly labeled as a visual layer only; this is NOT object recognition
  or markerless tracking, and no such capability is claimed.
- **Booking inquiry capture** (`js/inquiry.js`) — Stays and Artisan
  Experience bookings now collect name/contact/date through a small modal
  before confirming, and a "My Bookings" list was added to Profile.
- **Community moderation guidelines** — a visible criteria panel (accuracy,
  respect for communities, no unverifiable sensitive claims, consent for
  identifiable people) added next to the moderation queue.
- **`config.example.js`** — documents the config shape (API base URL, Ask
  Sutra RAG endpoint, feature flags) a real backend/LLM deployment would
  need. Not wired into the app — see "Not included" below.
- **`tests/sutra.test.js`** — Node-runnable unit tests for the geofence
  distance math, heritage dataset integrity, and badge thresholds.
  Run with `node tests/sutra.test.js`. All passing as of this update.

## Changed

- `js/app.js`: `claimDailySutra()`/`runDailySutra()` extended for streaks;
  added `checkHeritageDataLoaded()` fallback check on DOMContentLoaded.
- `js/geofence.js`: `distanceMeters` explicitly exported to `window` (used
  by the new tests; no behavior change).
- `js/pages.js` (`bookStay`), `js/living.js` (`bookArtisan`): now open the
  inquiry modal first; fall back to the original confirm()-based flow if
  `inquiry.js` isn't loaded on a page, so nothing breaks if you reuse these
  functions elsewhere.
- `map.html`: offline pack button id'd so its label can update dynamically.
- `profile.html`, `passport.html`, `community.html`: new sections/script
  tags for the features above.
- `style.css`: additive rules only (badges, streak pill, leaderboard rows,
  moderation guideline cards, inquiry modal) — nothing existing was removed
  or restyled.

## Deliberately NOT included, and why

These came up in the earlier review but need real infrastructure this
sandbox doesn't have (no network access, no API keys, no hosting). Faking
them would mean shipping something that looks functional but isn't —
worse for a live demo than not having it:

- **Real backend (FastAPI/PostGIS)** — README already documents the
  intended architecture; `config.example.js` documents the API shape.
  Stand this up separately and flip the feature flags in that file.
- **Real LLM-backed Ask Sutra (RAG)** — `ai.js` still uses the rule-based
  matcher. Wiring a real Claude/GPT call needs a backend to hold the API
  key (never put LLM keys in client-side JS) — see `askSutra` config block.
- **ONDC / real payment integration for bookings** — the new inquiry modal
  captures leads; connecting it to a real booking/payment provider is a
  backend integration, not a frontend change.
- **True markerless AR / object recognition** — the camera overlay added
  here is a real camera preview with a story card on top, not scene
  understanding. Said so explicitly in the UI.

## Prototype vs production

No change to the existing framing in `README.md` — this remains a browser
prototype (localStorage/IndexedDB, no server), and everything added here
follows that same model.
