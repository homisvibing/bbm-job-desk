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
    const taskContainer = document.getElementById('task-container');

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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.status === 200) {
            loginPage.classList.add('hidden');
            mainNav.classList.remove('hidden');
            userDeskPage.classList.remove('hidden');
            renderTasks(result.tasks);
            renderBulletin(result.bulletin);
        } else {
            loginError.textContent = result.error || 'Login failed. Please try again.';
        }
    });

    // Function to render tasks
    function renderTasks(tasks) {
        taskContainer.innerHTML = '';
        if (!tasks || tasks.length === 0) {
            taskContainer.innerHTML = '<p>No tasks assigned to you.</p>';
            return;
        }

        // Sort tasks by priority: High, Low, Done
        const priorityOrder = { 'High': 1, 'Low': 2, 'Done': 3 };
        tasks.sort((a, b) => {
            const priorityA = priorityOrder[a.Priority] || 4;
            const priorityB = priorityOrder[b.Priority] || 4;
            return priorityA - priorityB;
        });

        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card');
            
            // Set priority class for styling
            const priorityClass = task.Priority ? `priority-${task.Priority.toLowerCase().replace(/\s/g, '')}` : 'priority-low';
            taskCard.classList.add(priorityClass);

            taskCard.innerHTML = `
                <div class="card-header">
                    <span class="priority-badge">${task.Priority || 'Low'}</span>
                    <span class="status-badge">${task.Status}</span>
                </div>
                <h3 class="card-title">${task['Task Name']}</h3>
                <p class="card-client">Client: ${task['Client Name']}</p>
                <p class="card-date">Due: ${task['End Date']}</p>
            `;
            taskContainer.appendChild(taskCard);

            taskCard.addEventListener('click', () => {
                showTaskModal(task);
            });
        });
    }

    // Function to render bulletin board
    function renderBulletin(posts) {
        const bulletinContainer = document.getElementById('bulletin-container');
        bulletinContainer.innerHTML = '';
        if (!posts || posts.length === 0) {
            bulletinContainer.innerHTML = '<p>No new posts on the bulletin board.</p>';
            return;
        }
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.classList.add('post-card');
            postCard.innerHTML = `
                <div class="post-meta">
                    <span class="post-nickname">${post.Nickname}</span>
                    <span class="post-date">${post['Post Date']}</span>
                </div>
                <div class="post-content">
                    <p>${post['Post Content']}</p>
                </div>
            `;
            bulletinContainer.appendChild(postCard);
        });
    }

    // Post to bulletin board logic
    const postForm = document.getElementById('bulletin-post-form');
    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nickname = document.getElementById('post-nickname').value;
            const content = document.getElementById('post-content').value;
            const postStatus = document.getElementById('post-status');
    
            postStatus.textContent = 'Posting...';
    
            const response = await fetch('/.netlify/functions/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname, content }),
            });
    
            const result = await response.json();
    
            if (response.status === 200) {
                postStatus.textContent = 'Posted successfully!';
                postForm.reset();
                // Re-fetch bulletin posts to show the new one
                // (You'll need to re-run the login or create a new endpoint for this)
            } else {
                postStatus.textContent = `Error: ${result.error || 'Failed to post'}`;
            }
        });
    }

    function showTaskModal(task) {
        const priorityClass = task.Priority ? `priority-${task.Priority.toLowerCase().replace(/\s/g, '')}` : 'priority-low';
        modalBody.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${task['Task Name']}</h3>
                <span class="priority-badge ${priorityClass}">${task.Priority || 'Low'}</span>
            </div>
            <div class="modal-section">
                <h4><i class="fas fa-info-circle"></i> Details</h4>
                <p><strong>Client:</strong> ${task['Client Name']}</p>
                <p><strong>Campaign:</strong> ${task.Campaign}</p>
                <p><strong>Content Type:</strong> ${task['Content Type']}</p>
                <p><strong>Brief:</strong> ${task.Brief}</p>
            </div>
            <hr>
            <div class="modal-section">
                <h4><i class="fas fa-calendar-alt"></i> Timeline</h4>
                <p><strong>Start Date:</strong> ${task['Start Date']}</p>
                <p><strong>End Date:</strong> ${task['End Date']}</p>
            </div>
            <hr>
            <div class="modal-section">
                <h4><i class="fas fa-check-circle"></i> Status</h4>
                <p><strong>Status:</strong> <span class="status-badge">${task.Status}</span></p>
                <p><strong>Assigned To:</strong> ${task['Assigned To']}</p>
            </div>
        `;
        taskModal.style.display = 'flex';
    }

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
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });
});