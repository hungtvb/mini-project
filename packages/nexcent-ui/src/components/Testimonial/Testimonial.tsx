import type {AnchorHTMLAttributes} from 'react';

export type TestimonialLogo = {
    alt: string;
    id: string;
    src: string;
};

export type TestimonialProps = {
    action?: {
        href: string;
        label: string;
        target?: '_blank' | '_self';
    };
    actionProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
    author: string;
    image: {
        alt: string;
        src: string;
    };
    organization?: string;
    partnerLogos?: readonly TestimonialLogo[];
    quote: string;
};

export function Testimonial({
    action,
    actionProps,
    author,
    image,
    organization,
    partnerLogos = [],
    quote,
}: TestimonialProps) {
    if (!quote || !author || !image.src) {
        return null;
    }

    const {className: actionClassName, ...linkProps} = actionProps ?? {};

    return (
        <section className="customers" id="testimonial">
            <div className="customers__container block">
                <div className="customers__item block__item">
                    <p className="customers__info block__info">{quote}</p>
                    <p className="customers__box block__box mt">{author}</p>
                    {organization ? (
                        <p className="customers__text">{organization}</p>
                    ) : null}

                    {partnerLogos.length > 0 || action ? (
                        <div className="customers__partner ticker">
                            <div className="customers__wrapper">
                                {partnerLogos.length > 0 ? (
                                    <div className="customers__items ticker__items">
                                        {partnerLogos.map((logo) => (
                                            <div
                                                className="customers__icon ticker__item"
                                                key={logo.id}
                                            >
                                                <img src={logo.src} alt={logo.alt} />
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                                {action ? (
                                    <div className="customers__btn">
                                        <a
                                            {...linkProps}
                                            className={`btn__wrapper${
                                                actionClassName
                                                    ? ` ${actionClassName}`
                                                    : ''
                                            }`}
                                            href={action.href}
                                            rel={
                                                action.target === '_blank'
                                                    ? 'noopener noreferrer'
                                                    : undefined
                                            }
                                            target={action.target}
                                        >
                                            {action.label} &nbsp; →
                                        </a>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="customers__img img">
                    <img src={image.src} alt={image.alt} />
                </div>
            </div>
        </section>
    );
}
