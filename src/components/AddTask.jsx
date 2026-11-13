import { useState } from "react";
import { PRIORITIES, REPEATS, formatDue, getList, parseQuickAdd } from "../lib/tasks";
import { useStore } from "../store/context";
import ui from "./ui.module.css";
import styles from "./AddTask.module.css";

const BLANK = { priority: "medium", list: "", due: "", repeat: "none" };

function AddTask({ onAdd, inputRef, defaultList }) {
    const { lists } = useStore();
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [opts, setOpts] = useState(BLANK);

    const { text: clean, found } = parseQuickAdd(text, lists);
    const base = { ...opts, list: opts.list || defaultList || lists[0]?.id || "" };
    const task = { ...base, ...found, text: clean };
    const set = (k, v) => setOpts((o) => ({ ...o, [k]: v }));

    const submit = (e) => {
        e.preventDefault();
        if (!clean) return;
        onAdd(task);
        setText("");
        setOpts(BLANK);
    };

    return (
        <form className={styles.card} onSubmit={submit}>
            <div className={styles.row}>
                <span className={styles.seed} aria-hidden="true">🌰</span>
                <input
                    ref={inputRef}
                    className={styles.input}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Plant a new task…"
                    aria-label="New task"
                />
                <button
                    type="button"
                    className={`${ui.btn} ${ui.soft} ${open ? ui.on : ""}`}
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    title="More options"
                >
                    <span aria-hidden="true">⚙</span>
                    <span className={styles.optLabel}>Options</span>
                </button>
                <button className={ui.btn} type="submit" disabled={!clean}>
                    Plant 🌱
                </button>
            </div>

            {Object.keys(found).length > 0 ? (
                <p className={styles.hint} aria-live="polite">
                    Got it:
                    {found.priority && <span className={ui.chip}>⚑ {PRIORITIES[found.priority].label}</span>}
                    {found.list && <span className={ui.chip}>{getList(lists, found.list).emoji} {getList(lists, found.list).name}</span>}
                    {found.due && <span className={ui.chip}>📅 {formatDue(found.due)}</span>}
                </p>
            ) : (
                <p className={styles.hint}>
                    Shortcuts: <code>!high</code> <code>#work</code> <code>@tomorrow</code> · <kbd>N</kbd> opens the full form
                </p>
            )}

            {open && (
                <div className={styles.options}>
                    <div className={ui.field}>
                        <span className={ui.label}>Priority</span>
                        <div className={ui.segmented}>
                            {Object.entries(PRIORITIES).map(([k, p]) => (
                                <button
                                    key={k}
                                    type="button"
                                    aria-pressed={task.priority === k}
                                    style={{ "--seg": p.color }}
                                    onClick={() => set("priority", k)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className={ui.field}>
                        <span className={ui.label}>List</span>
                        <select className={ui.input} value={task.list} onChange={(e) => set("list", e.target.value)}>
                            {lists.map((l) => (
                                <option key={l.id} value={l.id}>{l.emoji} {l.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className={ui.field}>
                        <span className={ui.label}>Due date</span>
                        <input className={ui.input} type="date" value={task.due} onChange={(e) => set("due", e.target.value)} />
                    </label>
                    <label className={ui.field}>
                        <span className={ui.label}>Repeat</span>
                        <select className={ui.input} value={task.repeat} onChange={(e) => set("repeat", e.target.value)}>
                            {Object.entries(REPEATS).map(([k, l]) => (
                                <option key={k} value={k}>{l}</option>
                            ))}
                        </select>
                    </label>
                </div>
            )}
        </form>
    );
}

export default AddTask;
