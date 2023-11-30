const backAction = document.querySelector("#back-action");
const settingsContainer = document.querySelector("#settings-container");

backAction.addEventListener('click', (event) => {
    nav.openHome();
});

function createSelectorEntry(name, value, action, toggled = false) {
    const entryLabel = document.createElement('x-label');
    entryLabel.innerText = name;

    const entry = document.createElement('x-menuitem');
    entry.value = value;
    entry.toggled = toggled;
    entry.addEventListener('click', action);
    entry.appendChild(entryLabel);

    return entry;
}

function createSelectorSetting(name, options) {
    const selectorMenu = document.createElement('x-menu');
    for (const option of options) {
        selectorMenu.appendChild(createSelectorEntry(option.name, option.value, option.action, option.toggled));
    }

    const selector = document.createElement('x-select');
    selector.appendChild(selectorMenu);

    const settingName = document.createElement('p');
    settingName.classList.add('font-hd-2');
    settingName.innerText = name + ':';

    const hSpacer = document.createElement('div');
    hSpacer.classList.add('h-spacer-40');

    const settingContainer = document.createElement('div');
    settingContainer.classList.add('row-1-with-margin');
    settingContainer.appendChild(settingName);
    settingContainer.appendChild(hSpacer);
    settingContainer.appendChild(selector);

    return settingContainer;
}

function createLanguageSetting(language, translations) {
    const handleAction = async (event, languageCode) => {
        await i18n.setLanguage(languageCode);
        await ui.reload();
    }

    const languageSetting = createSelectorSetting(
        translations['language'], [
            {
                name: translations['english']
                , value: 'en'
                , action: async (event) => handleAction(event, 'en')
                , toggled: language === 'en' 
            },
            {
                name: translations['portuguese']
                , value: 'pt'
                , action: async (event) => handleAction(event, 'pt')
                , toggled: language === 'pt'
            },
            {
                name: translations['spanish']
                , value: 'es'
                , action: async (event) => handleAction(event, 'es')
                , toggled: language === 'es'
            }
        ]);
    settingsContainer.appendChild(languageSetting);
}

async function initUI() {
    const translations = await i18n.getTranslations();
    const language = await i18n.getLanguage();
    createLanguageSetting(language, translations);    
}

initUI();