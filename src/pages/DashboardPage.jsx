import { Link } from "react-router-dom";
import { useStore } from "../store/context";
import Header from "../components/Header";
import Garden from "../components/Garden";
import AddTask from "../components/AddTask";
import { addDays, completionsByDay, dueStatus, formatDue, fromKey, getList, streak, toKey } from "../lib/tasks";
import page from "./Page.module.css";
import styles from "./DashboardPage.module.css";

function MiniTask({ task }) {
    const { lists, today, toggleTask } = useStore();
    const list = getList(lists, task.list);
    const due = dueStatus(task, today);
    return (
        <li className={`${styles.mini} ${task.completed ? styles.miniDone : ""}`} style={{ "--list": list.color }}>
            <button
                className={styles.miniCheck}
                role="checkbox"
                aria-checked={task.completed}
                aria-label={`${task.completed ? "Unmark" : "Complete"} “${task.text}”`}
                onClick={() => toggleTask(task.id)}
            >
                {task.completed ? list.emoji : ""}
            </button>
            <Link to={`/tasks/${task.id}`} className={styles.miniText}>
                {task.text}
            </Link>
            {due === "overdue" && <span className={styles.late}>late</span>}
            <span className={styles.miniEmoji} aria-hidden="true">{list.emoji}</span>
        </li>
    );
}

function DashboardPage() {
    const { tasks, lists, today, addTask, notify } = useStore();

    const active = tasks.filter((t) => !t.completed);
    const doneToday = tasks.filter((t) => t.completedAt && toKey(new Date(t.completedAt)) === today).length;
    const overdue = active.filter((t) => t.due && t.due < today);
    const todays = tasks
        .filter((t) => t.due && (t.due === today || (t.due < today && !t.completed)))
        .sort((a, b) => a.completed - b.completed);
    const todaysDone = todays.filter((t) => t.completed).length;
    const weekEnd = addDays(today, 7);
    const upcoming = active.filter((t) => t.due > today && t.due <= weekEnd).sort((a, b) => a.due.localeCompare(b.due));
    const rate = tasks.length ? Math.round(((tasks.length - active.length) / tasks.length) * 100) : 0;
    const week = completionsByDay(tasks, 7);
    const weekMax = Math.max(3, ...week.map((d) => d.count));
    const days = streak(tasks);

    const stats = [
        { icon: "🌱", label: "Growing", value: active.length, to: "/tasks", tint: "var(--mint)" },
        { icon: "🌸", label: "Bloomed today", value: doneToday, to: "/tasks", tint: "#ffc2d1" },
        { icon: "⏰", label: "Overdue", value: overdue.length, to: "/tasks?view=overdue", tint: "var(--coral)" },
        { icon: "🔥", label: "Day streak", value: days, sub: `${rate}% of all tasks done`, tint: "var(--butter)" },
    ];

    const groupedUpcoming = upcoming.reduce((acc, t) => {
        (acc[t.due] ??= []).push(t);
        return acc;
    }, {});

    return (
        <div className={page.page}>
            <Header left={active.length} doneToday={doneToday} />

            <div className={styles.stats}>
                {stats.map((s) => {
                    const body = (
                        <>
                            <span className={styles.statIcon} style={{ background: s.tint }} aria-hidden="true">
                                {s.icon}
                            </span>
                            <span className={styles.statText}>
                                <strong>{s.value}</strong>
                                <span>{s.label}</span>
                                {s.sub && <small>{s.sub}</small>}
                            </span>
                        </>
                    );
                    return s.to ? (
                        <Link key={s.label} to={s.to} className={`${page.card} ${styles.stat} ${styles.statLink}`}>
                            {body}
                        </Link>
                    ) : (
                        <div key={s.label} className={`${page.card} ${styles.stat}`}>
                            {body}
                        </div>
                    );
                })}
            </div>

            <AddTask
                onAdd={(fields) => {
                    const t = addTask(fields);
                    notify(`🌱 Planted “${t.text}”`);
                }}
            />

            <div className={styles.grid}>
                <div className={styles.gardenArea}>
                    <Garden tasks={tasks} />
                </div>

                <section className={`${page.card} ${styles.today}`} aria-labelledby="today-title">
                    <div className={page.cardHead}>
                        <h2 id="today-title" className={page.cardTitle}>☀️ Today</h2>
                        <Link to="/tasks?view=today" className={page.more}>See all →</Link>
                    </div>
                    {todays.length ? (
                        <ul className={styles.miniList}>
                            {todays.slice(0, 6).map((t) => (
                                <MiniTask key={t.id} task={t} />
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.quiet}>Nothing due today. A perfect day for daydreaming ☁️</p>
                    )}
                    {todays.length > 6 && (
                        <Link to="/tasks?view=today" className={styles.moreTasks}>
                            +{todays.length - 6} more for today
                        </Link>
                    )}

                    <div className={styles.cardFoot}>
                        <div className={styles.footRow}>
                            <span>
                                {todaysDone}/{todays.length} done today
                            </span>
                            <Link to={`/tasks/new`} className={page.more}>＋ Add a task</Link>
                        </div>
                        <div className={styles.footBar} aria-hidden="true">
                            <span style={{ width: `${todays.length ? (todaysDone / todays.length) * 100 : 0}%` }} />
                        </div>
                    </div>
                </section>

                <section className={page.card} aria-labelledby="soon-title">
                    <div className={page.cardHead}>
                        <h2 id="soon-title" className={page.cardTitle}>🗓️ Coming up</h2>
                        <Link to="/tasks?view=upcoming" className={page.more}>See all →</Link>
                    </div>
                    {upcoming.length ? (
                        <div className={styles.days}>
                            {Object.entries(groupedUpcoming)
                                .slice(0, 4)
                                .map(([day, items]) => (
                                    <div key={day}>
                                        <p className={styles.dayLabel}>{formatDue(day)}</p>
                                        <ul className={styles.miniList}>
                                            {items.map((t) => (
                                                <MiniTask key={t.id} task={t} />
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className={styles.quiet}>Nothing planned for the next 7 days.</p>
                    )}
                </section>

                <section className={`${page.card} ${styles.wideCard}`} aria-labelledby="lists-title">
                    <div className={page.cardHead}>
                        <h2 id="lists-title" className={page.cardTitle}>🧺 Lists</h2>
                        <Link to="/lists" className={page.more}>Manage →</Link>
                    </div>
                    <ul className={styles.listBars}>
                        {lists.map((l) => {
                            const all = tasks.filter((t) => t.list === l.id);
                            const done = all.filter((t) => t.completed).length;
                            const pct = all.length ? Math.round((done / all.length) * 100) : 0;
                            return (
                                <li key={l.id}>
                                    <Link to={`/tasks?list=${l.id}`} className={styles.listRow} style={{ "--list": l.color }}>
                                        <span className={styles.listEmoji} aria-hidden="true">{l.emoji}</span>
                                        <span className={styles.listInfo}>
                                            <span className={styles.listName}>
                                                {l.name}
                                                <small>{done}/{all.length}</small>
                                            </span>
                                            <span className={styles.bar}>
                                                <span style={{ width: `${pct}%` }} />
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section className={`${page.card} ${styles.wideCard}`} aria-labelledby="week-title">
                    <div className={page.cardHead}>
                        <h2 id="week-title" className={page.cardTitle}>📈 This week</h2>
                        <span className={page.more}>{week.reduce((s, d) => s + d.count, 0)} bloomed</span>
                    </div>
                    <div
                        className={styles.chart}
                        role="img"
                        aria-label={`Tasks finished each day this week: ${week.map((d) => d.count).join(", ")}`}
                    >
                        {week.map((d, i) => (
                            <div key={d.key} className={`${styles.col} ${i === 6 ? styles.colToday : ""}`}>
                                <span className={styles.colVal}>{d.count || ""}</span>
                                <span className={styles.colBar} style={{ height: `${(d.count / weekMax) * 100}%` }}>
                                    {d.count > 0 && <span className={styles.colFlower}>🌼</span>}
                                </span>
                                <span className={styles.colDay}>
                                    {fromKey(d.key).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default DashboardPage;
