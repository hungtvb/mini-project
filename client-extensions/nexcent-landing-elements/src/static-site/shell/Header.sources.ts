import {
    readBooleanSetting,
    readStringSetting,
} from '../runtime/fragmentSettings';
import type {AccountContext, NavigationItem} from '../site-shell/types';

export type HeaderRuntimeContext = {
    account: AccountContext;
    navigation: NavigationItem[];
    site: {
        homeURL: string;
        name: string;
    };
};

export type HeaderSettingsSource = {
    loginLabel: string;
    logoAlt: string;
    logoURL: string;
    myAccountLabel: string;
    showAccountActions: boolean;
    signOutLabel: string;
    signUpLabel: string;
};

export type NxcHeaderSources = {
    context: HeaderRuntimeContext;
    settings: HeaderSettingsSource;
};

export type NxcHeaderSourceState =
    | {sources: NxcHeaderSources; status: 'ready'}
    | {status: 'empty'}
    | {error: Error; status: 'error'};

function normalizeTarget(value: unknown): string {
    if (typeof value !== 'string') {
        return '';
    }

    if (value.includes('_blank')) {
        return '_blank';
    }

    if (value.includes('_parent')) {
        return '_parent';
    }

    if (value.includes('_top')) {
        return '_top';
    }

    return value.includes('_self') ? '_self' : '';
}

function normalizeNavigation(
    value: unknown,
    prefix = 'NXC-NAV'
): NavigationItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item): item is Record<string, unknown> =>
                Boolean(item && typeof item === 'object')
        )
        .map((item, index) => ({
            children: normalizeNavigation(
                item.children,
                `${prefix}-${index + 1}`
            ),
            externalReferenceCode:
                typeof item.externalReferenceCode === 'string' &&
                item.externalReferenceCode
                    ? item.externalReferenceCode
                    : `${prefix}-${index + 1}`,
            label: typeof item.label === 'string' ? item.label.trim() : '',
            selected: item.selected === true,
            target: normalizeTarget(item.target),
            url:
                typeof item.url === 'string' && item.url.trim()
                    ? item.url.trim()
                    : '#',
        }))
        .filter((item) => Boolean(item.label));
}

function readRuntimeContext(host: HTMLElement): HeaderRuntimeContext {
    const script = host.querySelector<HTMLScriptElement>(
        'script[data-nexcent-header-props]'
    );

    if (!script?.textContent?.trim()) {
        throw new Error('Missing embedded Header Fragment props.');
    }

    const value = JSON.parse(script.textContent) as Record<string, unknown>;
    const account =
        value.account && typeof value.account === 'object'
            ? (value.account as Record<string, unknown>)
            : {};
    const site =
        value.site && typeof value.site === 'object'
            ? (value.site as Record<string, unknown>)
            : {};

    return {
        account: {
            accountURL:
                typeof account.accountURL === 'string'
                    ? account.accountURL.trim()
                    : '',
            createAccountURL:
                typeof account.createAccountURL === 'string'
                    ? account.createAccountURL.trim()
                    : '',
            displayName:
                typeof account.displayName === 'string'
                    ? account.displayName.trim()
                    : '',
            emailAddress:
                typeof account.emailAddress === 'string'
                    ? account.emailAddress.trim()
                    : '',
            loginURL:
                typeof account.loginURL === 'string'
                    ? account.loginURL.trim()
                    : '',
            logoutURL:
                typeof account.logoutURL === 'string'
                    ? account.logoutURL.trim()
                    : '',
            portraitURL:
                typeof account.portraitURL === 'string'
                    ? account.portraitURL.trim()
                    : '',
            signedIn: account.signedIn === true,
        },
        navigation: normalizeNavigation(value.navigation),
        site: {
            homeURL:
                typeof site.homeURL === 'string' ? site.homeURL.trim() : '',
            name: typeof site.name === 'string' ? site.name.trim() : '',
        },
    };
}

function readSettings(host: HTMLElement): HeaderSettingsSource {
    return {
        loginLabel: readStringSetting(host, 'login-label', 'Login'),
        logoAlt: readStringSetting(host, 'logo-alt', ''),
        logoURL: readStringSetting(host, 'logo-url', ''),
        myAccountLabel: readStringSetting(
            host,
            'my-account-label',
            'My Account'
        ),
        showAccountActions: readBooleanSetting(
            host,
            'show-account-actions',
            true
        ),
        signOutLabel: readStringSetting(host, 'sign-out-label', 'Sign out'),
        signUpLabel: readStringSetting(host, 'sign-up-label', 'Sign up'),
    };
}

export function readNxcHeaderSources(
    host: HTMLElement | undefined
): NxcHeaderSourceState {
    if (!host) {
        return {status: 'empty'};
    }

    try {
        return {
            sources: {
                context: readRuntimeContext(host),
                settings: readSettings(host),
            },
            status: 'ready',
        };
    }
    catch (cause) {
        return {
            error:
                cause instanceof Error
                    ? cause
                    : new Error('Invalid embedded Header Fragment props.'),
            status: 'error',
        };
    }
}
