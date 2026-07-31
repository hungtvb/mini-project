import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useCallback,
    useEffect,
    useId,
    useState,
} from 'react';

export type ContactFormValues = {
    contactDetails: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
};

export type ContactRequest = ContactFormValues & {
    captchaAnswer: string;
    captchaToken: string;
};

export type CaptchaChallenge = {
    image: string;
    token: string;
};

export type ContactFormProps = {
    description: string;
    errorMessage: string;
    loadCaptchaChallenge: () => Promise<CaptchaChallenge>;
    submitContactRequest: (request: ContactRequest) => Promise<void>;
    submitLabel: string;
    submittingText: string;
    successMessage: string;
    title: string;
};

type ContactField = keyof ContactFormValues;
type ContactFormErrors = Partial<Record<ContactField, string>>;

const INITIAL_VALUES: ContactFormValues = {
    contactDetails: '',
    emailAddress: '',
    firstName: '',
    lastName: '',
};

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactField(
    field: ContactField,
    rawValue: string
): string | undefined {
    const value = rawValue.trim();

    if (!value) {
        return 'This field is required.';
    }

    if (field === 'firstName' || field === 'lastName') {
        if (value.length < 2) {
            return 'Enter at least 2 characters.';
        }

        if (value.length > 50) {
            return 'Enter no more than 50 characters.';
        }

        if (!NAME_PATTERN.test(value)) {
            return 'Use letters, spaces, apostrophes, or hyphens only.';
        }
    }

    if (
        field === 'emailAddress' &&
        (value.length > 254 || !EMAIL_PATTERN.test(value))
    ) {
        return 'Enter a valid email address.';
    }

    if (field === 'contactDetails') {
        if (value.length < 10) {
            return 'Enter at least 10 characters.';
        }

        if (value.length > 2000) {
            return 'Enter no more than 2,000 characters.';
        }
    }

    return undefined;
}

function validateContactForm(values: ContactFormValues): ContactFormErrors {
    return (Object.keys(values) as ContactField[]).reduce<ContactFormErrors>(
        (errors, field) => {
            const error = validateContactField(field, values[field]);

            if (error) {
                errors[field] = error;
            }

            return errors;
        },
        {}
    );
}

export function ContactForm({
    description,
    errorMessage,
    loadCaptchaChallenge,
    submitContactRequest,
    submitLabel,
    submittingText,
    successMessage,
    title,
}: ContactFormProps) {
    const id = useId();
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaChallenge, setCaptchaChallenge] =
        useState<CaptchaChallenge | null>(null);
    const [captchaError, setCaptchaError] = useState('');
    const [errors, setErrors] = useState<ContactFormErrors>({});
    const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);
    const [status, setStatus] = useState<
        'error' | 'idle' | 'submitting' | 'success'
    >('idle');
    const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);

    const refreshCaptcha = useCallback(async () => {
        setIsCaptchaLoading(true);
        setCaptchaAnswer('');
        setCaptchaError('');

        try {
            const challenge = await loadCaptchaChallenge();

            if (!challenge.image || !challenge.token) {
                throw new Error('CAPTCHA challenge is incomplete.');
            }

            setCaptchaChallenge(challenge);
        }
        catch (cause) {
            console.warn('[Nexcent Contact Form CAPTCHA]', cause);
            setCaptchaChallenge(null);
            setCaptchaError(
                'Text verification could not be loaded. Please refresh it.'
            );
        }
        finally {
            setIsCaptchaLoading(false);
        }
    }, [loadCaptchaChallenge]);

    useEffect(() => {
        void refreshCaptcha();
    }, [refreshCaptcha]);

    const updateField = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const field = event.currentTarget.name as ContactField;
        const value = event.currentTarget.value;

        setValues((current) => ({...current, [field]: value}));

        if (errors[field]) {
            setErrors((current) => ({
                ...current,
                [field]: validateContactField(field, value),
            }));
        }
    };

    const validateOnBlur = (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const field = event.currentTarget.name as ContactField;

        setErrors((current) => ({
            ...current,
            [field]: validateContactField(field, event.currentTarget.value),
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors = validateContactForm(values);
        const hasCaptcha = Boolean(
            captchaAnswer.trim() && captchaChallenge
        );

        setErrors(nextErrors);
        setCaptchaError(
            hasCaptcha
                ? ''
                : 'Enter the text shown in the verification image.'
        );

        if (Object.keys(nextErrors).length > 0 || !hasCaptcha) {
            setStatus('idle');
            return;
        }

        setStatus('submitting');

        try {
            await submitContactRequest({
                captchaAnswer: captchaAnswer.trim(),
                captchaToken: captchaChallenge!.token,
                contactDetails: values.contactDetails.trim(),
                emailAddress: values.emailAddress.trim(),
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
            });

            setErrors({});
            setStatus('success');
            setValues(INITIAL_VALUES);
            await refreshCaptcha();
        }
        catch (cause) {
            console.warn('[Nexcent Contact Form]', cause);
            await refreshCaptcha();
            setCaptchaError(
                cause instanceof Error
                    ? cause.message
                    : 'The request could not be submitted. Please try again.'
            );
            setStatus('error');
        }
    };

    const fieldProps = (field: ContactField) => {
        const errorId = `${id}-${field}-error`;

        return {
            'aria-describedby': errors[field] ? errorId : undefined,
            'aria-invalid': errors[field] ? true : undefined,
            id: `${id}-${field}`,
            name: field,
            onBlur: validateOnBlur,
            onChange: updateField,
            value: values[field],
        };
    };

    return (
        <section className="nxc-contact">
            <div className="nxc-contact__container">
                <div className="nxc-contact__intro">
                    <p className="nxc-contact__eyebrow">Nexcent</p>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>

                <form
                    aria-label={title}
                    className="nxc-contact__form"
                    onSubmit={handleSubmit}
                >
                    <div className="nxc-contact__row">
                        <ContactInput
                            error={errors.firstName}
                            errorId={`${id}-firstName-error`}
                            inputProps={{
                                ...fieldProps('firstName'),
                                autoComplete: 'given-name',
                                maxLength: 50,
                                type: 'text',
                            }}
                            label="First name"
                        />
                        <ContactInput
                            error={errors.lastName}
                            errorId={`${id}-lastName-error`}
                            inputProps={{
                                ...fieldProps('lastName'),
                                autoComplete: 'family-name',
                                maxLength: 50,
                                type: 'text',
                            }}
                            label="Last name"
                        />
                    </div>

                    <ContactInput
                        error={errors.emailAddress}
                        errorId={`${id}-emailAddress-error`}
                        inputProps={{
                            ...fieldProps('emailAddress'),
                            autoComplete: 'email',
                            inputMode: 'email',
                            maxLength: 254,
                            type: 'email',
                        }}
                        label="Email address"
                    />

                    <div className="nxc-contact__field">
                        <label htmlFor={`${id}-contactDetails`}>
                            Contact details <RequiredMark />
                        </label>
                        <textarea
                            {...fieldProps('contactDetails')}
                            maxLength={2000}
                            rows={6}
                        />
                        <FieldError
                            error={errors.contactDetails}
                            id={`${id}-contactDetails-error`}
                        />
                    </div>

                    <div className="nxc-contact__captcha">
                        <div className="nxc-contact__captcha-challenge">
                            {captchaChallenge ? (
                                <img
                                    alt="Text verification challenge"
                                    height={50}
                                    src={captchaChallenge.image}
                                    width={150}
                                />
                            ) : (
                                <span aria-live="polite">
                                    {isCaptchaLoading
                                        ? 'Loading text verification…'
                                        : 'Text verification unavailable.'}
                                </span>
                            )}
                            <button
                                aria-label="Refresh text verification"
                                className="nxc-contact__captcha-refresh"
                                disabled={
                                    isCaptchaLoading || status === 'submitting'
                                }
                                onClick={() => void refreshCaptcha()}
                                type="button"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="nxc-contact__field">
                            <label htmlFor={`${id}-captchaAnswer`}>
                                Text verification <RequiredMark />
                            </label>
                            <input
                                aria-describedby={
                                    captchaError
                                        ? `${id}-captchaAnswer-error`
                                        : undefined
                                }
                                aria-invalid={captchaError ? true : undefined}
                                autoComplete="off"
                                disabled={
                                    isCaptchaLoading || !captchaChallenge
                                }
                                id={`${id}-captchaAnswer`}
                                name="captchaAnswer"
                                onChange={(event) => {
                                    setCaptchaAnswer(event.currentTarget.value);

                                    if (captchaError) {
                                        setCaptchaError('');
                                    }
                                }}
                                value={captchaAnswer}
                            />
                            <FieldError
                                error={captchaError}
                                id={`${id}-captchaAnswer-error`}
                            />
                        </div>
                    </div>

                    <div className="nxc-contact__actions">
                        <button
                            className="nxc-button nxc-button--primary nxc-contact__submit"
                            disabled={
                                status === 'submitting' ||
                                isCaptchaLoading ||
                                !captchaChallenge
                            }
                            type="submit"
                        >
                            {status === 'submitting'
                                ? submittingText
                                : submitLabel}
                        </button>
                        <p
                            aria-live="polite"
                            className={`nxc-contact__status nxc-contact__status--${status}`}
                            role="status"
                        >
                            {status === 'success' ? successMessage : null}
                            {status === 'error' ? errorMessage : null}
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
}

function RequiredMark() {
    return <span className="nxc-contact__required">*</span>;
}

function FieldError({error, id}: {error?: string; id: string}) {
    return error ? (
        <p className="nxc-contact__error" id={id}>
            {error}
        </p>
    ) : null;
}

function ContactInput({
    error,
    errorId,
    inputProps,
    label,
}: {
    error?: string;
    errorId: string;
    inputProps: React.InputHTMLAttributes<HTMLInputElement>;
    label: string;
}) {
    return (
        <div className="nxc-contact__field">
            <label htmlFor={String(inputProps.id)}>
                {label} <RequiredMark />
            </label>
            <input {...inputProps} />
            <FieldError error={error} id={errorId} />
        </div>
    );
}
