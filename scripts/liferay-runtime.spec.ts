import {expect, test} from '@playwright/test';

const baseUrl = process.env.LIFERAY_BASE_URL ?? 'http://127.0.0.1:8080';
const homeUrl = process.env.NEXCENT_HOME_URL ?? `${baseUrl}/web/next-gen-site/home`;
const runtimeUrl =
    process.env.NEXCENT_RUNTIME_URL ??
    `${baseUrl}/o/nexcent-react-runtime/index.js`;

const expectedElements = [
    'nexcent-contact-form',
    'nexcent-global-modal',
    'nexcent-react-clients',
    'nexcent-react-community',
    'nexcent-react-cta',
    'nexcent-react-feature-primary',
    'nexcent-react-feature-secondary',
    'nexcent-react-footer',
    'nexcent-react-header',
    'nexcent-react-hero',
    'nexcent-react-marketing',
    'nexcent-react-statistics',
    'nexcent-react-testimonial',
] as const;

const svgDataUrl =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="32"><rect width="96" height="32" rx="4" fill="#4caf4f"/><text x="48" y="21" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Nexcent</text></svg>'
    );

async function loadRuntime(page: import('@playwright/test').Page) {
    await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
    await page.addScriptTag({type: 'module', url: runtimeUrl});
    await page.waitForFunction(
        (names) => names.every((name) => Boolean(customElements.get(name))),
        expectedElements,
        {timeout: 60_000}
    );
}

test.describe.configure({mode: 'serial'});

test.describe('provisioned Nexcent site', () => {
    test('loads Home with attached runtime and seeded content', async ({page}) => {
        await page.goto(homeUrl, {waitUntil: 'domcontentloaded'});

        await page.waitForFunction(
            (names) => names.every((name) => Boolean(customElements.get(name))),
            expectedElements,
            {timeout: 60_000}
        );

        await expect(page.locator('nexcent-react-header')).toHaveCount(1);
        await expect(page.locator('nexcent-react-footer')).toHaveCount(1);
        await expect(page.locator('nexcent-global-modal')).toHaveCount(1);
        await expect(page.locator('nexcent-react-hero')).toHaveCount(1);
        await expect(page.locator('nexcent-react-community')).toHaveCount(1);
        await expect(page.locator('nexcent-react-marketing')).toHaveCount(1);

        await expect
            .poll(
                () =>
                    page.evaluate(() => {
                        const hero = document.querySelector(
                            'nexcent-react-hero'
                        );
                        return hero?.shadowRoot?.querySelectorAll(
                            '.home .swiper-slide, .home [data-hero-slide]'
                        ).length ?? 0;
                    }),
                {timeout: 60_000}
            )
            .toBeGreaterThan(0);

        await expect
            .poll(
                () =>
                    page.evaluate(() => {
                        const community = document.querySelector(
                            'nexcent-react-community'
                        );
                        return community?.shadowRoot?.querySelectorAll(
                            '.community__item, .community-card'
                        ).length ?? 0;
                    }),
                {timeout: 60_000}
            )
            .toBeGreaterThan(0);

        await expect
            .poll(
                () =>
                    page.evaluate(() => {
                        const marketing = document.querySelector(
                            'nexcent-react-marketing'
                        );
                        return marketing?.shadowRoot?.querySelectorAll(
                            '.community-updates__card, .marketing__item'
                        ).length ?? 0;
                    }),
                {timeout: 60_000}
            )
            .toBeGreaterThan(0);
    });
});

test.describe('isolated deployed runtime', () => {
    test.beforeEach(async ({page}) => {
        await loadRuntime(page);
    });

    test('registers every Nexcent custom element on a real Liferay page', async ({
        page,
    }) => {
        const registered = await page.evaluate(
            (names) => names.filter((name) => Boolean(customElements.get(name))),
            expectedElements
        );

        expect(registered).toEqual([...expectedElements]);
    });

    test('renders a production section inside the Liferay Shadow DOM boundary', async ({
        page,
    }) => {
        await page.evaluate(
            ({logoUrl}) => {
                const host = document.createElement('nexcent-react-clients');
                host.id = 'runtime-clients';
                host.setAttribute('title', 'Runtime clients');
                host.setAttribute(
                    'description',
                    'Rendered by the deployed client extension.'
                );
                host.setAttribute('logo-1-alt', 'Nexcent runtime logo');
                host.setAttribute('logo-1-url', logoUrl);
                host.setAttribute('show-ticker', 'false');
                document.body.append(host);
            },
            {logoUrl: svgDataUrl}
        );

        await expect
            .poll(
                () =>
                    page.evaluate(() => {
                        const host = document.querySelector('#runtime-clients');
                        return (
                            host?.shadowRoot?.querySelectorAll('.clients img')
                                .length ?? 0
                        );
                    }),
                {timeout: 30_000}
            )
            .toBe(1);

        const styleBoundaryPresent = await page.evaluate(() => {
            const host = document.querySelector('#runtime-clients');
            return Boolean(host?.shadowRoot?.querySelector('style'));
        });

        expect(styleBoundaryPresent).toBe(true);
    });

    test('renders signed-in Header data and toggles the account menu', async ({
        page,
    }) => {
        await page.evaluate(
            ({logoUrl}) => {
                const host = document.createElement('nexcent-react-header');
                host.id = 'runtime-header';
                host.setAttribute('logo-alt', 'Nexcent');
                host.setAttribute('logo-url', logoUrl);
                host.setAttribute('show-account-actions', 'true');

                const props = document.createElement('script');
                props.type = 'application/json';
                props.dataset.nexcentHeaderProps = '';
                props.textContent = JSON.stringify({
                    account: {
                        accountURL: '/group/control_panel/manage',
                        createAccountURL: '/web/guest/create-account',
                        displayName: 'Runtime Admin',
                        loginURL: '/c/portal/login',
                        logoutURL: '/c/portal/logout',
                        portraitURL: '',
                        signedIn: true,
                    },
                    navigation: [
                        {
                            children: [],
                            externalReferenceCode: 'HOME',
                            label: 'Home',
                            selected: true,
                            target: '_self',
                            url: '#runtime-home',
                        },
                    ],
                    site: {
                        homeURL: '/',
                        name: 'Nexcent',
                    },
                });
                host.append(props);
                document.body.append(host);
            },
            {logoUrl: svgDataUrl}
        );

        await expect
            .poll(() =>
                page.evaluate(() =>
                    Boolean(
                        document
                            .querySelector('#runtime-header')
                            ?.shadowRoot?.querySelector(
                                '.header__account-trigger'
                            )
                    )
                )
            )
            .toBe(true);

        await page.evaluate(() => {
            const button = document
                .querySelector('#runtime-header')
                ?.shadowRoot?.querySelector<HTMLButtonElement>(
                    '.header__account-trigger'
                );
            button?.click();
        });

        await expect
            .poll(() =>
                page.evaluate(() =>
                    document
                        .querySelector('#runtime-header')
                        ?.shadowRoot?.querySelector('.header__account-menu')
                        ?.classList.contains('is-open') ?? false
                )
            )
            .toBe(true);
    });

    test('loads Contact Form CAPTCHA from Liferay and exposes the request route', async ({
        page,
        request,
    }) => {
        const captchaResponse = await request.get(
            `${baseUrl}/o/captcha/v1.0/captcha/challenge`
        );
        expect(captchaResponse.status()).toBe(200);

        const challenge = (await captchaResponse.json()) as {
            image?: string;
            token?: string;
        };
        expect(challenge.image).toBeTruthy();
        expect(challenge.token).toBeTruthy();

        await page.evaluate(() => {
            const host = document.createElement('nexcent-contact-form');
            host.id = 'runtime-contact';
            host.setAttribute('title', 'Contact Nexcent');
            host.setAttribute('description', 'Runtime verification form');
            host.setAttribute('submit-label', 'Send request');
            host.setAttribute('submitting-text', 'Sending');
            host.setAttribute('success-message', 'Sent');
            host.setAttribute('error-message', 'Unable to send');
            document.body.append(host);
        });

        await expect(page.locator('#runtime-contact form')).toBeVisible({
            timeout: 30_000,
        });
        await expect(page.locator('#runtime-contact img')).toBeVisible({
            timeout: 30_000,
        });

        const routeResponse = await request.post(
            `${baseUrl}/o/nexcent-contact/v1.0/requests`,
            {
                data: {
                    captchaAnswer: 'invalid-runtime-answer',
                    captchaToken: challenge.token,
                    contactDetails: 'Runtime route verification request.',
                    emailAddress: 'runtime@example.com',
                    firstName: 'Runtime',
                    lastName: 'Check',
                },
            }
        );

        expect(routeResponse.status()).not.toBe(404);
        expect(routeResponse.status()).toBeLessThan(500);
    });

    test('opens Global Modal through delegated Liferay runtime and returns focus', async ({
        page,
    }) => {
        await page.evaluate(() => {
            const modal = document.createElement('nexcent-global-modal');
            modal.id = 'runtime-global-modal';
            document.body.append(modal);

            const trigger = document.createElement('button');
            trigger.id = 'runtime-modal-trigger';
            trigger.type = 'button';
            trigger.textContent = 'Open runtime details';
            trigger.setAttribute(
                'data-nxc-modal',
                JSON.stringify({
                    id: 'runtime-modal',
                    slots: {
                        description: {
                            value: 'Opened inside a deployed Liferay client extension.',
                        },
                        eyebrow: {value: 'Runtime verification'},
                        title: {value: 'Nexcent modal'},
                    },
                    version: 1,
                })
            );
            document.body.append(trigger);
            trigger.focus();
            trigger.click();
        });

        await expect
            .poll(
                () =>
                    page.evaluate(() =>
                        Boolean(
                            document
                                .querySelector('#runtime-global-modal')
                                ?.shadowRoot?.querySelector('[role="dialog"]')
                        )
                    ),
                {timeout: 30_000}
            )
            .toBe(true);

        await page.evaluate(() => {
            const closeButton = document
                .querySelector('#runtime-global-modal')
                ?.shadowRoot?.querySelector<HTMLButtonElement>(
                    '.nxc-global-modal__close'
                );
            closeButton?.click();
        });

        await expect
            .poll(() => page.evaluate(() => document.activeElement?.id))
            .toBe('runtime-modal-trigger');
    });
});
