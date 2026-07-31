import {
    type MouseEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

export type HeaderNavigationItem = {
    children: HeaderNavigationItem[];
    id: string;
    label: string;
    selected?: boolean;
    target?: '_blank' | '_parent' | '_self' | '_top';
    url: string;
};

export type HeaderAccount = {
    accountUrl?: string;
    createAccountUrl?: string;
    displayName?: string;
    loginUrl?: string;
    logoutUrl?: string;
    portraitUrl?: string;
    signedIn: boolean;
};

export type HeaderProps = {
    account: HeaderAccount;
    labels: {
        login: string;
        myAccount: string;
        signOut: string;
        signUp: string;
    };
    logo?: {
        alt: string;
        src: string;
    };
    navigation: readonly HeaderNavigationItem[];
    onNavigate?: (
        event: MouseEvent<HTMLAnchorElement>,
        item: HeaderNavigationItem
    ) => void;
    showAccountActions?: boolean;
    site: {
        homeUrl: string;
        name: string;
    };
};

function NavigationList({
    items,
    onNavigate,
    root = false,
}: {
    items: readonly HeaderNavigationItem[];
    onNavigate: (
        event: MouseEvent<HTMLAnchorElement>,
        item: HeaderNavigationItem
    ) => void;
    root?: boolean;
}) {
    return (
        <ul className={root ? 'header__navigation-list' : 'header__submenu'}>
            {items.map((item) => (
                <li className={item.selected ? 'is-selected' : undefined} key={item.id}>
                    <a
                        aria-current={item.selected ? 'page' : undefined}
                        href={item.url}
                        onClick={(event) => onNavigate(event, item)}
                        rel={
                            item.target === '_blank'
                                ? 'noopener noreferrer'
                                : undefined
                        }
                        target={item.target}
                    >
                        {item.label}
                    </a>
                    <span className="decor-line" />
                    {item.children.length > 0 ? (
                        <NavigationList
                            items={item.children}
                            onNavigate={onNavigate}
                        />
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

export function Header({
    account,
    labels,
    logo,
    navigation,
    onNavigate,
    showAccountActions = true,
    site,
}: HeaderProps) {
    const [accountOpen, setAccountOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const initials = useMemo(
        () =>
            (account.displayName || '')
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('') || 'U',
        [account.displayName]
    );

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setAccountOpen(false);
                setMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const closeNavigation = () => {
        setAccountOpen(false);
        setMenuOpen(false);
    };

    const handleNavigation = (
        event: MouseEvent<HTMLAnchorElement>,
        item: HeaderNavigationItem
    ) => {
        closeNavigation();
        onNavigate?.(event, item);
    };

    const homeItem: HeaderNavigationItem = {
        children: [],
        id: 'NXC-HOME',
        label: site.name,
        url: site.homeUrl,
    };

    return (
        <header className="header">
            <div className="header__container">
                <a
                    className="header__logo"
                    href={site.homeUrl}
                    onClick={(event) => handleNavigation(event, homeItem)}
                >
                    {logo?.src ? (
                        <img src={logo.src} alt={logo.alt} />
                    ) : (
                        <span>{site.name}</span>
                    )}
                </a>

                <button
                    aria-controls="nexcent-react-navigation"
                    aria-expanded={menuOpen}
                    aria-label={
                        menuOpen ? 'Close navigation' : 'Open navigation'
                    }
                    className={`header__burger-menu${menuOpen ? ' active' : ''}`}
                    onClick={() => setMenuOpen((value) => !value)}
                    type="button"
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div
                    className={`header__menu${menuOpen ? ' active' : ''}`}
                    id="nexcent-react-navigation"
                >
                    {navigation.length > 0 ? (
                        <nav aria-label="Primary navigation">
                            <NavigationList
                                items={navigation}
                                onNavigate={handleNavigation}
                                root
                            />
                        </nav>
                    ) : null}

                    {showAccountActions ? (
                        <div className="header__btns">
                            {account.signedIn ? (
                                <div className="header__account">
                                    <button
                                        aria-expanded={accountOpen}
                                        className="header__account-trigger"
                                        onClick={() =>
                                            setAccountOpen((value) => !value)
                                        }
                                        type="button"
                                    >
                                        {account.portraitUrl ? (
                                            <img
                                                alt=""
                                                className="header__account-avatar"
                                                src={account.portraitUrl}
                                            />
                                        ) : (
                                            <span
                                                aria-hidden="true"
                                                className="header__account-initials"
                                            >
                                                {initials}
                                            </span>
                                        )}
                                        {account.displayName ? (
                                            <span className="header__account-name">
                                                {account.displayName}
                                            </span>
                                        ) : null}
                                        <span aria-hidden="true">▾</span>
                                    </button>

                                    <div
                                        className={`header__account-menu${
                                            accountOpen ? ' is-open' : ''
                                        }`}
                                    >
                                        {account.accountUrl ? (
                                            <a
                                                href={account.accountUrl}
                                                onClick={closeNavigation}
                                            >
                                                {labels.myAccount}
                                            </a>
                                        ) : null}
                                        {account.logoutUrl ? (
                                            <a
                                                href={account.logoutUrl}
                                                onClick={closeNavigation}
                                            >
                                                {labels.signOut}
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {account.loginUrl ? (
                                        <a
                                            className="btn btn-light"
                                            href={account.loginUrl}
                                            onClick={closeNavigation}
                                        >
                                            {labels.login}
                                        </a>
                                    ) : null}
                                    {account.createAccountUrl ? (
                                        <a
                                            className="btn"
                                            href={account.createAccountUrl}
                                            onClick={closeNavigation}
                                        >
                                            {labels.signUp}
                                        </a>
                                    ) : null}
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
