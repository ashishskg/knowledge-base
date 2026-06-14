const STORAGE_KEY = 'taskdash:data:v1';

function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function defaultData() {
  const p1 = { id: uid('proj'), name: 'Website Redesign', color: '#8bd5ff' };
  const p2 = { id: uid('proj'), name: 'Mobile App', color: '#b7f7d1' };
  const p3 = { id: uid('proj'), name: 'Marketing', color: '#ffd19a' };

  return {
    projects: [p1, p2, p3],
    tasks: [
      {
        id: uid('task'),
        title: 'Make topbar responsive',
        description: 'Hide search on small screens and keep CTA visible.',
        projectId: p1.id,
        priority: 'high',
        status: 'doing',
        due: todayISO()
      },
      {
        id: uid('task'),
        title: 'Create pricing cards',
        description: 'Build a responsive card row using flex-wrap + gap.',
        projectId: p1.id,
        priority: 'medium',
        status: 'todo',
        due: ''
      },
      {
        id: uid('task'),
        title: 'Write onboarding copy',
        description: 'Short, clear copy for empty states and errors.',
        projectId: p3.id,
        priority: 'low',
        status: 'done',
        due: ''
      }
    ]
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    if (!parsed?.projects || !parsed?.tasks) return defaultData();
    return parsed;
  } catch {
    return defaultData();
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let state = {
  data: loadData(),
  route: 'dashboard',
  filters: {
    q: '',
    status: 'all',
    projectId: 'all'
  }
};

const els = {
  shell: document.getElementById('shell'),
  sidebar: document.getElementById('sidebar'),
  app: document.getElementById('app'),
  navToggle: document.getElementById('navToggle'),
  globalSearch: document.getElementById('globalSearch'),
  newTaskBtn: document.getElementById('newTaskBtn'),
  resetDataBtn: document.getElementById('resetDataBtn'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalClose: document.getElementById('modalClose'),
  cancelTask: document.getElementById('cancelTask'),
  taskForm: document.getElementById('taskForm'),
  taskTitle: document.getElementById('taskTitle'),
  taskProject: document.getElementById('taskProject'),
  taskPriority: document.getElementById('taskPriority'),
  taskDesc: document.getElementById('taskDesc'),
  taskDue: document.getElementById('taskDue'),
  taskStatus: document.getElementById('taskStatus')
};

function setRoute(route) {
  state.route = route;
  highlightNav();
  render();
  closeNav();
}

function routeFromHash() {
  const h = location.hash || '#/dashboard';
  const match = h.match(/^#\/([a-z-]+)/i);
  return match?.[1] ?? 'dashboard';
}

function highlightNav() {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.route === state.route);
  });
}

function openNav() {
  els.shell.classList.add('nav-open');
  els.navToggle.setAttribute('aria-expanded', 'true');
}

function closeNav() {
  els.shell.classList.remove('nav-open');
  els.navToggle.setAttribute('aria-expanded', 'false');
}

function toggleNav() {
  if (els.shell.classList.contains('nav-open')) closeNav();
  else openNav();
}

function openModal() {
  fillProjectOptions();
  els.taskForm.reset();
  els.taskPriority.value = 'medium';
  els.taskStatus.value = 'todo';
  els.modalBackdrop.hidden = false;
  els.taskTitle.focus();
}

function closeModal() {
  els.modalBackdrop.hidden = true;
}

function fillProjectOptions(selectedId = null) {
  els.taskProject.innerHTML = '';
  for (const p of state.data.projects) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (selectedId && selectedId === p.id) opt.selected = true;
    els.taskProject.appendChild(opt);
  }
}

function createTask(formValue) {
  const task = {
    id: uid('task'),
    title: formValue.title.trim(),
    description: (formValue.description ?? '').trim(),
    projectId: formValue.projectId,
    priority: formValue.priority,
    status: formValue.status,
    due: formValue.due ?? ''
  };

  state.data.tasks.unshift(task);
  saveData(state.data);
}

function updateTask(taskId, patch) {
  const t = state.data.tasks.find(x => x.id === taskId);
  if (!t) return;
  Object.assign(t, patch);
  saveData(state.data);
}

function deleteTask(taskId) {
  state.data.tasks = state.data.tasks.filter(t => t.id !== taskId);
  saveData(state.data);
}

function projectById(id) {
  return state.data.projects.find(p => p.id === id) ?? null;
}

function filteredTasks() {
  const q = (state.filters.q ?? '').toLowerCase().trim();
  return state.data.tasks.filter(t => {
    if (state.filters.status !== 'all' && t.status !== state.filters.status) return false;
    if (state.filters.projectId !== 'all' && t.projectId !== state.filters.projectId) return false;
    if (!q) return true;
    const p = projectById(t.projectId);
    const hay = `${t.title} ${t.description} ${p?.name ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}

function badge(text, cls) {
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderDashboard() {
  const tasks = state.data.tasks;
  const total = tasks.length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const doing = tasks.filter(t => t.status === 'doing').length;
  const done = tasks.filter(t => t.status === 'done').length;

  const dueToday = tasks.filter(t => t.due && t.due === todayISO() && t.status !== 'done').length;

  const recent = tasks.slice(0, 6);

  return `
    <section>
      <header class="page-head">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">Overview of tasks and quick actions.</p>
        </div>
        <div class="toolbar">
          <span class="pill">Due today: <strong>${dueToday}</strong></span>
          <button class="btn primary" type="button" data-action="open-modal">New task</button>
        </div>
      </header>

      <div class="page-body">
        <div class="grid">
          <div class="card" style="grid-column: span 3;">
            <div class="stat"><h3>Total tasks</h3><div class="value">${total}</div></div>
            <p>All tasks in the demo database.</p>
          </div>
          <div class="card" style="grid-column: span 3;">
            <div class="stat"><h3>To do</h3><div class="value">${todo}</div></div>
            <p>Not started yet.</p>
          </div>
          <div class="card" style="grid-column: span 3;">
            <div class="stat"><h3>Doing</h3><div class="value">${doing}</div></div>
            <p>In progress.</p>
          </div>
          <div class="card" style="grid-column: span 3;">
            <div class="stat"><h3>Done</h3><div class="value">${done}</div></div>
            <p>Completed.</p>
          </div>

          <div class="card" style="grid-column: span 12;">
            <h3>Recent tasks</h3>
            ${recent.length ? `
              <table class="table" aria-label="Recent tasks">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  ${recent.map(t => {
                    const p = projectById(t.projectId);
                    return `
                      <tr>
                        <td>${escapeHtml(t.title)}</td>
                        <td>${escapeHtml(p?.name ?? '—')}</td>
                        <td>${badge(t.status, t.status)}</td>
                        <td>${badge(t.priority, t.priority)}</td>
                        <td>${escapeHtml(t.due || '—')}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : `<div class="empty">No tasks yet. Create one to get started.</div>`}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderProjects() {
  const projects = state.data.projects;
  const counts = new Map();
  for (const p of projects) counts.set(p.id, 0);
  for (const t of state.data.tasks) counts.set(t.projectId, (counts.get(t.projectId) ?? 0) + 1);

  return `
    <section>
      <header class="page-head">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-sub">A realistic “left nav + content” layout with cards.</p>
        </div>
        <div class="toolbar">
          <span class="pill">Total: <strong>${projects.length}</strong></span>
        </div>
      </header>

      <div class="page-body">
        <div class="grid">
          ${projects.map(p => `
            <div class="card" style="grid-column: span 4;">
              <div class="stat">
                <h3>${escapeHtml(p.name)}</h3>
                <div class="pill"><strong>${counts.get(p.id) ?? 0}</strong> tasks</div>
              </div>
              <p>Color: <span style="font-family: var(--mono);">${escapeHtml(p.color)}</span></p>
              <div style="margin-top: 10px; display:flex; gap: 10px; align-items:center;">
                <span class="pill" style="border-color: rgba(255,255,255,.18);">Preview</span>
                <span style="width: 18px; height: 18px; border-radius: 6px; border: 1px solid rgba(255,255,255,.18); background:${escapeHtml(p.color)};"></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderTasks() {
  const tasks = filteredTasks();

  const projectOptions = [`<option value="all">All projects</option>`]
    .concat(state.data.projects.map(p => `<option value="${p.id}" ${state.filters.projectId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`))
    .join('');

  const statusOptions = [
    ['all', 'All statuses'],
    ['todo', 'To do'],
    ['doing', 'Doing'],
    ['done', 'Done']
  ].map(([v, label]) => `<option value="${v}" ${state.filters.status === v ? 'selected' : ''}>${label}</option>`).join('');

  return `
    <section>
      <header class="page-head">
        <div>
          <h1 class="page-title">Tasks</h1>
          <p class="page-sub">Filters + table view + actions. Try searching in the top bar.</p>
        </div>
        <div class="toolbar">
          <div class="field-inline">
            <label for="statusFilter">Status</label>
            <select id="statusFilter">${statusOptions}</select>
          </div>
          <div class="field-inline">
            <label for="projectFilter">Project</label>
            <select id="projectFilter">${projectOptions}</select>
          </div>
        </div>
      </header>

      <div class="page-body">
        ${tasks.length ? `
          <table class="table" aria-label="Tasks table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th style="width: 1%; white-space: nowrap;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(t => {
                const p = projectById(t.projectId);
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 800;">${escapeHtml(t.title)}</div>
                      ${t.description ? `<div class="muted" style="font-size: 12px; margin-top: 2px;">${escapeHtml(t.description)}</div>` : ''}
                    </td>
                    <td>${escapeHtml(p?.name ?? '—')}</td>
                    <td>${badge(t.status, t.status)}</td>
                    <td>${badge(t.priority, t.priority)}</td>
                    <td>${escapeHtml(t.due || '—')}</td>
                    <td style="white-space: nowrap;">
                      <button class="btn ghost" type="button" data-action="set-status" data-id="${t.id}" data-status="todo">To do</button>
                      <button class="btn ghost" type="button" data-action="set-status" data-id="${t.id}" data-status="doing">Doing</button>
                      <button class="btn ghost" type="button" data-action="set-status" data-id="${t.id}" data-status="done">Done</button>
                      <button class="btn ghost" type="button" data-action="delete" data-id="${t.id}">Delete</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : `
          <div class="empty">
            <strong>No results.</strong>
            <div style="margin-top: 6px;">Try changing filters or create a new task.</div>
          </div>
        `}
      </div>
    </section>
  `;
}

function renderSettings() {
  return `
    <section>
      <header class="page-head">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-sub">Production-style settings layout (forms + toggles).</p>
        </div>
        <div class="toolbar">
          <span class="pill">Demo</span>
        </div>
      </header>

      <div class="page-body">
        <div class="grid">
          <div class="card" style="grid-column: span 6;">
            <h3>Profile</h3>
            <p>Simple settings form example.</p>
            <div style="margin-top: 10px; display:grid; gap: 10px; max-width: 420px;">
              <label class="field-inline">
                <span class="muted">Display name</span>
                <input class="input" placeholder="Your name" />
              </label>
              <label class="field-inline">
                <span class="muted">Email</span>
                <input class="input" type="email" placeholder="you@example.com" />
              </label>
              <button class="btn primary" type="button" data-action="toast">Save (demo)</button>
            </div>
          </div>

          <div class="card" style="grid-column: span 6;">
            <h3>App data</h3>
            <p>Reset state to learn how persistence works.</p>
            <div style="margin-top: 10px; display:flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn" type="button" data-action="reset">Reset demo data</button>
              <button class="btn ghost" type="button" data-action="export">Export JSON</button>
            </div>
            <div class="note" style="margin-top: 10px;">
              <div class="muted" style="font-size: 12px;">Stored under key: <code>${escapeHtml(STORAGE_KEY)}</code></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function render() {
  const route = state.route;
  if (route === 'dashboard') els.app.innerHTML = renderDashboard();
  else if (route === 'projects') els.app.innerHTML = renderProjects();
  else if (route === 'tasks') els.app.innerHTML = renderTasks();
  else if (route === 'settings') els.app.innerHTML = renderSettings();
  else els.app.innerHTML = `<div class="page-body"><div class="empty">Unknown route.</div></div>`;

  attachPageHandlers();
}

function attachPageHandlers() {
  els.app.querySelectorAll('[data-action="open-modal"]').forEach(b => b.addEventListener('click', openModal));

  const statusFilter = els.app.querySelector('#statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      state.filters.status = statusFilter.value;
      render();
    });
  }

  const projectFilter = els.app.querySelector('#projectFilter');
  if (projectFilter) {
    projectFilter.addEventListener('change', () => {
      state.filters.projectId = projectFilter.value;
      render();
    });
  }

  els.app.querySelectorAll('[data-action="set-status"]').forEach(b => {
    b.addEventListener('click', () => {
      updateTask(b.dataset.id, { status: b.dataset.status });
      render();
    });
  });

  els.app.querySelectorAll('[data-action="delete"]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      if (!confirm('Delete this task?')) return;
      deleteTask(id);
      render();
    });
  });

  els.app.querySelectorAll('[data-action="reset"]').forEach(b => b.addEventListener('click', resetDemoData));
  els.app.querySelectorAll('[data-action="export"]').forEach(b => b.addEventListener('click', exportData));
  els.app.querySelectorAll('[data-action="toast"]').forEach(b => b.addEventListener('click', () => alert('Saved (demo)')));
}

function resetDemoData() {
  if (!confirm('Reset demo data? This will overwrite current tasks.')) return;
  state.data = defaultData();
  saveData(state.data);
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'taskdash-data.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Global handlers

window.addEventListener('hashchange', () => {
  const r = routeFromHash();
  setRoute(r);
});

els.navToggle.addEventListener('click', toggleNav);

document.querySelectorAll('.nav-link').forEach(a => {
  a.addEventListener('click', (e) => {
    const r = a.dataset.route;
    if (r) {
      e.preventDefault();
      location.hash = '#/' + r;
    }
  });
});

els.globalSearch.addEventListener('input', () => {
  state.filters.q = els.globalSearch.value;
  if (state.route !== 'tasks') {
    location.hash = '#/tasks';
  } else {
    render();
  }
});

els.newTaskBtn.addEventListener('click', openModal);
els.resetDataBtn.addEventListener('click', resetDemoData);

els.modalClose.addEventListener('click', closeModal);
els.cancelTask.addEventListener('click', closeModal);
els.modalBackdrop.addEventListener('click', (e) => {
  if (e.target === els.modalBackdrop) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.modalBackdrop.hidden) closeModal();
});

els.taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(els.taskForm);

  const value = {
    title: String(fd.get('title') ?? ''),
    description: String(fd.get('description') ?? ''),
    projectId: String(fd.get('projectId') ?? ''),
    priority: String(fd.get('priority') ?? 'medium'),
    status: String(fd.get('status') ?? 'todo'),
    due: String(fd.get('due') ?? '')
  };

  if (!value.title.trim() || value.title.trim().length < 3) {
    els.taskTitle.focus();
    return;
  }

  createTask(value);
  closeModal();
  if (state.route !== 'tasks') location.hash = '#/tasks';
  else render();
});

// Init
state.route = routeFromHash();
highlightNav();
render();
