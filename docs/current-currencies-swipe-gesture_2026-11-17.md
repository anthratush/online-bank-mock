# Description

- User should be able to swipe between current (available to user) currencies that are displayed on the main page. - Each swipe to the right must display next available currency. Each swipe to the left must display previous available currency.
- If currently selected currency has index 0, then swiping left is unavailable. If currently selected currency has index currencies_length - 1, then swiping right is unavailable.
- Selecting (swiping to) a new currency must filter and display transactions based on `transaction.currency` property.

# Implementation Requirements

- Use https://css-tricks.com/simple-swipe-with-vanilla-javascript/ as a reference implementation. ONLY REFERENCE, DO NOT USE FOR ACTUAL IMPLEMENTATION.
- Use `touchstart`, `touchend`, and related events to track mobile-events. MOBILE EVENTS ONLY.

## Implementation Details (Generated)

### Files changed

- `src/routes/+page.svelte` — swipe carousel, selected-currency state, passes `currencyId` to `TransactionList`
- `src/lib/components/TransactionList.svelte` — accepts `currencyId` prop, filters transactions by `transaction.currency`

### Behavior

- Main page shows one currency card at a time (carousel). Default selection: index 0.
- Mobile-only gestures (`ontouchstart` / `ontouchmove` / `ontouchend` / `ontouchcancel`); no mouse/pointer handlers.
- Swipe LEFT (dx < 0) → next currency; swipe RIGHT (dx > 0) → previous currency. Direction decision (user-confirmed): CSS-Tricks convention, which inverts the literal wording of the Description above; the boundary intent is preserved — at index 0 swiping right is a no-op, at the last index swiping left is a no-op.
- Swipe threshold: |dx| > 20% of container width. Below threshold = tap → card still flips (the click after a real swipe is suppressed via a capture-phase click handler).
- `ontouchmove` calls `preventDefault()` to block browser back-swipe and page scroll; the wrapper uses `touch-action: pan-y` so horizontal gestures reach JS while vertical page scroll still works.
- Selecting a currency filters transactions: the index-page preview shows the 3 most recent transactions of the selected currency; the "All" overlay lists ALL transactions of the selected currency, grouped by day.

### Key implementation points

- `+page.svelte`: `selectedIndex = $state(0)`; `selectedCurrency = $derived(currencies[Math.min(selectedIndex, currencies.length - 1)])` (clamped).
- Carousel markup: `overflow-hidden` wrapper + flex track with `transform: translateX(-selectedIndex * 100%)` and `transition-transform duration-300`; slides are `w-full shrink-0` (spacing via padding, not flex gap, so the percentage math stays exact).
- localStorage read moved from `$effect` to `onMount` per SPEC_2026-11-17.
- `TransactionList.svelte`: `currencyId?: string` prop; a `$derived` filter feeds the preview, the sorting, and the day grouping.
- Validation: svelte-autofixer 0 issues / 0 suggestions (Svelte 5.57.2), `prettier --check`, `svelte-check` (pre-existing `.svelte-kit` errors ignored).
