// Creator dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const user = checkAuthOnLoad();
    if (!user) return;

    // Check if user is a creator
    if (user.role !== 'creator') {
        window.location.href = 'worker-dashboard.html';
        return;
    }

    // Display user email
    document.getElementById('user-email').textContent = user.email;

    // Set up logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Load tasks
    loadTasks();

    async function loadTasks() {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/tasks`);
            const data = await response.json();

            if (response.ok) {
                displayTasks(data.tasks);
            } else {
                showError(data.error || 'Failed to load tasks');
            }
        } catch (error) {
            console.error('Load tasks error:', error);
            showError('Network error. Please try again.');
        }
    }

    function displayTasks(tasks) {
        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = '';

        if (tasks.length === 0) {
            tasksList.innerHTML = '<p>No tasks found.</p>';
            return;
        }

        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            tasksList.appendChild(taskCard);
        });
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';

        const statusClass = `status-${task.status}`;
        const createdDate = task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';

        card.innerHTML = `
            <h3>${task.title}</h3>
            <div class="task-meta">
                <span>Status: <span class="task-status ${statusClass}">${task.status}</span></span>
                <span class="task-price">$${task.price}</span>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                <span>Created: ${createdDate}</span>
            </div>
        `;

        return card;
    }
});
