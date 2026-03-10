const exercises = [
  {
    id: 'flex-row-cards',
    name: 'Flexbox: Row of cards',
    meta: 'align-items, gap, wrap',
    goal: 'Make 3 cards align in a row, with spacing, and wrap nicely on small screens.',
    hints: [
      'Start with: .cards { display: flex; }',
      'Use gap for spacing; avoid margins between items.',
      'Try flex-wrap: wrap and set a reasonable width on cards.',
      'On small screens, switch to one-column with a media query.'
    ],
    html: `<!-- Goal: cards in a row, wrap on small screens -->
<div class="page">
  <h1>Pricing</h1>
  <p class="sub">Pick a plan that fits.</p>

  <div class="cards">
    <article class="card">
      <h2>Starter</h2>
      <p class="price">$0</p>
      <ul>
        <li>1 project</li>
        <li>Community support</li>
      </ul>
      <button>Choose</button>
    </article>

    <article class="card featured">
      <h2>Pro</h2>
      <p class="price">$12</p>
      <ul>
        <li>Unlimited projects</li>
        <li>Email support</li>
      </ul>
      <button>Choose</button>
    </article>

    <article class="card">
      <h2>Team</h2>
      <p class="price">$29</p>
      <ul>
        <li>Seats & roles</li>
        <li>Priority support</li>
      </ul>
      <button>Choose</button>
    </article>
  </div>
</div>
`,
    css: `/* Your job: layout the cards using Flexbox and make it responsive */

* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; }
.page { max-width: 1000px; margin: 0 auto; }
.sub { color: #444; margin-top: 0; }

.cards {
  /* TODO */
}

.card {
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.card h2 { margin: 0 0 6px; }
.price { font-size: 28px; font-weight: 800; margin: 0 0 10px; }

.card ul { margin: 0 0 14px; padding-left: 18px; }
.card button {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #222;
  background: #111;
  color: #fff;
  cursor: pointer;
}

.featured {
  border-color: #7ad6ff;
  box-shadow: 0 12px 30px rgba(0,0,0,.10);
}
`
  },
  {
    id: 'responsive-grid',
    name: 'Responsive: Card grid',
    meta: 'auto-fit + minmax',
    goal: 'Create a responsive card layout that shows more columns on wider screens.',
    hints: [
      'CSS Grid is great here: display: grid.',
      'Try: grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));',
      'Use gap for spacing.'
    ],
    html: `<!-- Goal: responsive grid -->
<div class="wrap">
  <header class="hero">
    <h1>Explore</h1>
    <p>Responsive card grid practice.</p>
  </header>

  <section class="grid">
    <article class="card"><h2>Mountains</h2><p>Fresh air and trails.</p></article>
    <article class="card"><h2>Beach</h2><p>Sunset and waves.</p></article>
    <article class="card"><h2>City</h2><p>Food, culture, museums.</p></article>
    <article class="card"><h2>Forest</h2><p>Calm and greenery.</p></article>
    <article class="card"><h2>Desert</h2><p>Night skies.</p></article>
    <article class="card"><h2>Lake</h2><p>Kayak & chill.</p></article>
  </section>
</div>
`,
    css: `/* Your job: make the .grid responsive */

* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; background: #f7f7fb; }
.wrap { max-width: 1000px; margin: 0 auto; }
.hero { margin-bottom: 14px; }

.grid {
  /* TODO */
}

.card {
  background: #fff;
  border: 1px solid #e7e7ef;
  border-radius: 16px;
  padding: 16px;
}
.card h2 { margin: 0 0 6px; }
.card p { margin: 0; color: #444; }
`
  },
  {
    id: 'navbar-mobile',
    name: 'Responsive: Navbar',
    meta: 'flex + media query',
    goal: 'Make the nav links horizontal on desktop, and stacked / simplified on mobile.',
    hints: [
      'Use Flexbox for the header row.',
      'Add a media query under ~600px.',
      'Try switching flex-direction to column on small screens.'
    ],
    html: `<!-- Goal: responsive navbar -->
<header class="site">
  <div class="brand">Acme</div>
  <nav class="nav">
    <a href="#">Home</a>
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="#">About</a>
  </nav>
  <button class="cta" type="button">Sign in</button>
</header>

<main class="content">
  <h1>Welcome</h1>
  <p>Make the header responsive.</p>
</main>
`,
    css: `/* Your job: layout the header and make it responsive */

* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }

.site {
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
  background: white;

  /* TODO */
}

.brand { font-weight: 900; }

.nav {
  /* TODO */
}

.nav a { color: #111; text-decoration: none; padding: 8px 10px; border-radius: 10px; }
.nav a:hover { background: #f3f3f7; }

.cta {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #111;
  background: #111;
  color: #fff;
}

.content { padding: 24px 18px; }
`
  }
];

const els = {
  list: document.getElementById('exerciseList'),
  title: document.getElementById('exerciseTitle'),
  goal: document.getElementById('exerciseGoal'),
  hints: document.getElementById('exerciseHints'),
  html: document.getElementById('htmlEditor'),
  css: document.getElementById('cssEditor'),
  iframe: document.getElementById('preview'),
  previewFrame: document.getElementById('previewFrame'),
  viewport: document.getElementById('viewportSelect'),
  reset: document.getElementById('resetBtn'),
  toggleHelp: document.getElementById('toggleHelpBtn'),
  helpPanel: document.getElementById('helpPanel')
};

let activeId = exercises[0].id;
let activeTab = 'html';
let initialById = new Map(exercises.map(e => [e.id, { html: e.html, css: e.css }]));

function setActiveExercise(id) {
  activeId = id;
  renderList();
  const ex = exercises.find(e => e.id === activeId);
  els.title.textContent = ex.name;
  els.goal.textContent = ex.goal;

  els.hints.innerHTML = '';
  const ul = document.createElement('ul');
  for (const h of ex.hints) {
    const li = document.createElement('li');
    li.textContent = h;
    ul.appendChild(li);
  }
  els.hints.appendChild(ul);

  const saved = loadDraft(activeId);
  els.html.value = saved?.html ?? ex.html;
  els.css.value = saved?.css ?? ex.css;

  renderPreview();
}

function renderList() {
  els.list.innerHTML = '';
  for (const ex of exercises) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'item' + (ex.id === activeId ? ' active' : '');
    btn.addEventListener('click', () => setActiveExercise(ex.id));

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = ex.name;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = ex.meta;

    btn.appendChild(name);
    btn.appendChild(meta);

    els.list.appendChild(btn);
  }
}

function renderPreview() {
  saveDraft(activeId, { html: els.html.value, css: els.css.value });

  const doc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${els.css.value}</style>
</head>
<body>
${els.html.value}
</body>
</html>`;

  els.iframe.srcdoc = doc;
}

function saveDraft(id, value) {
  try {
    localStorage.setItem('ui-lab:' + id, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function loadDraft(id) {
  try {
    const raw = localStorage.getItem('ui-lab:' + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resetExercise() {
  const init = initialById.get(activeId);
  if (!init) return;
  els.html.value = init.html;
  els.css.value = init.css;
  renderPreview();
}

function setTab(tab) {
  activeTab = tab;
  const htmlTab = document.querySelector('.tab[data-tab="html"]');
  const cssTab = document.querySelector('.tab[data-tab="css"]');
  htmlTab.classList.toggle('active', tab === 'html');
  cssTab.classList.toggle('active', tab === 'css');
  els.html.hidden = tab !== 'html';
  els.css.hidden = tab !== 'css';
}

function applyViewport(mode) {
  const map = {
    auto: '100%',
    mobile: '390px',
    tablet: '820px',
    desktop: '1200px'
  };

  const w = map[mode] ?? '100%';
  els.previewFrame.style.maxWidth = w;
}

document.addEventListener('input', (e) => {
  if (e.target === els.html || e.target === els.css) {
    renderPreview();
  }
});

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => setTab(btn.dataset.tab));
});

els.reset.addEventListener('click', resetExercise);

els.toggleHelp.addEventListener('click', () => {
  els.helpPanel.open = !els.helpPanel.open;
  els.helpPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});

els.viewport.addEventListener('change', () => applyViewport(els.viewport.value));

renderList();
setTab('html');
applyViewport('auto');
setActiveExercise(activeId);
