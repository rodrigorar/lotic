/**
 * IMPORTANT: If using the task id, the format for the DOM id is <anyname-we-want-with-hifens>:<task-id> exlusively,
 * otherwise we won't be able to extract the task id from the DOM id. 
 */

const taskContainer = document.querySelector("#tasks-container");
const addTaskButton = document.querySelector("#add-task-button");
const loginButton = document.querySelector("#login-button");

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

let emptyTask = undefined;
let emptyTaskElement = undefined;

async function createTask() {
    if (emptyTask == undefined) {
        const newId = await utils.generateId();
        
        const newTaskDOM = createTaskDOM(newId);
        taskContainer.appendChild(newTaskDOM);
        
        updateEmptyTask(newId, newTaskDOM);

        document.getElementById('text-input:' + newId).focus();
    }

    return emptyTask;
}

function setInitialFocus() {
    if (emptyTask != undefined) {
        document.getElementById('text-input:' + emptyTask.focus());
    }
}

async function initUI() {
    tasks.listTasks()
        .then(taskList => {
            if (taskList.length == 0) {
                const taskId = createTask();
                uiTasks[taskId] = false;
            } else {
                taskList.forEach(entry => {
                    const taskElement = createTaskDOM(entry.id, entry.title)
                    if (entry.title === '') {
                        updateEmptyTask(entry.id, taskElement);
                    }
                    taskContainer.appendChild(taskElement);
                });
            }
            setInitialFocus();
        });
}

async function refreshTasks(tasks = undefined) {
    const activeElementId = document.activeElement.id;

    logger.info('Refreshing tasks');

    if (tasks != undefined) {
        taskContainer.innerHTML = null;

        updateEmptyTask();

        tasks.forEach(entry => {
            if (entry.title === '' && emptyTask == undefined) {
                emptyTask = entry.id;
            } else if (entry.title == '' && emptyTask != undefined) {
                tasks.completeTask(entry.id);
            }
            taskContainer.appendChild(createTaskDOM(entry.id, entry.title))
        });
        document.getElementById(activeElementId).focus();
    }
}

initUI();

// Add Task

addTaskButton.addEventListener('click', async () => {
    if (emptyTask == undefined) {
        const taskId = await createTask();
        document.getElementById('text-input:' + taskId).focus();
    }
});

loginButton.addEventListener('click', async () => {
    auth.openLogin();
});

window.addEventListener('keypress', (key) => {
    if (key.code === 'Enter') {
        if (emptyTask == undefined) {
            createTask();
        }
    }
});

// Handlers

function handleTextInput(event) {
    const taskId = extractId(event.target.id);

    if (taskId == emptyTask) {
        tasks.createTask({
            id: taskId
            , title: event.target.value
            , createdAt: new Date()
            , updatedAt: new Date()
        })

        updateEmptyTask();
        
        return;
    }
    
    tasks.updateTask(taskId, {
        id: taskId
        , title: event.target.value
        , updatedAt: new Date()
    });
}

function handleCompleteInput(event) {
    if (event.target.checked) {
        const taskId = extractId(event.target.parentElement.id);

        if (taskId == emptyTask) {
            updateEmptyTask();
            return;
        }

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

function updateEmptyTask(taskId = undefined, taskElement = undefined) {
    emptyTask = taskId;
    emptyTaskElement = taskElement;
}

// Event Handlers

tasks.handleRefresh((event, value) => {
    refreshTasks(value);
});