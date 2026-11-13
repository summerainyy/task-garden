import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/context";
import { PRIORITIES, REPEATS, dueStatus, formatDue, getList, uid } from "../lib/tasks";
import ui from "./ui.module.css";
import styles from "./TodoItem.module.css";

function Highlight({ text, query }) {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.split(new RegExp(`(${safe})`, "ig")).map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part
    );
}

function TodoItem({ task, today, query, onToggle, onUpdate, onDelete, drag }) {
    const { lists } = useStore();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(task.text);
    const [open, setOpen] = useState(false);
    const [newStep, setNewStep] = useState("");
    const [blooming, setBlooming] = useState(false);

    const list = getList(lists, task.list);
    const due = dueStatus(task, today);
    const stepsDone = task.subtasks.filter((s) => s.done).length;
    const update = (patch) => onUpdate(task.id, patch);
    const setSteps = (subtasks) => update({ subtasks });

    const startEdit = () => {
        setDraft(task.text);
        setEditing(true);
    };
    const saveEdit = () => {
        const text = draft.trim();
        if (text && text !== task.text) update({ text });
        setEditing(false);
    };

    const toggle = () => {
        if (!task.completed) {
            setBlooming(true);
            setTimeout(() => setBlooming(false), 800);
        }
        onToggle(task.id);
    };

    const addStep = (e) => {
        e.preventDefault();
        if (!newStep.trim()) return;
        setSteps([...task.subtasks, { id: uid(), text: newStep.trim(), done: false }]);
        setNewStep("");
    };

    const classes = [
        styles.item,
        task.completed && styles.done,
        due === "overdue" && styles.overdue,
        drag?.isOver && styles.dropTarget,
        drag?.isDragging && styles.dragging,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <li className={classes} style={{ "--list": list.color }} {...drag?.handlers}>
            <div className={styles.row}>
                {drag && (
                    <span className={styles.grip} title="Drag to reorder" aria-hidden="true">
                        ⠿
                    </span>
                )}

                <button
                    className={`${styles.check} ${blooming ? styles.bloom : ""}`}
                    role="checkbox"
                    aria-checked={task.completed}
                    aria-label={`${task.completed ? "Unmark" : "Complete"} “${task.text}”`}
                    onClick={toggle}
                >
                    <span aria-hidden="true">{task.completed ? list.emoji : ""}</span>
                </button>

                <div className={styles.body}>
                    {editing ? (
                        <input
                            className={styles.edit}
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") setEditing(false);
                            }}
                            aria-label="Task name"
                        />
                    ) : (
                        <span className={styles.text} onDoubleClick={startEdit} title="Double-click to rename">
                            <Highlight text={task.text} query={query} />
                        </span>
                    )}

                    <div className={styles.meta}>
                        <span className={`${ui.chip} ${styles.listChip}`}>
                            {list.emoji} {list.name}
                        </span>
                        <span className={ui.chip} style={{ background: PRIORITIES[task.priority].color, color: "#3b3557" }}>
                            ⚑ {PRIORITIES[task.priority].label}
                        </span>
                        {task.due && (
                            <span className={`${ui.chip} ${styles[`due_${due}`] ?? ""}`}>
                                {due === "overdue" ? "⏰" : "📅"} {formatDue(task.due)}
                            </span>
                        )}
                        {task.repeat !== "none" && <span className={ui.chip}>🔁 {REPEATS[task.repeat]}</span>}
                        {task.subtasks.length > 0 && (
                            <span className={ui.chip}>
                                ✔ {stepsDone}/{task.subtasks.length}
                            </span>
                        )}
                        {task.notes && (
                            <span className={ui.chip} title={task.notes}>
                                📝 Note
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={ui.iconBtn} onClick={startEdit} aria-label="Rename task" title="Rename">
                        ✎
                    </button>
                    <Link className={ui.iconBtn} to={`/tasks/${task.id}`} aria-label={`Open “${task.text}”`} title="Open details">
                        ➜
                    </Link>
                    <button
                        className={`${ui.iconBtn} ${styles.caret} ${open ? styles.caretOpen : ""}`}
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-label="Details"
                        title="Details"
                    >
                        ▾
                    </button>
                    <button
                        className={`${ui.iconBtn} ${ui.danger}`}
                        onClick={() => onDelete(task.id)}
                        aria-label="Delete task"
                        title="Delete"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {open && (
                <div className={styles.details}>
                    <div className={styles.fields}>
                        <div className={ui.field}>
                            <span className={ui.label}>Priority</span>
                            <div className={ui.segmented}>
                                {Object.entries(PRIORITIES).map(([k, p]) => (
                                    <button
                                        key={k}
                                        type="button"
                                        aria-pressed={task.priority === k}
                                        style={{ "--seg": p.color }}
                                        onClick={() => update({ priority: k })}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className={ui.field}>
                            <span className={ui.label}>List</span>
                            <select className={ui.input} value={task.list} onChange={(e) => update({ list: e.target.value })}>
                                {lists.map((l) => (
                                    <option key={l.id} value={l.id}>{l.emoji} {l.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className={ui.field}>
                            <span className={ui.label}>Due date</span>
                            <input className={ui.input} type="date" value={task.due} onChange={(e) => update({ due: e.target.value })} />
                        </label>
                        <label className={ui.field}>
                            <span className={ui.label}>Repeat</span>
                            <select className={ui.input} value={task.repeat} onChange={(e) => update({ repeat: e.target.value })}>
                                {Object.entries(REPEATS).map(([k, l]) => (
                                    <option key={k} value={k}>{l}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className={ui.field}>
                        <span className={ui.label}>
                            Steps {task.subtasks.length > 0 && `· ${stepsDone} of ${task.subtasks.length}`}
                        </span>
                        {task.subtasks.length > 0 && (
                            <ul className={styles.steps}>
                                {task.subtasks.map((s) => (
                                    <li key={s.id} className={s.done ? styles.stepDone : ""}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={s.done}
                                                onChange={() =>
                                                    setSteps(task.subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))
                                                }
                                            />
                                            <span>{s.text}</span>
                                        </label>
                                        <button
                                            className={`${ui.iconBtn} ${ui.danger}`}
                                            onClick={() => setSteps(task.subtasks.filter((x) => x.id !== s.id))}
                                            aria-label={`Remove step ${s.text}`}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <form className={styles.addStep} onSubmit={addStep}>
                            <input
                                className={ui.input}
                                value={newStep}
                                onChange={(e) => setNewStep(e.target.value)}
                                placeholder="Add a step…"
                                aria-label="New step"
                            />
                            <button className={`${ui.btn} ${ui.small}`} type="submit" disabled={!newStep.trim()}>
                                Add
                            </button>
                        </form>
                    </div>

                    <label className={ui.field}>
                        <span className={ui.label}>Notes</span>
                        <textarea
                            className={ui.input}
                            rows={2}
                            value={task.notes}
                            onChange={(e) => update({ notes: e.target.value })}
                            placeholder="Links, ideas, little reminders…"
                        />
                    </label>
                </div>
            )}
        </li>
    );
}

export default TodoItem;
