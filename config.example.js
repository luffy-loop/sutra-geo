// SUTRA-GEO — production configuration placeholder
//
// This prototype is intentionally 100% client-side (localStorage/IndexedDB,
// no server). This file is NOT wired into the app — it documents the config
// shape a real deployment would need, so the jump from prototype to a real
// backend + LLM-backed Ask Sutra is a config change, not a rewrite.
//
// Copy to config.js and fill in when a real backend/API exists. Never commit
// real API keys — load them from environment variables / server-side secrets
// instead of shipping them in client-side JS.

window.SUTRA_CONFIG = {
  // Base URL of the production API described in README.md's
  // "Production architecture proposal" (Auth/API -> Heritage Service ->
  // PostGIS -> Geofence/Event Service -> Quest Service -> Wallet/Rewards).
  apiBaseUrl: '', // e.g. 'https://api.sutrageo.example.com'

  // Ask Sutra (RAG): in production, the browser should call YOUR backend,
  // which in turn calls the LLM with retrieved heritage-dataset context
  // server-side. Never put a real LLM API key directly in client-side JS.
  askSutra: {
    endpoint: '', // e.g. '/v1/ask-sutra' on apiBaseUrl — your backend, not the LLM directly
    provider: 'anthropic', // which LLM provider the backend uses
    model: 'claude-sonnet-4-6',
  },

  // Feature flags so a real backend can be turned on per-flow without
  // breaking the rest of the prototype during rollout.
  features: {
    useBackendGeofence: false,
    useBackendWallet: false,
    useBackendAskSutra: false,
  },
};
