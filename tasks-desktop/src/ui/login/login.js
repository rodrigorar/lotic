
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const loginButton = document.querySelector("#submit-button");

emailInput.focus();

// Event Handlers

loginButton.addEventListener('click', async _ => {
    auth.login({
        email: emailInput.value
        , password: passwordInput.value
    });
});

window.addEventListener('keypress', (key) => {
    if (key.code === 'Enter') {
        auth.login({
            email: emailInput.value
            , password: passwordInput.value
        });
    }
});