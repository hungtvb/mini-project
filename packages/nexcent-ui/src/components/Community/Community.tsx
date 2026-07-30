import type {ButtonHTMLAttributes} from 'react';

export type CommunityItem = {
    description?: string;
    id: string;
    image: {
        alt: string;
        src: string;
    };
    title: string;
};

export type CommunityProps = {
    description?: string;
    getItemProps?: (
        item: CommunityItem
    ) => ButtonHTMLAttributes<HTMLButtonElement>;
    items: readonly CommunityItem[];
    title?: string;
};

export function Community({
    description,
    getItemProps,
    items,
    title,
}: CommunityProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="community" id="services">
            <div className="community__container">
                {title || description ? (
                    <div className="community__title title">
                        {title ? <h2>{title}</h2> : null}
                        {description ? <p>{description}</p> : null}
                    </div>
                ) : null}

                <div className="community__items mt">
                    {items.map((item) => {
                        const {className, ...buttonProps} =
                            getItemProps?.(item) ?? {};

                        return (
                            <button
                                {...buttonProps}
                                className={`community__item${
                                    className ? ` ${className}` : ''
                                }`}
                                key={item.id}
                                type="button"
                            >
                                <div className="community__icon">
                                    <img
                                        src={item.image.src}
                                        alt={item.image.alt}
                                    />
                                </div>
                                <h3>{item.title}</h3>
                                {item.description ? (
                                    <p className="community__description">
                                        {item.description}
                                    </p>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
