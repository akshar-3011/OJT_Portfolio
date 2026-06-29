// --- Element Registration Matrix ---
const todoColumn = document.querySelector("#todo");
const progressColumn = document.querySelector("#progress");
const doneColumn = document.querySelector("#done");
const columns = [todoColumn, progressColumn, doneColumn];

const toggleModelBtn = document.querySelector("#toggle-model");
const model = document.querySelector(".model");
const modelBg = document.querySelector(".model-bg");
const addTaskBtn = document.querySelector("#add-new-task");

const taskTitleInput = document.querySelector("#task-title-input");
const taskDescriptionInput = document.querySelector("#task-description-input");

let draggedElement = null;
let taskData = { todo: [], progress: [], done: [] };

// --- Pipeline State Serialization (Data Storage Engines) ---
function updateLocalStorage() {
    columns.forEach(col => {
        const tasksInCol = col.querySelectorAll(".task");
        taskData[col.id] = Array.from(tasksInCol).map(task => {
            return {
                title: task.querySelector("h2").innerText,
                description: task.querySelector("p").innerText
            };
        });
    });
    localStorage.setItem("tasks", JSON.stringify(taskData));
}

function initializeAppFromStorage() {
    const savedData = localStorage.getItem("tasks");
    if (savedData) {
        taskData = JSON.parse(savedData);
        for (const colId in taskData) {
            const targetColumn = document.getElementById(colId);
            taskData[colId].forEach(taskItem => {
                addTaskElement(taskItem.title, taskItem.description, targetColumn);
            });
        }
    }
    updateTaskCount();
}

// --- View Rendering Engine Transformations ---
function updateTaskCount() {
    columns.forEach(col => {
        const countIndicator = col.querySelector(".heading .count");
        const totalItems = col.querySelectorAll(".task").length;
        countIndicator.innerText = totalItems;
    });
}

function addTaskElement(title, description, targetColumn) {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task");
    taskCard.setAttribute("draggable", "true");

    taskCard.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>
        <button class="delete-btn">Delete</button>
    `;

    // Internal Component Tracking Events Setup
    taskCard.addEventListener("dragstart", () => {
        draggedElement = taskCard;
    });

    const deleteBtn = taskCard.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
        taskCard.remove();
        updateTaskCount();
        updateLocalStorage();
    });

    targetColumn.appendChild(taskCard);
    updateTaskCount();
}

// --- Spatial Board Grid Drag & Drop Context Event Registration ---
function addDragAndDropEventsToColumns(col) {
    col.addEventListener("dragenter", (e) => {
        e.preventDefault();
        col.classList.add("hover-over");
    });

    col.addEventListener("dragover", (e) => {
        e.preventDefault(); // Explicit target validation toggle bypass configuration override
    });

    col.addEventListener("dragleave", (e) => {
        e.preventDefault();
        col.classList.remove("hover-over");
    });

    col.addEventListener("drop", (e) => {
        col.appendChild(draggedElement);
        col.classList.remove("hover-over");
        updateTaskCount();
        updateLocalStorage();
    });
}

// Connect Drag Events to Board Subsystems
columns.forEach(col => addDragAndDropEventsToColumns(col));

// --- Modal Display Operations Logic Matrix ---
toggleModelBtn.addEventListener("click", () => {
    model.classList.toggle("active");
});

modelBg.addEventListener("click", () => {
    model.classList.remove("active");
});

addTaskBtn.addEventListener("click", () => {
    const titleVal = taskTitleInput.value.trim();
    const descVal = taskDescriptionInput.value.trim();

    if (titleVal === "" || descVal === "") {
        alert("Please complete all fields prior to generation execution.");
        return;
    }

    // Pipeline generation target always bound baseline standard context sequence to 'To Do' Column
    addTaskElement(titleVal, descVal, todoColumn);
    updateLocalStorage();

    // Reset inputs & hide view frame
    taskTitleInput.value = "";
    taskDescriptionInput.value = "";
    model.classList.remove("active");
});

// --- Boot Lifecycle Trigger Initialization ---
initializeAppFromStorage();