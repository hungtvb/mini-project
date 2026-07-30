import {
    readBooleanSetting,
    readStringSetting,
} from '../runtime/fragmentSettings';

const PARTNER_LOGO_SLOTS = 6;

export type NxcTestimonialSources = {
    author: string;
    imageAlt: string;
    imageUrl: string;
    linkHref: string;
    linkLabel: string;
    linkTarget: string;
    organization: string;
    partnerLogos: Array<{
        alt: string;
        slot: number;
        url: string;
    }>;
    quote: string;
    showPartnerLogos: boolean;
};

export function readNxcTestimonialSources(
    host: HTMLElement | undefined
): NxcTestimonialSources {
    return {
        author: readStringSetting(host, 'author', ''),
        imageAlt: readStringSetting(host, 'image-alt', ''),
        imageUrl: readStringSetting(host, 'image-url', ''),
        linkHref: readStringSetting(host, 'link-url', ''),
        linkLabel: readStringSetting(host, 'link-label', ''),
        linkTarget: readStringSetting(host, 'link-target', '_self'),
        organization: readStringSetting(host, 'organization', ''),
        partnerLogos: Array.from(
            {length: PARTNER_LOGO_SLOTS},
            (_, index) => ({
                alt: readStringSetting(
                    host,
                    `partner-logo-${index + 1}-alt`,
                    ''
                ),
                slot: index + 1,
                url: readStringSetting(
                    host,
                    `partner-logo-${index + 1}-url`,
                    ''
                ),
            })
        ),
        quote: readStringSetting(host, 'quote', ''),
        showPartnerLogos: readBooleanSetting(
            host,
            'show-partner-logos',
            true
        ),
    };
}
