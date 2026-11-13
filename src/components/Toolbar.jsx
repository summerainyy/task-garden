import { useStore } from "../store/context";
import { SORTS, VIEWS } from "../lib/filters";
import ui from "./ui.module.css";
import styles from "./Toolbar.module.css";

function Toolbar({ filters, setFilter, counts, searchRef }) {
    const { lists } = useStore();
    return (
        <div className={styles.bar}>
            <label className={styles.search}>
                <span aria-hidden="true">🔍</span>
                <input
                    ref={searchRef}
                    type="search"
                    placeholder="Search tasks, notes & steps"
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                    aria-label="Search tasks"
                />
                <kbd>/</kbd>
            </label>

            <div className={styles.views} role="tablist" aria-label="When">
                {VIEWS.map((v) => (
                    <button
                        key={v.id}
                        role="tab"
                        aria-selected={filters.view === v.id}
                        className={`${styles.tab} ${v.id === "overdue" && counts.overdue ? styles.alert : ""}`}
                        onClick={() => setFilter("view", v.id)}
                    >
                        <span aria-hidden="true">{v.icon}</span> {v.label}
                        {counts[v.id] > 0 && <span className={styles.count}>{counts[v.id]}</span>}
                    </button>
                ))}
            </div>

            <div className={styles.lists} aria-label="Lists">
                <button
                    className={styles.listChip}
                    aria-pressed={filters.list === "all"}
                    onClick={() => setFilter("list", "all")}
                >
                    Every list
                </button>
                {lists.map((l) => (
                    <button
                        key={l.id}
                        className={styles.listChip}
                        aria-pressed={filters.list === l.id}
                        style={{ "--list": l.color }}
                        onClick={() => setFilter("list", filters.list === l.id ? "all" : l.id)}
                    >
                        {l.emoji} {l.name}
                    </button>
                ))}
            </div>

            <div className={styles.bottom}>
                <div className={ui.segmented} role="tablist" aria-label="Status">
                    {[
                        ["all", "All"],
                        ["active", "To do"],
                        ["done", "Done"],
                    ].map(([k, l]) => (
                        <button key={k} role="tab" aria-selected={filters.status === k} onClick={() => setFilter("status", k)}>
                            {l}
                        </button>
                    ))}
                </div>
                <label className={styles.sort}>
                    <span className={ui.label}>Sort</span>
                    <select className={ui.input} value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
                        {Object.entries(SORTS).map(([k, l]) => (
                            <option key={k} value={k}>{l}</option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
}

export default Toolbar;
