# TaskDash (Production-Style Responsive Demo)

A small “production-like” responsive web app built with **plain HTML/CSS/JS** (no build tools) so you can learn how real UIs are structured.

## How to run
- Open `prod-app/index.html` in your browser.

## What this teaches
- **Responsive layout**
  - Desktop: sidebar + main content
  - Mobile: collapsible sidebar (hamburger menu)
- **UI patterns**
  - Topbar with primary action
  - Dashboard stats cards
  - Table with actions
  - Filters + search
  - Modal dialog with form
  - Empty states
- **State management**
  - App state in JS
  - Persistence via `localStorage`

## What to modify (learning tasks)
- Change breakpoints in `styles.css`.
- Add a new page route (copy the `renderX()` pattern in `app.js`).
- Add a new task field (e.g., assignee) and render it.
- Replace alerts with a custom toast component.
- Add inline editing of task titles.

## Files
- `index.html` — layout + modal form
- `styles.css` — responsive styling
- `app.js` — routing, state, rendering, persistence
