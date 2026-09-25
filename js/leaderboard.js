// SUTRA-GEO leaderboard
// Prototype note: this browser has no shared backend, so "other travellers"
// are fixed demo profiles seeded once per browser. Only the current user's
// row is real, live data pulled from SutraWallet/SutraNodeCapture. This is
// clearly labeled in the UI rather than presented as a live multi-user feed.

const SUTRA_LEADERBOARD_SEED = [
  { name: 'Aarav (Delhi)', coins: 640, nodes: 9 },
  { name: 'Meera (Chennai)', coins: 510, nodes: 7 },
  { name: 'Rohan (Pune)', coins: 460, nodes: 6 },
  { name: 'Fatima (Hyderabad)', coins: 395, nodes: 5 },
  { name: 'Priya (Jaipur)', coins: 210, nodes: 3 },
  { name: 'Karan (Kochi)', coins: 120, nodes: 2 },
];

function renderLeaderboard() {
  const el = document.getElementById('leaderboardList');
  if (!el) return;
  const user = window.SutraAuth ? SutraAuth.user() : {};
  const you = {
    name: `${user.name || 'You'} (You)`,
    coins: window.SutraWallet ? SutraWallet.get() : 0,
    nodes: window.SutraNodeCapture ? SutraNodeCapture.get().length : 0,
    isYou: true
  };
  const rows = [...SUTRA_LEADERBOARD_SEED, you].sort((a, b) => b.coins - a.coins);
  el.innerHTML = rows.map((r, i) => `<div class="leaderboard-row${r.isYou ? ' leaderboard-you' : ''}">
      <span class="lb-rank">#${i + 1}</span>
      <span class="lb-name">${r.isYou ? '⭐ ' : ''}${escapeLbHtml(r.name)}</span>
      <span class="lb-nodes">${r.nodes} nodes</span>
      <span class="lb-coins">✦ ${r.coins}</span>
    </div>`).join('');
}
function escapeLbHtml(v) { return String(v ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
window.renderLeaderboard = renderLeaderboard;
document.addEventListener('DOMContentLoaded', () => { if (document.getElementById('leaderboardList')) renderLeaderboard(); });
