import type {
    HeaderNavigationItem,
    HeaderProps,
} from '@nexcent/ui';

import type {NavigationItem} from '../site-shell/types';
import type {NxcHeaderSources} from './Header.sources';

function mapTarget(
    target: string
): HeaderNavigationItem['target'] | undefined {
    return target === '_blank' ||
        target === '_parent' ||
        target === '_self' ||
        target === '_top'
        ? target
        : undefined;
}

function mapNavigationItem(item: NavigationItem): HeaderNavigationItem {
    return {
        children: item.children.map(mapNavigationItem),
        id: item.externalReferenceCode || `${item.label}-${item.url}`,
        label: item.label,
        selected: item.selected,
        target: mapTarget(item.target),
        url: item.url,
    };
}

export function mapNxcHeaderProps(
    sources: NxcHeaderSources
): HeaderProps {
    const {context, settings} = sources;

    return {
        account: {
            accountUrl: context.account.accountURL || undefined,
            createAccountUrl:
                context.account.createAccountURL || undefined,
            displayName: context.account.displayName || undefined,
            loginUrl: context.account.loginURL || undefined,
            logoutUrl: context.account.logoutURL || undefined,
            portraitUrl: context.account.portraitURL || undefined,
            signedIn: context.account.signedIn,
        },
        labels: {
            login: settings.loginLabel,
            myAccount: settings.myAccountLabel,
            signOut: settings.signOutLabel,
            signUp: settings.signUpLabel,
        },
        logo: settings.logoURL
            ? {
                  alt: settings.logoAlt || context.site.name,
                  src: settings.logoURL,
              }
            : undefined,
        navigation: context.navigation.map(mapNavigationItem),
        showAccountActions: settings.showAccountActions,
        site: {
            homeUrl: context.site.homeURL || '#',
            name: context.site.name,
        },
    };
}
