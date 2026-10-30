
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Leaderboard.css";

const REGIONS = [
    { id: "europe", name: "Europe", flag: "🇪🇺" },
    { id: "americas", name: "Americas", flag: "🌎" },
    { id: "se_asia", name: "Southeast Asia", flag: "🌏" },
    { id: "china", name: "China", flag: "🇨🇳" },
];

function Leaderboard() {
    const [activeTab, setActiveTab] = useState("players");
    const [activeRegion, setActiveRegion] = useState("europe");

    const [teams, setTeams] = useState([]);
    const [regionalPlayers, setRegionalPlayers] = useState([]);

    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingRegional, setLoadingRegional] = useState(false);

    const [teamsError, setTeamsError] = useState("");
    const [regionalError, setRegionalError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadTeams() {
            try {
                const response = await fetch("http://localhost:3000/api/teams", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Не удалось загрузить команды");
                }

                const data = await response.json();

                if (active) {
                    setTeams(data.teams || []);
                }
            } catch (error) {
                if (active) setTeamsError(error.message);
            } finally {
                if (active) setLoadingTeams(false);
            }
        }

        loadTeams();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (activeTab !== "players") return;

        let active = true;

        async function loadRegionalPlayers() {
            setLoadingRegional(true);
            setRegionalError("");

            try {
                const response = await fetch(
                    `http://localhost:3000/api/regional-leaderboard?region=${activeRegion}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Не удалось загрузить региональный рейтинг");
                }

                const data = await response.json();

                if (active) {
                    setRegionalPlayers(data.players || []);
                }
            } catch (error) {
                if (active) {
                    setRegionalError(error.message);
                    setRegionalPlayers([]);
                }
            } finally {
                if (active) setLoadingRegional(false);
            }
        }

        loadRegionalPlayers();

        return () => {
            active = false;
        };
    }, [activeTab, activeRegion]);

    const formatNumber = (value) => {
        if (value == null || !Number.isFinite(Number(value))) return "—";
        return Number(value).toLocaleString("ru-RU");
    };

    const currentRegion = REGIONS.find(
        (region) => region.id === activeRegion
    );

    return (
        <div className="leaderboard">
            <div className="leaderboard-header">
                <div>
                    <span className="leaderboard-eyebrow">
                        DOTA META STATISTICS
                    </span>
                    <h1>Мировой рейтинг</h1>
                    <p>Лучшие игроки и профессиональные команды Dota 2</p>
                </div>
            </div>

            <div className="leaderboard-tabs">
                <button
                    className={`leaderboard-tab ${activeTab === "players" ? "active" : ""}`}
                    onClick={() => setActiveTab("players")}
                >
                    Игроки
                </button>

                <button
                    className={`leaderboard-tab ${activeTab === "teams" ? "active" : ""}`}
                    onClick={() => setActiveTab("teams")}
                >
                    Команды
                </button>
            </div>

            {activeTab === "players" && (
                <div className="leaderboard-tabs region-tabs">
                    {REGIONS.map((region) => (
                        <button
                            key={region.id}
                            className={`leaderboard-tab ${activeRegion === region.id ? "active" : ""}`}
                            onClick={() => setActiveRegion(region.id)}
                        >
                            {region.flag} {region.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="leaderboard-card">
                <div className="leaderboard-card-header">
                    <h2>
                        {activeTab === "players"
                            ? `Топ игроков · ${currentRegion?.name}`
                            : "Рейтинг команд"}
                    </h2>

                    <span>
                        {activeTab === "players"
                            ? `${regionalPlayers.length} игроков`
                            : `${teams.length} команд`}
                    </span>
                </div>

                {activeTab === "players" ? (
                    loadingRegional ? (
                        <div className="leaderboard-empty">
                            <h3>Загружаем рейтинг региона...</h3>
                        </div>
                    ) : regionalError ? (
                        <div className="leaderboard-empty">
                            <h3>{regionalError}</h3>
                        </div>
                    ) : regionalPlayers.length === 0 ? (
                        <div className="leaderboard-empty">
                            <div className="empty-icon">🏆</div>
                            <h3>В этом регионе пока нет данных</h3>
                        </div>
                    ) : (
                        <div className="leaderboard-table-wrapper">
                            <table className="leaderboard-table">
                                <thead>
                                <tr>
                                    <th>Место</th>
                                    <th>Игрок</th>
                                    <th>Команда</th>
                                    <th>Страна</th>
                                </tr>
                                </thead>

                                <tbody>
                                {regionalPlayers.map((player, index) => {
                                    const playerKey = player.player_key;

                                    return (
                                        <tr
                                            key={`${activeRegion}-${playerKey || "player"}-${index}`}
                                        >
                                            <td>
                                                    <span className={`rank rank-${player.rank}`}>
                                                        #{player.rank ?? index + 1}
                                                    </span>
                                            </td>

                                            <td className="player-name">
                                                {playerKey ? (
                                                    <Link
                                                        to={`/regional-players/${playerKey}`}
                                                        className="leaderboard-player-link"
                                                    >
                                                            <span>
                                                                {player.nickname || player.name || "Unknown"}
                                                            </span>
                                                    </Link>
                                                ) : (
                                                    <span className="regional-player-name">
                                                            {player.nickname || player.name || "Unknown"}
                                                        </span>
                                                )}
                                            </td>

                                            <td>
                                                {player.team_tag || player.team || "—"}
                                            </td>

                                            <td>
                                                {player.country
                                                    ? player.country.toUpperCase()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : loadingTeams ? (
                    <div className="leaderboard-empty">
                        <h3>Загружаем рейтинг команд...</h3>
                    </div>
                ) : teamsError ? (
                    <div className="leaderboard-empty">
                        <h3>{teamsError}</h3>
                    </div>
                ) : teams.length === 0 ? (
                    <div className="leaderboard-empty">
                        <div className="empty-icon">🏆</div>
                        <h3>Пока нет данных о командах</h3>
                    </div>
                ) : (
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                            <tr>
                                <th>Место</th>
                                <th>Команда</th>
                                <th>Рейтинг</th>
                                <th>Победы</th>
                                <th>Поражения</th>
                                <th>Матчи</th>
                            </tr>
                            </thead>

                            <tbody>
                            {teams.map((team, index) => (
                                <tr key={team.id ?? index}>
                                    <td>
                                            <span className={`rank rank-${index + 1}`}>
                                                #{index + 1}
                                            </span>
                                    </td>

                                    <td className="player-name">
                                        <Link
                                            to={`/teams/${team.id}`}
                                            className="team-name-link"
                                        >
                                            {team.logo ? (
                                                <img
                                                    src={team.logo}
                                                    alt=""
                                                    className="team-logo"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="team-logo-placeholder">
                                                    🏆
                                                </div>
                                            )}

                                            <strong>{team.name}</strong>

                                            {team.tag && (
                                                <span className="team-tag">
                                                        [{team.tag}]
                                                    </span>
                                            )}
                                        </Link>
                                    </td>

                                    <td className="player-mmr">
                                        {formatNumber(team.rating)}
                                    </td>

                                    <td>{formatNumber(team.wins)}</td>
                                    <td>{formatNumber(team.losses)}</td>

                                    <td>
                                        {formatNumber(
                                            Number(team.wins || 0) +
                                            Number(team.losses || 0)
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
