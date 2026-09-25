# SUTRA-GEO

SUTRA-GEO is a heritage-first prototype for turning everyday movement across India into discovery of living heritage, local stories, artisans and place-based cultural experiences.

## Core loop

Discover → Enter Heritage Zone → Geofence → Unlock Node → Heritage Micro-Quest → Earn Sutra Coins → Ask Sutra → Save to Passport → Capture Photo/Video → Community/Artisan Experience → Impact

## Implemented in this prototype

- India-first Heritage Map with clickable nodes and India zoom
- State → city/district → heritage node map controls
- 50m geofence proof with current distance, radius, unlock status and location accuracy
- Browser geolocation with accuracy and impossible-speed checks
- Demo geofence unlock for screening/demo use
- Functional 30-second Heritage Micro-Quest with node-specific question, completion, coins and passport journey event
- Repeat-quest prevention per account and node
- Node dataset with name, city, state, district, latitude, longitude, category, image, source and verification status
- Location-aware Ask Sutra answers grounded in the curated node dataset with source links
- Explicit AI scope: implemented contextual Q&A; future scope is clearly separated
- Profile with photo, username, journey statistics and settings
- Photo/video uploads using IndexedDB, with city + heritage-node metadata and captions
- City-based Heritage Passport with places, quests, photos, videos, coins and timeline
- Scrapbook connected to saved places and uploaded media, with filters
- Living Heritage categories and artisan profiles
- Traveller → artisan experience flow with prototype reward
- Community story submission and moderation states: Submitted → Under Review → Verified/Published
- Sutra Coin history and functional prototype reward redemption
- Local impact dashboard with explicit Prototype Simulation labeling
- Privacy controls for location, media deletion and account deletion
- Accessibility controls: larger text, high contrast and text-to-speech
- Language selection demo: English, Hindi and Telugu voice preference
- International visitor guidance for etiquette, photography, language and local travel
- Downloadable low-connectivity Heritage Pack using browser cache/service worker
- Evidence section with a current UNESCO statistic and source links

## Prototype vs production

This repository is a browser prototype. Account, wallet, journey, scrapbook and community data are stored locally in the browser. Media files use IndexedDB. Location is used for the visible geofence flow only.

The production architecture should move these flows to authenticated backend services with a geospatial database, object storage, moderation roles, rate limits, audit logs, consent records and server-side verification. The prototype does **not** claim that FastAPI/PostGIS/Redis or a hosted AI API is already deployed.

### Production architecture proposal

User → Auth/API → Heritage Service → PostGIS/geospatial index → Geofence/Event Service → Quest Service → Wallet/Rewards → Media Storage → Community Moderation → Impact Analytics

Ask Sutra → Retrieval from verified heritage dataset → answer + source attribution

## Privacy model in the prototype

- Location access can be switched off from Profile.
- Location is not continuously stored as a raw track in this browser prototype; journey events store only the city/state/node context needed for the experience.
- Uploaded media can be deleted from the local prototype database.
- The account can be deleted from the local browser.
- Production retention, access control and deletion policies must be finalized before deployment.

## Anti-abuse architecture considered

- Require geofence radius and reasonable location accuracy.
- Reject impossible movement speeds between location updates.
- Prevent repeated quest completion for the same account/node.
- Record quest and journey events for auditability.
- Production should add server-side location attestation, device integrity signals, rate limits and anomaly detection.

## Sources used in the prototype

- UNESCO World Heritage Centre — India: https://whc.unesco.org/en/statesparties/IN
- UNESCO — Group of Monuments at Hampi: https://whc.unesco.org/en/list/241
- UNESCO — Sun Temple, Konârak: https://whc.unesco.org/en/list/246
- Telangana Tourism — Charminar: https://tourism.telangana.gov.in/attractions/charminar
- Rajasthan Tourism: https://www.tourism.rajasthan.gov.in/
- Gujarat Tourism: https://www.gujarattourism.com/

## Run

```bash
npm start
```

Then open the local URL printed by `serve`.
