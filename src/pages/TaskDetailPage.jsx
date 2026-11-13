import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../store/context";
import Modal from "../components/Modal";
import { PRIORITIES, REPEATS, dueStatus, formatDue, formatStamp, getList } from "../lib/tasks";
import ui from "../components/ui.module.css";
import page from "./Page.module.css";
import styles from "./TaskDetailPage.module.css";

function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, lists, today, toggleTask, updateTask, deleteTask } = useStore();
    const [confirming, setConfirming] = useState(false);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
        return (
            <div className={page.page}>
                <div className={page.empty}>
                    <span className={page.emptyArt} aria-hidden="true">🍃</span>
                    <p>This seed blew away — the task doesn't exist anymore.</p>
                    <Link to="/tasks" className={ui.btn}>Back to tasks</Link>
                </div>
            </div>
        );
    }

    const list = getList(lists, task.list);
    const due = dueStatus(task, today);
    const stepsDone = task.subtasks.filter((s) => s.done).length;
    const pct = task.subtasks.length ? Math.round((stepsDone / task.subtasks.length) * 100) : 0;

    const facts = [
        ["List", <Link key="l" to={`/tasks?list=${list.id}`}>{list.emoji} {list.name}</Link>],
        ["Priority", <span key="p" className={ui.chip} style={{ background: PRIORITIES[task.priority].color, color: "#3b3557" }}>⚑ {PRIORITIES[task.priority].label}</span>],
        ["Due", task.due ? <span key="d" className={due === "overdue" ? styles.overdue : ""}>{formatDue(task.due)}{due === "overdue" && " · overdue"}</span> : "—"],
        ["Repeat", REPEATS[task.repeat]],
        ["Planted", formatStamp(task.createdAt)],
        ["Last edited", task.updatedAt ? formatStamp(task.updatedAt) : "—"],
        ["Bloomed", task.completedAt ? formatStamp(task.completedAt) : "Not yet"],
    ];

    const remove = () => {
        deleteTask(task.id);
        navigate("/tasks");
    };

    return (
        <div className={page.page}>
            <Link to="/tasks" className={page.crumb}>← All tasks</Link>

            <article className={`${page.card} ${styles.card}`} style={{ "--list": list.color }}>
                <span className={styles.tag} aria-hidden="true">{list.emoji}</span>

                <div className={styles.top}>
                    <button
                        className={`${styles.check} ${task.completed ? styles.checked : ""}`}
                        role="checkbox"
                        aria-checked={task.completed}
                        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
                        onClick={() => toggleTask(task.id)}
                    >
                        {task.completed ? list.emoji : ""}
                    </button>
                    <div>
                        <p className={styles.status}>{task.completed ? "🌸 In bloom" : "🌱 Growing"}</p>
                        <h1 className={`${styles.title} ${task.completed ? styles.titleDone : ""}`}>{task.text}</h1>
                    </div>
                </div>

                <dl className={styles.facts}>
                    {facts.map(([k, v]) => (
                        <div key={k}>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                        </div>
                    ))}
                </dl>

                <div className={styles.blocks}>
                <section className={styles.block}>
                    <h2 className={styles.blockTitle}>
                        Steps {task.subtasks.length > 0 && <small>{stepsDone}/{task.subtasks.length} · {pct}%</small>}
                    </h2>
                    {task.subtasks.length ? (
                        <>
                            <div className={styles.progress}><span style={{ width: `${pct}%` }} /></div>
                            <ul className={styles.steps}>
                                {task.subtasks.map((s) => (
                                    <li key={s.id}>
                                        <label className={s.done ? styles.stepDone : ""}>
                                            <input
                                                type="checkbox"
                                                checked={s.done}
                                                onChange={() =>
                                                    updateTask(task.id, {
                                                        subtasks: task.subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)),
                                                    })
                                                }
                                            />
                                            {s.text}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className={styles.muted}>No steps yet — add some when you edit.</p>
                    )}
                </section>

                <section className={styles.block}>
                    <h2 className={styles.blockTitle}>Notes</h2>
                    {task.notes ? <p className={styles.notes}>{task.notes}</p> : <p className={styles.muted}>No notes.</p>}
                </section>
                </div>

                <div className={styles.actions}>
                    <button className={`${ui.btn} ${ui.soft}`} onClick={() => toggleTask(task.id)}>
                        {task.completed ? "↺ Mark as growing" : "🌸 Mark as done"}
                    </button>
                    <Link to={`/tasks/${task.id}/edit`} className={`${ui.btn} ${ui.on}`}>✎ Edit</Link>
                    <button className={`${ui.btn} ${styles.deleteBtn}`} onClick={() => setConfirming(true)}>
                        🗑️ Delete
                    </button>
                </div>
            </article>

            {confirming && (
                <Modal
                    title="Delete this task?"
                    icon="🍂"
                    onClose={() => setConfirming(false)}
                    actions={
                        <>
                            <button className={`${ui.btn} ${ui.soft}`} onClick={() => setConfirming(false)} autoFocus>
                                Keep it
                            </button>
                            <button className={`${ui.btn} ${styles.deleteBtn}`} onClick={remove}>
                                Delete
                            </button>
                        </>
                    }
                >
                    <p>“{task.text}” will be removed. You can still undo right after.</p>
                </Modal>
            )}
        </div>
    );
}

export default TaskDetailPage;
