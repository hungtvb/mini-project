import type {Meta, StoryObj} from '@storybook/react-vite';

import {fixtureImage, primaryNavigation} from '../../stories/fixtures';
import {Header} from './Header';

const meta = {
    args: {
        account: {
            createAccountUrl: '#signup',
            loginUrl: '#login',
            signedIn: false,
        },
        labels: {
            login: 'Login',
            myAccount: 'My account',
            signOut: 'Sign out',
            signUp: 'Sign up',
        },
        logo: {
            alt: 'Nexcent',
            src: fixtureImage('Nexcent'),
        },
        navigation: primaryNavigation,
        showAccountActions: true,
        site: {
            homeUrl: '#home',
            name: 'Nexcent',
        },
    },
    component: Header,
    parameters: {layout: 'fullscreen'},
    tags: ['autodocs'],
    title: 'UI/Header',
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {};
export const SignedIn: Story = {
    args: {
        account: {
            accountUrl: '#account',
            displayName: 'Hung Tran',
            logoutUrl: '#logout',
            portraitUrl: fixtureImage('HT'),
            signedIn: true,
        },
    },
};
export const WithoutAccountActions: Story = {
    args: {showAccountActions: false},
};
