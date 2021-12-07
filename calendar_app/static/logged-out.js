const authFormElement = document.querySelector('.auth-form');

const emailInputElement = document.querySelector('.email-input');
const emailButtonElement = document.querySelector('.email-button');

const backButtonElement = document.querySelector('.back-button');
const emailCopyTextElement = document.querySelector('.email-copy-text');

const operationTypeTextElement = document.querySelector('.operation-type-text');

const passwordInputElement = document.querySelector('.password-input');
const passwordButtonElement = document.querySelector('.password-button');

const errorMessagesElement = document.querySelector('.error-messages');


let isCheckingEmail = false, isCheckingPassword = false;


function showElements(...elementList) {
    elementList.forEach((element) => element.classList.remove('display-none'));
}


function hideElements(...elementList) {
    elementList.forEach((element) => element.classList.add('display-none'));
}


function enableElements(...elementList) {
    elementList.forEach((element) => element.classList.remove('disabled'));
}


function disableElements(...elementList) {
    elementList.forEach((element) => element.classList.add('disabled'));
}


function submitEmail() {
    if (isCheckingEmail) return;
    isCheckingEmail = true;

    disableElements(authFormElement);
    emailInputElement.blur();

    errorMessagesElement.innerHTML = '';
    hideElements(errorMessagesElement);
    emailButtonElement.firstChild.classList.add('fa-spinner', 'fa-spin');

    fetch(`/email_status/${emailInputElement.value}`)
    .then((response) => response.json())
    .then((result) => {
        isCheckingEmail = false;

        enableElements(authFormElement);
        emailButtonElement.firstChild.classList.remove('fa-spinner', 'fa-spin');

        if (result.status === 'OK') {
            hideElements(emailInputElement, emailButtonElement);
            
            emailCopyTextElement.innerHTML = emailInputElement.value;
            operationTypeTextElement.innerHTML = (result.operation_type === 'login') ? 'Log in' : 'Create an account';
            showElements(backButtonElement, emailCopyTextElement, operationTypeTextElement, passwordInputElement, passwordButtonElement);
            passwordInputElement.focus();
        }

        else if (result.status === 'INVALID_DATA') {
            errorMessagesHTML = '';
            result.error_messages.forEach((message) => errorMessagesHTML += `<li>${message}</li>`);
            errorMessagesElement.innerHTML = errorMessagesHTML;
            showElements(errorMessagesElement);
            emailInputElement.focus();
        }
    });
}


function editEmail() {
    hideElements(backButtonElement, emailCopyTextElement, operationTypeTextElement, passwordInputElement, passwordButtonElement, errorMessagesElement);
    passwordInputElement.value = '';
    errorMessagesElement.innerHTML = '';

    showElements(emailInputElement, emailButtonElement);
    emailInputElement.focus();
}


function submitPassword() {
    if (isCheckingPassword) return;
    isCheckingPassword = true;

    disableElements(authFormElement);
    passwordInputElement.blur();

    errorMessagesElement.innerHTML = '';
    hideElements(errorMessagesElement);
    passwordButtonElement.firstChild.classList.add('fa-spinner', 'fa-spin');

    fetch('/login_or_register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
            email: emailInputElement.value,
            password: passwordInputElement.value,
        }),
    })
    .then((response) => response.json())
    .then((result) => {
        isCheckingPassword = false;

        if (result.status === 'OK') {
            location.reload();
        }

        else if (result.status === 'INVALID_DATA') {
            enableElements(authFormElement);
            passwordButtonElement.firstChild.classList.remove('fa-spinner', 'fa-spin');

            passwordInputElement.value = '';

            errorMessagesHTML = '';
            result.error_messages.forEach((message) => errorMessagesHTML += `<li>${message}</li>`);
            errorMessagesElement.innerHTML = errorMessagesHTML;
            showElements(errorMessagesElement);

            passwordInputElement.focus();
        }
    });
}


emailInputElement.focus();
emailInputElement.onkeydown = (e) => {
    if (!e.repeat && e.key === 'Enter') submitEmail();
};
emailButtonElement.onclick = submitEmail;

backButtonElement.onclick = editEmail;

passwordInputElement.onkeydown = (e) => {
    if (!e.repeat && e.key === 'Enter') submitPassword();
};
passwordButtonElement.onclick = submitPassword;
