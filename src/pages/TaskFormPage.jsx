import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../store/context";
import { PRIORITIES, REPEATS, uid } from "../lib/tasks";
import ui from "../components/ui.module.css";
import page from "./Page.module.css";
import styles from "./TaskFormPage.module.css";

// One form for both "create" (/tasks/new) and "update" (/tasks/:id/edit)
function TaskForm({ task }) {
    const { lists, addTask, updateTask, notify } = useStore();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const editing = !!task;

    const [form, setForm] = useState(() =>
        editing
            ? {
                  text: task.text,
                  notes: task.notes,
                  list: task.list,
                  priority: task.priority,
                  due: task.due,
                  repeat: task.repeat,
                  subtasks: task.subtasks,
              }
            : {
                  text: "",
                  notes: "",
                  list: lists.some((l) => l.id === params.get("list")) ? params.get("list") : lists[0]?.id ?? "",
                  priority: "medium",
                  due: "",
                  repeat: "none",
                  subtasks: [],
              }
    );
    const [newStep, setNewStep] = useState("");
    const [touched, setTouched] = useState(false);
    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const error = !form.text.trim() ? "Give your task a name so it can grow 🌱" : "";

    const addStep = () => {
        if (!newStep.trim()) return;
        set("subtasks", [...form.subtasks, { id: uid(), text: newStep.trim(), done: false }]);
        setNewStep("");
    };
    const editStep = (id, patch) => set("subtasks", form.subtasks.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    const submit = (e) => {
        e.preventDefault();
        setTouched(true);
        if (error) return;
        const data = { ...form, text: form.text.trim(), subtasks: form.subtasks.filter((s) => s.text.trim()) };
        if (editing) {
            updateTask(task.id, data);
            notify("✎ Changes saved");
            navigate(`/tasks/${task.id}`);
        } else {
            const created = addTask(data);
            notify(`🌱 Planted “${created.text}”`);
            navigate(`/tasks/${created.id}`);
        }
    };

    return (
        <div className={page.page}>
            <Link to={editing ? `/tasks/${task.id}` : "/tasks"} className={page.crumb}>
                ← {editing ? "Back to task" : "All tasks"}
            </Link>
            <div className={page.head}>
                <div>
                    <h1 className={page.title}>{editing ? "✎ Edit task" : "🌰 Plant a new task"}</h1>
                    <p className={page.sub}>{editing ? "Tidy up the details." : "Give it a name, a home and a little sunshine."}</p>
                </div>
            </div>

            <form className={`${page.card} ${styles.form}`} onSubmit={submit} noValidate>
                <div className={styles.col}>
                <label className={ui.field}>
                    <span className={ui.label}>Task name *</span>
                    <input
                        className={`${ui.input} ${styles.big}`}
                        value={form.text}
                        onChange={(e) => set("text", e.target.value)}
                        onBlur={() => setTouched(true)}
                        placeholder="e.g. Call grandma about Sunday lunch"
                        aria-invalid={touched && !!error}
                        aria-describedby="name-error"
                        autoFocus
                    />
                    {touched && error && (
                        <span id="name-error" className={styles.error} role="alert">{error}</span>
                    )}
                </label>

                <div className={styles.row}>
                    <label className={ui.field}>
                        <span className={ui.label}>List</span>
                        <select className={ui.input} value={form.list} onChange={(e) => set("list", e.target.value)}>
                            {lists.map((l) => (
                                <option key={l.id} value={l.id}>{l.emoji} {l.name}</option>
                            ))}
                        </select>
                        <Link to="/lists" className={styles.helper}>Manage lists →</Link>
                    </label>
                    <label className={ui.field}>
                        <span className={ui.label}>Due date</span>
                        <input className={ui.input} type="date" value={form.due} onChange={(e) => set("due", e.target.value)} />
                    </label>
                    <label className={ui.field}>
                        <span className={ui.label}>Repeat</span>
                        <select className={ui.input} value={form.repeat} onChange={(e) => set("repeat", e.target.value)}>
                            {Object.entries(REPEATS).map(([k, l]) => (
                                <option key={k} value={k}>{l}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className={ui.field}>
                    <span className={ui.label}>Priority</span>
                    <div className={ui.segmented}>
                        {Object.entries(PRIORITIES).map(([k, p]) => (
                            <button
                                key={k}
                                type="button"
                                aria-pressed={form.priority === k}
                                style={{ "--seg": p.color }}
                                onClick={() => set("priority", k)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                </div>

                <div className={styles.col}>
                <div className={ui.field}>
                    <span className={ui.label}>Steps</span>
                    {form.subtasks.length > 0 && (
                        <ul className={styles.steps}>
                            {form.subtasks.map((s, i) => (
                                <li key={s.id}>
                                    <input
                                        type="checkbox"
                                        checked={s.done}
                                        onChange={() => editStep(s.id, { done: !s.done })}
                                        aria-label={`Step ${i + 1} done`}
                                    />
                                    <input
                                        className={ui.input}
                                        value={s.text}
                                        onChange={(e) => editStep(s.id, { text: e.target.value })}
                                        aria-label={`Step ${i + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className={`${ui.iconBtn} ${ui.danger}`}
                                        onClick={() => set("subtasks", form.subtasks.filter((x) => x.id !== s.id))}
                                        aria-label={`Remove step ${i + 1}`}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className={styles.addStep}>
                        <input
                            className={ui.input}
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addStep();
                                }
                            }}
                            placeholder="Add a step and press Enter…"
                            aria-label="New step"
                        />
                        <button type="button" className={`${ui.btn} ${ui.soft} ${ui.small}`} onClick={addStep} disabled={!newStep.trim()}>
                            ＋ Step
                        </button>
                    </div>
                </div>

                <label className={ui.field}>
                    <span className={ui.label}>Notes</span>
                    <textarea
                        className={ui.input}
                        rows={4}
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        placeholder="Links, ideas, little reminders…"
                    />
                </label>

                </div>

                <div className={styles.actions}>
                    <button type="button" className={`${ui.btn} ${ui.soft}`} onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button type="submit" className={ui.btn}>
                        {editing ? "Save changes" : "Plant task 🌱"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function TaskFormPage() {
    const { id } = useParams();
    const { tasks } = useStore();

    if (!id) return <TaskForm key="new" />;

    const task = tasks.find((t) => t.id === id);
    if (!task) {
        return (
            <div className={page.page}>
                <div className={page.empty}>
                    <span className={page.emptyArt} aria-hidden="true">🍃</span>
                    <p>That task can't be found, so there's nothing to edit.</p>
                    <Link to="/tasks" className={ui.btn}>Back to tasks</Link>
                </div>
            </div>
        );
    }
    return <TaskForm key={task.id} task={task} />;
}

export default TaskFormPage;
