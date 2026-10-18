import { useEffect, useState } from "react";

function HeroDetail({ heroId, role, onBack }) {
    const [hero, setHero] = useState(null);
    const [items, setItems] = useState({ start: [], mid: [], late: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHeroData() {
            setLoading(true);
            try {
                const [heroesRes, itemsConstantsRes, popularityRes] = await Promise.all([
                    fetch("http://localhost:3000/api/heroes"),
                    fetch("https://api.opendota.com/api/constants/items"),
                    fetch(`https://api.opendota.com/api/heroes/${heroId}/itemPopularity`)
                ]);

                const heroesData = await heroesRes.json();
                const itemConstants = await itemsConstantsRes.json();
                const popularityData = await popularityRes.json();

                const heroesList = heroesData.heroes || (Array.isArray(heroesData) ? heroesData : []);
                const found = heroesList.find((h) => h.id === Number(heroId));
                setHero(found);

                const itemsById = {};
                Object.keys(itemConstants).forEach((key) => {
                    const item = itemConstants[key];
                    if (item) {
                        if (item.id) itemsById[item.id] = item;
                        itemsById[key] = item;
                    }
                });

                const mapItemIds = (itemObj, isEarly = false) => {
                    if (!itemObj) return [];
                    return Object.entries(itemObj)
                        .map(([itemId, count]) => {
                            const itemData = itemsById[itemId] || itemConstants[itemId] || {};
                            return { itemId, count, itemData };
                        })
                        .filter(({ itemData }) => {
                            if (isEarly) return true;
                            return itemData.qual !== "component" && (itemData.cost || 0) >= 400;
                        })
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 6)
                        .map(({ itemId, count, itemData }) => {
                            let rawKey = itemData.name || itemId;
                            if (typeof rawKey === "string" && rawKey.startsWith("item_")) {
                                rawKey = rawKey.replace("item_", "");
                            }

                            const imgPath = itemData.img
                                ? `https://cdn.cloudflare.steamstatic.com${itemData.img}`
                                : `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${rawKey}.png`;

                            return {
                                id: itemId,
                                key: rawKey,
                                img: imgPath,
                                name: itemData.dname || rawKey || `Item ${itemId}`,
                                count: count
                            };
                        });
                };

                setItems({
                    start: mapItemIds(popularityData.start_game_items, true),
                    mid: mapItemIds(popularityData.mid_game_items, false),
                    late: mapItemIds(popularityData.late_game_items, false)
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchHeroData();
    }, [heroId, role]);

    if (loading) return <p style={{ color: "var(--text-secondary)", padding: "40px" }}>Загрузка профиля героя и предметов...</p>;
    if (!hero) return <p style={{ color: "var(--text-secondary)", padding: "40px" }}>Герой не найден</p>;

    const winRate = hero["7_pick"] > 0 ? ((hero["7_win"] / hero["7_pick"]) * 100).toFixed(1) : "—";

    const renderItemGroup = (title, itemList) => {
        if (!itemList || itemList.length === 0) return null;
        return (
            <div style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "18px", color: "var(--purple-light)", marginBottom: "12px" }}>{title}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "12px" }}>
                    {itemList.map((item, idx) => (
                        <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                            <img
                                src={item.img}
                                alt={item.name}
                                style={{ width: "48px", height: "36px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border)" }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blink.png";
                                }}
                            />
                            <div style={{ overflow: "hidden" }}>
                                <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {item.name}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                                    Покупок: <span style={{ color: "var(--purple-light)" }}>{item.count.toLocaleString("ru-RU")}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="heroes-page">
            <button className="ui-button ui-button--secondary" onClick={onBack} style={{ marginBottom: "24px" }}>
                ← Назад к мете
            </button>

            <div style={{ display: "flex", gap: "32px", alignItems: "center", marginBottom: "32px" }}>
                {hero.img && (
                    <img
                        src={`https://cdn.cloudflare.steamstatic.com${hero.img}`}
                        alt={hero.localized_name}
                        style={{ width: "160px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
                    />
                )}
                <div>
                    <span className="hero__eyebrow">
                        ПРОФИЛЬ ГЕРОЯ {role && role !== "ALL" ? `• РОЛЬ: ${role.toUpperCase()}` : ""}
                    </span>
                    <h1 style={{ fontSize: "42px", margin: "4px 0 12px" }}>{hero.localized_name}</h1>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <span className="meta-attr-badge">{hero.primary_attr?.toUpperCase()}</span>
                        <span className="meta-attr-badge" style={{ background: "rgba(74, 222, 128, 0.1)", color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.2)" }}>
                            Винрейт: {winRate}%
                        </span>
                    </div>
                </div>
            </div>

            {renderItemGroup("До 0:00 (Стартовый закуп)", items.start)}
            {renderItemGroup("0:00 — 15:00 (Ранняя игра)", items.mid)}
            {renderItemGroup("15:00 — 30:00+ (Мидгейм / Лейт)", items.late)}
        </section>
    );
}

export default HeroDetail;