import { useEffect, useState } from "react";
import HeroCard from "../components/HeroCard";
import HeroDetail from "../components/HeroDetail";
import { getHeroes } from "../api/heroes";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/auth";

function Profile() {
    const { user, setUser } = useAuth();
    const [heroes, setHeroes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHeroId, setSelectedHeroId] = useState(null);

    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [usernameInput, setUsernameInput] = useState(user?.username || "");
    const [updateError, setUpdateError] = useState("");
    const [updateSuccess, setUpdateSuccess] = useState("");

    useEffect(() => {
        if (user) {
            setUsernameInput(user.username || "");
        }
    }, [user]);

    useEffect(() => {
        async function loadProfileData() {
            try {
                const [heroesData, favRes] = await Promise.all([
                    getHeroes(),
                    fetch("http://localhost:3000/api/favorites", {
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    })
                ]);

                const heroesList = heroesData.heroes || (Array.isArray(heroesData) ? heroesData : []);
                setHeroes(heroesList);

                if (favRes.ok) {
                    const favData = await favRes.json();
                    setFavorites(favData.favorite_hero_ids || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadProfileData();
    }, []);

    async function connectSteam() {
        try {
            const response = await fetch("http://localhost:3000/api/csrf", {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error("Не удалось получить CSRF-токен");

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

    const handleSaveUsername = async (e) => {
        e.preventDefault();
        setUpdateError("");
        setUpdateSuccess("");

        try {
            const data = await updateProfile({ username: usernameInput });
            setUser(data.user);
            setUpdateSuccess("Никнейм успешно изменен!");
            setIsEditingUsername(false);
        } catch (err) {
            setUpdateError(err.message || "Ошибка смены никнейма");
        }
    };

    if (selectedHeroId) {
        return <HeroDetail heroId={selectedHeroId} onBack={() => setSelectedHeroId(null)} />;
    }

    const favoriteHeroes = heroes.filter((hero) => favorites.includes(hero.id));
    const displayName = user?.username || (user?.email ? user.email.split("@")[0] : "Игрок");

    return (
        <section className="heroes-page">
            <div className="heroes-page__header" style={{ marginBottom: "24px" }}>
                <span className="hero__eyebrow">ЛИЧНЫЙ КАБИНЕТ</span>
                <h1>Профиль игрока</h1>
            </div>

            <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "24px",
                borderRadius: "12px",
                marginBottom: "36px"
            }}>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "rgba(139, 92, 246, 0.2)",
                        border: "2px solid var(--purple-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        color: "var(--purple-light)",
                        fontWeight: "700"
                    }}>
                        {displayName[0].toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <h2 style={{ fontSize: "22px", margin: 0, color: "var(--text)" }}>
                                {displayName}
                            </h2>
                            <button
                                onClick={() => setIsEditingUsername(!isEditingUsername)}
                                style={{
                                    background: "transparent",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-secondary)",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                }}
                            >
                                {isEditingUsername ? "Отмена" : "✏️ Изменить ник"}
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: "20px", color: "var(--text-secondary)", fontSize: "14px", flexWrap: "wrap", alignItems: "center" }}>
                            <span>Email: <strong style={{ color: "var(--text)" }}>{user?.email || "—"}</strong></span>

                            <span>
                                Steam: {user?.steam_connected ? (
                                <strong style={{ color: "#4ade80" }}>
                                    ● Подключён {user?.steam_id ? `(ID: ${user.steam_id})` : ""}
                                </strong>
                            ) : (
                                <button
                                    onClick={connectSteam}
                                    style={{
                                        marginLeft: "6px",
                                        padding: "4px 12px",
                                        borderRadius: "6px",
                                        background: "rgba(139, 92, 246, 0.15)",
                                        border: "1px solid rgba(139, 92, 246, 0.3)",
                                        color: "var(--purple-light)",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    Привязать Steam
                                </button>
                            )}
                            </span>

                            <span>Пул героев: <strong style={{ color: "var(--purple-light)" }}>{favoriteHeroes.length}</strong></span>
                        </div>
                    </div>
                </div>

                {updateSuccess && <p style={{ color: "#4ade80", marginTop: "12px", fontSize: "14px" }}>{updateSuccess}</p>}
                {updateError && <p style={{ color: "#f87171", marginTop: "12px", fontSize: "14px" }}>{updateError}</p>}

                {isEditingUsername && (
                    <form onSubmit={handleSaveUsername} style={{
                        marginTop: "20px",
                        paddingTop: "16px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center"
                    }}>
                        <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder="Новый никнейм"
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                background: "var(--background)",
                                color: "var(--text)",
                                fontSize: "14px",
                                width: "250px"
                            }}
                            required
                        />

                        <button
                            type="submit"
                            style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                background: "var(--purple-light)",
                                color: "#fff",
                                border: "none",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            Сохранить
                        </button>
                    </form>
                )}
            </div>

            <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>Мой пул героев (Избранное)</h2>

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Загрузка вашего пулла...</p>
            ) : favoriteHeroes.length === 0 ? (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "32px", borderRadius: "12px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                        У вас пока нет героев в пулле. Перейдите в раздел <strong>«Герои»</strong> или <strong>«Мета»</strong> и нажмите на звёздочку ⭐️!
                    </p>
                </div>
            ) : (
                <div className="heroes-grid">
                    {favoriteHeroes.map((hero) => (
                        <div
                            key={hero.id}
                            onClick={() => setSelectedHeroId(hero.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <HeroCard hero={hero} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Profile;