const STORAGE_KEY = "action-lab-tasks";

const starterTasks = [
  { id: 1, text: "Create a feature branch", completed: true, priority: "high", createdAt: 1 },
  { id: 2, text: "Add a workflow file in .github/workflows", completed: false, priority: "high", createdAt: 2 },
  { id: 3, text: "Make a commit and open a pull request", completed: false, priority: "medium", createdAt: 3 }
];

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";
let sortMode = "newest";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const clearCompletedButton = document.querySelector("#clear-completed");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : starterTasks;
  } catch {
    return starterTasks;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  let result = tasks.filter((task) => {
    const matchesFilter = currentFilter === "all" || (currentFilter === "open" ? !task.completed : task.completed);
    return matchesFilter && task.text.toLowerCase().includes(searchTerm.toLowerCase());
  });
  if (sortMode === "priority") {
    const order = { high: 0, medium: 1, low: 2 };
    result.sort((first, second) => order[first.priority] - order[second.priority]);
  } else if (sortMode === "status") {
    result.sort((first, second) => Number(first.completed) - Number(second.completed));
  } else {
    result.sort((first, second) => second.createdAt - first.createdAt);
  }
  return result;
}

function render() {
  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  document.querySelector("#progress-value").textContent = `${progress}%`;
  document.querySelector("#progress-caption").textContent = progress === 100 ? "Queue cleared" : progress ? "Keep the rhythm going" : "Ready when you are";
  document.querySelector("#open-value").textContent = openCount;
  document.querySelector("#done-value").textContent = completedCount;

  const filteredTasks = visibleTasks();
  taskList.innerHTML = filteredTasks.map((task) => `
    <li class="task-item">
      <button class="task-check ${task.completed ? "checked" : ""}" type="button" data-action="toggle" data-id="${task.id}" aria-label="${task.completed ? "Mark task open" : "Complete task"}"></button>
      <span class="task-text ${task.completed ? "completed" : ""}">${escapeHtml(task.text)}<small class="priority priority-${task.priority || "medium"}">${task.priority || "medium"}</small></span>
      <button class="edit-task" type="button" data-action="edit" data-id="${task.id}" aria-label="Edit task">↗</button>
      <button class="delete-task" type="button" data-action="delete" data-id="${task.id}" aria-label="Delete task">&times;</button>
    </li>
  `).join("");

  document.querySelector("#task-count").textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"}`;
  emptyState.classList.toggle("hidden", filteredTasks.length > 0);
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, completed: false, priority: document.querySelector("#priority-input").value, createdAt: Date.now() });
  saveTasks();
  taskInput.value = "";
  currentFilter = "all";
  document.querySelectorAll(".filter-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.filter === "all"));
  render();
  taskInput.focus();
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const taskId = Number(button.dataset.id);
  if (button.dataset.action === "toggle") {
    tasks = tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
  } else if (button.dataset.action === "edit") {
    const task = tasks.find((item) => item.id === taskId);
    const updatedText = window.prompt("Update this task", task.text);
    if (updatedText && updatedText.trim()) tasks = tasks.map((item) => item.id === taskId ? { ...item, text: updatedText.trim() } : item);
  } else {
    tasks = tasks.filter((task) => task.id !== taskId);
  }
  saveTasks();
  render();
});

document.querySelectorAll(".filter-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentFilter = tab.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((item) => item.classList.toggle("active", item === tab));
    render();
  });
});

function renderEnv() {
  const config = window.ENV_CONFIG || { APP_ENV: 'local-dev', ACTION_SECRET: 'not-set', BUILD_TIME: 'n/a' };
  const appEnvEl = document.querySelector("#env-app-env");
  const secretEl = document.querySelector("#env-secret-val");
  const timeEl = document.querySelector("#env-build-time");

  if (appEnvEl) appEnvEl.textContent = config.APP_ENV;
  if (secretEl) secretEl.textContent = config.ACTION_SECRET;
  if (timeEl) timeEl.textContent = `Build: ${config.BUILD_TIME}`;
}

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

searchInput.addEventListener("input", (event) => { searchTerm = event.target.value.trim(); render(); });
sortSelect.addEventListener("change", (event) => { sortMode = event.target.value; render(); });

document.querySelector("#export-tasks").addEventListener("click", () => {
  const file = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "action-lab-board.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector("#import-tasks").addEventListener("click", () => document.querySelector("#import-input").click());
document.querySelector("#import-input").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported) || imported.some((task) => typeof task.text !== "string")) throw new Error("Invalid board");
      tasks = imported.map((task, index) => ({ id: task.id || Date.now() + index, text: task.text, completed: Boolean(task.completed), priority: task.priority || "medium", createdAt: task.createdAt || Date.now() + index }));
      saveTasks();
      render();
    } catch { window.alert("That file is not a valid Action Lab board."); }
    event.target.value = "";
  };
  reader.readAsText(file);
});

document.querySelector("#load-challenge").addEventListener("click", () => {
  tasks = [
    { id: Date.now(), text: "Create a feature branch named actions-lab", completed: false, priority: "high", createdAt: Date.now() },
    { id: Date.now() + 1, text: "Add a workflow that runs on every push", completed: false, priority: "high", createdAt: Date.now() + 1 },
    { id: Date.now() + 2, text: "Protect the main branch with a required check", completed: false, priority: "medium", createdAt: Date.now() + 2 },
    { id: Date.now() + 3, text: "Ship the change through a pull request", completed: false, priority: "low", createdAt: Date.now() + 3 }
  ];
  saveTasks();
  currentFilter = "all";
  document.querySelectorAll(".filter-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.filter === "all"));
  render();
});

render();
renderEnv();

