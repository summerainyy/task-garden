import { useCallback, useEffect, useState } from "react";
import { StoreContext } from "./context";
import { useLocalStorage } from "../lib/useLocalStorage";
import { DEFAULT_LISTS, createTask, formatDue, nextOccurrence, now, starterTasks, todayKey, uid } from "../lib/tasks";

const readOld = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
};

const defaultSettings = () => ({
    name: "Gardener",
    theme: readOld("pocketGarden.theme") ?? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    sort: readOld("pocketGarden.sort") ?? "manual",
});

export function StoreProvider({ children }) {
    const [tasks, setTasks] = useLocalStorage("pocketGarden.tasks", starterTasks);
    const [lists, setLists] = useLocalStorage("pocketGarden.lists", DEFAULT_LISTS);
    const [settings, setSettingsState] = useLocalStorage("pocketGarden.settings", defaultSettings);
    const [toast, setToast] = useState(null);
    const today = todayKey();

    useEffect(() => {
        document.documentElement.dataset.theme = settings.theme;
    }, [settings.theme]);

    const notify = (message, undo) => setToast({ id: uid(), message, undo });
    const closeToast = useCallback(() => setToast(null), []);
    const setSettings = (patch) => setSettingsState((s) => ({ ...s, ...patch }));

    /* ---------- tasks: create / update / delete ---------- */

    const addTask = (fields) => {
        const task = createTask({ list: lists[0]?.id ?? "", ...fields });
        setTasks((ts) => [task, ...ts]);
        return task;
    };

    const updateTask = (id, patch) =>
        setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)));

    const toggleTask = (id) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        const done = !task.completed;
        const updated = { ...task, completed: done, completedAt: done ? now() : null };
        const next = done && task.repeat !== "none" ? nextOccurrence(task) : null;
        setTasks((ts) => ts.flatMap((t) => (t.id !== id ? [t] : next ? [updated, next] : [updated])));
        if (next) notify(`🔁 Replanted for ${formatDue(next.due)}`);
    };

    const deleteTask = (id) => {
        const index = tasks.findIndex((t) => t.id === id);
        if (index < 0) return;
        const task = tasks[index];
        setTasks((ts) => ts.filter((t) => t.id !== id));
        notify(`🍂 Removed “${task.text}”`, () =>
            setTasks((ts) => {
                const copy = [...ts];
                copy.splice(Math.min(index, copy.length), 0, task);
                return copy;
            })
        );
    };

    const clearCompleted = () => {
        const removed = tasks.filter((t) => t.completed);
        if (!removed.length) return;
        setTasks((ts) => ts.filter((t) => !t.completed));
        notify(`🧺 Harvested ${removed.length} finished task${removed.length === 1 ? "" : "s"}`, () =>
            setTasks((ts) => [...ts, ...removed])
        );
    };

    const moveTask = (fromId, toId) =>
        setTasks((ts) => {
            const from = ts.findIndex((t) => t.id === fromId);
            const to = ts.findIndex((t) => t.id === toId);
            if (from < 0 || to < 0) return ts;
            const copy = [...ts];
            const [moved] = copy.splice(from, 1);
            copy.splice(to, 0, moved);
            return copy;
        });

    /* ---------- lists: create / update / delete ---------- */

    const addList = (fields) => {
        const list = { id: uid(), name: "New list", emoji: "🌸", color: "#ff9bb0", ...fields };
        setLists((ls) => [...ls, list]);
        notify(`${list.emoji} Created “${list.name}”`);
        return list;
    };

    const updateList = (id, patch) => setLists((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

    // moveTo = another list's id to keep the tasks, or null to delete them too
    const deleteList = (id, moveTo) => {
        const index = lists.findIndex((l) => l.id === id);
        if (index < 0) return;
        const list = lists[index];
        const affected = tasks.filter((t) => t.list === id);
        const ids = new Set(affected.map((t) => t.id));

        setLists((ls) => ls.filter((l) => l.id !== id));
        setTasks((ts) =>
            moveTo ? ts.map((t) => (ids.has(t.id) ? { ...t, list: moveTo } : t)) : ts.filter((t) => !ids.has(t.id))
        );
        notify(`🗑️ Deleted list “${list.name}”`, () => {
            setLists((ls) => {
                const copy = [...ls];
                copy.splice(Math.min(index, copy.length), 0, list);
                return copy;
            });
            setTasks((ts) => (moveTo ? ts.map((t) => (ids.has(t.id) ? { ...t, list: id } : t)) : [...ts, ...affected]));
        });
    };

    /* ---------- data ---------- */

    const exportData = () => {
        const blob = new Blob([JSON.stringify({ app: "task-garden", tasks, lists, settings }, null, 2)], {
            type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `task-garden-${today}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const importData = (data) => {
        if (!Array.isArray(data?.tasks) || !Array.isArray(data?.lists)) throw new Error("Not a Task Garden backup");
        const before = { tasks, lists };
        setTasks(data.tasks.map((t) => createTask(t)));
        setLists(data.lists);
        notify(`📥 Restored ${data.tasks.length} tasks`, () => {
            setTasks(before.tasks);
            setLists(before.lists);
        });
    };

    const resetAll = () => {
        setTasks(starterTasks());
        setLists(DEFAULT_LISTS);
        notify("🌱 Fresh garden planted");
    };

    const value = {
        tasks,
        lists,
        settings,
        today,
        toast,
        notify,
        closeToast,
        setSettings,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        clearCompleted,
        moveTask,
        addList,
        updateList,
        deleteList,
        exportData,
        importData,
        resetAll,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
