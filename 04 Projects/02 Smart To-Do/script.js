// Smart To-Do — full implementation
const STORAGE_KEY = "smart-todo-tasks";
const THEME_KEY = "smart-todo-theme";

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const prioritySel = document.getElementById("priority");
const dueInput = document.getElementById("dueDate");
const list = document.getElementById("taskList");
const empty = document.getElementById("empty");
const themeToggle = document.getElementById("themeToggle");
const filterBtns = document.querySelectorAll(".filters button");
const clearBtn = document.getElementById("clearCompleted");
const activeCount = document.getElementById("activeCount");
const doneCount = document.getElementById("doneCount");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let filter = "all";
let dragSrcId = null;

// ---------- Theme ----------
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeToggle.textContent = dark ? "☀️" : "🌙";
}
applyTheme(localStorage.getItem(THEME_KEY) === "dark");
themeToggle.addEventListener("click", () => {
  const dark = !document.body.classList.contains("dark");
  applyTheme(dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
});

// ---------- Persistence ----------
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

// ---------- Helpers ----------
function todayStr() { return new Date().toISOString().slice(0, 10); }
function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function dueClass(d, done) {
  if (!d || done) return "";
  const t = todayStr();
  if (d < t) return "overdue";
  // within 2 days
  const diff = (new Date(d) - new Date(t)) / 86400000;
  if (diff <= 2) return "soon";
  return "";
}

// ---------- Render ----------
function render() {
  list.innerHTML = "";
  const visible = tasks.filter(t =>
    filter === "all" || (filter === "active" ? !t.done : t.done)
  );

  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = "task" + (t.done ? " done" : "");
    li.draggable = true;
    li.dataset.id = t.id;

    li.innerHTML = `
      <span class="handle" title="Drag to reorder">⋮⋮</span>
      <input type="checkbox" ${t.done ? "checked" : ""} aria-label="Toggle done" />
      <div class="task-body">
        <div class="task-text">${escapeHtml(t.text)}</div>
        <input class="edit-input hidden" type="text" value="${escapeAttr(t.text)}" />
        <div class="task-meta">
          <span class="priority ${t.priority}">${t.priority}</span>
          ${t.due ? `<span class="due ${dueClass(t.due, t.done)}">📅 ${formatDate(t.due)}</span>` : ""}
        </div>
      </div>
      <div class="task-actions">
        <button class="edit" title="Edit" aria-label="Edit">✏️</button>
        <button class="del" title="Delete" aria-label="Delete">🗑</button>
      </div>`;

    // Drag events
    li.addEventListener("dragstart", (e) => {
      dragSrcId = t.id;
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(t.id));
    });
    li.addEventListener("dragend", () => {
      dragSrcId = null;
      document.querySelectorAll(".task").forEach(x => x.classList.remove("dragging", "drag-over"));
    });
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (dragSrcId && dragSrcId !== t.id) li.classList.add("drag-over");
    });
    li.addEventListener("dragleave", () => li.classList.remove("drag-over"));
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      li.classList.remove("drag-over");
      const srcId = Number(e.dataTransfer.getData("text/plain"));
      if (!srcId || srcId === t.id) return;
      const srcIdx = tasks.findIndex(x => x.id === srcId);
      const dstIdx = tasks.findIndex(x => x.id === t.id);
      if (srcIdx < 0 || dstIdx < 0) return;
      const [moved] = tasks.splice(srcIdx, 1);
      tasks.splice(dstIdx, 0, moved);
      save(); render();
    });

    // Checkbox
    li.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      const task = tasks.find(x => x.id === t.id);
      if (task) { task.done = e.target.checked; save(); render(); }
    });

    // Delete
    li.querySelector(".del").addEventListener("click", () => {
      tasks = tasks.filter(x => x.id !== t.id);
      save(); render();
    });

    // Edit
    const textEl = li.querySelector(".task-text");
    const editInput = li.querySelector(".edit-input");
    li.querySelector(".edit").addEventListener("click", () => startEdit(li, t, textEl, editInput));
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finishEdit(li, t, editInput);
      if (e.key === "Escape") cancelEdit(li, textEl, editInput, t.text);
    });
    editInput.addEventListener("blur", () => finishEdit(li, t, editInput));

    list.appendChild(li);
  });

  const active = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;
  activeCount.textContent = `${active} active`;
  doneCount.textContent = `${done} completed`;
  empty.style.display = visible.length ? "none" : "block";
  empty.textContent = filter === "completed"
    ? "No completed tasks yet."
    : (filter === "active" ? "Nothing active — you're all caught up! 🎉" : "No tasks yet. Add one above! 🎯");
}

function startEdit(li, t, textEl, editInput) {
  li.classList.add("editing");
  editInput.classList.remove("hidden");
  editInput.focus();
  editInput.select();
}
function finishEdit(li, t, editInput) {
  if (!li.classList.contains("editing")) return;
  const val = editInput.value.trim();
  if (val && val !== t.text) { t.text = val; save(); }
  li.classList.remove("editing");
  editInput.classList.add("hidden");
  render();
}
function cancelEdit(li, textEl, editInput, original) {
  editInput.value = original;
  li.classList.remove("editing");
  editInput.classList.add("hidden");
}

// ---------- Form ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({
    id: Date.now(),
    text,
    priority: prioritySel.value,
    due: dueInput.value || "",
    done: false
  });
  input.value = "";
  dueInput.value = "";
  prioritySel.value = "medium";
  save(); render();
  input.focus();
});

// ---------- Filters ----------
filterBtns.forEach(b => b.addEventListener("click", () => {
  filterBtns.forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  filter = b.dataset.filter;
  render();
}));

// ---------- Clear completed ----------
clearBtn.addEventListener("click", () => {
  const before = tasks.length;
  tasks = tasks.filter(t => !t.done);
  if (tasks.length !== before) { save(); render(); }
});

// ---------- Utils ----------
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

render();