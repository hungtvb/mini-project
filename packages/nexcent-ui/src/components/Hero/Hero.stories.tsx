import type {Meta, StoryObj} from '@storybook/react-vite';

import {heroSlides} from '../../stories/fixtures';
import {Hero} from './Hero';

const meta = {
    args: {
        autoplay: false,
        intervalMs: 3000,
        pauseOnHover: true,
        showPagination: true,
        slides: heroSlides,
    },
    component: Hero,
    tags: ['autodocs'],
    title: 'UI/Hero',
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleSlide: Story = {args: {slides: heroSlides.slice(0, 1)}};
