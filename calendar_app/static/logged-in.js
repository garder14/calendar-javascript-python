const loadingContainerElement = document.querySelector('.loading-container');

const mainContainerElement = document.querySelector('.main-container');

const userInfoElement = document.querySelector('.user-info');
const currentUserEmailElement = document.querySelector('.current-user-email');
const logoutButtonElement = document.querySelector('.logout-button');

const calendarElement = document.querySelector('.calendar');
const calendarHeaderTextElement = document.querySelector('.calendar-header p');
const prevMonthElement = document.querySelector('.prev-month');
const nextMonthElement = document.querySelector('.next-month');
const todayMonthElement = document.querySelector('.today-month');
const calendarDaysElement = document.querySelector('.calendar-days');

const eventsElement = document.querySelector('.events');
const eventsHeaderTextElement = document.querySelector('.events-header p');
const addEventElement = document.querySelector('.add-event');
const eventsListElement = document.querySelector('.events-list');

const eventContainerElement = document.querySelector('.event-container');
const eventFormHeaderElement = document.querySelector('.event-form-header');
const eventFormBodyElement = document.querySelector('.event-form-body');
const dayInputElement = document.querySelector('.day-input');
const monthInputElement = document.querySelector('.month-input');
const yearInputElement = document.querySelector('.year-input');
const hoursInputElement = document.querySelector('.hours-input');
const minutesInputElement = document.querySelector('.minutes-input');
const descriptionInputElement = document.querySelector('.description-input');
const colorOptionElementList = document.querySelectorAll('.color-input input');
const cancelButtonElement = document.querySelector('.cancel-button');
const acceptButtonElement = document.querySelector('.accept-button');
const deleteButtonElement = document.querySelector('.delete-button');
const deletePopupElement = document.querySelector('.delete-popup');
const yesDeleteButtonElement = document.querySelector('.yes-delete-button');
const noDeleteButtonElement = document.querySelector('.no-delete-button');
const errorMessagesElement = document.querySelector('.error-messages');


const todayDate = new Date();
const todayYear = todayDate.getFullYear(), todayMonth = todayDate.getMonth() + 1, todayDay = todayDate.getDate();

const monthNames = ['-', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let visibleYear = todayYear, visibleMonth = todayMonth;
let activeYear = todayYear, activeMonth = todayMonth, activeDay = todayDay;
let dictEvents = {};

let isDeletingEvent = false, isCreatingEvent = false, isUpdatingEvent = false, isLoggingOut = false;


function getValueByNestedKey(dict, firstKey, ...restKeys) {
    if (dict === undefined) return undefined;
    if (restKeys.length == 0) return dict[firstKey];
    return getValueByNestedKey(dict[firstKey], ...restKeys);
}


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


function logout() {
    if (isLoggingOut) return;
    isLoggingOut = true;

    logoutButtonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    disableElements(userInfoElement, calendarElement, eventsElement);

    fetch('/logout')
    .then((response) => response.json())
    .then((result) => {
        isLoggingOut = false;

        if (result.status === 'OK') {
            location.reload();
        }
    });
}


function createEvent() {
    if (isCreatingEvent) return;
    isCreatingEvent = true;
    
    hideElements(errorMessagesElement);
    errorMessagesElement.innerHTML = '';
    
    acceptButtonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    disableElements(eventFormBodyElement);
    
    fetch('/event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
            'day': dayInputElement.value,
            'month': monthInputElement.value,
            'year': yearInputElement.value,
            'hours': hoursInputElement.value,
            'minutes': minutesInputElement.value,
            'description': descriptionInputElement.value,
            'color': document.querySelector('.color-input input:checked').value,
        }),
    })
    .then((response) => response.json())
    .then((result) => {
        isCreatingEvent = false;
        
        if (result.status === 'OK') {
            location.reload();
        }

        else if (result.status === 'INVALID_DATA') {
            errorMessagesHTML = '';
            result.error_messages.forEach((message) => errorMessagesHTML += `<li>${message}</li>`);
            errorMessagesElement.innerHTML = errorMessagesHTML;
            showElements(errorMessagesElement);
            enableElements(eventFormBodyElement);
            acceptButtonElement.innerHTML = 'Save';
        }

        else {
            location.reload();
        }
    });
}


function updateEvent(eventId) {
    if (isUpdatingEvent || isDeletingEvent) return;
    isUpdatingEvent = true;

    hideElements(errorMessagesElement);
    errorMessagesElement.innerHTML = '';

    acceptButtonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    disableElements(eventFormBodyElement, eventFormHeaderElement);

    fetch(`/event/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
            'day': dayInputElement.value,
            'month': monthInputElement.value,
            'year': yearInputElement.value,
            'hours': hoursInputElement.value,
            'minutes': minutesInputElement.value,
            'description': descriptionInputElement.value,
            'color': document.querySelector('.color-input input:checked').value,
        }),
    })
    .then((response) => response.json())
    .then((result) => {
        isUpdatingEvent = false;

        if (result.status === 'OK') {
            location.reload();
        }

        else if (result.status === 'INVALID_DATA') {
            errorMessagesHTML = '';
            result.error_messages.forEach((message) => errorMessagesHTML += `<li>${message}</li>`);
            errorMessagesElement.innerHTML = errorMessagesHTML;
            showElements(errorMessagesElement);
            enableElements(eventFormBodyElement, eventFormHeaderElement);
            acceptButtonElement.innerHTML = 'Save';
        }

        else {
            location.reload();
        }
    });
}


function deleteEvent(eventId) {
    if (isDeletingEvent || isUpdatingEvent) return;
    isDeletingEvent = true;

    yesDeleteButtonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    disableElements(eventFormHeaderElement);

    fetch(`/event/${eventId}`, {
        method: 'DELETE',
    })
    .then((response) => response.json())
    .then((result) => {
        isDeletingEvent = false;

        if (result.status === 'OK') {
            location.reload();
        }
    });
}


function renderCalendar() {
    const visibleMonthFirstWeekday = ((new Date(visibleYear, visibleMonth - 1, 1)).getDay() + 6) % 7;
    const visibleMonthlastDay = (new Date(visibleYear, (visibleMonth - 1) + 1, 0)).getDate();

    calendarHeaderTextElement.innerHTML = `${monthNames[visibleMonth]}&nbsp; ${visibleYear}`;

    let dictEventsVisibleYearMonth = getValueByNestedKey(dictEvents, visibleYear.toString().padStart(4, '0'), 
                                                                     visibleMonth.toString().padStart(2, '0'));

    let calendarDaysHTML = '';
    for (let weekday = 1; weekday <= visibleMonthFirstWeekday; weekday++) {
        calendarDaysHTML += `<div class="hidden"></div>`;
    }
    for (let day = 1; day <= visibleMonthlastDay; day++) {
        const dayEvents = getValueByNestedKey(dictEventsVisibleYearMonth, day.toString().padStart(2, '0'));
        let dayInfo = '';
        if (dayEvents !== undefined) {
            dayInfo += `<br/>${'I'.repeat(Math.min(dayEvents.length, 6))}`;
        }

        if (day === activeDay && visibleMonth === activeMonth && visibleYear === activeYear) {
            calendarDaysHTML += `<div class="day active">${day}${dayInfo}</div>`;
        }
        else if (day === todayDay && visibleMonth === todayMonth && visibleYear === todayYear) {
            calendarDaysHTML += `<div class="day today">${day}${dayInfo}</div>`;
        }
        else {
            calendarDaysHTML += `<div class="day">${day}${dayInfo}</div>`;
        }
    }
    calendarDaysElement.innerHTML = calendarDaysHTML;

    document.querySelectorAll('.day').forEach((dayElement) => {
        dayElement.onclick = (e) => {
            activeDay = parseInt(e.target.innerHTML);
            activeMonth = visibleMonth;
            activeYear = visibleYear;
            renderCalendar();
            renderActiveDateEvents();
        };
    });
    
    prevMonthElement.onclick = renderPreviousMonth;
    nextMonthElement.onclick = renderNextMonth;
    todayMonthElement.onclick = renderTodayMonth;
}


function renderPreviousMonth() {
    if (visibleMonth == 1) visibleYear--;
    visibleMonth = (visibleMonth + 10) % 12 + 1;
    renderCalendar();
}


function renderNextMonth() {
    if (visibleMonth == 12) visibleYear++;
    visibleMonth = (visibleMonth) % 12 + 1;
    renderCalendar();
}


function renderTodayMonth() {
    visibleMonth = todayMonth;
    visibleYear = todayYear;
    renderCalendar();
}


function renderActiveDateEvents() {
    eventsHeaderTextElement.innerHTML = `${activeDay} ${monthNames[activeMonth]} ${activeYear}`;
    addEventElement.onclick = renderEventCreator;

    eventsListHTML = '';
    const listEventsActiveDay = getValueByNestedKey(dictEvents, activeYear.toString().padStart(4, '0'), 
                                                                activeMonth.toString().padStart(2, '0'), 
                                                                activeDay.toString().padStart(2, '0'));
    if (listEventsActiveDay !== undefined) {
        listEventsActiveDay.forEach((event) => {
            eventsListHTML += `<div class="event" style="border-bottom: .3rem solid ${event.color};">
                                   <p><b style="font-size: 1.2rem;">${event.hours}:${event.minutes}</b><br/>${event.description.replace('\n', '<br/>')}</p>
                               </div>`;
        });
    }
    eventsListElement.innerHTML = eventsListHTML;

    document.querySelectorAll('.event').forEach((eventElement, index) => {
        eventElement.onclick = () => renderEventEditor(listEventsActiveDay[index]);
    });
}


function renderEventCreator() {
    hideElements(mainContainerElement, eventFormHeaderElement, errorMessagesElement);
    errorMessagesElement.innerHTML = '';
    
    dayInputElement.value = activeDay.toString().padStart(2, '0');
    monthInputElement.value = activeMonth.toString().padStart(2, '0');
    yearInputElement.value = activeYear.toString().padStart(4, '0');
    hoursInputElement.value = '';
    minutesInputElement.value = '';
    descriptionInputElement.value = '';
    colorOptionElementList[0].checked = true;

    cancelButtonElement.onclick = () => {
        hideElements(eventContainerElement);
        showElements(mainContainerElement);
    };
    acceptButtonElement.onclick = createEvent;

    hoursInputElement.oninput = () => {
        if (hoursInputElement.value.length === 2 || parseInt(hoursInputElement.value) >= 3) minutesInputElement.focus();
    };
    minutesInputElement.oninput = () => {
        if (minutesInputElement.value.length === 2) descriptionInputElement.focus();
    };
    
    showElements(eventContainerElement);
    hoursInputElement.focus();
}


function renderEventEditor(event) {
    hideElements(mainContainerElement, errorMessagesElement);
    errorMessagesElement.innerHTML = '';
    
    dayInputElement.value = event.day;
    monthInputElement.value = event.month;
    yearInputElement.value = event.year;
    hoursInputElement.value = event.hours;
    minutesInputElement.value = event.minutes;
    descriptionInputElement.value = event.description;
    colorOptionElementList.forEach((colorOptionElement) => {
        colorOptionElement.checked = (colorOptionElement.value === event.color);
    });

    cancelButtonElement.onclick = () => {
        hideElements(eventContainerElement);
        showElements(mainContainerElement);
    };
    acceptButtonElement.onclick = () => updateEvent(event.id);
    deleteButtonElement.onclick = clickInsideDeleteButton;

    yesDeleteButtonElement.onclick = () => deleteEvent(event.id);

    showElements(eventContainerElement, eventFormHeaderElement);
}


function possibleClickOutsideDeletePopup(e) {
    e.stopImmediatePropagation();
    if (isDeletingEvent) return;
    if (!deletePopupElement.contains(e.target) || noDeleteButtonElement.contains(e.target)) {
        document.removeEventListener('click', possibleClickOutsideDeletePopup);
        hideElements(deletePopupElement);
        enableElements(eventFormBodyElement);
        showElements(deleteButtonElement);
    }
}


function clickInsideDeleteButton(e) {
    e.stopImmediatePropagation();
    hideElements(deleteButtonElement);
    disableElements(eventFormBodyElement);
    showElements(deletePopupElement);
    document.addEventListener('click', possibleClickOutsideDeletePopup);
}


fetch('/events')
.then((response) => response.json())
.then((result) => {
    if (result.status === 'OK') {
        hideElements(loadingContainerElement);

        currentUserEmailElement.innerHTML = result.user_email;
        logoutButtonElement.onclick = logout;

        dictEvents = result.dict_events;
        renderCalendar();
        renderActiveDateEvents();
        
        showElements(mainContainerElement);
    }
});
