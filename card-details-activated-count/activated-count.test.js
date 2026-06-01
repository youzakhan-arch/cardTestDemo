/**
 * Unit tests for activated-count.logic.js (per-cardholder, informational only)
 * Framework-free (Node's built-in assert). Run: node activated-count.test.js
 */
'use strict';

var assert = require('assert');
var L = require('./activated-count.logic.js');
var V = L.VARIATION;
var S = L.LOAD_STATE;

var passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + e.message); process.exitCode = 1; }
}

console.log('getDrawerTitle');
test('physical / virtual / fallback', function () {
  assert.strictEqual(L.getDrawerTitle('physical'), 'Physical Card Details');
  assert.strictEqual(L.getDrawerTitle('virtual'), 'Virtual Card Details');
  assert.strictEqual(L.getDrawerTitle(undefined), 'Physical Card Details');
});

console.log('visibility rules');
test('hidden for single-card driver (total <= 1)', function () {
  assert.strictEqual(L.shouldShowActivatedCards({ activatedCardsCount: 1, totalCardsCount: 1 }), false);
  assert.strictEqual(L.getActivatedCardsHelper({ activatedCardsCount: 1, totalCardsCount: 1, cardholderName: 'Dana Cole' }), null);
});
test('hidden when count missing / unavailable / null', function () {
  assert.strictEqual(L.shouldShowActivatedCards(null), false);
  assert.strictEqual(L.shouldShowActivatedCards({ totalCardsCount: 3 }), false);
  assert.strictEqual(L.shouldShowActivatedCards({ loadState: S.UNAVAILABLE }), false);
});
test('shown for multi-card driver', function () {
  assert.strictEqual(L.shouldShowActivatedCards({ activatedCardsCount: 2, totalCardsCount: 3 }), true);
});

console.log('informational helper — no action/CTA fields');
test('result never exposes a CTA or action affordance', function () {
  var h = L.getActivatedCardsHelper({ activatedCardsCount: 2, totalCardsCount: 3, cardholderName: 'JP Pritzl' });
  assert.strictEqual(h.ctaLabel, undefined, 'must not expose ctaLabel (no bulk activation)');
  assert.strictEqual(h.tone, undefined, 'must not expose an action tone');
});

console.log('pending state');
test('count-first phrasing', function () {
  var h = L.getActivatedCardsHelper({ activatedCardsCount: 2, totalCardsCount: 3, cardholderName: 'JP Pritzl', variation: V.COUNT_FIRST });
  assert.strictEqual(h.text, '2 of 3 cards activated for JP Pritzl');
  assert.strictEqual(h.srText, '2 of 3 cards activated for JP Pritzl');
  assert.strictEqual(h.pending, 1);
  assert.strictEqual(h.hasPending, true);
});
test('name-first phrasing', function () {
  var h = L.getActivatedCardsHelper({ activatedCardsCount: 2, totalCardsCount: 3, cardholderName: 'JP Pritzl', variation: V.NAME_FIRST });
  assert.strictEqual(h.text, 'JP Pritzl has 2 of 3 cards activated');
});
test('zero activated of many', function () {
  var h = L.getActivatedCardsHelper({ activatedCardsCount: 0, totalCardsCount: 4, cardholderName: 'JP Pritzl' });
  assert.strictEqual(h.text, '0 of 4 cards activated for JP Pritzl');
  assert.strictEqual(h.pending, 4);
});

console.log('all-activated state');
test('count-first, quiet confirmation', function () {
  var h = L.getActivatedCardsHelper({ activatedCardsCount: 3, totalCardsCount: 3, cardholderName: 'Theresa Webb', variation: V.COUNT_FIRST });
  assert.strictEqual(h.text, 'All 3 cards activated for Theresa Webb');
  assert.strictEqual(h.hasPending, false);
});
test('name-first, all activated', function () {
  var h = L.getActivatedCardsHelper({ activatedCardsCount: 2, totalCardsCount: 2, cardholderName: 'Theresa Webb', variation: V.NAME_FIRST });
  assert.strictEqual(h.text, "Theresa Webb's 2 cards are all activated");
});

console.log('loading + fallback');
test('loading returns skeleton state', function () {
  var h = L.getActivatedCardsHelper({ loadState: S.LOADING, cardholderName: 'JP Pritzl' });
  assert.strictEqual(h.state, S.LOADING);
  assert.strictEqual(h.text, '');
});
test('missing cardholder name falls back gracefully', function () {
  var h = L.getActivatedCardsHelper({ activatedCardsCount: 2, totalCardsCount: 3 });
  assert.strictEqual(h.text, '2 of 3 cards activated for this driver');
});

console.log('\n' + passed + ' assertions passed.');
