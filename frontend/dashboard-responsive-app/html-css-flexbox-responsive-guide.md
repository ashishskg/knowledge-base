## HTML/CSS/Flexbox/Responsive Guide

This guide explains **every major HTML tag, CSS concept, flexbox property, and responsive design technique** used in the FlexPro example app (`index.html`, `dashboard.html`).

---

## 0. Project Overview

### 0.1 What this project is

- **FlexPro Landing (`index.html`)**: A marketing-style landing page showing a hero section, feature cards, pricing grid, testimonials, and a call-to-action.  
- **FlexPro Dashboard (`dashboard.html`)**: An app-like dashboard layout with a sidebar, top bar, stat cards, data table, and settings form.

Both pages are built to demonstrate:

- **HTML**: Clean, semantic structure and accessibility-friendly tags.  
- **CSS**: Separation of base styles, layout, components, and responsive rules.  
- **Flexbox**: Primary layout mechanism for header, hero, grids, sidebar shell, and forms.  
- **Responsive design**: Mobile-first breakpoints for mobile, tablet, and desktop.

### 0.2 File map by concern

- **HTML**
  - `index.html`: Landing page markup and content.
  - `dashboard.html`: Dashboard shell and main content areas.
- **CSS**
  - `assets/css/base.css`: Global resets, variables, typography, sections, header/footer.
  - `assets/css/layout.css`: All main **flexbox layouts** (header, hero, grids, sidebar shell, forms, tables).
  - `assets/css/components.css`: Reusable UI components (buttons, cards, badges, form controls).
  - `assets/css/responsive.css`: Media queries and responsive behavior.

The next sections break this down into **HTML**, **CSS**, **Flexbox**, and **Responsive** topics, then tie each topic back to specific code in the project.

---

## 1. HTML5 Fundamentals & Semantics

### 1.1 Document Structure

#### `<!DOCTYPE html>`
- **Definition**: Declares the document as HTML5.
- **Why it exists**: Puts browsers into **standards mode** so they render according to modern specs.
- **Syntax**:

```html
<!DOCTYPE html>
<html lang="en">
  ...
</html>
```

- **Internal behavior**: Without this, browsers may use **quirks mode**, changing box model and layout behavior.
- **Best practices**: Always include it at the very top of HTML files.
- **Interview question**: What happens if you omit the doctype in an HTML page?

#### `<html>`, `<head>`, `<body>`
- **Definition**:
  - `<html>`: Root of the HTML document.
  - `<head>`: Metadata (title, meta tags, links, scripts not affecting layout).
  - `<body>`: Visible content (headers, sections, forms, etc.).
- **Why they exist**: Separate **metadata** from **content**, and define a consistent structure.
- **Syntax**:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FlexPro SaaS - Responsive Landing</title>
    <link rel="stylesheet" href="assets/css/base.css" />
  </head>
  <body> ... </body>
</html>
```

- **Internal behavior**:
  - `lang` assists screen readers and search engines.
  - `<meta charset>` defines encoding (UTF-8 recommended).
  - `viewport` meta ensures proper scaling on mobile.

---

### 1.2 Common Structural & Sectioning Tags

#### `<header>`
- **Definition**: Introductory content or navigational aids for a page or section.
- **Example in app**:

```html
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="logo">FlexPro</a>
    <nav class="nav">...</nav>
  </div>
</header>
```

- **Why it exists**: Improves semantics; screen readers know this is a header area.
- **Best practices**: Use at top of page or inside sections, but **don’t abuse** it for any random block.

#### `<nav>`
- **Definition**: Contains primary navigation links.
- **Why it exists**: Signals to assistive tech where the main nav is.
- **Example**:

```html
<nav class="nav" aria-label="Main navigation">
  <ul class="nav-list">
    <li><a href="#features">Features</a></li>
    ...
  </ul>
</nav>
```

- **Best practices**: Use sparingly (main nav, footer nav, in-page nav). Add `aria-label` for clarity.

#### `<main>`
- **Definition**: Dominant content of the `<body>`.
- **Why it exists**: Allows assistive tech to skip directly to main content.
- **Example**:

```html
<main>
  <section class="hero" id="hero"> ... </section>
  ...
</main>
```

#### `<section>`, `<article>`, `<aside>`, `<footer>`
- **`<section>`**: Thematic grouping of content with heading.
- **`<article>`**: Self-contained composition that could stand alone.
- **`<aside>`**: Sidebar/ancillary content.
- **`<footer>`**: Footer for page or section.

**Example**:

```html
<section class="section" id="features">
  <div class="container">
    <header class="section-header">
      <h2>Features</h2>
      <p>Key layout and responsive techniques...</p>
    </header>
    <div class="feature-grid">
      <article class="card">...</article>
    </div>
  </div>
</section>
```

---

### 1.3 Text & Inline Tags

#### Headings `h1`–`h6`
- **Definition**: Hierarchical headings; `h1` is page title, `h2` section titles, etc.
- **Why**: Provide **document outline** for users and SEO.
- **Example**:

```html
<h1>Build Production-Ready Responsive Apps</h1>
<h2>Features</h2>
<h3>Semantic HTML5</h3>
```

- **Best practices**: Exactly one main `h1` per page; follow a logical hierarchy.

#### `<p>`, `<span>`, `<strong>`, `<em>`, `<a>`
- `<p>`: Paragraphs (block-level).
- `<span>`: Inline styling wrapper.
- `<strong>`: Strong importance; screen readers emphasize.
- `<em>`: Emphasis (stress).
- `<a>`: Links to other locations or actions.

**Example**:

```html
<p>
  Learn <strong>HTML5, CSS3, Flexbox</strong>, and responsive design by exploring this
  real-world example application.
</p>
```

---

### 1.4 Forms & Inputs

#### `<form>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<button>`
- **Definition**: Form elements used in the dashboard “Quick Settings” section.
- **Example**:

```html
<form class="form-grid">
  <div class="form-field">
    <label for="theme">Theme</label>
    <select id="theme" name="theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>
  ...
  <button type="submit" class="btn btn-primary">Save Changes</button>
</form>
```

- **Best practices**:
  - Always pair `label` with form controls via `for`/`id`.
  - Use appropriate `type` attributes (`email`, `password`, `number`) for better UX and validation.

---

### 1.5 Lists & Tables

#### `<ul>`, `<ol>`, `<li>`
- Used in the pricing cards to list features.

```html
<ul>
  <li>Team access</li>
  <li>Advanced components</li>
  <li>Priority support</li>
</ul>
```

#### `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- Used in dashboard “Recent Layouts”:

```html
<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Last Updated</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Marketing Landing</td>
      <td>Hero + Cards</td>
      <td>2026-03-08</td>
      <td><span class="badge badge--success">Published</span></td>
    </tr>
  </tbody>
</table>
```

- **Best practices**:
  - Use `<th>` for header cells.  
  - Keep tables for **tabular data** only (not layout).

---

## 2. CSS3 Fundamentals

### 2.1 Including CSS & Selectors

#### Linking stylesheets

```html
<link rel="stylesheet" href="assets/css/base.css" />
<link rel="stylesheet" href="assets/css/layout.css" />
<link rel="stylesheet" href="assets/css/components.css" />
<link rel="stylesheet" href="assets/css/responsive.css" />
```

#### Basic selectors
- **Type selector**: `p { ... }`
- **Class selector**: `.card { ... }`
- **ID selector**: `#hero { ... }` (avoid overuse in large systems)
- **Descendant**: `.section .card { ... }`

---

### 2.2 Box Model & `box-sizing`

**Diagram**

```text
+-----------------------------+
|        margin              |
|  +-----------------------+ |
|  |       border          | |
|  |  +-----------------+  | |
|  |  |    padding      |  | |
|  |  |  +-----------+  |  | |
|  |  |  | content   |  |  | |
|  |  |  +-----------+  |  | |
|  |  +-----------------+  | |
|  +-----------------------+ |
+-----------------------------+
```

- **In `base.css`**:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

- **Why**: `border-box` makes width/height calculations intuitive (padding and border included).

---

### 2.3 Typography & Colors

- **In `base.css`**:

```css
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI',
    sans-serif;
  background: radial-gradient(circle at top left, #0b1120, #020617 55%, #000 100%);
  color: var(--color-text);
}
```

- **CSS variables**:

```css
:root {
  --color-bg: #050816;
  --color-primary: #38bdf8;
  --color-text: #e5e7eb;
  --spacing-md: 1rem;
}
```

- **Why**: Variables allow **theming**, consistent spacing, and easier changes in large projects.

---

### 2.4 Display & Positioning (Used Here)

- **`display: flex`**: For layout (see flexbox section).
- **`position`**: Application uses mostly default (`static`); no complex positioning needed in this example. In real apps, `relative`, `absolute`, `fixed`, and `sticky` are common for toolbars, modals, etc.

---

## 3. Flexbox Deep Dive

### 3.1 Concepts

**Diagram of main vs cross axis**

```text
Row direction (default):
  main axis  ---->
  cross axis
       |
       v

Column direction:
  main axis
       |
       v
  cross axis  ---->
```

- **Flex container**: Element with `display: flex` or `inline-flex`.
- **Flex items**: Direct children of the container.

---

### 3.2 Container Properties

#### `display: flex`
- **Example** (`layout.css`):

```css
.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2xl);
}
```

- **Why**: Arrange hero text and visual **side-by-side** on larger screens.

#### `flex-direction`
- Controls main axis direction: `row`, `row-reverse`, `column`, `column-reverse`.
- **Responsive override** in `responsive.css`:

```css
@media (max-width: 767px) {
  .hero-inner {
    flex-direction: column;
    text-align: left;
  }
}
```

- **Behavior**: On mobile, stack hero content vertically.

#### `flex-wrap`
- Allows items to wrap: `nowrap` (default), `wrap`, `wrap-reverse`.
- Example: card grids use `flex-wrap: wrap` implicitly via:

```css
.feature-grid,
.pricing-grid,
.testimonial-grid,
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}
```

#### `justify-content`
- Aligns items along the main axis.
- Example (header):

```css
.site-header .header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

#### `align-items`
- Aligns items along the cross axis (e.g., vertically in `row` direction).
- E.g., navigation and topbar use `align-items: center`.

#### `gap`
- Space between flex items without margins:

```css
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}
```

---

### 3.3 Item Properties

#### `flex`, `flex-grow`, `flex-shrink`, `flex-basis`

In card grids:

```css
.feature-grid .card,
.pricing-grid .card,
.testimonial-grid .card,
.card-grid .card {
  flex: 1 1 min(260px, 100%);
}
```

- `flex: 1 1 min(260px, 100%)` = `flex-grow:1`, `flex-shrink:1`, `flex-basis:min(260px,100%)`.
- **Behavior**: Cards try to be at least 260px wide, share remaining space, and wrap when needed.

---

## 4. Responsive Design & Media Queries

### 4.1 Breakpoints Used

- **Mobile**: `max-width: 767px`  
- **Tablet**: `768px–1023px`  
- **Desktop**: `min-width: 1024px`

**Diagram**

```text
0 -------- 767px | 768 -------- 1023px | 1024px -------->
   mobile         tablet                  desktop
```

### 4.2 Media Query Syntax

```css
@media (max-width: 767px) {
  /* mobile styles */
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* tablet styles */
}

@media (min-width: 1024px) {
  /* desktop styles */
}
```

### 4.3 Responsive Patterns in the App

#### 4.3.1 Stacking vs Side-by-Side

- **Hero layout**:
  - Desktop/tablet: `flex-direction: row`.
  - Mobile: `flex-direction: column`.

#### 4.3.2 Card Grids

```css
@media (min-width: 768px) and (max-width: 1023px) {
  .feature-grid .card,
  .pricing-grid .card {
    flex: 1 1 calc(50% - var(--spacing-lg));
  }
}

@media (min-width: 1024px) {
  .feature-grid .card,
  .pricing-grid .card,
  .testimonial-grid .card {
    flex: 1 1 calc(25% - var(--spacing-lg));
  }

  .pricing-grid .pricing-card {
    flex: 1 1 calc(33.333% - var(--spacing-lg));
  }
}
```

- **Behavior**:
  - Mobile: cards stack (min 260px width).
  - Tablet: 2 cards per row.
  - Desktop: 3–4 cards per row.

#### 4.3.3 Responsive Dashboard Shell

```css
@media (max-width: 767px) {
  .dashboard-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }
}
```

- **Behavior**:  
  - On mobile, the sidebar moves to the top and becomes a horizontal nav bar.  
  - On larger screens, it stays as a vertical left sidebar.

---

## 5. Enterprise Practices: Performance & Accessibility

### 5.1 Performance

- **CSS organization**: Split into `base.css`, `layout.css`, `components.css`, `responsive.css`.
  - Easier to maintain as app grows.
- **Selectors**: Mostly **class-based**, shallow selectors for performance.
- **Images**: In a real app, use `loading="lazy"` and optimized sizes.

### 5.2 Accessibility

- Semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- Clear headings and landmarks.
- Descriptive link text (“View Dashboard”, “Open Guide”) instead of “Click here”.

---

## 6. Learning Path & Practice

### 6.1 Beginner
- Read `index.html` and identify each tag’s purpose using this guide.  
- Experiment by editing text, adding new paragraphs, and reloading.

### 6.2 Intermediate
- Inspect `.hero-inner`, `.feature-grid`, `.pricing-grid` in devtools and resize the viewport.  
- Add a new section with cards and copy the flexbox patterns.

### 6.3 Advanced
- Add a new breakpoint (e.g., very large screens) and adjust the layout.  
- Introduce dark/light theme toggling using CSS variables.

---

## 7. Interview-Style Questions

1. Explain the difference between `<section>`, `<article>`, and `<div>`.  
2. How does the CSS box model work, and why is `box-sizing: border-box` commonly used?  
3. What is the main axis and cross axis in flexbox?  
4. How does `flex: 1 1 260px` behave as the viewport size changes?  
5. What is the difference between `max-width` and `min-width` media queries?  
6. How would you make a sidebar collapse into a top navigation bar on mobile?  
7. Why are CSS variables useful in large codebases?  
8. What are common pitfalls when using flexbox for card grids?  
9. How do you ensure a page is accessible to screen readers when using modern layouts?  
10. How would you structure CSS files for a large frontend project?

