import type {Meta, StoryObj} from '@storybook/react-vite';

import {ContactForm} from '@nexcent/ui';

const captchaImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50"><rect width="100%" height="100%" fill="#f5f7fa"/><text x="24" y="33" font-family="sans-serif" font-size="24" fill="#263238">NXC42</text></svg>'
)}`;

const meta = {
    args: {
        description:
            'Tell us what you are working on and our team will get back to you.',
        errorMessage: 'We could not send your message. Please try again.',
        loadCaptchaChallenge: async () => ({
            image: captchaImage,
            token: 'storybook-captcha-token',
        }),
        submitContactRequest: async () => undefined,
        submitLabel: 'Submit',
        submittingText: 'Sending...',
        successMessage: 'Thanks! Your message has been sent.',
        title: 'Contact us',
    },
    argTypes: {
        description: {control: 'text'},
        errorMessage: {control: 'text'},
        loadCaptchaChallenge: {table: {disable: true}},
        submitContactRequest: {table: {disable: true}},
        submitLabel: {control: 'text'},
        submittingText: {control: 'text'},
        successMessage: {control: 'text'},
        title: {control: 'text'},
    },
    component: ContactForm,
    parameters: {
        docs: {
            description: {
                component:
                    'API-agnostic Contact Form. Storybook supplies fixture CAPTCHA and submission capabilities; production injects Liferay adapters.',
            },
        },
    },
    tags: ['autodocs'],
    title: 'Components/Contact Form',
} satisfies Meta<typeof ContactForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
    args: {
        description:
            'Share your project goals, timeline, platform requirements, and any integration constraints. Our team will review the details and contact you.',
        title: 'Build your next digital experience with Nexcent',
    },
};
