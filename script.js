
const addJobBtn = document.getElementById("addJobBtn");
const jobModal = document.getElementById("jobModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const jobForm = document.getElementById("jobForm");

const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const locationInput = document.getElementById("location");
const salaryInput = document.getElementById("salary");
const dateInput = document.getElementById("date");
const statusInput = document.getElementById("status");
const jobUrlInput = document.getElementById("jobUrl");

const editIdInput = document.getElementById("editId");

const modalTitle = document.getElementById("modalTitle");

const applicationsContainer =
    document.getElementById("applicationsContainer");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const sortBy =
    document.getElementById("sortBy");


// ==========================================
// APPLICATION DATA
// ==========================================

// Get saved applications from LocalStorage

let applications =
    JSON.parse(localStorage.getItem("applications")) || [];


// ==========================================
// SAVE DATA
// ==========================================

function saveApplications() {

    localStorage.setItem(
        "applications",
        JSON.stringify(applications)
    );

}


// ==========================================
// OPEN MODAL
// ==========================================

addJobBtn.addEventListener("click", () => {

    modalTitle.textContent = "Add Application";

    jobForm.reset();

    editIdInput.value = "";

    // Set today's date
    dateInput.value =
        new Date().toISOString().split("T")[0];

    jobModal.classList.add("show");

});


// ==========================================
// CLOSE MODAL
// ==========================================

function closeJobModal() {

    jobModal.classList.remove("show");

    jobForm.reset();

    editIdInput.value = "";

}


closeModal.addEventListener("click", closeJobModal);

cancelBtn.addEventListener("click", closeJobModal);


// Close modal when clicking outside

jobModal.addEventListener("click", (event) => {

    if (event.target === jobModal) {

        closeJobModal();

    }

});


// ==========================================
// ADD / EDIT APPLICATION
// ==========================================

jobForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const company = companyInput.value.trim();
    const role = roleInput.value.trim();
    const location = locationInput.value.trim();
    const salary = salaryInput.value.trim();
    const date = dateInput.value;
    const status = statusInput.value;
    const jobUrl = jobUrlInput.value.trim();


    // Basic validation

    if (!company || !role || !date) {

        alert("Please fill all required fields.");

        return;

    }


    // Check if editing

    const editId = editIdInput.value;


    if (editId) {

        // Find application

        const application =
            applications.find(
                app => app.id === editId
            );


        if (application) {

            application.company = company;
            application.role = role;
            application.location = location;
            application.salary = salary;
            application.date = date;
            application.status = status;
            application.jobUrl = jobUrl;

        }

    } else {

        // Create new application

        const newApplication = {

            id: Date.now().toString(),

            company: company,

            role: role,

            location: location,

            salary: salary,

            date: date,

            status: status,

            jobUrl: jobUrl

        };


        // Add to array

        applications.push(newApplication);

    }


    // Save data

    saveApplications();


    // Display applications

    renderApplications();


    // Close modal

    closeJobModal();

});


// ==========================================
// RENDER APPLICATIONS
// ==========================================

function renderApplications() {

    let filteredApplications = [...applications];


    // ======================================
    // SEARCH
    // ======================================

    const searchText =
        searchInput.value.toLowerCase().trim();


    if (searchText) {

        filteredApplications =
            filteredApplications.filter(app =>

                app.company
                    .toLowerCase()
                    .includes(searchText)

                ||

                app.role
                    .toLowerCase()
                    .includes(searchText)

            );

    }


    // ======================================
    // STATUS FILTER
    // ======================================

    const selectedStatus =
        statusFilter.value;


    if (selectedStatus !== "All") {

        filteredApplications =
            filteredApplications.filter(
                app => app.status === selectedStatus
            );

    }


    // ======================================
    // SORT
    // ======================================

    if (sortBy.value === "newest") {

        filteredApplications.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );

    } else {

        filteredApplications.sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );

    }


    // ======================================
    // EMPTY STATE
    // ======================================

    if (filteredApplications.length === 0) {

        applicationsContainer.innerHTML = `

            <div class="empty-state">

                <h3>No applications found</h3>

                <p>
                    Try changing your search or filter.
                </p>

            </div>

       ` ;

        updateStatistics();

        return;

    }


    // ======================================
    // CREATE APPLICATION CARDS
    // ======================================

    applicationsContainer.innerHTML =
        filteredApplications
            .map(app => createApplicationCard(app))
            .join("");


    updateStatistics();

}


// ==========================================
// CREATE APPLICATION CARD
// ==========================================

function createApplicationCard(app) {

    let statusClass = "";


    // Choose status CSS class

    if (app.status === "Applied") {

        statusClass = "status-applied";

    }

    else if (app.status === "Interview") {

        statusClass = "status-interview";

    }

    else if (app.status === "Selected") {

        statusClass = "status-selected";

    }

    else if (app.status === "Rejected") {

        statusClass = "status-rejected";

    }


    return `

        <div class="application-card">

            <div class="application-info">

                <h3>
                    ${escapeHTML(app.role)}
                </h3>

                <p>
                    <strong>
                        ${escapeHTML(app.company)}
                    </strong>
                </p>

                <div class="application-meta">

                    <span>
                        📍
                        ${escapeHTML(app.location || "Not specified")}
                    </span>

                    <span>
                        💰
                        ${escapeHTML(app.salary || "Not specified")}
                    </span>

                    <span>
                        📅
                        ${formatDate(app.date)}
                    </span>

                </div>

                <div style="margin-top: 10px;">

                    <span class="status ${statusClass}">
                        ${escapeHTML(app.status)}
                    </span>

                </div>

            </div>


            <div class="application-actions">

                ${
                    app.jobUrl
                    ?
                    `
                    <button
                        class="edit-btn"
                        onclick="openJobLink('${encodeURIComponent(app.jobUrl)}')"
                    >
                        View Job
                    </button>
                    `
                    :
                    ""
                }


                <button
                    class="edit-btn"
                    onclick="editApplication('${app.id}')"
                >
                    Edit
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteApplication('${app.id}')"
                >
                    Delete
                </button>

            </div>

        </div>

    `;

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) {
        return "Not specified";
    }

    const formattedDate =
        new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    return formattedDate;

}


// ==========================================
// EDIT APPLICATION
// ==========================================

function editApplication(id) {

    const application =
        applications.find(
            app => app.id === id
        );


    if (!application) {
        return;
    }


    // Fill form

    companyInput.value =
        application.company;

    roleInput.value =
        application.role;

    locationInput.value =
        application.location;

    salaryInput.value =
        application.salary;

    dateInput.value =
        application.date;

    statusInput.value =
        application.status;

    jobUrlInput.value =
        application.jobUrl;

    editIdInput.value =
        application.id;


    // Change modal title

    modalTitle.textContent =
        "Edit Application";


    // Open modal

    jobModal.classList.add("show");

}


// ==========================================
// DELETE APPLICATION
// ==========================================

function deleteApplication(id) {

    const application =
        applications.find(
            app => app.id === id
        );


    if (!application) {
        return;
    }


    const confirmDelete =
        confirm(
            `Delete ${application.company} application?`
        );


    if (!confirmDelete) {
        return;
    }


    applications =
        applications.filter(
            app => app.id !== id
        );


    saveApplications();

    renderApplications();

}


// ==========================================
// OPEN JOB LINK
// ==========================================

function openJobLink(encodedUrl) {

    const url =
        decodeURIComponent(encodedUrl);


    if (!/^https?:\/\//i.test(url)) {

        alert("Invalid job URL.");

        return;

    }


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        applications.length;


    const applied =
        applications.filter(
            app => app.status === "Applied"
        ).length;


    const interviews =
        applications.filter(
            app => app.status === "Interview"
        ).length;


    const selected =
        applications.filter(
            app => app.status === "Selected"
        ).length;


    document.getElementById(
        "totalApplications"
    ).textContent = total;


    document.getElementById(
        "appliedCount"
    ).textContent = applied;


    document.getElementById(
        "interviewCount"
    ).textContent = interviews;


    document.getElementById(
        "selectedCount"
    ).textContent = selected;

}


// ==========================================
// SEARCH EVENT
// ==========================================

searchInput.addEventListener(
    "input",
    renderApplications
);


// ==========================================
// FILTER EVENT
// ==========================================

statusFilter.addEventListener(
    "change",
    renderApplications
);


// ==========================================
// SORT EVENT
// ==========================================

sortBy.addEventListener(
    "change",
    renderApplications
);


// ==========================================
// HTML SECURITY
// ==========================================

// Prevent user-entered HTML from being
// inserted directly into the page.

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// INITIAL LOAD
// ==========================================

renderApplications();

