/**
 * IMPORTANT: If using the task id, the format for the DOM id is <anyname-we-want-with-hifens>:<task-id> exlusively,
 * otherwise we won't be able to extract the task id from the DOM id. 
 */

const taskContainer = document.querySelector("#tasks-container");
const addTaskButton = document.querySelector("#add-task-button");
const notificationContainer = document.querySelector("#notification-container");
const refreshButton = document.querySelector("#refresh-button");

// DOM Create / 

function createTaskDOM(id, title = undefined) {
    const containerDiv = document.createElement('div');
    containerDiv.id = 'container:' + id; // container:task-id
    containerDiv.classList.add("box");
    containerDiv.draggable = true;
    containerDiv.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData("draggedTaskId", extractId(event.target.id));
    })
    containerDiv.addEventListener('dragover', (event) => event.preventDefault());
    containerDiv.addEventListener('drop', (event) => {
        const targetTaskId = extractId(event.target.id);
        const draggedTaskId = event.dataTransfer.getData('draggedTaskId');
        tasks.repositionTasks(targetTaskId, draggedTaskId);
    })

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
    separator.classList.add("input-marker");

    containerDiv.appendChild(span);
    containerDiv.appendChild(completionInput);
    containerDiv.appendChild(separator);

    return containerDiv;
}

async function createMainMenu() {
    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");

    const dropdownButton = document.createElement("button");
    dropdownButton.id = "main-menu"
    dropdownButton.classList.add("btn-dropdown");
    dropdownButton.classList.add("font-hd-2");
    dropdownButton.classList.add("right");
    dropdownButton.innerText = "...";
    dropdown.appendChild(dropdownButton);

    const dropdownContent = document.createElement("div");
    dropdownContent.id = "main-menu-content";
    dropdownContent.classList.add("dropdown-content");
    dropdown.appendChild(dropdownContent);

    const isLoggedIn = await auth.isLoggedIn();
    
    if (isLoggedIn) {
        const logoutOption = document.createElement("a");
        logoutOption.href = "#";
        logoutOption.innerText = "Logout";
        logoutOption.addEventListener("click", async (event) => {
            auth.logout();
        });
        dropdownContent.appendChild(logoutOption);
    } else {
        const signInOption = document.createElement("a");
        signInOption.href = "#";
        signInOption.innerText = "Sign In";
        signInOption.addEventListener("click", async (event) => {
            nav.openLogin();
        });
        dropdownContent.appendChild(signInOption);

        const signUpOption = document.createElement("a");
        signUpOption.href = "#";
        signUpOption.innerText = "Sign Up";
        signUpOption.addEventListener("click", async (event) => {
            nav.openSignUp();
        });
        dropdownContent.appendChild(signUpOption);
    }

    const aboutOption = document.createElement("a");
    aboutOption.innerText = "About";
    aboutOption.href = "#";
    aboutOption.addEventListener("click", async (event) => {
        logger.info("About Option has been pressed. / Not implemented");
        nav.openAbout();
    });
    dropdownContent.appendChild(aboutOption);

    const headerRight = document.querySelector('#header-right');
    headerRight.appendChild(dropdown);
}

async function refreshMainMenu() {
    const headerRight = document.querySelector('#header-right');
    if (headerRight.children.length > 0) {
        headerRight.innerHTML = "";
    }
    createMainMenu();
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

function refreshTaskList() {
    
}

async function initUI() {
    await createMainMenu();

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
    logger.info("Add task button clicked");
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

refreshButton.addEventListener('click', async () => {
    logger.info("Refreshing info");
    refreshButton.classList.add('press-spinner');
    tasks.refresh();
});

// UI Handlers

let debouncedUpdateOperation;
let updatedText = "";
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
    
    updatedText = event.target.value;
    if (debouncedUpdateOperation) {
        clearTimeout(debouncedUpdateOperation);
    }
    debouncedUpdateOperation = setTimeout(() => {
        tasks.updateTask(taskId, {
            id: taskId
            , title: updatedText
            , updatedAt: new Date()
        }, 1000);
    });
}

function handleCompleteInput(event) {
    if (event.target.checked) {
        const taskId = extractId(event.target.parentElement.id);

        if (taskId == emptyTask) {
            updateEmptyTask();
            return;
        }
        
        if (document.querySelector('input') == null) {
            createTask();
        }

        setTimeout(() => {
            event.target.checked = false;
            event.target.parentElement.remove();
            tasks.completeTask(taskId);
        }, 1000);
    }
}

// Event Handlers

tasks.handleRefresh((event, tasks) => {
    const activeElementId = document.activeElement.id;

    logger.trace('Refreshing tasks');

    refreshButton.classList = [];

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

    refreshMainMenu();

    document.querySelector('#tasks-container').innerHTML = '';
    updateEmptyTask();
    createTask();
});

ui.handleLoadingStart((event) => {
    refreshButton.classList.add('press-spinner');
    document.querySelector("#loader").classList = ["loader"];
});

ui.handleLoadingEnd((event) => {
    setTimeout(() => {
        refreshButton.classList = [];
        document.querySelector("#loader").classList = [""];
    }, 500);
});

ui.handleUIRefresh((event) => {
    taskContainer.innerHTML = "";
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
});

// Helper functions

function extractId(value) {
    return value.replace(/.*\:/, "");
}

function updateEmptyTask(taskId = undefined, taskElement = undefined) {
    emptyTask = taskId;
    emptyTaskElement = taskElement;
}

// Alert Functions

// types: info, notice, success, warning, error
function alertMessage(type, message) {
    const alertLabel = document.createElement('label');
    alertLabel.id = "alert";
    
    const inputAlert = document.createElement('input');
    inputAlert.classList.add("alertCheckbox");
    inputAlert.type = "checkbox";
    inputAlert.autocomplete = "off";
    alertLabel.appendChild(inputAlert);

    const alertContainer = document.createElement('div');
    alertContainer.classList.add("alert");
    alertContainer.classList.add(type);

    const closeSpan = document.createElement('span');
    closeSpan.classList.add("alertClose");
    closeSpan.innerHTML = "X";
    alertContainer.appendChild(closeSpan);
    
    const textSpan = document.createElement('span');
    textSpan.classList.add("alertText");
    textSpan.innerHTML = message;
    alertContainer.appendChild(textSpan);

    const clearBr = document.createElement('br');
    clearBr.classList.add("clear");
    alertContainer.appendChild(clearBr);

    alertLabel.appendChild(alertContainer);

    notificationContainer.appendChild(alertLabel);
    setTimeout(() => document.querySelector("#alert").remove(), 5000);
}
