import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

function toAccountId32(steamId) {
    if (!steamId) return null;
    const strId = String(steamId);
    if (strId.length < 12) return strId;
    try {
        const steam64 = BigInt(strId);
        const base = BigInt("76561197960265728");
        return (steam64 - base).toString();
    } catch {
        return strId;
    }
}

function Matches() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [heroes, setHeroes] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchHeroes() {
            try {
                const res = await fetch("https://api.opendota.com/api/constants/heroes");
                if (res.ok) {
                    const data = await res.json();
                    setHeroes(data);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchHeroes();
    }, []);

    useEffect(() => {
        async function fetchUserMatches() {
            if (!user?.steam_id) return;

            setLoading(true);
            setError("");

            const accountId = toAccountId32(user.steam_id);

            try {
                const res = await fetch(
                    `https://api.opendota.com/api/players/${accountId}/matches?limit=20`
                );

                if (!res.ok) {
                    throw new Error("Не удалось загрузить историю матчей.");
                }

                const data = await res.json();
                if (Array.isArray(data)) {
                    setMatches(data);
                } else {
                    setMatches([]);
                }
            } catch (err) {
                setError(err.message || "Ошибка при получении матчей");
            } finally {
                setLoading(false);
            }
        }

        fetchUserMatches();
    }, [user?.steam_id]);

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
        } catch (err) {
            console.error(err);
        }
    }

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const isWin = (match) => {
        const isRadiant = match.player_slot < 128;
        return isRadiant ? match.radiant_win : !match.radiant_win;
    };

    const getHeroData = (heroId) => {
        const hero = heroes[heroId] || heroes[String(heroId)];
        if (!hero) return { name: `Герой ${heroId}`, img: null };

        let imgUrl = null;
        if (hero.name) {
            const cleanName = hero.name.replace("npc_dota_hero_", "");
            imgUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${cleanName}.png`;
        } else if (hero.img) {
            imgUrl = hero.img.startsWith("http") ? hero.img : `https://api.opendota.com${hero.img}`;
        }

        return {
            name: hero.localized_name || hero.name,
            img: imgUrl
        };
    };

    if (!user) {
        return (
            <section className="heroes-page">
                <div className="heroes-page__header">
                    <span className="hero__eyebrow">DOTA 2 MATCHES</span>
                    <h1>Мои матчи</h1>
                </div>
                <div style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "32px",
                    borderRadius: "12px",
                    textAlign: "center"
                }}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                        Войдите в аккаунт, чтобы просматривать свою статистику и последние игры.
                    </p>
                </div>
            </section>
        );
    }

    if (!user.steam_connected || !user.steam_id) {
        return (
            <section className="heroes-page">
                <div className="heroes-page__header">
                    <span className="hero__eyebrow">DOTA 2 MATCHES</span>
                    <h1>Мои матчи</h1>
                </div>
                <div style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "36px",
                    borderRadius: "12px",
                    textAlign: "center"
                }}>
                    <h3 style={{ marginBottom: "12px", color: "var(--text)" }}>Steam аккаунт не привязан</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "20px", maxWidth: "500px", margin: "0 auto 20px" }}>
                        Привяжите ваш Steam, чтобы отслеживать личную историю матчей, винрейт, KDA и сборки.
                    </p>
                    <Button onClick={connectSteam}>
                        Привязать Steam
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="heroes-page">
            <div className="heroes-page__header" style={{ marginBottom: "24px" }}>
                <span className="hero__eyebrow">DOTA 2 MATCHES</span>
                <h1>Мои матчи</h1>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Загрузка последних игр из OpenDota...</p>
            ) : error ? (
                <div style={{ background: "var(--surface)", border: "1px solid #f87171", padding: "20px", borderRadius: "12px", color: "#f87171" }}>
                    {error}
                </div>
            ) : matches.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Матчи не найдены или профиль Dota 2 закрыт в настройках игры.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {matches.map((match) => {
                        const win = isWin(match);
                        const { name: heroName, img: heroImg } = getHeroData(match.hero_id);

                        return (
                            <div
                                key={match.match_id}
                                style={{
                                    background: "var(--surface)",
                                    border: `1px solid ${win ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
                                    borderLeft: `6px solid ${win ? "#4ade80" : "#f87171"}`,
                                    padding: "16px 20px",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "16px"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "220px" }}>
                                    {heroImg && (
                                        <img
                                            src={heroImg}
                                            alt={heroName}
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                            style={{ width: "64px", height: "36px", objectFit: "cover", borderRadius: "6px" }}
                                        />
                                    )}
                                    <div>
                                        <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--text)" }}>
                                            {heroName}
                                        </div>
                                        <div style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: win ? "#4ade80" : "#f87171"
                                        }}>
                                            {win ? "Победа" : "Поражение"}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" }}>К / С / П</div>
                                    <div style={{ fontWeight: "600", fontSize: "15px" }}>
                                        <span style={{ color: "#4ade80" }}>{match.kills}</span> /{" "}
                                        <span style={{ color: "#f87171" }}>{match.deaths}</span> /{" "}
                                        <span style={{ color: "var(--text-secondary)" }}>{match.assists}</span>
                                    </div>
                                </div>

                                <div style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: "14px" }}>
                                    <div>{formatDuration(match.duration)}</div>
                                    <div style={{ fontSize: "12px", marginTop: "2px" }}>
                                        ID: {match.match_id}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default Matches;