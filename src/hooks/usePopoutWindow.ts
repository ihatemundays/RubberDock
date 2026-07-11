import { useEffect, useState } from "react";

// Opens a real browser window and hands back a DOM node inside it that the
// caller can render into (via createPortal). Closing that window (by the OS
// "x" button or programmatically) calls onClose so the item can dock back.
export const usePopoutWindow = (isOpen: boolean, title: string, onClose: () => void) => {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const popup = window.open('', '', 'width=900,height=650');
        if (!popup) {
            onClose();
            return;
        }

        popup.document.title = title;
        popup.document.head.append(...Array.from(
            document.querySelectorAll('style, link[rel="stylesheet"]'),
            node => node.cloneNode(true) as Node
        ));

        popup.document.body.style.margin = '0';
        popup.document.body.style.height = '100vh';
        const root = popup.document.createElement('div');
        root.style.height = '100%';
        popup.document.body.appendChild(root);
        setContainer(root);

        popup.addEventListener('beforeunload', onClose);

        return () => {
            popup.removeEventListener('beforeunload', onClose);
            setContainer(null);
            if (!popup.closed) {
                popup.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return container;
};
