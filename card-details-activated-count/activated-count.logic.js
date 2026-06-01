/**
 * activated-count.logic.js
 * --------------------------------------------------------------------------
 * Pure presentation logic for the INFORMATIONAL "activated cards" helper shown
 * inside the admin Fleet Card → Card Details side drawer.
 *
 * IMPORTANT: this is read-only supporting context. It does NOT trigger any
 * activation. There is no bulk-activation feature in the product, so the helper
 * never renders an "activate" action — it only reports how many of the
 * cardholder's cards are already activated.
 *
 * SCOPE: per-cardholder (per-driver). The drawer is opened for ONE card whose
 * "Assigned to" is a driver. The helper reports how many of THAT driver's cards
 * are activated, and only when the driver holds more than one card (the
 * "Multiple Cards per Driver" case). For a single-card driver it returns null.
 *
 * --- Design-system mapping -------------------------------------------------
 * In production this string would be rendered with the existing
 * `phx-alert-inline` component (intent="info") that already appears in this
 * drawer's Card Policies section — NOT a bespoke component. Card type uses the
 * existing discriminator cardDetails.typeOfCard. The per-driver {activated,
 * total} is derivable client-side in card-management-v6.component.ts by grouping
 * already-loaded cards by assignedTo — no new API call, no new action.
 *
 * Framework-free so it runs in the browser prototype and in Node tests.
 * --------------------------------------------------------------------------
 */

(function (root) {
  'use strict';

  var TYPE_OF_CARD = { virtual: 'virtual', physical: 'physical' };
  var VARIATION = { COUNT_FIRST: 'count-first', NAME_FIRST: 'name-first' };
  var LOAD_STATE = { LOADING: 'loading', READY: 'ready', UNAVAILABLE: 'unavailable' };

  /** Drawer header title — matches the production "<Type> Card Details" heading. */
  function getDrawerTitle(cardType) {
    return cardType === TYPE_OF_CARD.virtual ? 'Virtual Card Details' : 'Physical Card Details';
  }

  /**
   * Whether the helper should render.
   * Hidden when: no model, count unavailable, counts not numeric, or the driver
   * holds 0/1 cards (nothing to compare). Loading is allowed (shows a skeleton).
   */
  function shouldShowActivatedCards(model) {
    if (!model) return false;
    if (model.loadState === LOAD_STATE.UNAVAILABLE) return false;
    if (model.loadState === LOAD_STATE.LOADING) return true;
    if (typeof model.activatedCardsCount !== 'number') return false;
    if (typeof model.totalCardsCount !== 'number' || model.totalCardsCount <= 1) return false;
    return true;
  }

  /**
   * Build the informational helper string for the cardholder.
   * @returns {null|{ text:string, srText:string, state:string,
   *                  activated:number, total:number, pending:number, hasPending:boolean }}
   */
  function getActivatedCardsHelper(model) {
    if (!shouldShowActivatedCards(model)) return null;

    var loadState = model.loadState || LOAD_STATE.READY;
    var variation = model.variation || VARIATION.COUNT_FIRST;
    var name = model.cardholderName || 'this driver';

    if (loadState === LOAD_STATE.LOADING) {
      return { text: '', srText: 'Card activation status loading', state: LOAD_STATE.LOADING,
               activated: null, total: null, pending: null, hasPending: false };
    }

    var activated = model.activatedCardsCount;
    var total = model.totalCardsCount;
    var pending = Math.max(0, total - activated);
    var hasPending = pending > 0;

    var text;
    if (hasPending) {
      text = variation === VARIATION.NAME_FIRST
        ? name + ' has ' + activated + ' of ' + total + ' cards activated'
        : activated + ' of ' + total + ' cards activated for ' + name;
    } else {
      text = variation === VARIATION.NAME_FIRST
        ? name + "'s " + total + ' cards are all activated'
        : 'All ' + total + ' cards activated for ' + name;
    }

    return { text: text, srText: text, state: LOAD_STATE.READY,
             activated: activated, total: total, pending: pending, hasPending: hasPending };
  }

  var api = {
    TYPE_OF_CARD: TYPE_OF_CARD,
    VARIATION: VARIATION,
    LOAD_STATE: LOAD_STATE,
    getDrawerTitle: getDrawerTitle,
    shouldShowActivatedCards: shouldShowActivatedCards,
    getActivatedCardsHelper: getActivatedCardsHelper
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.ActivatedCount = api;
  }
})(typeof window !== 'undefined' ? window : this);
