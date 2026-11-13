import { useEffect } from "react";
import styles from "./Toast.module.css";

function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    return (
        <div className={styles.toast} role="status">
            <span>{toast.message}</span>
            {toast.undo && (
                <button
                    className={styles.undo}
                    onClick={() => {
                        toast.undo();
                        onClose();
                    }}
                >
                    Undo
                </button>
            )}
            <button className={styles.close} onClick={onClose} aria-label="Dismiss">
                ✕
            </button>
        </div>
    );
}

export default Toast;
