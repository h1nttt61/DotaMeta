import { useEffect, useState } from "react";
import { getHeroes } from "../api/heroes";

const DRAFT_STAGES = [
    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },
    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },
    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },
    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },

    { type: "pick", team: "player" },
    { type: "pick", team: "bot" },
    { type: "pick", team: "bot" },
    { type: "pick", team: "player" },

    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },
    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },
    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },

    { type: "pick", team: "bot" },
    { type: "pick", team: "player" },
    { type: "pick", team: "player" },
    { type: "pick", team: "bot" },

    { type: "ban", team: "player" },
    { type: "ban", team: "bot" },

    { type: "pick", team: "player" },
    { type: "pick", team: "bot" }
];

function Draft() {
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stageIndex, setStageIndex] = useState(0);
    const [playerPicks, setPlayerPicks] = useState([]);
    const [playerBans, setPlayerBans] = useState([]);
    const [botPicks, setBotPicks] = useState([]);
    const [botBans, setBotBans] = useState([]);
    const [draftEnded, setDraftEnded] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAttr, setSelectedAttr] = useState("all");

    useEffect(() => {
        async function loadHeroes() {
            try {
                const data = await getHeroes();
                const heroesList = data.heroes || (Array.isArray(data) ? data : []);
                setHeroes(heroesList);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadHeroes();
    }, []);

    const currentStage = DRAFT_STAGES[stageIndex];

    const getHeroImg = (hero) => {
        if (!hero) return null;
        if (hero.name) {
            const cleanName = hero.name.replace("npc_dota_hero_", "");
            return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${cleanName}.png`;
        }
        return null;
    };

    const handleSelectHero = (hero) => {
        if (draftEnded || !currentStage || currentStage.team !== "player") return;

        const isUsed =
            playerPicks.some(h => h.id === hero.id) ||
            playerBans.some(h => h.id === hero.id) ||
            botPicks.some(h => h.id === hero.id) ||
            botBans.some(h => h.id === hero.id);

        if (isUsed) return;

        let nextPlayerPicks = [...playerPicks];
        let nextPlayerBans = [...playerBans];

        if (currentStage.type === "pick") {
            nextPlayerPicks.push(hero);
            setPlayerPicks(nextPlayerPicks);
        } else {
            nextPlayerBans.push(hero);
            setPlayerBans(nextPlayerBans);
        }

        advanceDraft(stageIndex + 1, nextPlayerPicks, nextPlayerBans, botPicks, botBans);
    };

    const advanceDraft = (nextIndex, pPicks, pBans, bPicks, bBans) => {
        if (nextIndex >= DRAFT_STAGES.length) {
            setStageIndex(nextIndex);
            setDraftEnded(true);
            return;
        }

        setStageIndex(nextIndex);
        const nextStage = DRAFT_STAGES[nextIndex];

        if (nextStage.team === "bot") {
            setTimeout(() => {
                makeBotMove(nextIndex, pPicks, pBans, bPicks, bBans);
            }, 800);
        }
    };

    const makeBotMove = (currentIndex, pPicks, pBans, bPicks, bBans) => {
        const stage = DRAFT_STAGES[currentIndex];
        const usedIds = new Set([
            ...pPicks.map(h => h.id),
            ...pBans.map(h => h.id),
            ...bPicks.map(h => h.id),
            ...bBans.map(h => h.id)
        ]);

        const available = heroes.filter(h => !usedIds.has(h.id));
        if (available.length === 0) return;

        const choice = available[Math.floor(Math.random() * available.length)];

        let nextBotPicks = [...bPicks];
        let nextBotBans = [...bBans];

        if (stage.type === "pick") {
            nextBotPicks.push(choice);
            setBotPicks(nextBotPicks);
        } else {
            nextBotBans.push(choice);
            setBotBans(nextBotBans);
        }

        advanceDraft(currentIndex + 1, pPicks, pBans, nextBotPicks, nextBotBans);
    };

    const resetDraft = () => {
        setStageIndex(0);
        setPlayerPicks([]);
        setPlayerBans([]);
        setBotPicks([]);
        setBotBans([]);
        setDraftEnded(false);
    };

    const calculateTeamScore = (picks) => {
        if (picks.length === 0) return { score: 0, str: 0, agi: 0, int: 0, all: 0 };
        let str = 0, agi = 0, int = 0, all = 0;
        picks.forEach(h => {
            if (h.primary_attr === "str" || h.primary_attr === 0) str++;
            else if (h.primary_attr === "agi" || h.primary_attr === 1) agi++;
            else if (h.primary_attr === "int" || h.primary_attr === 2) int++;
            else all++;
        });
        const balanceBonus = (str > 0 ? 20 : 0) + (agi > 0 ? 20 : 0) + (int > 0 ? 20 : 0) + (all > 0 ? 20 : 0);
        const score = Math.min(100, balanceBonus + picks.length * 4);
        return { score, str, agi, int, all };
    };

    const playerStats = calculateTeamScore(playerPicks);
    const botStats = calculateTeamScore(botPicks);

    const filteredHeroes = heroes.filter(h => {
        const nameMatch = (h.localized_name || h.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        if (!nameMatch) return false;
        if (selectedAttr === "all") return true;
        if (selectedAttr === "str") return h.primary_attr === "str" || h.primary_attr === 0;
        if (selectedAttr === "agi") return h.primary_attr === "agi" || h.primary_attr === 1;
        if (selectedAttr === "int") return h.primary_attr === "int" || h.primary_attr === 2;
        if (selectedAttr === "universal") return h.primary_attr === "all" || h.primary_attr === 3;
        return true;
    });

    if (loading) {
        return <div style={{ padding: "32px", color: "var(--text-secondary)" }}>Загрузка героев...</div>;
    }

    return (
        <section className="heroes-page">
            <div className="heroes-page__header" style={{ marginBottom: "20px" }}>
                <span className="hero__eyebrow">DOTA 2 TOURNAMENT DRAFT</span>
                <h1>Captains Mode Драфт</h1>
            </div>

            <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "16px 20px",
                borderRadius: "12px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Текущая стадия: </span>
                    <strong style={{ color: "var(--text)", fontSize: "16px", marginLeft: "6px" }}>
                        {draftEnded ? "Драфт завершён" : `Стадия ${stageIndex + 1} из ${DRAFT_STAGES.length}: ${currentStage.type === "ban" ? "🚫 БАН" : "⚔️ ПИК"} (${currentStage.team === "player" ? "ВАШ ХОД" : "ХОД БОТА"})`}
                    </strong>
                </div>
                {draftEnded && (
                    <button onClick={resetDraft} style={{ padding: "8px 16px", background: "var(--purple-light)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                        Сбросить драфт
                    </button>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "16px", borderRadius: "12px" }}>
                    <h3 style={{ color: "#4ade80", marginTop: 0, marginBottom: "12px" }}>Ваша команда</h3>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>ПИКИ (5)</div>
                    <div style={{ display: "flex", gap: "8px", minHeight: "50px", marginBottom: "16px" }}>
                        {playerPicks.map(h => (
                            <img key={h.id} src={getHeroImg(h)} alt={h.localized_name} title={h.localized_name} style={{ width: "52px", height: "30px", borderRadius: "4px", objectFit: "cover", border: "1px solid #4ade80" }} />
                        ))}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>БАНЫ (7)</div>
                    <div style={{ display: "flex", gap: "6px", minHeight: "35px" }}>
                        {playerBans.map(h => (
                            <img key={h.id} src={getHeroImg(h)} alt={h.localized_name} title={h.localized_name} style={{ width: "36px", height: "20px", borderRadius: "3px", objectFit: "cover", opacity: 0.5, border: "1px solid #f87171" }} />
                        ))}
                    </div>
                </div>

                {/* Команда бота */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "16px", borderRadius: "12px" }}>
                    <h3 style={{ color: "#f87171", marginTop: 0, marginBottom: "12px" }}>Команда Соперника</h3>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>ПИКИ (5)</div>
                    <div style={{ display: "flex", gap: "8px", minHeight: "50px", marginBottom: "16px" }}>
                        {botPicks.map(h => (
                            <img key={h.id} src={getHeroImg(h)} alt={h.localized_name} title={h.localized_name} style={{ width: "52px", height: "30px", borderRadius: "4px", objectFit: "cover", border: "1px solid #f87171" }} />
                        ))}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>БАНЫ (7)</div>
                    <div style={{ display: "flex", gap: "6px", minHeight: "35px" }}>
                        {botBans.map(h => (
                            <img key={h.id} src={getHeroImg(h)} alt={h.localized_name} title={h.localized_name} style={{ width: "36px", height: "20px", borderRadius: "3px", objectFit: "cover", opacity: 0.5, border: "1px solid #f87171" }} />
                        ))}
                    </div>
                </div>
            </div>

            {draftEnded && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--purple-light)", padding: "24px", borderRadius: "12px", marginBottom: "30px" }}>
                    <h2 style={{ marginTop: 0, textAlign: "center", color: "var(--purple-light)" }}>📊 Аналитика и Сравнение Драфтов</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "16px" }}>
                        <div style={{ background: "rgba(74, 222, 128, 0.05)", border: "1px solid rgba(74, 222, 128, 0.2)", padding: "16px", borderRadius: "8px" }}>
                            <h3 style={{ color: "#4ade80", margin: "0 0 12px 0" }}>Ваша Оценка: {playerStats.score} / 100</h3>
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                                Сила: {playerStats.str} | Ловкость: {playerStats.agi} | Интеллект: {playerStats.int} | Универсальные: {playerStats.all}
                            </p>
                        </div>
                        <div style={{ background: "rgba(248, 113, 113, 0.05)", border: "1px solid rgba(248, 113, 113, 0.2)", padding: "16px", borderRadius: "8px" }}>
                            <h3 style={{ color: "#f87171", margin: "0 0 12px 0" }}>Оценка Бота: {botStats.score} / 100</h3>
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                                Сила: {botStats.str} | Ловкость: {botStats.agi} | Интеллект: {botStats.int} | Универсальные: {botStats.all}
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: "20px", textAlign: "center", fontWeight: "700", fontSize: "18px" }}>
                        {playerStats.score > botStats.score ? (
                            <span style={{ color: "#4ade80" }}>🏆 Ваш драфт выглядин сбалансированнее!</span>
                        ) : playerStats.score < botStats.score ? (
                            <span style={{ color: "#f87171" }}>⚠️ Бот собрал более сбалансированный пик.</span>
                        ) : (
                            <span style={{ color: "var(--purple-light)" }}>⚖️ Равный драфт по балансу атрибутов!</span>
                        )}
                    </div>
                </div>
            )}

            {!draftEnded && (
                <div>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder="Поиск героя..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "220px" }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                            {["all", "str", "agi", "int", "universal"].map(attr => (
                                <button
                                    key={attr}
                                    onClick={() => setSelectedAttr(attr)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--border)",
                                        background: selectedAttr === attr ? "var(--purple-light)" : "var(--surface)",
                                        color: selectedAttr === attr ? "#fff" : "var(--text-secondary)",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        textTransform: "uppercase"
                                    }}
                                >
                                    {attr}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px" }}>
                        {filteredHeroes.map(hero => {
                            const isPicked =
                                playerPicks.some(h => h.id === hero.id) ||
                                playerBans.some(h => h.id === hero.id) ||
                                botPicks.some(h => h.id === hero.id) ||
                                botBans.some(h => h.id === hero.id);

                            const isPlayerTurn = currentStage && currentStage.team === "player";
                            const imgUrl = getHeroImg(hero);

                            return (
                                <div
                                    key={hero.id}
                                    onClick={() => !isPicked && isPlayerTurn && handleSelectHero(hero)}
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px",
                                        padding: "4px",
                                        textAlign: "center",
                                        cursor: isPicked || !isPlayerTurn ? "not-allowed" : "pointer",
                                        opacity: isPicked ? 0.25 : 1,
                                        filter: isPicked ? "grayscale(100%)" : "none",
                                        transition: "0.2s"
                                    }}
                                >
                                    {imgUrl ? (
                                        <img src={imgUrl} alt={hero.localized_name} style={{ width: "100%", height: "42px", objectFit: "cover", borderRadius: "4px", display: "block" }} />
                                    ) : (
                                        <div style={{ height: "42px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {hero.localized_name}
                                        </div>
                                    )}
                                    <div style={{ fontSize: "10px", marginTop: "4px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", color: "var(--text)" }}>
                                        {hero.localized_name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}

export default Draft;