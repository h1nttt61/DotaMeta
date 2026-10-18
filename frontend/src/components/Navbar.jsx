import { Link } from "react-router-dom";

import Button from "./Button";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
    const {
        user,
        loading,
        logout,
    } = useAuth();

    const {
        theme,
        toggleTheme,
    } = useTheme();

    async function connectSteam() {
        try {
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

            const form = document.createElement("form");
            form.method = "POST";
            form.action = "http://localhost:3000/auth/steam";

            const token = document.createElement("input");
            token.type = "hidden";
            token.name = "authenticity_token";
            token.value = data.csrf_token;

            form.appendChild(token);
            document.body.appendChild(form);

            form.submit();
        } catch (error) {
            console.error("Steam connection error:", error);
        }
    }

    const displayName = user?.username || (user?.email ? user.email.split("@")[0] : "Игрок");

    return (
        <nav className="navbar">
            <Link to="/" className="navbar__logo">
                Dota<span>Meta</span>
            </Link>

            <div className="navbar__links">
                <Link to="/">Главная</Link>
                <Link to="/meta">Мета</Link>
                <Link to="/heroes">Герои</Link>
                <Link to="/matches">Матчи</Link>
                <Link to="/draft">Драфтер</Link>
            </div>

            <div className="navbar__actions">
                {/* Переключатель темы */}
                <button
                    type="button"
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Сменить тему"
                    title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                >
                    {theme === "dark" ? "☀" : "☾"}
                </button>

                {loading ? null : user ? (
                    <>
                        <Link
                            to="/profile"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                textDecoration: "none",
                                color: "inherit",
                                cursor: "pointer"
                            }}
                        >
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "rgba(139, 92, 246, 0.2)",
                                border: "1px solid var(--purple-light)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                color: "var(--purple-light)",
                                fontSize: "14px"
                            }}>
                                {displayName[0].toUpperCase()}
                            </div>

                            <span className="navbar__user" style={{ fontWeight: "500" }}>
                                {displayName}
                            </span>
                        </Link>

                        {user.steam_connected ? (
                            <span className="navbar__steam">
                                ● Steam подключён
                            </span>
                        ) : (
                            <Button
                                variant="secondary"
                                onClick={connectSteam}
                            >
                                Привязать Steam
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            onClick={logout}
                        >
                            Выйти
                        </Button>
                    </>
                ) : (
                    <>
                        <Link to="/login">
                            <Button variant="ghost">Войти</Button>
                        </Link>

                        <Link to="/register">
                            <Button>Регистрация</Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;