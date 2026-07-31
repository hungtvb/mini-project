import type {
    CaptchaChallenge,
    ContactRequest,
} from '@nexcent/ui';

import {ApiError, portalFetch} from '../../api/http';

const CAPTCHA_API_PATH = '/o/captcha/v1.0/captcha/challenge';
const CONTACT_REQUEST_API_PATH = '/o/nexcent-contact/v1.0/requests';

export function loadCaptchaChallenge(): Promise<CaptchaChallenge> {
    return portalFetch<CaptchaChallenge>(CAPTCHA_API_PATH);
}

export async function submitContactRequest(
    request: ContactRequest
): Promise<void> {
    try {
        await portalFetch<unknown>(CONTACT_REQUEST_API_PATH, {
            body: JSON.stringify(request),
            method: 'POST',
        });
    }
    catch (cause) {
        if (cause instanceof ApiError && cause.responseBody) {
            try {
                const body = JSON.parse(cause.responseBody) as {
                    title?: string;
                };

                if (body.title) {
                    throw new Error(body.title);
                }
            }
            catch (parseError) {
                if (
                    parseError instanceof Error &&
                    !(parseError instanceof SyntaxError)
                ) {
                    throw parseError;
                }
            }
        }

        throw cause;
    }
}
