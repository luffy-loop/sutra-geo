// SUTRA-GEO badges & achievements
// Computed entirely from data already stored by the prototype (node captures,
// journey events, community submissions, wallet balance). No new storage
// beyond the badge definitions themselves.

const SUTRA_BADGES = [
  { id: 'first-steps', emoji: '🪔', name: 'First Steps', desc: 'Discover your first Heritage Node.',
    check: (s) => s.nodes >= 1 },
  { id: 'heritage-explorer', emoji: '🧭', name: 'Heritage Explorer', desc: 'Discover 5 Heritage Nodes.',
    check: (s) => s.nodes >= 5 },
  { id: 'heritage-master', emoji: '🏛️', name: 'Heritage Master', desc: 'Discover 15 Heritage Nodes.',
    check: (s) => s.nodes >= 15 },
  { id: 'quiz-novice', emoji: '❓', name: 'Quiz Novice', desc: 'Complete your first Heritage Micro-Quest.',
    check: (s) => s.quests >= 1 },
  { id: 'quiz-champion', emoji: '🎓', name: 'Quiz Champion', desc: 'Complete 10 Heritage Micro-Quests.',
    check: (s) => s.quests >= 10 },
  { id: 'state-hopper', emoji: '🗺️', name: 'State Hopper', desc: 'Explore heritage in 3 different states.',
    check: (s) => s.states >= 3 },
  { id: 'national-wanderer', emoji: '🇮🇳', name: 'National Wanderer', desc: 'Explore heritage in 7 different states.',
    check: (s) => s.states >= 7 },
  { id: 'storyteller', emoji: '📖', name: 'Storyteller', desc: 'Submit your first community story.',
    check: (s) => s.stories >= 1 },
  { id: 'culture-keeper', emoji: '🕯️', name: 'Culture Keeper', desc: 'Get 3 community stories verified or published.',
    check: (s) => s.verifiedStories >= 3 },
  { id: 'artisan-friend', emoji: '🧑‍🎨', name: "Artisan's Friend", desc: 'Complete your first artisan experience.',
    check: (s) => s.experiences >= 1 },
  { id: 'coin-collector', emoji: '✦', name: 'Coin Collector', desc: 'Earn 500 Sutra Coins in total.',
    check: (s) => s.coins >= 500 },
  { id: 'streak-keeper', emoji: '🔥', name: 'Streak Keeper', desc: 'Claim the Daily Sutra 3 days in a row.',
    check: (s) => s.streak >= 3 },
];

window.SUTRA_BADGES = SUTRA_BADGES;

const SutraBadges = {
  stats() {
    const email = (window.SutraAuth ? SutraAuth.user().email : '') || 'guest';
    const journey = (window.SutraJourney ? SutraJourney.forUser() : []) || [];
    const nodes = (window.SutraNodeCapture ? SutraNodeCapture.get().length : 0);
    const quests = journey.filter(x => x.type === 'quest-completed').length;
    const states = new Set(journey.filter(x => x.state).map(x => x.state)).size;
    const experiences = journey.filter(x => x.type === 'experience-completed').length;
    let community = [];
    try { community = JSON.parse(localStorage.getItem('sutra_community_nodes') || '[]'); } catch (e) { community = []; }
    const mine = community.filter(x => x.email === email.toLowerCase());
    const stories = mine.length;
    const verifiedStories = mine.filter(x => x.status === 'Verified' || x.status === 'Published').length;
    const coins = window.SutraWallet ? SutraWallet.get() : 0;
    const streak = Number(localStorage.getItem('sutra_streak_' + email.toLowerCase()) || 0);
    return { nodes, quests, states, experiences, stories, verifiedStories, coins, streak };
  },
  earned() {
    const s = this.stats();
    return SUTRA_BADGES.filter(b => b.check(s)).map(b => b.id);
  },
  render(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const earned = new Set(this.earned());
    el.innerHTML = SUTRA_BADGES.map(b => {
      const has = earned.has(b.id);
      return `<div class="badge-card${has ? ' badge-earned' : ' badge-locked'}" title="${b.desc.replace(/"/g, '&quot;')}">
        <div class="badge-emoji">${has ? b.emoji : '🔒'}</div>
        <b>${b.name}</b>
        <small>${b.desc}</small>
      </div>`;
    }).join('');
    const countEl = document.getElementById(targetId + 'Count');
    if (countEl) countEl.textContent = `${earned.size} / ${SUTRA_BADGES.length}`;
  }
};
window.SutraBadges = SutraBadges;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('badgesGrid')) SutraBadges.render('badgesGrid');
});
