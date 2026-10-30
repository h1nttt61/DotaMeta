import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./TeamProfile.css";

function TeamProfile() {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadTeam() {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/teams/${teamId}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Не удалось загрузить профиль команды");
                }

                const data = await response.json();

                if (active) {
                    setTeam(data.team);
                    setPlayers(data.players || []);
                    setMatches(data.matches || []);
                }
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadTeam();

        return () => {
            active = false;
        };
    }, [teamId]);

    const formatNumber = (value) => {
        if (value == null || !Number.isFinite(Number(value))) return "—";
        return Number(value).toLocaleString("ru-RU");
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "—";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "—";

        return new Date(timestamp * 1000).toLocaleDateString("ru-RU");
    };

    if (loading) {
        return (
            <div className="team-profile-state">
                <h2>Загружаем профиль команды...</h2>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="team-profile-state">
                <h2>{error || "Команда не найдена"}</h2>
                <Link to="/leaderboard">Вернуться к рейтингу</Link>
            </div>
        );
    }

    return (
        <div className="team-profile">
            <Link to="/leaderboard" className="team-back-link">
                ← Назад к рейтингу
            </Link>

            <section className="team-profile-header">
                {team.logo_url ? (
                    <img
                        src={team.logo_url}
                        alt=""
                        className="team-profile-logo"
                    />
                ) : (
                    <div className="team-profile-logo-placeholder">🏆</div>
                )}

                <div className="team-profile-heading">
                    <span className="team-profile-eyebrow">
                        DOTA META TEAM PROFILE
                    </span>
                    <h1>{team.name || "Unknown"}</h1>
                    {team.tag && <span className="team-profile-tag">[{team.tag}]</span>}
                </div>
            </section>

            <section className="team-stats">
                <div className="team-stat-card">
                    <span>Рейтинг</span>
                    <strong>{formatNumber(team.rating)}</strong>
                </div>
                <div className="team-stat-card">
                    <span>Победы</span>
                    <strong>{formatNumber(team.wins)}</strong>
                </div>
                <div className="team-stat-card">
                    <span>Поражения</span>
                    <strong>{formatNumber(team.losses)}</strong>
                </div>
                <div className="team-stat-card">
                    <span>Всего матчей</span>
                    <strong>
                        {formatNumber(
                            Number(team.wins || 0) + Number(team.losses || 0)
                        )}
                    </strong>
                </div>
            </section>

            <section className="team-profile-section">
                <div className="team-section-heading">
                    <h2>Состав команды</h2>
                    <span>{players.length} игроков</span>
                </div>

                {players.length === 0 ? (
                    <p className="team-no-data">Нет данных о составе</p>
                ) : (
                    <div className="team-players-list">
                        {players.map((player, index) => (
                            <Link
                                to={`/leaderboard/${player.account_id}`}
                                className="team-player-row"
                                key={player.account_id || index}
                            >
                                <div>
                                    <strong>
                                        {player.name || player.personaname || "Unknown"}
                                    </strong>
                                    <span>
                                        {player.is_current_team_member
                                            ? "Текущий игрок"
                                            : "Бывший игрок"}
                                    </span>
                                </div>
                                <div className="team-player-record">
                                    <span>{formatNumber(player.games_played)} матчей</span>
                                    <span>{formatNumber(player.wins)} побед</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="team-profile-section">
                <div className="team-section-heading">
                    <h2>Последние матчи</h2>
                    <span>{matches.length} матчей</span>
                </div>

                {matches.length === 0 ? (
                    <p className="team-no-data">Нет данных о матчах</p>
                ) : (
                    <div className="team-matches-list">
                        {matches.map((match) => {
                            const teamWon =
                                (match.radiant && match.radiant_win) ||
                                (!match.radiant && !match.radiant_win);

                            return (
                                <a
                                    href={`https://www.dotabuff.com/matches/${match.match_id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="team-match-row"
                                    key={match.match_id}
                                >
                                    <div className={`team-match-result ${teamWon ? "win" : "loss"}`}>
                                        {teamWon ? "Победа" : "Поражение"}
                                    </div>

                                    <div className="team-match-opponent">
                                        {match.opposing_team_logo && (
                                            <img src={match.opposing_team_logo} alt="" />
                                        )}
                                        <div>
                                            <strong>
                                                {match.opposing_team_name || "Неизвестный соперник"}
                                            </strong>
                                            <span>{match.league_name || "Турнир"}</span>
                                        </div>
                                    </div>

                                    <div className="team-match-info">
                                        <span>{formatDate(match.start_time)}</span>
                                        <span>{formatDuration(match.duration)}</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default TeamProfile;