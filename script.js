const STORAGE_KEY = 'dynamic-todo-list';

const taskForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const template = document.getElementById('taskItemTemplate');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Could not load tasks from localStorage', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateTaskCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  const text = remaining === 1 ? '1 task left' : `${remaining} tasks left`;
  taskCount.textContent = text;
}

function getVisibleTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.innerHTML = '';

  visibleTasks.forEach((task) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const text = item.querySelector('.task-text');
    const checkbox = item.querySelector('.task-toggle');
    const deleteBtn = item.querySelector('.delete-btn');

    text.textContent = task.text;
    checkbox.checked = task.completed;
    item.classList.toggle('completed', task.completed);

    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    deleteBtn.addEventListener('click', () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(item);
  });

  emptyState.classList.toggle('hidden', visibleTasks.length > 0);
  updateTaskCount();
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = '';
  taskInput.focus();
});

clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    renderTasks();
  });
});

renderTasks();
