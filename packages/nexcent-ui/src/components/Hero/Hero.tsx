import {useEffect, useMemo, useState} from 'react';

export type HeroAction = {
    href: string;
    label: string;
    target?: '_blank' | '_self';
};

export type HeroSlide = {
    action?: HeroAction;
    description?: string;
    highlight?: string;
    id: string;
    image: {
        alt: string;
        src: string;
    };
    title: string;
};

export type HeroProps = {
    autoplay?: boolean;
    intervalMs?: number;
    pauseOnHover?: boolean;
    showPagination?: boolean;
    slides: readonly HeroSlide[];
};

export function Hero({
    autoplay = true,
    intervalMs = 3000,
    pauseOnHover = true,
    showPagination = true,
    slides,
}: HeroProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduceMotion = useMemo(
        () =>
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        []
    );

    useEffect(() => {
        if (activeIndex >= slides.length) {
            setActiveIndex(0);
        }
    }, [activeIndex, slides.length]);

    useEffect(() => {
        if (!autoplay || paused || reduceMotion || slides.length < 2) {
            return;
        }

        const timer = window.setInterval(() => {
            setActiveIndex((index) => (index + 1) % slides.length);
        }, intervalMs);

        return () => window.clearInterval(timer);
    }, [autoplay, intervalMs, paused, reduceMotion, slides.length]);

    const slide = slides[activeIndex] ?? slides[0];

    if (!slide) {
        return null;
    }

    return (
        <section className="home" id="home">
            <div className="home__container">
                <div
                    className="swiper mySwiper"
                    onMouseEnter={() => pauseOnHover && setPaused(true)}
                    onMouseLeave={() => pauseOnHover && setPaused(false)}
                >
                    <div className="swiper-wrapper">
                        <div className="swiper-slide nxc-react-fade" key={slide.id}>
                            <div className="home__slide block">
                                <div className="home__info block__item">
                                    <h1 className="block__title big-fs">
                                        {slide.title}{' '}
                                        {slide.highlight ? (
                                            <span className="bright-headline">
                                                {slide.highlight}
                                            </span>
                                        ) : null}
                                    </h1>
                                    {slide.description ? (
                                        <p className="block__info">{slide.description}</p>
                                    ) : null}
                                    {slide.action ? (
                                        <a
                                            className="home__btn btn block__box"
                                            href={slide.action.href}
                                            rel={
                                                slide.action.target === '_blank'
                                                    ? 'noopener noreferrer'
                                                    : undefined
                                            }
                                            target={slide.action.target}
                                        >
                                            {slide.action.label}
                                        </a>
                                    ) : null}
                                </div>
                                <div className="home__img img">
                                    <img src={slide.image.src} alt={slide.image.alt} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {showPagination && slides.length > 1 ? (
                        <div
                            aria-label="Choose hero slide"
                            className="swiper-pagination"
                            role="group"
                        >
                            {slides.map((item, index) => (
                                <button
                                    aria-label={`Show slide ${index + 1}: ${item.title}`}
                                    aria-pressed={index === activeIndex}
                                    className={`swiper-pagination-bullet${
                                        index === activeIndex
                                            ? ' swiper-pagination-bullet-active'
                                            : ''
                                    }`}
                                    key={item.id}
                                    onClick={() => setActiveIndex(index)}
                                    type="button"
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
