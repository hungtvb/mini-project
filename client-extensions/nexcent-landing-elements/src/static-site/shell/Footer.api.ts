import {portalFetch} from '../../api/http';

export async function submitNewsletter(
    endpoint: string,
    email: string
): Promise<void> {
    await portalFetch<unknown>(endpoint, {
        body: JSON.stringify({
            consent: true,
            email,
            locale: document.documentElement.lang || navigator.language,
            sourcePage: window.location.pathname,
        }),
        method: 'POST',
    });
}
