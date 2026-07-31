import type {
    ClientLogo,
    CommunityItem,
    FooterNavigationItem,
    FooterSocialItem,
    HeaderNavigationItem,
    HeroSlide,
    MarketingItem,
    StatisticItem,
    TestimonialLogo,
} from '../index';

export function fixtureImage(label: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#f5f7fa"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#263238">${label}</text></svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const heroSlides: HeroSlide[] = [
    {
        action: {href: '#demo', label: 'Register', target: '_self'},
        description: 'Fixture content used only by Storybook.',
        highlight: 'from eight years',
        id: 'hero-1',
        image: {alt: 'Hero fixture', src: fixtureImage('Hero')},
        title: 'Lessons and insights',
    },
    {
        action: {href: '#learn', label: 'Learn more', target: '_self'},
        description: 'A second slide verifies carousel behavior.',
        highlight: 'for growing teams',
        id: 'hero-2',
        image: {alt: 'Second hero fixture', src: fixtureImage('Hero 2')},
        title: 'Build a stronger community',
    },
];

export const clientLogos: ClientLogo[] = Array.from({length: 6}, (_, index) => ({
    alt: `Client ${index + 1}`,
    id: `client-${index + 1}`,
    src: fixtureImage(`C${index + 1}`),
}));

export const communityItems: CommunityItem[] = [
    'Membership organisations',
    'National associations',
    'Clubs and groups',
].map((title, index) => ({
    description: 'Storybook fixture description for this community solution.',
    id: `community-${index + 1}`,
    image: {alt: title, src: fixtureImage(`S${index + 1}`)},
    title,
}));

export const statisticItems: StatisticItem[] = [
    ['2,245,341', 'Members'],
    ['46,328', 'Clubs'],
    ['828,867', 'Event bookings'],
    ['1,926,436', 'Payments'],
].map(([value, label], index) => ({
    id: `stat-${index + 1}`,
    image: {alt: label, src: fixtureImage(`${index + 1}`)},
    label,
    value,
}));

export const marketingItems: MarketingItem[] = [1, 2, 3].map((index) => ({
    action: {href: '#article', label: 'Read more', target: '_self'},
    id: `article-${index}`,
    image: {alt: `Article ${index}`, src: fixtureImage(`Article ${index}`)},
    title: `Storybook article fixture ${index}`,
}));

export const partnerLogos: TestimonialLogo[] = clientLogos.slice(0, 4);

export const primaryNavigation: HeaderNavigationItem[] = [
    {children: [], id: 'home', label: 'Home', selected: true, url: '#home'},
    {children: [], id: 'services', label: 'Services', url: '#services'},
    {children: [], id: 'features', label: 'Features', url: '#features'},
];

export const footerNavigation: FooterNavigationItem[] = [
    {children: [], id: 'about', label: 'About us', url: '#about'},
    {children: [], id: 'contact', label: 'Contact us', url: '#contact'},
];

export const socialNavigation: FooterSocialItem[] = [
    {
        children: [],
        icon: {alt: '', src: fixtureImage('I')},
        id: 'instagram',
        label: 'Instagram',
        target: '_blank',
        url: '#instagram',
    },
];
