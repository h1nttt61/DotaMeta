import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./PlayerProfile.css";

function formatDuration(seconds) {
    if (!seconds) return "—";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatDate(timestamp) {
    if (!timestamp) return "Дата неизвестна";

    return new Date(timestamp * 1000).toLocaleString("ru-RU");
}

function PlayerProfile() {
    const { accountId } = useParams();

    const [player, setPlayer] = useState(null);
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                const [profileResponse, heroesResponse] = await Promise.all([
                    fetch(`http://localhost:3000/api/players/${accountId}`, {
                        credentials: "include",
                    }),
                    fetch("http://localhost:3000/api/heroes", {
                        credentials: "include",
                    }),
                ]);

                if (!profileResponse.ok) {
                    throw new Error("Не удалось загрузить профиль игрока");
                }

                const profileData = await profileResponse.json();

                let heroesData = [];

                if (heroesResponse.ok) {
                    const data = await heroesResponse.json();
                    heroesData = Array.isArray(data) ? data : data.heroes || [];
                }

                if (active) {
                    setPlayer(profileData);
                    setHeroes(heroesData);
                    setLoading(false);
                }
            } catch (err) {
                if (active) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, [accountId]);

    if (loading) {
        return <div className="player-profile-message">Загружаем профиль...</div>;
    }

    if (error || !player) {
        return (
            <div className="player-profile-message">
                <h2>{error || "Игрок не найден"}</h2>
                <Link to="/leaderboard">← Вернуться к рейтингу</Link>
            </div>
        );
    }

    return (
        <div className="player-profile">
            <Link to="/leaderboard" className="profile-back">
                ← Назад к рейтингу
            </Link>

            <section className="profile-card">
                <div className="profile-main">
                    {player.avatar && (
                        <img
                            src={player.avatar}
                            alt={player.nickname}
                            className="profile-avatar"
                        />
                    )}

                    <div>
                        <span className="profile-eyebrow">PRO PLAYER PROFILE</span>
                        <h1>{player.nickname}</h1>
                        <p>
                            {player.team || "Команда не указана"}
                            {player.team_tag ? ` [${player.team_tag}]` : ""}
                        </p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="profile-stat">
                        <span>Расчётный MMR</span>
                        <strong>
                            {player.estimated_mmr
                                ? Number(player.estimated_mmr).toLocaleString("ru-RU")
                                : "Нет данных"}
                        </strong>
                    </div>

                    <div className="profile-stat">
                        <span>Последние матчи</span>
                        <strong>{player.matches.length}</strong>
                    </div>
                </div>

                {player.steam_url && (
                    <a
                        href={player.steam_url}
                        target="_blank"
                        rel="noreferrer"
                        className="steam-profile-link"
                    >
                        Открыть Steam профиль ↗
                    </a>
                )}
            </section>

            <section className="matches-section">
                <div className="matches-heading">
                    <div>
                        <span className="profile-eyebrow">MATCH HISTORY</span>
                        <h2>Последние 5 матчей</h2>
                    </div>
                </div>

                {player.matches.length === 0 ? (
                    <div className="profile-empty">
                        История матчей недоступна
                    </div>
                ) : (
                    <div className="matches-list">
                        {player.matches.map((match) => {
                            const hero = heroes.find(
                                (item) => item.id === match.hero_id
                            );

                            return (
                                <article
                                    className="match-card"
                                    key={match.match_id}
                                >
                                    <div className="match-result">
                                        <span className={match.result}>
                                            {match.result === "win"
                                                ? "ПОБЕДА"
                                                : "ПОРАЖЕНИЕ"}
                                        </span>
                                        <small>{formatDate(match.start_time)}</small>
                                    </div>

                                    <div className="match-hero">
                                        <strong>
                                            {hero?.localized_name ||
                                                `Герой #${match.hero_id}`}
                                        </strong>
                                        <small>
                                            Матч #{match.match_id}
                                        </small>
                                    </div>

                                    <div className="match-kda">
                                        <strong>
                                            {match.kills} / {match.deaths} / {match.assists}
                                        </strong>
                                        <small>K / D / A</small>
                                    </div>

                                    <div className="match-duration">
                                        <strong>
                                            {formatDuration(match.duration)}
                                        </strong>
                                        <small>Длительность</small>
                                    </div>

                                    <div className="match-items">
                                        {match.items.length > 0
                                            ? match.items.map((item, index) => (
                                                <span key={index} className="match-item">
                                                    {item}
                                                </span>
                                            ))
                                            : "Предметы не указаны"}
                                    </div>

                                    <a
                                        href={`https://www.opendota.com/matches/${match.match_id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="match-details-link"
                                    >
                                        Матч ↗
                                    </a>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default PlayerProfile;