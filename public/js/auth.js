// Authentication utility functions

const API_BASE_URL = 'https://nomad-production-e24e.up.railway.app/;

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('nomad_token', token);
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('nomad_token');
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('nomad_token');
}

// Get user info from token (without verification - for UI only)
function getUserFromToken() {
    const token = getToken();
    if (!token) return null;

    try {
        // Decode JWT payload (base64)
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        return decodedPayload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        return decodedPayload.exp > currentTime;
    } catch (error) {
        return false;
    }
}

// Redirect to appropriate dashboard based on user role
function redirectToDashboard(user) {
    if (user.role === 'creator') {
        window.location.href = 'creator-dashboard.html';
    } else if (user.role === 'worker') {
        window.location.href = 'worker-dashboard.html';
    } else {
        // Fallback
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    removeToken();
    window.location.href = 'login.html';
}

// Check authentication on page load for protected pages
function checkAuthOnLoad() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return null;
    }

    const user = getUserFromToken();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }

    return user;
}

// API request helper with authentication
async function authenticatedFetch(url, options = {}) {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (response.status === 401) {
        // Token expired or invalid
        removeToken();
        window.location.href = 'login.html';
        throw new Error('Authentication failed');
    }

    return response;
}

// Show error message
function showError(message, elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Hide error message
function hideError(elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Show success message
function showSuccess(message, elementId = 'success-message') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
}

// Hide success message
function hideSuccess(elementId = 'success-message') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.style.display = 'none';
    }
}
