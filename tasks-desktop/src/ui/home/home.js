/**
 * IMPORTANT: If using the task id, the format for the DOM id is <anyname-we-want-with-hifens>:<task-id> exlusively,
 * otherwise we won't be able to extract the task id from the DOM id. 
 */

const taskContainer = document.querySelector("#tasks-container");
const addTaskButton = document.querySelector("#add-task-button");

function createTaskDOM(id, title = undefined) {
    const containerDiv = document.createElement('div');
    containerDiv.id = 'container:' + id; // container:task-id

    const text = document.createElement('input');
    text.classList.add('transparent-text-input');
    text.id = 'text-input:' + id; // text-input:<task-id>
    text.type = 'text';
    text.placeholder = 'Tasks title'
    if (title) {
        text.value = title;
    }
    text.addEventListener('input', handleTextInput);

    const span = document.createElement('span');
    span.appendChild(text);

    const completionInput = document.createElement('input');
    completionInput.type = 'checkbox';
    completionInput.classList.add("task-checkbox");
    completionInput.addEventListener('change', handleCompleteInput);
    

    const separator = document.createElement('hr');
    separator.classList.add("separator");

    containerDiv.appendChild(span);
    containerDiv.appendChild(completionInput);
    containerDiv.appendChild(separator);

    return containerDiv;
}

let emptyTasks = [];

async function createTask() {
    const newId = await utils.generateId();
    emptyTasks.push(newId);
    
    const newTaskDOM = createTaskDOM(newId);
    taskContainer.appendChild(newTaskDOM);

    document.getElementById('text-input:' + newId).focus();

    tasks.createTask({
        id: newId,
        title: '',
        state: 'IN_TODO',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    return newId;
}

function setInitialFocus() {
    if (emptyTasks.length > 0) {
        document.getElementById('text-input:' + emptyTasks.pop()).focus();
    }
}

async function initUI() {
    tasks.listTasks()
        .then(tasks => {
            if (tasks.length == 0) {
                const taskId = createTask();
                uiTasks[taskId] = false;
            } else {
                tasks.forEach(entry => {
                    if (entry.title === '') {
                        emptyTasks.push(entry.id);
                    }
                    taskContainer.appendChild(createTaskDOM(entry.id, entry.title))
                });
            }
            setInitialFocus();
        });
}

async function refreshTasks(tasks = undefined) {
    if (tasks != undefined) {
        taskContainer.innerHTML = null;
        emptyTasks = [];

        tasks.forEach(entry => {
            if (entry.title === '') {
                emptyTasks.push(entry.id);
            }
            taskContainer.appendChild(createTaskDOM(entry.id, entry.title))
        });
        setInitialFocus();
    }
}

initUI();

// Add Task

addTaskButton.addEventListener('click', async () => {
    const taskId = await createTask();
    emptyTasks.push(taskId);
    document.getElementById('text-input:' + taskId).focus();
});

window.addEventListener('keypress', (key) => {
    if (key.code === 'Enter') {
        if (emptyTasks.length == 0) {
            createTask();
        }
    }
});

// Handlers

function handleTextInput(event) {
    const taskId = extractId(event.target.id);

    updateEmptyTasks(taskId, event.target.value);
    
    tasks.updateTask(taskId, {
        id: taskId,
        title: event.target.value,
        updatedAt: new Date()
    });
}

function handleCompleteInput(event) {
    if (event.target.checked) {
        const taskId = extractId(event.target.parentElement.id);

        updateEmptyTasks(taskId);

        tasks.completeTask(taskId);
        event.target.parentElement.remove();
        
        if (document.querySelector('input') == null) {
            createTask();
        }
    }
}

// Helper functions

function extractId(value) {
    return value.replace(/.*\:/, "");
}

function updateEmptyTasks(taskId, taskTitle = undefined) {
    if (taskTitle === '') {
        emptyTasks.push(taskId);
    } else {
        if (emptyTasks.length > 0) {
            emptyTasks = emptyTasks.filter(id => taskId !== id);
        }
    }
}

// Event Handlers

tasks.handleRefresh((event, value) => {
    refreshTasks(value);
});