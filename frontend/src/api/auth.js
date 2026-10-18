let csrfToken = null;

async function getCsrfToken() {
    if (csrfToken) {
        return csrfToken;
    }

    const response = await fetch(
        "http://localhost:3000/api/csrf",
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Не удалось получить CSRF-токен");
    }

    const data = await response.json();

    csrfToken = data.csrf_token;

    return csrfToken;
}

async function apiRequest(url, options = {}) {
    const token = await getCsrfToken();

    const response = await fetch(
        `http://localhost:3000${url}`,
        {
            ...options,
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
                ...(options.headers || {}),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.errors?.join(", ") ||
            "Произошла ошибка"
        );
    }

    return data;
}

export async function getAuthStatus() {
    const response = await fetch(
        "http://localhost:3000/api/auth/status",
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Не удалось получить статус авторизации");
    }

    return response.json();
}

export async function registerUser(data) {
    return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function loginUser(data) {
    return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function logoutUser() {
    const token = await getCsrfToken();

    const response = await fetch(
        "http://localhost:3000/api/auth/logout",
        {
            method: "DELETE",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.errors?.join(", ") ||
            "Не удалось выйти из аккаунта"
        );
    }

    csrfToken = null;

    return data;
}

export async function updateProfile(data) {
    return apiRequest("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}