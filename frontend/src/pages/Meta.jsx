import { useEffect, useState } from "react";
import { getHeroes } from "../api/heroes";
import HeroDetail from "../components/HeroDetail.jsx";

const POSITIONS = [
    { id: "ALL", label: "Все роли" },
    { id: "Carry", label: "1 — Carry" },
    { id: "Mid", label: "2 — Mid" },
    { id: "Offlane", label: "3 — Offlane" },
    { id: "SoftSupport", label: "4 — Soft Support" },
    { id: "HardSupport", label: "5 — Hard Support" },
];

function Meta() {
    const [heroes, setHeroes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [patch, setPatch] = useState("—");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [selectedHeroId, setSelectedHeroId] = useState(null);

    useEffect(() => {
        async function loadMeta() {
            setLoading(true);
            try {
                const [data, favRes] = await Promise.all([
                    getHeroes(selectedRole),
                    fetch("http://localhost:3000/api/favorites", {
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    })
                ]);

                if (data.heroes) {
                    setHeroes(data.heroes);
                    setPatch(data.patch || "7.38");
                } else {
                    setHeroes(data);
                }

                if (favRes.ok) {
                    const favData = await favRes.json();
                    setFavorites(favData.favorite_hero_ids || []);
                }
            } catch (err) {
                setError(err.message || "Не удалось загрузить мету");
            } finally {
                setLoading(false);
            }
        }

        loadMeta();
    }, [selectedRole]);

    const toggleFavorite = async (e, heroId) => {
        e.stopPropagation();

        const isFav = favorites.includes(heroId);
        const url = "http://localhost:3000/api/favorites";
        const method = isFav ? "DELETE" : "POST";
        const endpoint = isFav ? `${url}/${heroId}` : url;

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: isFav ? null : JSON.stringify({ hero_id: heroId })
            });

            if (res.ok) {
                setFavorites((prev) =>
                    isFav ? prev.filter((id) => id !== heroId) : [...prev, heroId]
                );
            }
        } catch (err) {
            console.error("Ошибка обновления избранного:", err);
        }
    };

    if (selectedHeroId) {
        return (
            <HeroDetail
                heroId={selectedHeroId}
                role={selectedRole}
                onBack={() => setSelectedHeroId(null)}
            />
        );
    }

    const getWinRate = (hero) => {
        const picks = Number(hero["7_pick"] || 0);
        const wins = Number(hero["7_win"] || 0);
        if (picks === 0) return null;
        return (wins / picks) * 100;
    };

    const sortedHeroes = [...heroes].sort((a, b) => {
        return Number(b["7_pick"] || 0) - Number(a["7_pick"] || 0);
    });

    return (
        <section className="heroes-page">
            <div className="heroes-page__header">
                <span className="hero__eyebrow">DOTA 2 META</span>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
                    <h1 style={{ margin: 0 }}>Мета Dota 2</h1>
                    <span
                        style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            background: "rgba(139, 92, 246, 0.15)",
                            border: "1px solid rgba(167, 139, 250, 0.3)",
                            color: "var(--purple-light)",
                            fontSize: "14px",
                            fontWeight: "700",
                            letterSpacing: "0.5px"
                        }}
                    >
                        Патч {patch}
                    </span>
                </div>
                <p>
                    Актуальная популярность и статистика героев по данным OpenDota.
                </p>
            </div>

            <div className="meta-roles">
                {POSITIONS.map((pos) => (
                    <button
                        key={pos.id}
                        onClick={() => setSelectedRole(pos.id)}
                        className={`meta-role-btn ${
                            selectedRole === pos.id ? "meta-role-btn--active" : ""
                        }`}
                    >
                        {pos.label}
                    </button>
                ))}
            </div>

            {loading && <p style={{ color: "var(--text-secondary)" }}>Загрузка статистики меты...</p>}

            {error && (
                <div role="alert" className="auth-error">
                    <p>Ошибка: {error}</p>
                    <button
                        className="ui-button ui-button--secondary"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: "10px" }}
                    >
                        Попробовать снова
                    </button>
                </div>
            )}

            {!loading && !error && (
                <>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                        Героев в выбранной категории: <strong style={{ color: "var(--purple-light)" }}>{sortedHeroes.length}</strong>
                    </p>

                    <div className="meta-table-wrapper">
                        <table className="meta-table">
                            <thead>
                            <tr>
                                <th style={{ width: "50px" }}>★</th>
                                <th style={{ width: "50px" }}>#</th>
                                <th>Герой</th>
                                <th>Атрибут</th>
                                <th>Популярность</th>
                                <th>Победы</th>
                                <th>Винрейт</th>
                            </tr>
                            </thead>

                            <tbody>
                            {sortedHeroes.map((hero, index) => {
                                const picks = Number(hero["7_pick"] || 0);
                                const wins = Number(hero["7_win"] || 0);
                                const winRate = getWinRate(hero);
                                const isFavorite = favorites.includes(hero.id);

                                return (
                                    <tr
                                        key={hero.id}
                                        onClick={() => setSelectedHeroId(hero.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
                                            <button
                                                onClick={(e) => toggleFavorite(e, hero.id)}
                                                style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: isFavorite ? "#f59e0b" : "var(--text-secondary)",
                                                    fontSize: "18px"
                                                }}
                                                title={isFavorite ? "Удалить из пулла" : "Добавить в пулл"}
                                            >
                                                {isFavorite ? "★" : "☆"}
                                            </button>
                                        </td>

                                        <td style={{ color: "var(--text-secondary)", fontWeight: "600" }}>
                                            {index + 1}
                                        </td>

                                        <td>
                                            <div className="meta-hero-cell">
                                                {hero.img && (
                                                    <img
                                                        className="meta-hero-img"
                                                        src={`https://cdn.cloudflare.steamstatic.com${hero.img}`}
                                                        alt={hero.localized_name}
                                                        loading="lazy"
                                                    />
                                                )}

                                                <span className="meta-hero-name">
                                                    {hero.localized_name}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="meta-attr-badge">
                                                {hero.primary_attr?.toUpperCase() || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            {picks.toLocaleString("ru-RU")}
                                        </td>

                                        <td>
                                            {wins.toLocaleString("ru-RU")}
                                        </td>

                                        <td>
                                            {winRate === null ? (
                                                "—"
                                            ) : (
                                                <span
                                                    className={`meta-winrate ${
                                                        winRate >= 50
                                                            ? "meta-winrate--high"
                                                            : "meta-winrate--low"
                                                    }`}
                                                >
                                                    {winRate.toFixed(1)}%
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
}

export default Meta;