---
name: Navigation query quirks
description: Reliable handling for same-page actions and query-based entry in the Wouter navigation.
---

For actions that open UI on the current page, use a direct callback from the navigation instead of relying only on a query-string change. Keep a query-string fallback for arriving from another route.

**Why:** Wouter can keep the same route component mounted when only the query string changes, so a query-only navigation is not a reliable trigger for opening a modal.

**How to apply:** Pass callbacks through the shared shell for same-page actions, and use `window.location.search` on mount only for cross-route deep links.