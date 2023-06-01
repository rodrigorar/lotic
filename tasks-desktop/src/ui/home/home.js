/**
 * IMPORTANT: If using the task id, the format for the DOM id is <anyname-we-want-with-hifens>:<task-id> exlusively,
 * otherwise we won't be able to extract the task id from the DOM id. 
 */

const taskContainer = document.querySelector("#tasks-container");
const addTaskButton = document.querySelector("#add-task-button");

// DOM Create / Management

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

function createLogoutButtonDOM() {
    const logoutButton = document.createElement('button');
    
    logoutButton.id = 'logout-button';
    logoutButton.classList.add('login-button');
    logoutButton.classList.add('general-button');
    logoutButton.innerText = 'Logout';
    
    logoutButton.addEventListener('click', () => {
        auth.logout();
    });

    const authButtonContainer = document.querySelector('#auth-button-container');
    authButtonContainer.appendChild(logoutButton);

    return logoutButton;
}

function createLoginButtonDOM() {
    const loginButton = document.createElement('button');

    loginButton.id = 'login-button';
    loginButton.classList.add('login-button');
    loginButton.classList.add('general-button');
    loginButton.innerText = 'Login';
    
    loginButton.addEventListener('click', async () => {
        auth.openLogin();
    });

    const authButtonContainer = document.querySelector('#auth-button-container');
    authButtonContainer.appendChild(loginButton);

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

// UI Initialization

function setInitialFocus() {
    if (emptyTask != undefined) {
        document.getElementById('text-input:' + emptyTask.focus());
    }
}

async function initLoginUI() {
    const isLoggedIn = await auth.isLoggedIn();
    if (isLoggedIn) {
        createLogoutButtonDOM();
    } else {
        createLoginButtonDOM();
    }
}

async function initUI() {
    await initLoginUI();

    tasks.listTasks()
        .then(taskList => {
            if (taskList == undefined || taskList.length == 0) {
                createTask();
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

initUI();

// Template Event Handlers

addTaskButton.addEventListener('click', async () => {
    if (emptyTask == undefined) {
        const taskId = await createTask();
        document.getElementById('text-input:' + taskId).focus();
    }
});

window.addEventListener('keypress', (key) => {
    if (key.code === "Enter") {
        if (emptyTask == undefined) {
            createTask();
        }
    }
});

// UI Handlers

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

// Event Handlers

tasks.handleRefresh((event, tasks) => {
    const activeElementId = document.activeElement.id;

    logger.trace('Refreshing tasks');

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
});

auth.handleLoggedIn(event => {
    logger.trace('Handling logged in event');

    createLogoutButtonDOM();
    document.querySelector("#login-button").remove();
});

auth.handleLoggedOut(event => {
    logger.trace('Handling logged out event');

    createLoginButtonDOM();
    document.querySelector('#logout-button').remove();

    document.querySelector('#tasks-container').innerHTML = '';
    updateEmptyTask();
    createTask();
});

// Helper functions

function extractId(value) {
    return value.replace(/.*\:/, "");
}

function updateEmptyTask(taskId = undefined, taskElement = undefined) {
    emptyTask = taskId;
    emptyTaskElement = taskElement;
}