
const pageTitle = document.querySelector('#page-title');
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const passwordInputRepeat = document.querySelector("#password-input-repeat");
const signUpButton = document.querySelector("#submit-button");
const backAction = document.querySelector("#back-action");
const about = document.querySelector("#about");
const notificationContainer = document.querySelector("#notification-container");

emailInput.focus();

backAction.addEventListener('click', (event) => {
    nav.openHome();
});

async function translateUI() {
    const translations = await i18n.getTranslations();
    pageTitle.innerText = translations['signUp'];
    emailInput.placeholder = translations['email'];
    passwordInput.placeholder = translations['password'];
    passwordInputRepeat.placeholder = translations['repeatPassword'];
    signUpButton.innerText = translations['signUp'];
    about.innerText = translations['about'];
}

translateUI();

// Event Handlers

signUpButton.addEventListener('click', async (event) => {
    document.querySelector("#loader").classList = ["loader"];
    accounts.signup({
        email: emailInput.value
        , password: passwordInput.value
    });
});

window.addEventListener('keypress', (key) => {
    if (key.code === 'Enter' && signUpButton.disabled == "") {
        document.querySelector("#loader").classList = ["loader"];
        accounts.signup({
            email: emailInput.value
            , password: passwordInput.value
        });
    }
});

about.addEventListener('click', async (event) => {
    nav.openAbout();
});

passwordInputRepeat.addEventListener('input', (event) => {
    if (passwordInput.value == event.target.value) {
        signUpButton.disabled = "";
    } else {
        signUpButton.disabled = "disabled";
    }
});

accounts.handleSignUpFailure((event, value) => {
    logger.trace("[UI]: Failed to Sign Up");

    document.querySelector("#loader").classList = [];
    alertMessage("error", value.message);
});

// Alert Functions

// types: info, notice, success, warning, error
function alertMessage(type, message) {
    logger.info("Launching alert message");

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