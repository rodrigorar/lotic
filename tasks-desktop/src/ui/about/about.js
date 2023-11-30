const tasksTitle = document.querySelector("#tasks-title");
const appVersion = document.querySelector('#app-version');
const appDescription = document.querySelector('#app-description');
const backAction = document.querySelector("#back-action");

tasksTitle.addEventListener('click', async (event) => {
    nav.openHome();
});

backAction.addEventListener('click', (event) => {
    nav.openHome();
});

async function translateUI() {
    const translations = await i18n.getTranslations();
    appVersion.innerText = `${translations['version']} - 0.6.0`;
    appDescription.innerText = translations['appDescription'];
}

translateUI();
