import type {AnchorHTMLAttributes} from 'react';

import {Testimonial} from '@nexcent/ui';

import {mapNxcTestimonialProps} from './Testimonial.mapping';
import {readNxcTestimonialSources} from './Testimonial.sources';

type HostProps = {
    host?: HTMLElement;
};

export function StaticTestimonial({host}: HostProps) {
    const props = mapNxcTestimonialProps(readNxcTestimonialSources(host));

    if (!props.quote || !props.author || !props.image.src) {
        return null;
    }

    const modalRule = JSON.stringify({
        id: 'featured-customer-story',
        slots: {
            description: {value: props.quote},
            eyebrow: {value: 'Customer story'},
            facts: [
                {
                    label: {value: 'Customer'},
                    value: {value: props.author},
                },
            ],
            media: {
                alt: props.image.alt,
                url: props.image.src,
            },
            title: {value: props.organization || props.author},
        },
        version: 1,
    });
    const actionProps = props.action
        ? ({
              'aria-haspopup': 'dialog',
              'data-nxc-modal': modalRule,
          } as AnchorHTMLAttributes<HTMLAnchorElement>)
        : undefined;

    return <Testimonial {...props} actionProps={actionProps} />;
}
