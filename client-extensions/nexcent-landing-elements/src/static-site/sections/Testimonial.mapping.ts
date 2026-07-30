import type {TestimonialProps} from '@nexcent/ui';

import type {NxcTestimonialSources} from './Testimonial.sources';

export function mapNxcTestimonialProps(
    sources: NxcTestimonialSources
): TestimonialProps {
    return {
        action:
            sources.linkHref && sources.linkLabel
                ? {
                      href: sources.linkHref,
                      label: sources.linkLabel,
                      target:
                          sources.linkTarget === '_blank'
                              ? '_blank'
                              : '_self',
                  }
                : undefined,
        author: sources.author,
        image: {
            alt: sources.imageAlt,
            src: sources.imageUrl,
        },
        organization: sources.organization || undefined,
        partnerLogos: sources.showPartnerLogos
            ? sources.partnerLogos
                  .filter((logo) => Boolean(logo.url))
                  .map((logo) => ({
                      alt: logo.alt,
                      id: `testimonial-partner-${logo.slot}`,
                      src: logo.url,
                  }))
            : [],
        quote: sources.quote,
    };
}
