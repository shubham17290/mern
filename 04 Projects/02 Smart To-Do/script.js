// Smart To-Do — script
const STORAGE_KEY = "smart-todo-tasks";
const THEME_KEY = "smart-todo-theme";

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const prioritySel = document.getElementById("priority");
const list = document.getElementById("taskList");
const empty = document.getElementById("empty");
const themeToggle = document.getElementById("themeToggle");
const filterBtns = document.querySelectorAll(".filters button");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let filter = "all";

// Theme
if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function render() {
  list.innerHTML = "";
  const visible = tasks.filter(t => filter === "all" || (filter === "active" ? !t.done : t.done));
  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = "task" + (t.done ? " done" : "");
    li.draggable = true;
    li.innerHTML = `
      <input type="checkbox" ${t.done ? "checked" : ""} data-id="${t.id}" />
      <span>${t.text}</span>
      <span class="priority ${t.priority}">${t.priority}</span>
      <button data-del="${t.id}" aria-label="Delete">🗑</button>`;
    list.appendChild(li);
  });
  empty.style.display = tasks.length ? "none" : "block";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  tasks.push({ id: Date.now(), text: input.value.trim(), priority: prioritySel.value, done: false });
  input.value = "";
  save(); render();
});

list.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    const t = tasks.find(x => x.id == e.target.dataset.id);
    if (t) { t.done = e.target.checked; save(); render(); }
  }
});
list.addEventListener("click", (e) => {
  if (e.target.dataset.del) {
    tasks = tasks.filter(x => x.id != e.target.dataset.del);
    save(); render();
  }
});

filterBtns.forEach(b => b.addEventListener("click", () => {
  filterBtns.forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  filter = b.dataset.filter;
  render();
}));

render();
// TODO: add drag-and-drop reordering + due dates