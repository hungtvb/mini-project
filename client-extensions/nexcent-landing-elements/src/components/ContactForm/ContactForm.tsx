import {
    ContactForm as ContactFormView,
    type ContactFormProps as ContactFormViewProps,
} from '@nexcent/ui';

import {
    loadCaptchaChallenge,
    submitContactRequest,
} from './ContactForm.api';
import './contact-form.scss';

export type ContactFormProps = Omit<
    ContactFormViewProps,
    'loadCaptchaChallenge' | 'submitContactRequest'
>;

export {validateContactField} from '@nexcent/ui';

export function ContactForm(props: ContactFormProps) {
    return (
        <ContactFormView
            {...props}
            loadCaptchaChallenge={loadCaptchaChallenge}
            submitContactRequest={submitContactRequest}
        />
    );
}
