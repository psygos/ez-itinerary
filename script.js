document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('trip-data.json');
        if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
        const tripData = await response.json();

        renderHeader(tripData);
        renderChecklist(tripData.checklist);
        renderItinerary(tripData.itinerary);
        renderInfoSections(tripData.infoSections);
        renderGiscusComments();

    } catch (error) {
        console.error("Fatal Error: Could not load or parse trip data.", error);
        document.getElementById('trip-header').innerHTML = `<h1>Oops! Something went wrong.</h1><p>Could not load the trip itinerary. Please check the browser console (F12) for errors.</p>`;
    }
});

function renderHeader(data) {
    document.title = data.tripTitle || "Singapore Trip";
    const header = document.getElementById('trip-header');
    header.innerHTML = `<h1>${data.tripTitle}</h1><p>${data.tripSubtitle}</p>`;
}

function renderChecklist(checklistItems = []) {
    const container = document.getElementById('checklist-section');
    if (!checklistItems || checklistItems.length === 0) return;
    
    const checklistHTML = `
        <section class="section-card">
            <h2>Pre-Trip Mission Control</h2>
            <div id="checklist-container">
                ${checklistItems.map(item => `
                    <div class="checklist-item" id="item-${item.id}">
                        <input type="checkbox" id="${item.id}">
                        <div class="checklist-content">
                            <label for="${item.id}">${item.text}</label>
                            ${(item.subtasks || []).map(sub => `
                                <div class="subtask-item">
                                    <input type="checkbox" id="${sub.id}"><label for="${sub.id}">${sub.text}</label>
                                </div>`).join('')}
                        </div>
                    </div>`).join('')}
            </div>
        </section>`;
    container.innerHTML = checklistHTML;
    attachChecklistLogic(checklistItems);
}

function renderItinerary(itineraryDays = []) {
    const container = document.getElementById('itinerary-section');
    if (!itineraryDays || itineraryDays.length === 0) return;

    const itineraryHTML = `
        ${itineraryDays.map(day => `
            <section class="day-section">
                <div class="day-header">
                    <h2>Day ${day.day}: ${day.title}</h2>
                    <h3>${day.date}</h3>
                </div>
                <ul class="timeline">
                    ${(day.events || []).map(event => `<li class="timeline-event">
                        ${event.time ? `<span class="timeline-time">${event.time}</span>` : ''}
                        <p>${event.description || ''}</p>
                        ${event.details ? `<p class="timeline-details">${event.details}</p>` : ''}
                        ${event.bookingLink ? `<a href="${event.bookingLink.url}" target="_blank" class="booking-link">${event.bookingLink.text} →</a>` : ''}
                    </li>`).join('')}
                </ul>
            </section>`).join('')}`;
    container.innerHTML = itineraryHTML;
}

function renderInfoSections(sections = []) {
    const container = document.getElementById('info-section-container');
    if (!sections || sections.length === 0) return;
    container.innerHTML = sections.map(section => `
        <section class="section-card">
            <h2>${section.title}</h2>
            <div>${section.content}</div>
        </section>`).join('');
}

function renderGiscusComments() {
    const container = document.getElementById('main-comments-section');
    const commentsSection = document.createElement('section');
    commentsSection.className = 'section-card';
    commentsSection.innerHTML = '<h2>Trip Discussion & Questions</h2>';

    const script = document.createElement('script');
    script.src = "https://giscus.app/client.js";
    
    script.setAttribute("data-repo", "psygos/ez-itinerary");
    script.setAttribute("data-repo-id", "R_kgDOO220qA");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOO220qM4CrFuT");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    commentsSection.appendChild(script);
    container.appendChild(commentsSection);
}

function attachChecklistLogic(checklistItems) {
    let state = JSON.parse(localStorage.getItem('checklistState')) || {};
    // ... (This entire function remains unchanged from the previous version)
    const updateMainTaskStatus = (item) => {
        if (!item.subtasks) return;
        const mainCheckbox = document.getElementById(item.id);
        const allSubtasksDone = item.subtasks.every(sub => state[sub.id]);
        if (allSubtasksDone && mainCheckbox && !mainCheckbox.checked) {
            mainCheckbox.checked = true;
            state[item.id] = true;
            document.getElementById(`item-${item.id}`).classList.add('done');
        }
    };

    checklistItems.forEach(item => {
        const mainCheckbox = document.getElementById(item.id);
        if (!mainCheckbox) return;
        mainCheckbox.checked = state[item.id] || false;
        if(mainCheckbox.checked) document.getElementById(`item-${item.id}`).classList.add('done');

        mainCheckbox.addEventListener('change', () => {
            state[item.id] = mainCheckbox.checked;
            document.getElementById(`item-${item.id}`).classList.toggle('done', mainCheckbox.checked);
            if (mainCheckbox.checked && item.subtasks) {
                item.subtasks.forEach(sub => {
                    const subCheckbox = document.getElementById(sub.id);
                    if (subCheckbox && !subCheckbox.checked) {
                        subCheckbox.checked = true;
                        state[sub.id] = true;
                        subCheckbox.parentElement.classList.add('done');
                    }
                });
            }
            localStorage.setItem('checklistState', JSON.stringify(state));
        });

        if (item.subtasks) {
            item.subtasks.forEach(sub => {
                const subCheckbox = document.getElementById(sub.id);
                if (!subCheckbox) return;
                subCheckbox.checked = state[sub.id] || false;
                if(subCheckbox.checked) subCheckbox.parentElement.classList.add('done');

                subCheckbox.addEventListener('change', () => {
                    state[sub.id] = subCheckbox.checked;
                    subCheckbox.parentElement.classList.toggle('done', subCheckbox.checked);
                    updateMainTaskStatus(item);
                    localStorage.setItem('checklistState', JSON.stringify(state));
                });
            });
            updateMainTaskStatus(item);
        }
    });
}
