export type CtaAction = {
    href: string;
    label: string;
    target?: '_blank' | '_self';
};

export type CtaProps = {
    action?: CtaAction;
    title: string;
};

export function Cta({action, title}: CtaProps) {
    if (!title) {
        return null;
    }

    return (
        <section className="suscipit" id="faq">
            <div className="suscipit__container block">
                <div className="suscipit__info block__item">
                    <h2 className="block__title big-fs">{title}</h2>
                    {action ? (
                        <a
                            className="suscipit__btn btn block__box"
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
                    ) : null}
                </div>
            </div>
        </section>
    );
}
