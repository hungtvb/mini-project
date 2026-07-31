export type MarketingItem = {
    action?: {
        href: string;
        label: string;
        target?: '_blank' | '_self';
    };
    id: string;
    image: {
        alt: string;
        src: string;
    };
    title: string;
};

export type MarketingProps = {
    description?: string;
    items: readonly MarketingItem[];
    title?: string;
};

export function Marketing({description, items, title}: MarketingProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="marketing">
            <div className="marketing__container">
                {title || description ? (
                    <div className="marketing__title title">
                        {title ? <h2>{title}</h2> : null}
                        {description ? <p>{description}</p> : null}
                    </div>
                ) : null}

                <div className="marketing__items mt">
                    {items.map((item) => (
                        <article className="marketing__item" key={item.id}>
                            <div className="marketing__img img">
                                <img src={item.image.src} alt={item.image.alt} />
                            </div>
                            <div className="marketing__info">
                                <p>{item.title}</p>
                                {item.action ? (
                                    <a
                                        className="btn__wrapper"
                                        href={item.action.href}
                                        rel={
                                            item.action.target === '_blank'
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                        target={item.action.target}
                                    >
                                        {item.action.label} &nbsp; →
                                    </a>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
