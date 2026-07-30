import {useCallback, useEffect, useRef, useState} from 'react';

import {
    GlobalModal as GlobalModalView,
    type GlobalModalCloseReason,
    type GlobalModalDocument,
} from '@nexcent/ui';

import {
    closeGlobalModal,
    installModalTriggerDelegation,
    openGlobalModal,
    subscribeGlobalModalOpen,
} from '../../liferay/globalModal';

import modalCss from './global-modal.css?inline';

export function NxcGlobalModal() {
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const [document, setDocument] = useState<GlobalModalDocument | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeGlobalModalOpen((nextDocument) => {
            if (!returnFocusRef.current) {
                returnFocusRef.current =
                    window.document.activeElement instanceof HTMLElement
                        ? window.document.activeElement
                        : null;
            }

            setDocument(nextDocument);
        });
        const uninstallDelegation = installModalTriggerDelegation(
            (nextDocument, trigger) => {
                returnFocusRef.current = trigger;
                openGlobalModal(nextDocument);
            }
        );

        return () => {
            uninstallDelegation();
            unsubscribe();
        };
    }, []);

    const close = useCallback(
        (reason: GlobalModalCloseReason) => {
            if (!document) {
                return;
            }

            closeGlobalModal({
                ...(document.id ? {id: document.id} : {}),
                reason,
            });
            setDocument(null);

            window.requestAnimationFrame(() => {
                returnFocusRef.current?.focus();
                returnFocusRef.current = null;
            });
        },
        [document]
    );

    return (
        <>
            <style>{modalCss}</style>
            <GlobalModalView document={document} onClose={close} />
        </>
    );
}
