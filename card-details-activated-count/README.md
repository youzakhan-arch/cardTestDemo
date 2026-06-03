# Motive · Card Management — Activation & Wallet prototype

High-fidelity interactive prototype of the admin **Card Management** dashboard: the card list, the
**Card Details** side-drawer, card **activation** (physical/virtual), **digital wallet** status, the
row **ellipsis actions** menu, and **multi-card** management. Built from the Figma flow board
(`Virtual Cards — Multiple Cards per Driver`, nodes `2122:9071` / `2085:4889` / `2078:4295`).

**Live:** https://youzakhan-arch.github.io/cardTestDemo/card-details-activated-count/

## Run locally
```bash
cd option-a-preview && python3 -m http.server 3333
# open http://localhost:3333/card-details-activated-count/   (only while this server runs)
```
Unit tests for the helper logic: `node card-details-activated-count/activated-count.test.js`

## Flows implemented
- **A — Activation:** banner with live "ready to activate" count → **Activate ▾** (Physical / Virtual)
  → side-drawer (card select + assignee; wallet checkbox **physical only**) → Confirm → **toast**
  (success / error-with-Retry). Esc / outside-click dismiss without saving.
- **B — Card Details drawer:** opens on row click. Card number + type badge, **digital-wallet status**
  ("✓ Added to Driver Wallet" / "Add to wallet"), per-driver activation caption, "+N more cards" link,
  metadata, Card Policies, Freeze card.
- **C — Ellipsis menu:** 10 row actions; **"Remove card from digital wallet"** shown only when
  `inWallet === true`, with a confirmation modal.
- **D — Multi-card panel:** "+N more cards" → panel with Select-all → sticky **action bar**
  (Change policies / Edit security settings) → tabbed modal "Update N Selected Cards" → Apply.

## Data, state & masking
- Schema per spec §2.1; 8-card fixture (4 Active / 2 Locked / 1 Frozen / 1 Deactivated; ≥2 in wallet).
- Card masking `•••• {last4}`; `<4` digits shows all (`•• 49`).
- Status tags: Active=positive, Locked=caution, Frozen=warning, Deactivated=neutral (Phoenix tokens).
- State lives in browser memory for the session; reload resets (acceptable for a prototype).

## Design system
- Real **PHX icons** (47) extracted verbatim from `KeepTruckin/webapp` `libs/phoenix` (`icon-map.ts`)
  into `phx-icons.js`, recoloured via `currentColor`.
- Colour/type/spacing/tags use the real Phoenix `--phx-web-*` token **values**.

## Honest caveats
- **Mock API:** the spec calls for MSW, but this is a single static `index.html` on GitHub Pages with
  no bundler/service-worker, so the API is mocked **in-memory** instead (simulated latency, ~12%
  activation-failure to exercise the error toast, optimistic wallet updates). Behaviourally equivalent
  for a prototype; not real MSW.
- **Not Angular `phx-*` components:** the markup *reproduces* Phoenix components (tag, alert-inline,
  drawer, menu, button) with real tokens/icons — it is not literal component instances. Production
  should use the real Angular components.
- **Copy:** strings follow the spec §7 and AD2 (no bold, no decorative icons in the caption). Not
  formally certified against live AD2 Confluence guidance (no Atlassian MCP run).
