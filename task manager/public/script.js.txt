const API = '/api/tasks';
const form = document.getElementById('task-form');
const list = document.getElementById('task-list');
const empty = document.getElementById('empty');

async function loadTasks() {
  try {
    const res = await fetch(API);
    const tasks = await res.json();
    render(tasks);
  } catch (err) {
    console.error('Load error:', err);
  }
}

function render(tasks) {
  list.innerHTML = '';
  if (!tasks.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="toggle" />
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      </div>
      <button class="delete-btn" data-id="${task.id}">✕</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.toggle').forEach(cb => {
    cb.addEventListener('change', () => toggleTask(cb.dataset.id, cb.checked));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteTask(btn.dataset.id));
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  if (!title) return;

  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });

  form.reset();
  loadTasks();
});

async function toggleTask(id, completed) {
  await fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, completed })
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  loadTasks();
}

loadTasks();