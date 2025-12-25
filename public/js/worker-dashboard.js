// Worker dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const user = checkAuthOnLoad();
    if (!user) return;

    // Check if user is a worker
    if (user.role !== 'worker') {
        window.location.href = 'creator-dashboard.html';
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
                // Separate available and accepted tasks
                const availableTasks = data.tasks.filter(task => task.status === 'open');
                const acceptedTasks = data.tasks.filter(task => task.status === 'accepted' && task.acceptedBy === user.userId);

                displayAvailableTasks(availableTasks);
                displayAcceptedTasks(acceptedTasks);
            } else {
                showError(data.error || 'Failed to load tasks');
            }
        } catch (error) {
            console.error('Load tasks error:', error);
            showError('Network error. Please try again.');
        }
    }

    function displayAvailableTasks(tasks) {
        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = '';

        if (tasks.length === 0) {
            tasksList.innerHTML = '<p>No available tasks.</p>';
            return;
        }

        tasks.forEach(task => {
            const taskCard = createAvailableTaskCard(task);
            tasksList.appendChild(taskCard);
        });
    }

    function displayAcceptedTasks(tasks) {
        const tasksList = document.getElementById('accepted-tasks-list');
        tasksList.innerHTML = '';

        if (tasks.length === 0) {
            tasksList.innerHTML = '<p>No accepted tasks.</p>';
            return;
        }

        tasks.forEach(task => {
            const taskCard = createAcceptedTaskCard(task);
            tasksList.appendChild(taskCard);
        });
    }

    function createAvailableTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';

        const createdDate = task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';

        card.innerHTML = `
            <h3>${task.title}</h3>
            <div class="task-meta">
                <span>Status: <span class="task-status status-open">open</span></span>
                <span class="task-price">$${task.price}</span>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                <span>Created: ${createdDate}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-success accept-btn" data-task-id="${task.id}">Accept Task</button>
            </div>
        `;

        // Add event listener for accept button
        const acceptBtn = card.querySelector('.accept-btn');
        acceptBtn.addEventListener('click', () => acceptTask(task.id, acceptBtn));

        return card;
    }

    function createAcceptedTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';

        const createdDate = task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';

        card.innerHTML = `
            <h3>${task.title}</h3>
            <div class="task-meta">
                <span>Status: <span class="task-status status-accepted">accepted</span></span>
                <span class="task-price">$${task.price}</span>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                <span>Created: ${createdDate}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-primary complete-btn" data-task-id="${task.id}">Mark as Completed</button>
            </div>
        `;

        // Add event listener for complete button
        const completeBtn = card.querySelector('.complete-btn');
        completeBtn.addEventListener('click', () => completeTask(task.id, completeBtn));

        return card;
    }

    async function acceptTask(taskId, buttonElement) {
        // Disable button immediately to prevent double-clicks
        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.textContent = 'Accepting...';
        }

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}/accept`, {
                method: 'PUT'
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                showSuccess('Task accepted successfully! Check your "My Accepted Tasks" section.');

                // Reload tasks after a short delay to show the update
                setTimeout(() => {
                    loadTasks();
                }, 1500);
            } else {
                // Re-enable button if failed
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.textContent = 'Accept Task';
                }
                showError(data.error || 'Failed to accept task');
            }
        } catch (error) {
            console.error('Accept task error:', error);
            // Re-enable button if network error
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.textContent = 'Accept Task';
            }
            showError('Network error. Please try again.');
        }
    }

    async function completeTask(taskId, buttonElement) {
        // Disable button immediately to prevent double-clicks
        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.textContent = 'Completing...';
        }

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
                method: 'PUT'
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                showSuccess('Task completed successfully! Great work!');

                // Reload tasks after a short delay to show the update
                setTimeout(() => {
                    loadTasks();
                }, 1500);
            } else {
                // Re-enable button if failed
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.textContent = 'Mark as Completed';
                }
                showError(data.error || 'Failed to complete task');
            }
        } catch (error) {
            console.error('Complete task error:', error);
            // Re-enable button if network error
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.textContent = 'Mark as Completed';
            }
            showError('Network error. Please try again.');
        }
    }
});
