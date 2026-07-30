import {useCallback, useEffect, useId, useRef} from 'react';

export type GlobalModalCloseReason = 'backdrop' | 'button' | 'escape';

export type GlobalModalDocument = {
    id?: string;
    slots: {
        comparison?: {
            deltaValue: string;
            direction: 'down' | 'neutral' | 'up';
            percent?: number;
            previousValue: string;
        };
        description?: string;
        eyebrow?: string;
        facts?: Array<{
            label: string;
            value: string;
        }>;
        media?: {
            alt: string;
            url: string;
        };
        primaryValue?: string;
        title: string;
    };
    version: 1;
};

export type GlobalModalProps = {
    closeLabel?: string;
    document: GlobalModalDocument | null;
    onClose: (reason: GlobalModalCloseReason) => void;
};

const integerFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});

function formatInteger(value: string, includePositiveSign = false): string {
    try {
        const integerValue = BigInt(value);
        const formattedValue = integerFormatter.format(integerValue);

        return includePositiveSign && integerValue > 0n
            ? `+${formattedValue}`
            : formattedValue;
    }
    catch {
        return value;
    }
}

export function GlobalModal({
    closeLabel = 'Close details',
    document,
    onClose,
}: GlobalModalProps) {
    const headingId = useId();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const close = useCallback(
        (reason: GlobalModalCloseReason) => {
            if (document) {
                onClose(reason);
            }
        },
        [document, onClose]
    );

    useEffect(() => {
        if (!document) {
            return;
        }

        const previousOverflow = window.document.body.style.overflow;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close('escape');
            }
            else if (event.key === 'Tab') {
                event.preventDefault();
                closeButtonRef.current?.focus();
            }
        };

        window.document.body.style.overflow = 'hidden';
        window.document.addEventListener('keydown', onKeyDown);
        window.requestAnimationFrame(() => closeButtonRef.current?.focus());

        return () => {
            window.document.body.style.overflow = previousOverflow;
            window.document.removeEventListener('keydown', onKeyDown);
        };
    }, [close, document]);

    if (!document) {
        return null;
    }

    const {slots} = document;

    return (
        <div
            className="nxc-global-modal__backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    close('backdrop');
                }
            }}
        >
            <section
                aria-labelledby={headingId}
                aria-modal="true"
                className={`nxc-global-modal${
                    slots.media ? '' : ' nxc-global-modal--without-media'
                }`}
                role="dialog"
            >
                <button
                    aria-label={closeLabel}
                    className="nxc-global-modal__close"
                    onClick={() => close('button')}
                    ref={closeButtonRef}
                    type="button"
                >
                    <span aria-hidden="true">{'×'}</span>
                </button>

                {slots.media ? (
                    <div className="nxc-global-modal__media">
                        <img alt={slots.media.alt} src={slots.media.url} />
                    </div>
                ) : null}

                <div className="nxc-global-modal__content">
                    {slots.eyebrow ? (
                        <p className="nxc-global-modal__eyebrow">
                            {slots.eyebrow}
                        </p>
                    ) : null}

                    <h2 id={headingId}>{slots.title}</h2>

                    {slots.primaryValue ? (
                        <p className="nxc-global-modal__primary-value">
                            {slots.primaryValue}
                        </p>
                    ) : null}

                    {slots.comparison ? (
                        <div
                            className={`nxc-global-modal__trend nxc-global-modal__trend--${slots.comparison.direction}`}
                        >
                            <div className="nxc-global-modal__trend-summary">
                                <span
                                    aria-hidden="true"
                                    className="nxc-global-modal__trend-arrow"
                                >
                                    {slots.comparison.direction === 'up'
                                        ? '↑'
                                        : slots.comparison.direction === 'down'
                                          ? '↓'
                                          : '−'}
                                </span>
                                <strong>
                                    {slots.comparison.percent === undefined
                                        ? slots.comparison.direction === 'neutral'
                                            ? 'No change'
                                            : slots.comparison.direction === 'up'
                                              ? 'Increase'
                                              : 'Decrease'
                                        : `${slots.comparison.percent > 0 ? '+' : ''}${slots.comparison.percent.toFixed(2)}%`}
                                </strong>
                                <span className="nxc-global-modal__trend-delta">
                                    (
                                    {formatInteger(
                                        slots.comparison.deltaValue,
                                        true
                                    )}
                                    )
                                </span>
                            </div>
                            <p>
                                Previous value{' '}
                                <strong>
                                    {formatInteger(
                                        slots.comparison.previousValue
                                    )}
                                </strong>
                            </p>
                        </div>
                    ) : null}

                    {slots.description ? (
                        <p className="nxc-global-modal__description">
                            {slots.description}
                        </p>
                    ) : null}

                    {slots.facts?.length ? (
                        <dl className="nxc-global-modal__facts">
                            {slots.facts.map((fact, index) => (
                                <div key={`${fact.label}-${index}`}>
                                    <dt>{fact.label}</dt>
                                    <dd>{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
