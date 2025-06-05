document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('trip-data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const tripData = await response.json();

        renderHeader(tripData);
        renderChecklist(tripData.checklist);
        renderItinerary(tripData.itinerary);
        renderInfoSections(tripData.infoSections);
        renderGiscusComments();

    } catch (error) {
        console.error("Could not load trip data:", error);
        document.getElementById('trip-header').innerHTML = '<h1>Error</h1><p>Could not load trip data. Please check the `trip-data.json` file format and try again.</p>';
    }
});

function renderHeader(data) {
    document.title = data.tripTitle;
    const header = document.getElementById('trip-header');
    header.innerHTML = `<h1>${data.tripTitle}</h1><p>${data.tripSubtitle}</p>`;
}

function renderChecklist(checklistItems = []) {
    const container = document.getElementById('checklist-section');
    if (!checklistItems.length) return;
    
    const checklistHTML = `
        <details open>
            <summary><h2>Pre-Trip Mission Control</h2></summary>
            <div id="checklist-container" class="card">
                ${checklistItems.map(item => `
                    <div class="checklist-item" id="item-${item.id}">
                        <input type="checkbox" id="${item.id}">
                        <div class="checklist-content">
                            <label for="${item.id}">${item.text}</label>
                            ${item.subtasks ? `<div class="subtasks">${item.subtasks.map(sub => `
                                <div class="subtask-item" id="item-${sub.id}">
                                    <input type="checkbox" id="${sub.id}"><label for="${sub.id}">${sub.text}</label>
                                </div>`).join('')}</div>` : ''}
                        </div>
                    </div>`).join('')}
            </div>
        </details>`;
    container.innerHTML = checklistHTML;
    attachChecklistLogic(checklistItems);
}

function renderItinerary(itineraryDays = []) {
    const container = document.getElementById('itinerary-section');
    if (!itineraryDays.length) return;

    const itineraryHTML = `
        <h2 class="itinerary-title">The Day-by-Day Plan</h2>
        ${itineraryDays.map(day => `
            <details>
                <summary>Day ${day.day} (${day.date}): ${day.title}</summary>
                <article class="card">
                    <ul>
                        ${day.events.map(event => `<li>
                            ${event.time ? `<strong>${event.time}:</strong> ` : ''}${event.description}
                            ${event.details ? `<em>${event.details}</em>` : ''}
                            ${event.bookingLink ? `<a href="${event.bookingLink.url}" target="_blank" class="booking-link">${event.bookingLink.text}</a>` : ''}
                        </li>`).join('')}
                    </ul>
                </article>
            </details>`).join('')}`;
    container.innerHTML = itineraryHTML;
}

function renderInfoSections(sections = []) {
    const container = document.getElementById('info-section-container');
    if (!sections.length) return;
    container.innerHTML = sections.map(section => `
        <section class="info-section">
            <h3>${section.title}</h3>
            <div>${section.content}</div>
        </section>`).join('');
}

function renderGiscusComments() {
    const container = document.getElementById('main-comments-section');
    const commentsSection = document.createElement('section');
    commentsSection.className = 'info-section';
    commentsSection.innerHTML = '<h3>Trip Discussion & Questions</h3>';

    const script = document.createElement('script');
    script.src = "https://giscus.app/client.js";
    
    // Your Giscus configuration is correctly placed here
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

    const updateMainTaskStatus = (item) => {
        if (!item.subtasks) return;
        const mainCheckbox = document.getElementById(item.id);
        const allSubtasksDone = item.subtasks.every(sub => state[sub.id]);
        if (allSubtasksDone && !mainCheckbox.checked) {
            mainCheckbox.checked = true;
            state[item.id] = true;
            document.getElementById(`item-${item.id}`).classList.add('done');
        }
    };

    checklistItems.forEach(item => {
        const mainCheckbox = document.getElementById(item.id);
        mainCheckbox.checked = state[item.id] || false;
        if(mainCheckbox.checked) document.getElementById(`item-${item.id}`).classList.add('done');

        mainCheckbox.addEventListener('change', () => {
            state[item.id] = mainCheckbox.checked;
            document.getElementById(`item-${item.id}`).classList.toggle('done', mainCheckbox.checked);
            if (mainCheckbox.checked && item.subtasks) {
                item.subtasks.forEach(sub => {
                    const subCheckbox = document.getElementById(sub.id);
                    if (!subCheckbox.checked) {
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
