function HeroCard({ hero }) {
    const imageUrl = `https://cdn.cloudflare.steamstatic.com${hero.img}`;

    return (
        <article className="hero-card">
            <img
                src={imageUrl}
                alt={hero.localized_name}
                className="hero-card__image"
            />

            <div className="hero-card__content">
                <h3>{hero.localized_name}</h3>

                <span>{hero.primary_attr}</span>

                <div className="hero-card__roles">
                    {hero.roles.map((role) => (
                        <span key={role}>{role}</span>
                    ))}
                </div>
            </div>
        </article>
    );
}

export default HeroCard;