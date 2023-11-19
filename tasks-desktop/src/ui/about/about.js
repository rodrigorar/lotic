const tasksTitle = document.querySelector("#tasks-title");
const backAction = document.querySelector("#back-action");

tasksTitle.addEventListener('click', async (event) => {
    nav.openHome();
});

backAction.addEventListener('click', (event) => {
    nav.openHome();
});