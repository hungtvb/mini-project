import type {
    FooterNavigationItem,
    FooterProps,
    FooterSocialItem,
} from '@nexcent/ui';

import {resolveStaticAsset, type StaticAssetKey} from '../assets';
import type {NavigationItem} from '../site-shell/types';
import type {NxcFooterSources} from './Footer.sources';

const SOCIAL_ASSETS: Record<string, StaticAssetKey> = {
    dribbble: 'ball',
    instagram: 'instagram',
    twitter: 'twitter',
    twitterx: 'twitter',
    x: 'twitter',
    xcom: 'twitter',
    youtube: 'youtube',
    youtubechannel: 'youtube',
};

function normalizeSocialName(label: string): string {
    return label.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function mapTarget(
    target: string
): FooterNavigationItem['target'] | undefined {
    return target === '_blank' ||
        target === '_parent' ||
        target === '_self' ||
        target === '_top'
        ? target
        : undefined;
}

function mapNavigationItem(item: NavigationItem): FooterNavigationItem {
    return {
        children: item.children.map(mapNavigationItem),
        id: item.externalReferenceCode || `${item.label}-${item.url}`,
        label: item.label,
        target: mapTarget(item.target),
        url: item.url,
    };
}

function mapSocialItem(item: NavigationItem): FooterSocialItem {
    const asset = SOCIAL_ASSETS[normalizeSocialName(item.label)];

    return {
        ...mapNavigationItem(item),
        icon: asset
            ? {
                  alt: '',
                  src: resolveStaticAsset(asset),
              }
            : undefined,
    };
}

export function mapNxcFooterProps(
    sources: NxcFooterSources,
    submit: (email: string) => Promise<void>
): FooterProps {
    const {context, settings} = sources;

    return {
        companyHeading: settings.companyHeading || undefined,
        companyNavigation: context.companyNavigation.map(mapNavigationItem),
        copyrightText: settings.copyrightText || undefined,
        logo: settings.logoURL
            ? {
                  alt: settings.logoAlt || context.site.name,
                  src: settings.logoURL,
              }
            : undefined,
        newsletter:
            settings.showNewsletter &&
            settings.newsletterEndpoint &&
            settings.newsletterTitle
                ? {
                      errorText: settings.newsletterErrorText,
                      icon: {
                          alt: '',
                          src: resolveStaticAsset('email'),
                      },
                      placeholder: settings.newsletterPlaceholder,
                      submit,
                      submitLabel: settings.newsletterSubmitLabel,
                      submittingText: settings.newsletterSubmittingText,
                      successText: settings.newsletterSuccessText,
                      title: settings.newsletterTitle,
                  }
                : undefined,
        rightsText: settings.rightsText || undefined,
        site: {
            homeUrl: context.site.homeURL || '#',
            name: context.site.name,
        },
        socialNavigation: settings.showSocialLinks
            ? context.socialNavigation.map(mapSocialItem)
            : [],
        supportHeading: settings.supportHeading || undefined,
        supportNavigation: context.supportNavigation.map(mapNavigationItem),
    };
}
