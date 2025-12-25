// Create task page functionality

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

    const createTaskForm = document.getElementById('create-task-form');

    createTaskForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(createTaskForm);
        const title = formData.get('title');
        const description = formData.get('description');
        const price = formData.get('price');

        // Clear previous messages
        hideError();
        hideSuccess();

        try {
            // Make create task request
            const response = await authenticatedFetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                body: JSON.stringify({ title, description, price })
            });

            const data = await response.json();

            if (response.ok) {
                // Task created successfully
                showSuccess('Task created successfully!');
                createTaskForm.reset();

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'creator-dashboard.html';
                }, 2000);
            } else {
                // Task creation failed
                showError(data.error || 'Failed to create task');
            }
        } catch (error) {
            console.error('Create task error:', error);
            showError('Network error. Please try again.');
        }
    });
});
