// Signup page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated
    if (isAuthenticated()) {
        const user = getUserFromToken();
        if (user) {
            redirectToDashboard(user);
            return;
        }
    }

    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(signupForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const role = formData.get('role');

        // Clear previous messages
        hideError();

        try {
            // Make signup request
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                // Signup successful
                setToken(data.token);
                redirectToDashboard(data.user);
            } else {
                // Signup failed
                showError(data.error || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('Network error. Please try again.');
        }
    });
});
