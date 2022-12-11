const taskContainer = document.querySelector("#tasks-container");
const addTaskButton = document.querySelector("#add-task-button");

function createTaskDOM(id, contents) {
    const containerDiv = document.createElement('div');
    containerDiv.id = 'task-' + id;

    const span = document.createElement('span');
    span.innerText = contents;

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