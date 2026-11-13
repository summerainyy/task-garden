import { useStore } from "../store/context";
import styles from "./Header.module.css";

function Sun() {
    return (
        <svg className={styles.sun} viewBox="0 0 100 100" aria-hidden="true">
            <g className={styles.rays}>
                {Array.from({ length: 10 }, (_, i) => (
                    <rect key={i} x="47" y="2" width="6" height="16" rx="3" transform={`rotate(${i * 36} 50 50)`} />
                ))}
            </g>
            <circle cx="50" cy="50" r="26" className={styles.sunFace} />
            <circle cx="41" cy="47" r="3" className={styles.eye} />
            <circle cx="59" cy="47" r="3" className={styles.eye} />
            <circle cx="35" cy="56" r="4" className={styles.cheek} />
            <circle cx="65" cy="56" r="4" className={styles.cheek} />
            <path d="M43 57 Q50 63 57 57" className={styles.smile} />
        </svg>
    );
}

function Moon() {
    return (
        <svg className={styles.sun} viewBox="0 0 100 100" aria-hidden="true">
            <path d="M62 18a32 32 0 1 0 20 50A28 28 0 0 1 62 18z" className={styles.moonFace} />
            <path d="M44 50 q3 3 6 0" className={styles.smile} />
            <path d="M30 50 q3 3 6 0" className={styles.smile} />
            <circle cx="33" cy="58" r="3.5" className={styles.cheek} />
            <path d="M36 62 Q41 66 46 62" className={styles.smile} />
            <text x="78" y="30" className={styles.zzz}>z</text>
            <text x="86" y="18" className={styles.zzz}>z</text>
        </svg>
    );
}

function greeting() {
    const h = new Date().getHours();
    if (h < 5) return "Sweet dreams";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

function Header({ left, doneToday }) {
    const { settings } = useStore();
    const theme = settings.theme;
    const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

    return (
        <header className={styles.header}>
            {theme === "dark" ? <Moon /> : <Sun />}

            <div className={styles.titles}>
                <p className={styles.date}>{date}</p>
                <h1 className={styles.title}>
                    {greeting()}, {settings.name}!
                </h1>
                <p className={styles.subtitle}>
                    {left === 0
                        ? "Nothing left to plant — go smell the flowers 🦋"
                        : `${left} seed${left === 1 ? "" : "s"} waiting · ${doneToday} bloomed today`}
                </p>
            </div>

        </header>
    );
}

export default Header;
