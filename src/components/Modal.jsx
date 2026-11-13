import { useEffect } from "react";
import styles from "./Modal.module.css";

// A small confirm-style dialog. Esc or clicking outside closes it.
function Modal({ title, icon = "🌼", children, actions, onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <span className={styles.icon} aria-hidden="true">{icon}</span>
                <h2 id="modal-title" className={styles.title}>{title}</h2>
                <div className={styles.body}>{children}</div>
                <div className={styles.actions}>{actions}</div>
            </div>
        </div>
    );
}

export default Modal;
