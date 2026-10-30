
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./RegionalPlayerProfile.css";

function RegionalPlayerProfile() {
    const { playerKey } = useParams();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadPlayer() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `http://localhost:3000/api/regional-players/${playerKey}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? "Игрок не найден"
                            : "Не удалось загрузить профиль"
                    );
                }

                const data = await response.json();

                if (active) {
                    setPlayer(data.player);
                }
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadPlayer();

        return () => {
            active = false;
        };
    }, [playerKey]);

    if (loading) {
        return <div className="regional-profile-message">Загружаем профиль...</div>;
    }

    if (error || !player) {
        return (
            <div className="regional-profile-message">
                <h2>{error || "Игрок не найден"}</h2>
                <Link to="/leaderboard">Вернуться к рейтингу</Link>
            </div>
        );
    }

    return (
        <div className="regional-profile">
            <Link to="/leaderboard" className="regional-profile-back">
                ← Вернуться к рейтингу
            </Link>

            <div className="regional-profile-card">
                <div className="regional-profile-rank">
                    #{player.rank}
                </div>

                <div className="regional-profile-info">
                    <span className="regional-profile-label">
                        DOTA 2 REGIONAL LEADERBOARD
                    </span>

                    <h1>{player.nickname}</h1>

                    <p>
                        {player.team_tag
                            ? `Команда ${player.team_tag}`
                            : "Без команды"}
                    </p>
                </div>
            </div>

            <div className="regional-profile-stats">
                <div className="regional-profile-stat">
                    <span>Место в рейтинге</span>
                    <strong>#{player.rank}</strong>
                </div>

                <div className="regional-profile-stat">
                    <span>Регион</span>
                    <strong>{player.region.toUpperCase()}</strong>
                </div>

                <div className="regional-profile-stat">
                    <span>Страна</span>
                    <strong>
                        {player.country
                            ? player.country.toUpperCase()
                            : "—"}
                    </strong>
                </div>

                <div className="regional-profile-stat">
                    <span>Команда</span>
                    <strong>{player.team_tag || "—"}</strong>
                </div>
            </div>

            <p className="regional-profile-note">
                Позиция отображается по официальному региональному рейтингу Dota 2.
                Данные профиля обновляются вместе с региональным рейтингом.
            </p>
        </div>
    );
}

export default RegionalPlayerProfile;
