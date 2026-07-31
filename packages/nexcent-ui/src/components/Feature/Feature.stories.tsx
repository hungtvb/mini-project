import type {Meta, StoryObj} from '@storybook/react-vite';

import {fixtureImage} from '../../stories/fixtures';
import {Feature} from './Feature';

const meta = {
    args: {
        action: {
            href: '#learn-more',
            label: 'Learn more',
            target: '_self',
        },
        description:
            'A Storybook fixture that verifies the reusable feature layout without Liferay runtime data.',
        image: {
            alt: 'Feature fixture illustration',
            src: fixtureImage('Feature'),
        },
        sectionId: 'features',
        title: 'The unseen work behind a successful community platform',
    },
    component: Feature,
    tags: ['autodocs'],
    title: 'UI/Feature',
} satisfies Meta<typeof Feature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = {
    args: {
        image: {
            alt: 'Secondary feature fixture',
            src: fixtureImage('Feature 2'),
        },
        sectionId: undefined,
        title: 'Design a footer that helps visitors find their next step',
    },
};
