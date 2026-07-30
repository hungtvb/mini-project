import type {Meta, StoryObj} from '@storybook/react-vite';

import {fixtureImage} from '../../stories/fixtures';
import {ContactForm} from './ContactForm';

const meta = {
    args: {
        description:
            'Tell us what you are working on and our team will get back to you.',
        errorMessage: 'We could not send your message. Please try again.',
        loadCaptchaChallenge: async () => ({
            image: fixtureImage('NXC42'),
            token: 'storybook-captcha-token',
        }),
        submitContactRequest: async () => undefined,
        submitLabel: 'Submit',
        submittingText: 'Sending…',
        successMessage: 'Thanks! Your message has been sent.',
        title: 'Contact us',
    },
    argTypes: {
        loadCaptchaChallenge: {table: {disable: true}},
        submitContactRequest: {table: {disable: true}},
    },
    component: ContactForm,
    tags: ['autodocs'],
    title: 'UI/Contact Form',
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SubmissionError: Story = {
    args: {
        submitContactRequest: async () => {
            throw new Error('The Storybook submission fixture failed.');
        },
    },
};
