export type ClientLogo = {
    alt: string;
    id: string;
    src: string;
};

export type ClientsProps = {
    description?: string;
    logos: readonly ClientLogo[];
    showTicker?: boolean;
    title?: string;
};

function ClientLogos({
    duplicate = false,
    logos,
}: {
    duplicate?: boolean;
    logos: readonly ClientLogo[];
}) {
    return (
        <div
            aria-hidden={duplicate || undefined}
            className="ticker__items ticker__marquee"
        >
            {logos.map((logo) => (
                <div
                    className="ticker__item"
                    key={`${logo.id}-${duplicate ? 'duplicate' : 'original'}`}
                >
                    <img src={logo.src} alt={duplicate ? '' : logo.alt} />
                </div>
            ))}
        </div>
    );
}

export function Clients({
    description,
    logos,
    showTicker = true,
    title,
}: ClientsProps) {
    if (logos.length === 0) {
        return null;
    }

    return (
        <section className="clients">
            <div className="clients__container">
                {title || description ? (
                    <div className="title">
                        {title ? <h2>{title}</h2> : null}
                        {description ? <p>{description}</p> : null}
                    </div>
                ) : null}

                <div className="clients__wrapper mt">
                    <div className="clients__ticker ticker">
                        <div className="clients__box ticker__wrapper">
                            <ClientLogos logos={logos} />
                            {showTicker ? (
                                <ClientLogos duplicate logos={logos} />
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
