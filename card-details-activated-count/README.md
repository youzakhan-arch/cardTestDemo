# Card Management → Card Details — activated cards **per driver** (prototype)

A high-fidelity, locally runnable prototype of the **admin Fleet Card flow**: the
**Card Management** list → click a card → the **Card Details side drawer** opens, with a new
**per-cardholder "activated cards" helper** in the drawer.

Visual source of truth: Figma `Virtual Cards — Multiple Cards per Driver` — card-management screen
`2085:4889`, annotated flow frame `2038:16905`, drawer node `2078:4295`, overlay node `2038:15672`.
The screen is matched to `2085:4889`: **motive wordmark**, Search + Organization/Products sidebar,
tabs (Billing · Card Management · Orders · Policies · Settings), the black "ready to be activated"
banner with the **Activate ▾** (Physical / Virtual) menu, the filter set (Group · Spend profile ·
Security · Txn. requirement · Status), and table columns (checkbox · Card number / ID · Assigned to ·
Spend limits · Security · Status · kebab). Color, type, spacing, and tags use the exact Phoenix
`--phx-web-*` token values read from Figma (e.g. caution `#fff1cf`/`#7d5800`, strokes
`#0000001c`/`#00000038`, content `#000000d1`/`#000000a1`).

**Status vocabulary note:** the table uses the product's display statuses (Active, Locked, Frozen,
Deactivated). Cards that have been issued but **not yet activated** are shown as `Inactive` (neutral
tag) — a modeling choice so the per-driver activation count has something to count; `activated` is
tracked separately from the display status.

## Run locally

```bash
cd option-a-preview
python3 -m http.server 3333
# open http://localhost:3333/card-details-activated-count/
```

Unit tests (no dependencies):

```bash
cd option-a-preview/card-details-activated-count
node activated-count.test.js   # 13 assertions
```

## The flow

1. **Card Management** list — cards grouped by cardholder. Drivers with more than one card show a
   `N cards · X active` badge.
2. **Click any card row** → the Card Details drawer slides in (matches Figma `2078:4295`).
3. The drawer shows that card's details **plus the per-driver helper** describing how many of *that
   driver's* cards are activated.

## The helper (per cardholder) — informational only

The helper is **read-only supporting context**, scoped to the **driver this card is assigned to**
(not the fleet). It only appears when the driver holds **more than one card** (on a lone card there
is nothing to compare, so it is hidden).

> There is **no bulk-activation** action — the helper has no "Activate" button. It only reports
> status. (An earlier pass wrongly added an "Activate N more" CTA; that invented a feature that does
> not exist and has been removed.)

| Driver situation | Example |
|---|---|
| Some cards pending | "2 of 3 cards activated for JP Pritzl" |
| All cards activated | "All 2 cards activated for Theresa Webb" |
| Single-card driver | hidden |

### Design system — why a metadata caption, not an alert
The helper is rendered as a **subdued metadata caption** (Phoenix `Body/Small`, `content-subdued`) —
the same type/colour the drawer already uses for audit-log and transaction sub-text — **not** as a
`phx-alert-inline`.

Rationale: the activated count is *neutral metadata*, while `phx-alert-inline` signals a message to
notice/act on (the Card Policies "Reassigned cards are declined…" banner). An earlier pass rendered
the helper as a second inline-alert; stacking two identical blue alert boxes caused alert-fatigue and
misused the alert component's intent. Using the caption pattern keeps it 100% design-system-native
while staying visually distinct from, and subordinate to, the real alert. No bespoke component; the
status `phx-tag` and all tokens still match the Phoenix values from Figma `2078:4295` / `2085:4889`.

The caption is **plain text — no bold and no leading icon** (per AD2 writing guidance: avoid bolding;
an info `ⓘ` glyph implies a hover tooltip, so a non-functional one would be a decorative-icon
anti-pattern). The string communicates on its own.

> **Content caveat (honest):** the strings were graded against the atpm-crank-strings *rubric* but the
> **live AD2 writing guidelines were not fetched from Confluence** (needs the Atlassian MCP + full skill
> flow). So copy is not formally certified — run the full crank-strings flow to validate.

### Design-system sourcing (atd-design-kickstart, webapp-fallback mode)
The PHX design-system MCP is offline in this environment, so the skill's fallback path was used:
`KeepTruckin/webapp` was cloned (sparse: `libs/phoenix`) and real assets were sourced from it —
- **Icons:** the real PHX glyphs, extracted verbatim from
  `libs/phoenix/projects/core/src/lib/icon/icon-map.ts` into `phx-icons.js` (33 icons, the
  `@ds-mo/icons` set), recoloured via `currentColor`. No more hand-drawn SVGs.
- **Tokens:** values mirror the bundled Phoenix↔Figma mapping + the reference-token SCSS in the clone.

> **Remaining approximation (honest):** this is still **vanilla HTML, not Angular `phx-*` component
> instances** (no PHX MCP to scaffold the React/shadcn project, and the prototype repo is plain HTML).
> So the markup *reproduces* PHX components (tag, alert-inline, button, nav, table) using real tokens
> and real icons, but they are not literal component instances. The sidebar follows the Figma admin
> screen (light) rather than the mapping's newer dark `NavigationSidebar`. Production should use the
> real Angular `phx-*` components.

### Seeded scenarios (click to compare)
- **JP Pritzl** — 3 physical cards, 2 activated → "2 of 3 cards activated for JP Pritzl"
- **Marcus Lee** — 3 virtual cards, 1 activated → "1 of 3 cards activated for Marcus Lee"
- **Theresa Webb** — 2 cards (mixed), all activated → "All 2 cards activated for Theresa Webb"
- **Dana Cole** — 1 card → helper hidden

### Copy variation toggle (banner)
- **Count-first:** "2 of 3 cards activated for JP Pritzl"
- **Name-first:** "JP Pritzl has 2 of 3 cards activated"

### States handled
Loading (skeleton + `aria-label`), all-activated, some-pending, zero-activated, single-card (hidden),
data unavailable (hidden). Verified via unit tests and the live accessibility tree.

## Content (atpm-crank-strings)

Graded against the Motive 5C rubric. Recommended: **count-first, with an Activate CTA when cards are
pending** — it frontloads the number, names the driver, and pairs with an action (Coaching).

| Option | Clear | Consistent | Concise | Conversational | Coaching |
|---|---|---|---|---|---|
| **2 of 3 cards activated for JP Pritzl** ✅ | Strong | Strong | Strong | Good | Strong (paired CTA) |
| JP Pritzl has 2 of 3 cards activated | Strong | Good | Good | Strong | Good |
| 1 of JP Pritzl's cards isn't activated yet | Good | Weak | Weak | Weak — negative contraction (AD2: avoid) | Good |

## Functional vs mocked

**Fully functional on localhost**
- Card Management list, drawer open/close (click, Esc, overlay), per-driver informational helper.
- Card-type-aware title/number, in-driver pagination (`1 / 3`), copy-variation toggle.
- Helper text/title/visibility logic — pure functions in `activated-count.logic.js`, **12 unit tests**
  (incl. a guard asserting the result exposes no CTA/action field).

**Mocked / stubbed (clearly seeded)**
- All cardholders, cards, counts, policies, transactions, and audit entries are sample data.
- No real API, routing, auth, or persistence.
- Phoenix components are approximated (no PHX MCP / webapp clone available here — see Design system note).

## Data assumption (documented)

There is **no** activated-count field on the production `ICardDetails` payload today. The closest
existing concepts are `FleetCardsManagementService.getUnactivatedCardsCount()` (page-level) and an
order-level `activeCardsCount` getter.

This prototype interprets the count as **per-cardholder** — the cards belonging to the driver in
"Assigned to". Because `card-management-v6.component.ts` already loads the full card list and builds
the drawer model via `getCardDetailsDrawerData(card)`, the per-driver `{activated, total}` is
**derivable client-side by grouping loaded cards by `assignedTo`** — **no new API call**. Recommended
production plumbing: compute the cardholder tally in `card-management-v6` (or expose a small
`getCardholderActivationSummary(cardholderId)` on `FleetCardsManagementService` for entry points that
open the drawer without the full list — orders, savings drilldowns, transactions) and pass it through
`CardDetailsWrapperComponent` into `CardDetailsDrawerComponent`.
