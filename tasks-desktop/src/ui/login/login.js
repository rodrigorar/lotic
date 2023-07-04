
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const loginButton = document.querySelector("#submit-button");
const termsAndConditions = document.querySelector("#terms-conditions");

emailInput.focus();

// Event Handlers

loginButton.addEventListener('click', async _ => {
    document.querySelector("#loader").classList = ["loader"];
    auth.login({
        email: emailInput.value
        , password: passwordInput.value
    });
});

window.addEventListener('keypress', (key) => {
    if (key.code === 'Enter') {
        document.querySelector("#loader").classList = ["loader"];
        auth.login({
            email: emailInput.value
            , password: passwordInput.value
        });
    }
});

termsAndConditions.addEventListener('click', async _ => {
    logger.info("About Was pressed (Not Implemented)");
});
