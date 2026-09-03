const STORAGE_KEY = "action-lab-tasks";

const starterTasks = [
  { id: 1, text: "Create a feature branch", completed: true },
  { id: 2, text: "Add a workflow file in .github/workflows", completed: false },
  { id: 3, text: "Make a commit and open a pull request", completed: false }
];

let tasks = loadTasks();
let currentFilter = "all";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const clearCompletedButton = document.querySelector("#clear-completed");

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
  if (currentFilter === "open") return tasks.filter((task) => !task.completed);
  if (currentFilter === "done") return tasks.filter((task) => task.completed);
  return tasks;
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
      <span class="task-text ${task.completed ? "completed" : ""}">${escapeHtml(task.text)}</span>
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
  tasks.unshift({ id: Date.now(), text, completed: false });
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

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

render();
