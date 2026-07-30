import {
    readBooleanSetting,
    readStringSetting,
} from '../runtime/fragmentSettings';
import type {NavigationItem} from '../site-shell/types';

export type FooterRuntimeContext = {
    companyNavigation: NavigationItem[];
    site: {
        homeURL: string;
        name: string;
    };
    socialNavigation: NavigationItem[];
    supportNavigation: NavigationItem[];
};

export type FooterSettingsSource = {
    companyHeading: string;
    copyrightText: string;
    logoAlt: string;
    logoURL: string;
    newsletterEndpoint: string;
    newsletterErrorText: string;
    newsletterPlaceholder: string;
    newsletterSubmitLabel: string;
    newsletterSubmittingText: string;
    newsletterSuccessText: string;
    newsletterTitle: string;
    rightsText: string;
    showNewsletter: boolean;
    showSocialLinks: boolean;
    supportHeading: string;
};

export type NxcFooterSources = {
    context: FooterRuntimeContext;
    settings: FooterSettingsSource;
};

export type NxcFooterSourceState =
    | {sources: NxcFooterSources; status: 'ready'}
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

function normalizeNavigation(value: unknown, prefix: string): NavigationItem[] {
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

function readRuntimeContext(host: HTMLElement): FooterRuntimeContext {
    const script = host.querySelector<HTMLScriptElement>(
        'script[data-nexcent-footer-props]'
    );

    if (!script?.textContent?.trim()) {
        throw new Error('Missing embedded Footer Fragment props.');
    }

    const value = JSON.parse(script.textContent) as Record<string, unknown>;
    const site =
        value.site && typeof value.site === 'object'
            ? (value.site as Record<string, unknown>)
            : {};

    return {
        companyNavigation: normalizeNavigation(
            value.companyNavigation,
            'NXC-COMPANY'
        ),
        site: {
            homeURL:
                typeof site.homeURL === 'string' ? site.homeURL.trim() : '',
            name: typeof site.name === 'string' ? site.name.trim() : '',
        },
        socialNavigation: normalizeNavigation(
            value.socialNavigation,
            'NXC-SOCIAL'
        ),
        supportNavigation: normalizeNavigation(
            value.supportNavigation,
            'NXC-SUPPORT'
        ),
    };
}

function readSettings(host: HTMLElement): FooterSettingsSource {
    return {
        companyHeading: readStringSetting(host, 'company-heading', ''),
        copyrightText: readStringSetting(host, 'copyright-text', ''),
        logoAlt: readStringSetting(host, 'logo-alt', ''),
        logoURL: readStringSetting(host, 'logo-url', ''),
        newsletterEndpoint: readStringSetting(
            host,
            'newsletter-endpoint',
            '/o/c/nxcnewslettersubscriptions'
        ),
        newsletterErrorText: readStringSetting(
            host,
            'newsletter-error-text',
            'Subscription failed. Please try again.'
        ),
        newsletterPlaceholder: readStringSetting(
            host,
            'newsletter-placeholder',
            'Your email address'
        ),
        newsletterSubmitLabel: readStringSetting(
            host,
            'newsletter-submit-label',
            'Subscribe'
        ),
        newsletterSubmittingText: readStringSetting(
            host,
            'newsletter-submitting-text',
            'Submitting…'
        ),
        newsletterSuccessText: readStringSetting(
            host,
            'newsletter-success-text',
            'Thank you for subscribing.'
        ),
        newsletterTitle: readStringSetting(host, 'newsletter-title', ''),
        rightsText: readStringSetting(host, 'rights-text', ''),
        showNewsletter: readBooleanSetting(host, 'show-newsletter', true),
        showSocialLinks: readBooleanSetting(host, 'show-social-links', true),
        supportHeading: readStringSetting(host, 'support-heading', ''),
    };
}

export function readNxcFooterSources(
    host: HTMLElement | undefined
): NxcFooterSourceState {
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
                    : new Error('Invalid embedded Footer Fragment props.'),
            status: 'error',
        };
    }
}
