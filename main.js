const tasks = [];
const RENDER_EVENT = "render-task";
const SAVED_EVENT = "saved-tasks";
const STORAGE_KEY = "TASK_APPS";

function generateId() {
  return +new Date();
}

function generateTaskObject(id, title, author, year, status) {
  return {
    id,
    title,
    author,
    year,
    status,
  };
}

function findTask(taskId) {
  for (const taskItem of tasks) {
    if (taskItem.id === taskId) {
      return taskItem;
    }
  }
  return null;
}

function findTaskIndex(taskId) {
  for (const index in tasks) {
    if (tasks[index].id === taskId) {
      return index;
    }
  }
  return -1;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTask();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function makeTask(taskObject) {
  const taskTitle = document.createElement("h3");
  taskTitle.innerText = taskObject.title;
  taskTitle.classList.add("task-title");

  const taskAuthor = document.createElement("p");
  taskAuthor.innerText = "Created by : " + taskObject.author;

  const taskYear = document.createElement("p");
  taskYear.innerText = "Date : " + taskObject.year;

  const buttonMove = document.createElement("button");
  buttonMove.innerText = "Move on Task";
  buttonMove.classList.add("progress-button");

  const buttonBack = document.createElement("button");
  buttonBack.innerText = "Back off Task";
  buttonBack.classList.add("progress-button");

  switch (taskObject.status) {
    case "planned":
      buttonMove.addEventListener("click", function () {
        moveOnProgress(taskObject.id, "planned");
      });
      buttonBack.addEventListener("click", function () {
        backOfProgress(taskObject.id, "planned");
      });
      break;
    case "on-progress":
      buttonMove.addEventListener("click", function () {
        moveOnProgress(taskObject.id, "on-progress");
      });
      buttonBack.addEventListener("click", function () {
        backOfProgress(taskObject.id, "on-progress");
      });
      break;
    case "on-review":
      buttonMove.addEventListener("click", function () {
        moveOnProgress(taskObject.id, "on-review");
      });
      buttonBack.addEventListener("click", function () {
        backOfProgress(taskObject.id, "on-review");
      });
      break;
    case "done":
      buttonMove.addEventListener("click", function () {
        moveOnProgress(taskObject.id, "done");
      });
      buttonBack.addEventListener("click", function () {
        backOfProgress(taskObject.id, "done");
      });
      break;
    default:
      break;
  }

  const buttonDelete = document.createElement("button");
  buttonDelete.innerText = "Delete Task";
  buttonDelete.classList.add("task-button");

  buttonDelete.addEventListener("click", function () {
    deleteTask(taskObject.id);
  });

  const buttonProgressWrapper = document.createElement("div");
  buttonProgressWrapper.classList.add("progress-button-wrapper");
  buttonProgressWrapper.append(buttonBack, buttonMove);

  const buttonWrapper = document.createElement("div");
  buttonWrapper.classList.add("task-button-wrapper");
  buttonWrapper.append(buttonDelete, buttonProgressWrapper);

  const container = document.createElement("div");
  container.classList.add("task-container");
  container.append(taskTitle, taskAuthor, taskYear, buttonWrapper);
  container.setAttribute("id", `task-${taskObject.id}`);

  return container;
}

function addTask() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("user").value;
  const year = document.getElementById("date").value;
  const status = document.getElementById("status").value;

  const generatedID = generateId();
  const taskObject = generateTaskObject(
    generatedID,
    title,
    author,
    year,
    status
  );
  tasks.push(taskObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveOnProgress(taskId, progress) {
  let taskTarget = findTask(taskId);
  switch (progress) {
    case "planned":
      taskTarget.status = "on-progress";
      break;
    case "on-progress":
      taskTarget.status = "on-review";
      break;
    case "on-review":
      taskTarget.status = "done";
      break;
    case "done":
      taskTarget.status = "planned";
      break;
    default:
      break;
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function backOfProgress(taskId, progress) {
  let taskTarget = findTask(taskId);
  switch (progress) {
    case "planned":
      taskTarget.status = "done";
      break;
    case "on-progress":
      taskTarget.status = "planned";
      break;
    case "on-review":
      taskTarget.status = "on-progress";
      break;
    case "done":
      taskTarget.status = "on-review";
      break;
    default:
      break;
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteTask(taskId) {
  const taskTarget = findTaskIndex(taskId);

  if (taskTarget === -1) return;

  if (window.confirm("Yakin ingin lanjut menghapus buku?")) {
    tasks.splice(taskTarget, 1);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(tasks);
    sessionStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = sessionStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const task of data) {
      tasks.push(task);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const plannedTask = document.getElementById("planned");
  const onProgressTask = document.getElementById("on-progress");
  const onReviewTask = document.getElementById("on-review");
  const doneTask = document.getElementById("done");
  plannedTask.innerHTML = "";
  onProgressTask.innerHTML = "";
  onReviewTask.innerHTML = "";
  doneTask.innerHTML = "";

  for (const taskItem of tasks) {
    const taskElement = makeTask(taskItem);
    switch (taskItem.status) {
      case "planned":
        plannedTask.append(taskElement);
        break;
      case "on-progress":
        onProgressTask.append(taskElement);
        break;
      case "on-review":
        onReviewTask.append(taskElement);
        break;
      case "done":
        doneTask.append(taskElement);
        break;
      default:
        break;
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitSearch = document.getElementById("search");
  submitSearch.addEventListener("submit", function (event) {
    event.preventDefault();
    addSearchedTask();
  });
});

function addSearchedTask() {
  const searchInputValue = document.getElementById("searchValue").value;
  const filteredTask = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchInputValue.toLowerCase()) ||
      task.author.toLowerCase().includes(searchInputValue.toLowerCase())
  );
  const searchedTask = document.getElementById("searchedTask");
  searchedTask.innerHTML = "";

  if (filteredTask.length !== 0 && searchInputValue.length !== 0) {
    const searchedTask = document.getElementById("searchedTask");
    searchedTask.innerHTML = "";
    filteredTask.map((task) => searchedTask.append(makeTask(task)));
  } else {
    const searchFailed = document.createElement("h3");
    if (searchInputValue.length === 0) {
      searchFailed.innerText = "Please add title task or user name.";
    } else {
      searchFailed.innerText = "Task not found.";
    }
    searchedTask.innerHTML = "";
    searchedTask.append(searchFailed);
  }
}

const createTaskButton = document.getElementById("btn-create");
createTaskButton.onclick = function () {
  toggleCreateTask();
};

function toggleCreateTask() {
  const createForm = document.getElementById("form");
  if (createForm.classList.contains("hidden")) {
    createForm.classList.remove("hidden");
  } else {
    createForm.classList.add("hidden");
  }
  createForm.classList.add("transition-all");
}
