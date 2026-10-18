import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            const data = await registerUser({
                username,
                email,
                password,
                password_confirmation: passwordConfirmation,
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
                    <span className="hero__eyebrow">DOTA META</span>
                    <h1>Создать аккаунт</h1>
                    <p>Создай аккаунт, чтобы настроить профиль и собрать свой пул героев.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>
                        Никнейм
                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="Arthas"
                            required
                        />
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Пароль
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Повторите пароль
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(event) => setPasswordConfirmation(event.target.value)}
                            required
                        />
                    </label>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="ui-button ui-button--primary">
                        Создать аккаунт
                    </button>
                </form>
            </div>
        </section>
    );
}

export default Register;