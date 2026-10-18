import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            const data = await loginUser({
                email,
                password,
            });

            setUser(data.user);

            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
          <span className="hero__eyebrow">
            DOTA META
          </span>

                    <h1>Вход</h1>

                    <p>
                        Войди в аккаунт, чтобы продолжить.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >
                    <label>
                        Email

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </label>

                    <label>
                        Пароль

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </label>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="ui-button ui-button--primary"
                    >
                        Войти
                    </button>
                </form>

                <p className="auth-card__footer">
                    Нет аккаунта?{" "}
                    <Link to="/register">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default Login;