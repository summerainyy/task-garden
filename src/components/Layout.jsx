import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../store/context";
import ThemeToggle from "./ThemeToggle";
import Toast from "./Toast";
import styles from "./Layout.module.css";

const MENU = [
    { to: "/", label: "Dashboard", icon: "🏡", end: true },
    { to: "/tasks", label: "Tasks", icon: "🌱", end: true },
    { to: "/lists", label: "Lists", icon: "🧺" },
    { to: "/settings", label: "Settings", icon: "⚙️" },
];

function Brand() {
    return (
        <Link to="/" className={styles.brand}>
            <span className={styles.brandSun} aria-hidden="true">🌞</span>
            <span>
                Task
                <br />
                Garden
            </span>
        </Link>
    );
}

function Layout() {
    const { tasks, lists, toast, closeToast } = useStore();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const activeList = location.pathname === "/tasks" ? params.get("list") : null;

    // each new page starts at the top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Shortcuts: N = new task page, / = search tasks, Esc = leave a field
    useEffect(() => {
        const onKey = (e) => {
            if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
                if (e.key === "Escape") e.target.blur();
                return;
            }
            if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('[role="dialog"]')) return;
            if (e.key.toLowerCase() === "n") {
                e.preventDefault();
                navigate("/tasks/new");
            } else if (e.key === "/") {
                e.preventDefault();
                const search = document.querySelector('input[type="search"]');
                if (search) search.focus();
                else navigate("/tasks");
            } else if (e.key === "Escape") {
                setOpen(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [navigate]);

    const close = () => setOpen(false);
    const growing = tasks.filter((t) => !t.completed).length;
    const countFor = (id) => tasks.filter((t) => t.list === id && !t.completed).length;

    return (
        <div className={styles.shell}>
            <header className={styles.topbar}>
                <button className={styles.burger} onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
                    <span />
                    <span />
                    <span />
                </button>
                <Brand />
                <ThemeToggle />
            </header>

            <div className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`} onClick={close} aria-hidden="true" />

            <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`} aria-label="Main menu">
                <div className={styles.sideTop}>
                    <Brand />
                    <button className={styles.closeBtn} onClick={close} aria-label="Close menu">
                        ✕
                    </button>
                </div>

                <Link to="/tasks/new" className={styles.newBtn} onClick={close}>
                    ＋ New task
                </Link>

                <nav className={styles.nav}>
                    {MENU.map((m) => (
                        <NavLink
                            key={m.to}
                            to={m.to}
                            end={m.end}
                            onClick={close}
                            className={({ isActive }) => `${styles.navItem} ${isActive && !activeList ? styles.active : ""}`}
                        >
                            <span className={styles.navIcon} aria-hidden="true">{m.icon}</span>
                            <span className={styles.navLabel}>{m.label}</span>
                            {m.to === "/tasks" && growing > 0 && <span className={styles.count}>{growing}</span>}
                            {m.to === "/lists" && <span className={styles.count}>{lists.length}</span>}
                        </NavLink>
                    ))}
                </nav>

                <p className={styles.sectionLabel}>My lists</p>
                <nav className={styles.nav}>
                    {lists.map((l) => (
                        <Link
                            key={l.id}
                            to={`/tasks?list=${l.id}`}
                            onClick={close}
                            className={`${styles.navItem} ${styles.listItem} ${activeList === l.id ? styles.active : ""}`}
                            style={{ "--list": l.color }}
                        >
                            <span className={styles.navIcon} aria-hidden="true">{l.emoji}</span>
                            <span className={styles.navLabel}>{l.name}</span>
                            {countFor(l.id) > 0 && <span className={styles.count}>{countFor(l.id)}</span>}
                        </Link>
                    ))}
                    <Link to="/lists" onClick={close} className={`${styles.navItem} ${styles.addList}`}>
                        <span className={styles.navIcon} aria-hidden="true">＋</span>
                        <span className={styles.navLabel}>Add a list</span>
                    </Link>
                </nav>

                <div className={styles.sideBottom}>
                    <span className={styles.snail} aria-hidden="true">🐌</span>
                    <span className={styles.slow}>slow &amp; steady</span>
                    <ThemeToggle />
                </div>
            </aside>

            <main className={styles.main}>
                <Outlet />
            </main>

            <Toast key={toast?.id} toast={toast} onClose={closeToast} />
        </div>
    );
}

export default Layout;
