import type {Meta, StoryObj} from '@storybook/react-vite';

import '../../../../../client-extensions/nexcent-landing-elements/src/components/GlobalModal/global-modal.css';
import {fixtureImage} from '../../stories/fixtures';
import {GlobalModal} from './GlobalModal';

const meta = {
    args: {
        document: {
            id: 'storybook-modal',
            slots: {
                comparison: {
                    deltaValue: '1200',
                    direction: 'up',
                    percent: 5.25,
                    previousValue: '22800',
                },
                description:
                    'A fixture document verifies the reusable dialog without the Liferay EventBus adapter.',
                eyebrow: 'Customer story',
                facts: [
                    {label: 'Customer', value: 'Nexcent Community'},
                    {label: 'Region', value: 'Asia Pacific'},
                ],
                media: {
                    alt: 'Global Modal fixture',
                    url: fixtureImage('Modal'),
                },
                primaryValue: '24,000',
                title: 'A reusable Global Modal',
            },
            version: 1,
        },
        onClose: () => undefined,
    },
    argTypes: {
        onClose: {table: {disable: true}},
    },
    component: GlobalModal,
    parameters: {layout: 'fullscreen'},
    tags: ['autodocs'],
    title: 'UI/Global Modal',
} satisfies Meta<typeof GlobalModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMedia: Story = {};
export const WithoutMedia: Story = {
    args: {
        document: {
            id: 'storybook-modal-without-media',
            slots: {
                description: 'The same dialog also supports text-only documents.',
                title: 'Text-only modal',
            },
            version: 1,
        },
    },
};
