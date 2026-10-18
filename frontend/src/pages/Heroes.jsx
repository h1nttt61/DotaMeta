import { useEffect, useState } from "react";
import HeroCard from "../components/HeroCard";
import { getHeroes } from "../api/heroes";

function Heroes() {
    const [heroes, setHeroes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
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
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

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

    if (loading) {
        return <div className="page" style={{ padding: "40px", color: "var(--text-secondary)" }}>Загрузка героев...</div>;
    }

    if (error) {
        return <div className="page" style={{ padding: "40px", color: "var(--text-secondary)" }}>Ошибка: {error}</div>;
    }

    return (
        <section className="heroes-page">
            <div className="heroes-page__header">
                <span className="hero__eyebrow">DOTA 2 HEROES</span>
                <h1>Все герои</h1>
                <p>Полный список героев Dota 2. Нажимай на звёздочку, чтобы добавить героя в свой пулл!</p>
            </div>

            <div className="heroes-grid">
                {heroes.map((hero) => {
                    const isFavorite = favorites.includes(hero.id);

                    return (
                        <div
                            key={hero.id}
                            style={{ position: "relative" }}
                        >
                            <button
                                onClick={(e) => toggleFavorite(e, hero.id)}
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    zIndex: 10,
                                    background: "rgba(15, 23, 42, 0.85)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "50%",
                                    width: "36px",
                                    height: "36px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: isFavorite ? "#f59e0b" : "var(--text-secondary)",
                                    fontSize: "18px"
                                }}
                                title={isFavorite ? "Удалить из пулла" : "Добавить в пулл"}
                            >
                                {isFavorite ? "★" : "☆"}
                            </button>

                            <HeroCard hero={hero} />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Heroes;