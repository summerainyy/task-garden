import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/context";
import AddTask from "../components/AddTask";
import Toolbar from "../components/Toolbar";
import TodoItem from "../components/TodoItem";
import { VIEWS, inView, matchesSearch, sortTasks } from "../lib/filters";
import { getList } from "../lib/tasks";
import ui from "../components/ui.module.css";
import page from "./Page.module.css";
import styles from "./TasksPage.module.css";

function TasksPage() {
    const store = useStore();
    const { tasks, lists, today, settings } = store;
    const [params, setParams] = useSearchParams();
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [dragId, setDragId] = useState(null);
    const [overId, setOverId] = useState(null);

    // view & list live in the URL so menu links and the dashboard can open filtered pages
    const view = VIEWS.some((v) => v.id === params.get("view")) ? params.get("view") : "all";
    const listId = lists.some((l) => l.id === params.get("list")) ? params.get("list") : "all";
    const sort = settings.sort;
    const filters = { view, list: listId, status, sort, search };

    const setFilter = (key, value) => {
        if (key === "status") return setStatus(value);
        if (key === "search") return setSearch(value);
        if (key === "sort") return store.setSettings({ sort: value });
        const next = new URLSearchParams(params);
        if (value === "all") next.delete(key);
        else next.set(key, value);
        setParams(next, { replace: true });
    };

    const visible = sortTasks(
        tasks.filter(
            (t) =>
                inView(view, t, today) &&
                (listId === "all" || t.list === listId) &&
                (status === "all" || (status === "done") === t.completed) &&
                matchesSearch(t, search)
        ),
        sort
    );
    const growing = visible.filter((t) => !t.completed);
    const bloomed = visible.filter((t) => t.completed);
    const counts = Object.fromEntries(VIEWS.map((v) => [v.id, tasks.filter((t) => !t.completed && inView(v.id, t, today)).length]));
    const isFiltered = view !== "all" || listId !== "all" || status !== "all" || search;
    const list = listId !== "all" ? getList(lists, listId) : null;
    const viewInfo = VIEWS.find((v) => v.id === view);

    const canDrag = sort === "manual" && !search;
    const dragFor = (id) =>
        canDrag && {
            isOver: overId === id && dragId !== id,
            isDragging: dragId === id,
            handlers: {
                draggable: true,
                onDragStart: (e) => {
                    e.dataTransfer.effectAllowed = "move";
                    setDragId(id);
                },
                onDragOver: (e) => {
                    e.preventDefault();
                    if (overId !== id) setOverId(id);
                },
                onDrop: (e) => {
                    e.preventDefault();
                    if (dragId && dragId !== id) store.moveTask(dragId, id);
                    setDragId(null);
                    setOverId(null);
                },
                onDragEnd: () => {
                    setDragId(null);
                    setOverId(null);
                },
            },
        };

    const renderTask = (task) => (
        <TodoItem
            key={task.id}
            task={task}
            today={today}
            query={search}
            onToggle={store.toggleTask}
            onUpdate={store.updateTask}
            onDelete={store.deleteTask}
            drag={!task.completed ? dragFor(task.id) : null}
        />
    );

    return (
        <div className={page.page}>
            <div className={page.head}>
                <div>
                    <h1 className={page.title}>
                        {list ? `${list.emoji} ${list.name}` : view !== "all" ? `${viewInfo.icon} ${viewInfo.label}` : "🌱 All tasks"}
                    </h1>
                    <p className={page.sub}>
                        {growing.length} growing · {bloomed.length} in bloom
                    </p>
                </div>
                <Link to={`/tasks/new${list ? `?list=${list.id}` : ""}`} className={ui.btn}>
                    ＋ Detailed task
                </Link>
            </div>

            <div className={styles.layout}>
            <aside className={styles.controls}>
                <AddTask onAdd={store.addTask} defaultList={list?.id} />
                <Toolbar filters={filters} setFilter={setFilter} counts={counts} />
            </aside>

            <div className={styles.results}>

            {visible.length === 0 ? (
                <div className={page.empty}>
                    <span className={page.emptyArt} aria-hidden="true">🌾🐌🌾</span>
                    <p>{isFiltered ? "No tasks match these filters." : "Your garden is resting. Plant a task above!"}</p>
                    {isFiltered && (
                        <button
                            className={page.textBtn}
                            onClick={() => {
                                setParams({}, { replace: true });
                                setStatus("all");
                                setSearch("");
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {growing.length > 0 && (
                        <section aria-labelledby="growing-heading">
                            <h2 id="growing-heading" className={page.sectionTitle}>
                                Growing <span className={page.badge}>{growing.length}</span>
                            </h2>
                            <ul className={`${page.taskList} ${styles.taskGrid}`}>{growing.map(renderTask)}</ul>
                        </section>
                    )}

                    {bloomed.length > 0 && (
                        <section aria-labelledby="bloom-heading">
                            <div className={page.cardHead}>
                                <h2 id="bloom-heading" className={page.sectionTitle}>
                                    In bloom <span className={page.badge}>{bloomed.length}</span>
                                </h2>
                                <button className={page.textBtn} onClick={store.clearCompleted}>
                                    🧺 Clear finished
                                </button>
                            </div>
                            <ul className={`${page.taskList} ${styles.taskGrid}`}>{bloomed.map(renderTask)}</ul>
                        </section>
                    )}
                </>
            )}
            </div>
            </div>

            <p className={page.footnote}>
                ✿ double-click to rename · ➜ opens a task · drag ⠿ to reorder · <kbd>N</kbd> new task · <kbd>/</kbd> search
            </p>
        </div>
    );
}

export default TasksPage;
