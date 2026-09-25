// Minimal, dependency-free tests for SUTRA-GEO's core logic.
// Run with: node tests/sutra.test.js
// These are unit tests for the browser modules, run outside a browser with a
// tiny DOM/localStorage shim — not a replacement for manual/browser QA, but
// enough to catch a broken distance calc or a broken badge threshold before
// a demo.

const path = require('path');
const assert = require('assert');

let failures = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok - ${name}`); }
  catch (e) { failures++; console.log(`  FAIL - ${name}\n    ${e.message}`); }
}

// --- tiny shims so browser-only files can be require()'d in Node ---
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.window = global;
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: () => ({ classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, style: {} }),
  body: { appendChild() {}, classList: { toggle() {} } },
};
global.navigator = { geolocation: undefined };

console.log('SUTRA-GEO core logic tests\n');

// --- geofence distance math ---
console.log('geofence.js — distanceMeters()');
require(path.join(__dirname, '../js/geofence.js'));
test('distance between identical points is ~0m', () => {
  const d = global.distanceMeters(17.3616, 78.4747, 17.3616, 78.4747);
  assert.ok(d < 0.01, `expected ~0, got ${d}`);
});
test('Charminar to Amber Fort great-circle distance is roughly 1050-1150 km', () => {
  const d = global.distanceMeters(17.3616, 78.4747, 26.9855, 75.8513); // metres
  const km = d / 1000;
  assert.ok(km > 1050 && km < 1150, `expected ~1050-1150km great-circle, got ${km.toFixed(1)}km`);
});
test('a 50m-radius geofence correctly separates near/far points', () => {
  const near = global.distanceMeters(17.3616, 78.4747, 17.36164, 78.47474); // a few metres away
  const far = global.distanceMeters(17.3616, 78.4747, 17.3700, 78.4800); // ~1km away
  assert.ok(near < 50, `expected near point inside 50m radius, got ${near.toFixed(1)}m`);
  assert.ok(far > 50, `expected far point outside 50m radius, got ${far.toFixed(1)}m`);
});

// --- heritage dataset sanity ---
console.log('\nheritageData.js — dataset integrity');
require(path.join(__dirname, '../js/heritageData.js'));
test('dataset has at least 20 heritage nodes', () => {
  assert.ok(global.SUTRA_HERITAGE.length >= 20, `expected >=20 nodes, got ${global.SUTRA_HERITAGE.length}`);
});
test('every node has a valid lat/lng, quest and source', () => {
  global.SUTRA_HERITAGE.forEach((n) => {
    assert.ok(n.lat > -90 && n.lat < 90, `${n.id} has bad lat`);
    assert.ok(n.lng > -180 && n.lng < 180, `${n.id} has bad lng`);
    assert.ok(n.quest && n.quest.options.length >= 2, `${n.id} missing a valid quiz`);
    assert.ok(n.quest.answer >= 0 && n.quest.answer < n.quest.options.length, `${n.id} quest.answer out of range`);
    assert.ok(n.sources && n.sources.length >= 1 && n.sources[0].url.startsWith('http'), `${n.id} missing a source URL`);
  });
});
test('no duplicate node ids', () => {
  const ids = global.SUTRA_HERITAGE.map((n) => n.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'duplicate node id found');
});

// --- badge thresholds (pure function of a stats object) ---
console.log('\nbadges.js — achievement thresholds');
require(path.join(__dirname, '../js/badges.js'));
test('no badges earned with zero activity', () => {
  const earned = global.SUTRA_BADGES.filter((b) => b.check({ nodes: 0, quests: 0, states: 0, experiences: 0, stories: 0, verifiedStories: 0, coins: 0, streak: 0 }));
  assert.strictEqual(earned.length, 0, `expected 0 badges, got ${earned.length}`);
});
test('"Heritage Explorer" needs exactly 5 nodes, not 4', () => {
  const badge = global.SUTRA_BADGES.find((b) => b.id === 'heritage-explorer');
  assert.strictEqual(badge.check({ nodes: 4, quests: 0, states: 0, experiences: 0, stories: 0, verifiedStories: 0, coins: 0, streak: 0 }), false);
  assert.strictEqual(badge.check({ nodes: 5, quests: 0, states: 0, experiences: 0, stories: 0, verifiedStories: 0, coins: 0, streak: 0 }), true);
});
test('"Coin Collector" needs 500 coins', () => {
  const badge = global.SUTRA_BADGES.find((b) => b.id === 'coin-collector');
  assert.strictEqual(badge.check({ nodes: 0, quests: 0, states: 0, experiences: 0, stories: 0, verifiedStories: 0, coins: 499, streak: 0 }), false);
  assert.strictEqual(badge.check({ nodes: 0, quests: 0, states: 0, experiences: 0, stories: 0, verifiedStories: 0, coins: 500, streak: 0 }), true);
});

console.log(`\n${passed} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
