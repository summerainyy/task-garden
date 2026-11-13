import { PRIORITIES } from "./tasks";

export const VIEWS = [
    { id: "all", label: "All", icon: "🌈" },
    { id: "today", label: "Today", icon: "☀️" },
    { id: "upcoming", label: "Upcoming", icon: "🗓️" },
    { id: "overdue", label: "Overdue", icon: "⏰" },
];

export const SORTS = {
    manual: "My order",
    due: "Due date",
    priority: "Priority",
    newest: "Newest",
    az: "A → Z",
};

export function inView(view, t, today) {
    switch (view) {
        case "today":
            return !!t.due && (t.due === today || (t.due < today && !t.completed));
        case "upcoming":
            return t.due > today;
        case "overdue":
            return !!t.due && t.due < today && !t.completed;
        default:
            return true;
    }
}

export function matchesSearch(t, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
        t.text.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.subtasks.some((s) => s.text.toLowerCase().includes(q))
    );
}

const byDue = (a, b) => (a.due || "9999").localeCompare(b.due || "9999");
const byPriority = (a, b) => PRIORITIES[a.priority].rank - PRIORITIES[b.priority].rank;

const COMPARE = {
    due: (a, b) => byDue(a, b) || byPriority(a, b),
    priority: (a, b) => byPriority(a, b) || byDue(a, b),
    newest: (a, b) => b.createdAt - a.createdAt,
    az: (a, b) => a.text.localeCompare(b.text),
};

export function sortTasks(list, sort) {
    return COMPARE[sort] ? [...list].sort(COMPARE[sort]) : list;
}
