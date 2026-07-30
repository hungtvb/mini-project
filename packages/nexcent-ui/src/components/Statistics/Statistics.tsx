export type StatisticItem = {
    id: string;
    image: {
        alt: string;
        src: string;
    };
    label: string;
    value: string;
};

export type StatisticsProps = {
    description?: string;
    highlight?: string;
    items: readonly StatisticItem[];
    title?: string;
};

export function Statistics({
    description,
    highlight,
    items,
    title,
}: StatisticsProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="business" id="product">
            <div className="business__container">
                {title || description ? (
                    <div className="business__block block">
                        <div className="block__item">
                            {title ? (
                                <h2 className="block__title">
                                    {title}{' '}
                                    {highlight ? (
                                        <span className="bright-headline">
                                            {highlight}
                                        </span>
                                    ) : null}
                                </h2>
                            ) : null}
                            {description ? (
                                <p className="block__info">{description}</p>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <div className="business__items">
                    {items.map((item) => (
                        <div className="business__item" key={item.id}>
                            <div className="business__icon">
                                <img src={item.image.src} alt={item.image.alt} />
                            </div>
                            <div className="business__info">
                                <p>{item.value}</p>
                                <p>{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
