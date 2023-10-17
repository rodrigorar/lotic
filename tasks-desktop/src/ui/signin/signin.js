
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const signinButton = document.querySelector("#submit-button");
const about = document.querySelector("#about");
const notificationContainer = document.querySelector("#notification-container");

emailInput.focus();

// Event Handlers

signinButton.addEventListener('click', async (event) => {
    document.querySelector("#loader").classList = ["loader"];
    auth.signin({
        email: emailInput.value
        , password: passwordInput.value
    });
});

window.addEventListener('keypress', (key) => {
    if (key.code === 'Enter') {
        document.querySelector("#loader").classList = ["loader"];
        auth.signin({
            email: emailInput.value
            , password: passwordInput.value
        });
    }
});

about.addEventListener('click', async (event) => {
    nav.openAbout();
});

auth.handleLoginFailure((event, value) => {
    logger.trace("[UI]: Failed to login");

    document.querySelector("#loader").classList = [];
    alertMessage("error", value.message);
});

accounts.handleSignUpSuccess((event, value) => {
    logger.trace("[UI]: Account Successfully created");
    alertMessage("success", value.message);
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
