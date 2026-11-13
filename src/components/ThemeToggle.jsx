import { useStore } from "../store/context";
import styles from "./ThemeToggle.module.css";

function ThemeToggle() {
    const { settings, setSettings } = useStore();
    const dark = settings.theme === "dark";

    return (
        <button
            className={styles.toggle}
            onClick={() => setSettings({ theme: dark ? "light" : "dark" })}
            role="switch"
            aria-checked={dark}
            aria-label="Night mode"
            title={dark ? "Switch to day" : "Switch to night"}
        >
            <span className={styles.knob}>{dark ? "🌙" : "☀️"}</span>
        </button>
    );
}

export default ThemeToggle;
