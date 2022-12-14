const taskContainer = document.querySelector("#tasks-container");
const addTaskButton = document.querySelector("#add-task-button");

function createTaskDOM(id, contents) {
    const containerDiv = document.createElement('div');
    containerDiv.id = 'task-' + id;

    const text = document.createElement('input');
    text.classList.add('transparent-text-input');
    text.id = 'task-' + id + '-text';
    text.type = 'text';
    text.placeholder = 'Tasks title'

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

logger.trace('This is a trace');
logger.info('This is an info');
logger.warn('This is a warn with no error');
logger.warn('', new Error('This is the error'));
logger.error(new Error('This is the error error'));

let id = 1;
addTaskButton.addEventListener('click', () => {
    taskContainer.appendChild(createTaskDOM(id, 'Task - #' + id));
    id++;
});

// Create dummy data in the UI
while (id < 6) {
    taskContainer.appendChild(createTaskDOM(id, 'Task - #' + id));
    id++;
}