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

async function createTask() {
    const newId = await utils.generateId();
    taskContainer.appendChild(createTaskDOM(newId));

    tasks.createTask({
        id: newId,
        title: '',
        state: 'IN_TODO',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    return newId;
}

async function initUI() {
    tasks.listTasks()
        .then(tasks => {
            if (tasks.length == 0) {
                createTask();
            } else {
                tasks.forEach(entry => taskContainer.appendChild(createTaskDOM(entry.id, entry.title)));
            }
        });
}

initUI();

// Add Task Button Event Listeners

addTaskButton.addEventListener('click', async () => {
    const id = await createTask();
    document.getElementById('text-input:' + id).focus();
});

// Handlers

function handleTextInput(event) {
    const taskId = extractId(event.target.id);
    tasks.updateTask(taskId, {
        id: taskId,
        title: event.target.value,
        updatedAt: new Date()
    });
}

function handleCompleteInput(event) {
    if (event.target.checked) {
        tasks.completeTask(extractId(event.target.parentElement.id));
        event.target.parentElement.remove();
    }
}

// Helper functions

function extractId(value) {
    return value.replace(/.*\:/, "");
}