import {
    type FormEvent,
    type MouseEvent,
    useId,
    useState,
} from 'react';

export type FooterNavigationItem = {
    children: FooterNavigationItem[];
    id: string;
    label: string;
    target?: '_blank' | '_parent' | '_self' | '_top';
    url: string;
};

export type FooterSocialItem = FooterNavigationItem & {
    icon?: {
        alt: string;
        src: string;
    };
};

export type FooterNewsletter = {
    errorText: string;
    icon?: {
        alt: string;
        src: string;
    };
    placeholder: string;
    submit: (email: string) => Promise<void>;
    submitLabel: string;
    submittingText: string;
    successText: string;
    title: string;
};

export type FooterProps = {
    companyHeading?: string;
    companyNavigation: readonly FooterNavigationItem[];
    copyrightText?: string;
    logo?: {
        alt: string;
        src: string;
    };
    newsletter?: FooterNewsletter;
    onNavigate?: (
        event: MouseEvent<HTMLAnchorElement>,
        item: FooterNavigationItem
    ) => void;
    rightsText?: string;
    site: {
        homeUrl: string;
        name: string;
    };
    socialNavigation?: readonly FooterSocialItem[];
    supportHeading?: string;
    supportNavigation: readonly FooterNavigationItem[];
};

function FooterNavigation({
    items,
    onNavigate,
}: {
    items: readonly FooterNavigationItem[];
    onNavigate?: FooterProps['onNavigate'];
}) {
    return (
        <ul className="footer__navigation">
            {items.map((item) => (
                <li key={item.id}>
                    <a
                        href={item.url}
                        onClick={(event) => onNavigate?.(event, item)}
                        rel={
                            item.target === '_blank'
                                ? 'noopener noreferrer'
                                : undefined
                        }
                        target={item.target}
                    >
                        {item.label}
                    </a>
                    {item.children.length > 0 ? (
                        <FooterNavigation
                            items={item.children}
                            onNavigate={onNavigate}
                        />
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

function NewsletterForm({newsletter}: {newsletter: FooterNewsletter}) {
    const id = useId();
    const [state, setState] = useState<
        'error' | 'idle' | 'submitting' | 'success'
    >('idle');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const email = String(new FormData(form).get('email') ?? '').trim();

        if (!email) {
            return;
        }

        setState('submitting');

        try {
            await newsletter.submit(email);
            form.reset();
            setState('success');
        }
        catch (cause) {
            console.warn('[Nexcent Newsletter]', cause);
            setState('error');
        }
    };

    return (
        <div className="footer__item footer__submit">
            <h3>{newsletter.title}</h3>
            <form className="footer__form" onSubmit={handleSubmit}>
                <div>
                    <label className="sr-only" htmlFor={id}>
                        {newsletter.placeholder}
                    </label>
                    <input
                        autoComplete="email"
                        disabled={state === 'submitting'}
                        id={id}
                        name="email"
                        placeholder={newsletter.placeholder}
                        required
                        type="email"
                    />
                    <button
                        aria-label={newsletter.submitLabel}
                        disabled={state === 'submitting'}
                        type="submit"
                    >
                        {newsletter.icon ? (
                            <span className="footer__form-icon">
                                <img
                                    aria-hidden="true"
                                    alt={newsletter.icon.alt}
                                    src={newsletter.icon.src}
                                />
                            </span>
                        ) : (
                            <span aria-hidden="true">→</span>
                        )}
                    </button>
                </div>
                <p
                    aria-live="polite"
                    className={`footer__form-status footer__form-status--${state}`}
                >
                    {state === 'submitting'
                        ? newsletter.submittingText
                        : null}
                    {state === 'success' ? newsletter.successText : null}
                    {state === 'error' ? newsletter.errorText : null}
                </p>
            </form>
        </div>
    );
}

export function Footer({
    companyHeading,
    companyNavigation,
    copyrightText,
    logo,
    newsletter,
    onNavigate,
    rightsText,
    site,
    socialNavigation = [],
    supportHeading,
    supportNavigation,
}: FooterProps) {
    const hasContent =
        Boolean(logo?.src || site.name || copyrightText || rightsText) ||
        companyNavigation.length > 0 ||
        supportNavigation.length > 0 ||
        socialNavigation.length > 0 ||
        Boolean(newsletter);

    if (!hasContent) {
        return null;
    }

    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__box">
                    <a className="footer__logo" href={site.homeUrl}>
                        {logo?.src ? (
                            <img src={logo.src} alt={logo.alt} />
                        ) : (
                            <span>{site.name}</span>
                        )}
                    </a>
                    {copyrightText ? <p>{copyrightText}</p> : null}
                    {rightsText ? <p>{rightsText}</p> : null}

                    {socialNavigation.length > 0 ? (
                        <div className="footer__social social">
                            {socialNavigation.map((item) => (
                                <a
                                    aria-label={item.label}
                                    href={item.url}
                                    key={item.id}
                                    rel={
                                        item.target === '_blank'
                                            ? 'noopener noreferrer'
                                            : undefined
                                    }
                                    target={item.target}
                                >
                                    {item.icon ? (
                                        <img
                                            aria-hidden="true"
                                            alt={item.icon.alt}
                                            src={item.icon.src}
                                        />
                                    ) : (
                                        <span aria-hidden="true">
                                            {item.label.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </a>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="footer__items">
                    {companyNavigation.length > 0 ? (
                        <div className="footer__item">
                            {companyHeading ? <h3>{companyHeading}</h3> : null}
                            <FooterNavigation
                                items={companyNavigation}
                                onNavigate={onNavigate}
                            />
                        </div>
                    ) : null}

                    {supportNavigation.length > 0 ? (
                        <div className="footer__item">
                            {supportHeading ? <h3>{supportHeading}</h3> : null}
                            <FooterNavigation
                                items={supportNavigation}
                                onNavigate={onNavigate}
                            />
                        </div>
                    ) : null}

                    {newsletter ? (
                        <NewsletterForm newsletter={newsletter} />
                    ) : null}
                </div>
            </div>
        </footer>
    );
}
