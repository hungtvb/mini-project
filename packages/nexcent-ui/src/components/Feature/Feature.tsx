import type {AnchorHTMLAttributes} from 'react';

export type FeatureProps = {
    action?: {
        href: string;
        label: string;
        target?: '_blank' | '_self';
    };
    actionProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
    description?: string;
    image: {
        alt: string;
        src: string;
    };
    sectionId?: string;
    title: string;
};

export function Feature({
    action,
    actionProps,
    description,
    image,
    sectionId,
    title,
}: FeatureProps) {
    if (!title || !image.src) {
        return null;
    }

    const {className: actionClassName, ...linkProps} = actionProps ?? {};

    return (
        <section className="pixelgrade section" id={sectionId}>
            <div className="pixelgrade__container section__container block">
                <div className="pixelgrade__item section__item block__item">
                    <h2 className="pixelgrade__title block__title">{title}</h2>
                    {description ? (
                        <p className="block__info">{description}</p>
                    ) : null}
                    {action ? (
                        <a
                            {...linkProps}
                            className={`pixelgrade__btn btn block__box${
                                actionClassName ? ` ${actionClassName}` : ''
                            }`}
                            href={action.href}
                            rel={
                                action.target === '_blank'
                                    ? 'noopener noreferrer'
                                    : undefined
                            }
                            target={action.target}
                        >
                            {action.label}
                        </a>
                    ) : null}
                </div>

                <div className="pixelgrade__img section__img">
                    <img src={image.src} alt={image.alt} />
                </div>
            </div>
        </section>
    );
}
