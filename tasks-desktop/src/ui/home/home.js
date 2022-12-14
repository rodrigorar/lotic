/**
 * IMPORTANT: If using the task id, the format for the DOM id is <anyname-we-want-with-hifens>:<task-id> exlusively,
 * otherwise we won't be able to extract the task id from the DOM id. 
 */

const taskContainer = document.querySelector("#tasks-container");
const addTaskButton = document.querySelector("#add-task-button");

function createTaskDOM(id) {
    const containerDiv = document.createElement('div');
    containerDiv.id = 'container:' + id; // container:task-id

    const text = document.createElement('input');
    text.classList.add('transparent-text-input');
    text.id = 'text-input:' + id; // text-input:<task-id>
    text.type = 'text';
    text.placeholder = 'Tasks title'
    text.addEventListener('input', handleTextInput);

    const span = document.createElement('span');
    span.appendChild(text);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.classList.add("task-checkbox");

    const separator = document.createElement('hr');
    separator.classList.add("separator");

    containerDiv.appendChild(span);
    containerDiv.appendChild(input);
    containerDiv.appendChild(separator);

    return containerDiv;
}

async function createTask() {
    const newId = await utils.generateId();
    taskContainer.appendChild(createTaskDOM(newId));
}

// Init UI
const taskIds = [];
if (taskIds.length == 0) {
    createTask();
}

// Add Task Button Event Listeners

addTaskButton.addEventListener('click', async () => {
    createTask();
});

// Handlers

function handleTextInput(event) {
    tasks.updateTitle(extractId(event.target.id), event.target.value);
}

// Helper functions
function extractId(blob) {
    return blob.replace(/.*\:/, "");
}