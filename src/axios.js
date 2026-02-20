// axios.js
// Centralized axios instance with CSRF and credentials handling for Django
import axios from "axios";

// Helper to get cookie value
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1),
                );
                break;
            }
        }
    }
    return cookieValue;
}

const axiosInstance = axios.create({
    withCredentials: true,
});

// Add CSRF token to all unsafe requests
axiosInstance.interceptors.request.use(
    (config) => {
        const method = config.method && config.method.toUpperCase();
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
            const csrftoken = getCookie("csrftoken");
            if (csrftoken) {
                config.headers["X-CSRFToken"] = csrftoken;
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export default axiosInstance;
