
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const loginButton = document.querySelector("#submit-button");

// Event Handlers

loginButton.addEventListener('click', async _ => {
    logger.trace('Login button pressed');
    auth.login({
        email: emailInput.value
        , password: passwordInput.value
    });
});