import { getList } from "../lib/tasks";
import { useStore } from "../store/context";
import styles from "./Garden.module.css";

const MAX_PLANTS = 24;

// One plant per task: a sprout while it's waiting, a flower once it's done.
function Garden({ tasks }) {
    const { lists } = useStore();
    const done = tasks.filter((t) => t.completed).length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const plants = tasks.slice(0, MAX_PLANTS);
    const allDone = tasks.length > 0 && done === tasks.length;

    return (
        <section className={styles.garden} aria-label={`Garden progress: ${done} of ${tasks.length} tasks done`}>
            <div className={styles.top}>
                <h2 className={styles.heading}>My garden</h2>
                <span className={styles.count}>
                    {done}/{tasks.length} bloomed · {pct}%
                </span>
            </div>

            <div className={styles.bed}>
                {allDone && <span className={styles.butterfly} aria-hidden="true">🦋</span>}
                {["f1", "f2", "f3"].map((f) => (
                    <span key={f} className={`${styles.firefly} ${styles[f]}`} aria-hidden="true" />
                ))}

                <div className={styles.row} aria-hidden="true">
                    {plants.length === 0 && <span className={styles.empty}>Plant a task to start your garden 🌱</span>}
                    {plants.map((t, i) => (
                        <span
                            key={t.id}
                            className={t.completed ? styles.flower : styles.sprout}
                            style={{
                                animationDelay: t.completed
                                    ? `0s, ${(i % 6) * -0.6}s` // bloom right away, then sway out of step
                                    : `${(i % 6) * -0.6}s`,
                            }}
                            title={t.text}
                        >
                            {t.completed ? getList(lists, t.list).emoji : "🌱"}
                        </span>
                    ))}
                    {tasks.length > MAX_PLANTS && <span className={styles.more}>+{tasks.length - MAX_PLANTS}</span>}
                </div>
                <div className={styles.soil} />
            </div>

            <div className={styles.progress} aria-hidden="true">
                <span style={{ width: `${pct}%` }} />
            </div>
        </section>
    );
}

export default Garden;
