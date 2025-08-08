document.addEventListener('DOMContentLoaded', () => {
    // === Theme Toggle Logic ===
    const themeToggleBtn = document.getElementById('theme-icon');
    const body = document.body;

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            themeToggleBtn.classList.remove('fa-moon');
            themeToggleBtn.classList.add('fa-sun');
        } else {
            themeToggleBtn.classList.remove('fa-sun');
            themeToggleBtn.classList.add('fa-moon');
        }
    });

    // === Navigation and Page Display Logic ===
    const loginPage = document.getElementById('login-page');
    const userDeskPage = document.getElementById('user-desk');
    const mainNav = document.getElementById('main-nav');
    const taskModal = document.getElementById('task-modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('login-error');

        // Make an API call to the Netlify Function
        const response = await fetch('/.netlify/functions/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            loginPage.classList.add('hidden');
            userDeskPage.classList.remove('hidden');
            mainNav.classList.add('show');
            document.getElementById('user-desk-link').textContent = `${username}'s Desk`;
            
            renderTasks(data.tasks); // Render tasks from the server response
        } else {
            loginError.textContent = data.error;
        }
    });

    // === Task Card Rendering and Click Logic ===
    let allTasks = []; // To store tasks for modal
    function renderTasks(tasks) {
        allTasks = tasks; // Store tasks globally for the modal
        const container = document.getElementById('task-container');
        container.innerHTML = '';
        
        tasks.sort((a, b) => {
            const priorityA = a.Priority === 'High' ? 1 : 0;
            const priorityB = b.Priority === 'High' ? 1 : 0;
            return priorityB - priorityA;
        });

        tasks.forEach((task, index) => {
            const card = document.createElement('div');
            card.className = 'task-card';

            const priority = task.Priority || 'Low';
            const priorityClass = priority.toLowerCase();
            const priorityIcon = `<i class="fas fa-flag"></i>`;

            card.innerHTML = `
                <div class="priority-flag priority-${priorityClass}">
                    ${priorityIcon}
                </div>
                <h3>${task['Task Name']}</h3>
                <p><strong>Assigned To:</strong> ${task['Assigned To']}</p>
                <p><strong>Client:</strong> ${task['Client Name']}</p>
                <p><strong>Status:</strong> ${task['Status']}</p>
                <p><strong>Due Date:</strong> ${task['End Date']}</p>
            `;
            card.dataset.taskIndex = index;
            container.appendChild(card);
        });
    }

    // === Modal Logic ===
    document.getElementById('task-container').addEventListener('click', (e) => {
        const card = e.target.closest('.task-card');
        if (card) {
            const taskIndex = card.dataset.taskIndex;
            const task = allTasks[taskIndex]; // Use the stored global array
            
            modalBody.innerHTML = `
                <h3 class="modal-title">${task['Task Name']}</h3>
                <hr>
                <div class="modal-section">
                    <h4><i class="fas fa-info-circle"></i> Task Details</h4>
                    <p><strong>Client:</strong> ${task['Client Name']}</p>
                    <p><strong>Campaign:</strong> ${task['Campaign']}</p>
                    <p><strong>Content Type:</strong> ${task['Content Type']}</p>
                    <p><strong>Brief:</strong> ${task['Brief']}</p>
                    <p><strong>Note:</strong> ${task['Note']}</p>
                    <p><strong>Assigned By:</strong> ${task['Assigned By']}</p>
                </div>
                <hr>
                <div class="modal-section">
                    <h4><i class="fas fa-clock"></i> Timeline</h4>
                    <p><strong>Start Date:</strong> ${task['Start Date']}</p>
                    <p><strong>End Date:</strong> ${task['End Date']}</p>
                </div>
                <hr>
                <div class="modal-section">
                    <h4><i class="fas fa-check-circle"></i> Status</h4>
                    <p><strong>Status:</strong> <span class="status-badge">${task['Status']}</span></p>
                    <p><strong>Priority:</strong> <span class="priority-badge priority-${task.Priority ? task.Priority.toLowerCase() : 'low'}">${task.Priority || 'Low'}</span></p>
                    <p><strong>Assigned To:</strong> ${task['Assigned To']}</p>
                </div>
            `;
            taskModal.style.display = 'flex';
        }
    });

    closeButton.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });

    // === Basic Navigation Logic ===
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            
            document.querySelectorAll('main section').forEach(section => {
                section.classList.add('hidden');
            });
            
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
});