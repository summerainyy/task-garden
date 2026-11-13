/* ---------- lists ---------- */

export const DEFAULT_LISTS = [
    { id: "personal", name: "Personal", emoji: "🌷", color: "#ff9bb0" },
    { id: "work", name: "Work", emoji: "🌼", color: "#8ecbff" },
    { id: "home", name: "Home", emoji: "🌻", color: "#ffc65c" },
    { id: "health", name: "Health", emoji: "🌺", color: "#7fd8b6" },
    { id: "errands", name: "Errands", emoji: "🏵️", color: "#c3a6ff" },
];

export const LIST_COLORS = ["#ff9bb0", "#8ecbff", "#ffc65c", "#7fd8b6", "#c3a6ff", "#ffa47a", "#a8e07f", "#f5a8e0"];
export const LIST_EMOJIS = ["🌷", "🌼", "🌻", "🌺", "🏵️", "🌸", "🍄", "🌿", "🍓", "🐝", "🦋", "🍀", "⭐", "🎨", "📚", "🛒"];

const NO_LIST = { id: "", name: "No list", emoji: "🌱", color: "#d8d2c4" };

export const getList = (lists, id) => lists.find((l) => l.id === id) ?? NO_LIST;

export const PRIORITIES = {
    high: { label: "High", rank: 0, color: "#ff7a6b" },
    medium: { label: "Medium", rank: 1, color: "#ffbf47" },
    low: { label: "Low", rank: 2, color: "#6cc99f" },
};

export const REPEATS = {
    none: "No repeat",
    daily: "Every day",
    weekly: "Every week",
    monthly: "Every month",
};

/* ---------- dates: local "YYYY-MM-DD" keys ---------- */

export const toKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromKey = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
};

export const todayKey = () => toKey(new Date());

export const addDays = (key, n) => {
    const d = fromKey(key);
    d.setDate(d.getDate() + n);
    return toKey(d);
};

export const formatDue = (key) => {
    if (!key) return "";
    const t = todayKey();
    if (key === t) return "Today";
    if (key === addDays(t, 1)) return "Tomorrow";
    if (key === addDays(t, -1)) return "Yesterday";
    return fromKey(key).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

export const formatStamp = (ms) =>
    new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const dueStatus = (task, today) => {
    if (!task.due || task.completed) return "";
    if (task.due < today) return "overdue";
    if (task.due === today) return "today";
    return "later";
};

/* ---------- tasks ---------- */

export const now = () => Date.now();

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export function createTask(fields = {}) {
    return {
        id: uid(),
        text: "",
        completed: false,
        completedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        priority: "medium",
        list: "personal",
        due: "",
        repeat: "none",
        notes: "",
        subtasks: [],
        ...fields,
    };
}

export function nextOccurrence(task) {
    const base = task.due || todayKey();
    let due = base;
    if (task.repeat === "daily") due = addDays(base, 1);
    if (task.repeat === "weekly") due = addDays(base, 7);
    if (task.repeat === "monthly") {
        const d = fromKey(base);
        d.setMonth(d.getMonth() + 1);
        due = toKey(d);
    }
    return createTask({
        ...task,
        id: uid(),
        createdAt: Date.now(),
        updatedAt: null,
        completed: false,
        completedAt: null,
        due,
        subtasks: task.subtasks.map((s) => ({ ...s, id: uid(), done: false })),
    });
}

/* ---------- quick-add shortcuts ----------
   "Buy bread !high #errands @tomorrow"
   !high !med !low · #list · @today @tomorrow @mon…@sun               */

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function wordToDate(word) {
    const w = word.toLowerCase();
    const t = todayKey();
    if (w.startsWith("tod")) return t;
    if (w.startsWith("tom")) return addDays(t, 1);
    const idx = WEEKDAYS.indexOf(w.slice(0, 3));
    if (idx === -1) return null;
    return addDays(t, (idx - new Date().getDay() + 7) % 7 || 7);
}

export function parseQuickAdd(input, lists) {
    const found = {};
    let text = ` ${input} `;

    text = text.replace(/\s!(high|h|med|medium|m|low|l)(?=\s)/i, (_, p) => {
        const k = p[0].toLowerCase();
        found.priority = k === "h" ? "high" : k === "l" ? "low" : "medium";
        return " ";
    });
    text = text.replace(/\s#(\w+)(?=\s)/, (match, w) => {
        const q = w.toLowerCase();
        const list = lists.find((l) => l.name.toLowerCase().replace(/\s+/g, "").startsWith(q));
        if (!list) return match;
        found.list = list.id;
        return " ";
    });
    text = text.replace(/\s@(\w+)(?=\s)/, (match, w) => {
        const due = wordToDate(w);
        if (!due) return match;
        found.due = due;
        return " ";
    });

    return { text: text.replace(/\s+/g, " ").trim(), found };
}

/* ---------- stats ---------- */

export function completionsByDay(tasks, days = 7) {
    const t = todayKey();
    const keys = Array.from({ length: days }, (_, i) => addDays(t, i - days + 1));
    const counts = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const task of tasks) {
        if (!task.completedAt) continue;
        const k = toKey(new Date(task.completedAt));
        if (k in counts) counts[k] += 1;
    }
    return keys.map((key) => ({ key, count: counts[key] }));
}

export function streak(tasks) {
    const days = new Set(tasks.filter((t) => t.completedAt).map((t) => toKey(new Date(t.completedAt))));
    let day = todayKey();
    if (!days.has(day)) day = addDays(day, -1);
    let n = 0;
    while (days.has(day)) {
        n += 1;
        day = addDays(day, -1);
    }
    return n;
}

/* ---------- first visit: a few friendly example tasks ---------- */

export function starterTasks() {
    const t = todayKey();
    return [
        createTask({ text: "Plant your first task ✨", list: "personal", due: t, priority: "high" }),
        createTask({
            text: "Open me to see my details",
            list: "work",
            due: addDays(t, 1),
            notes: "Every task has its own page — tap the ➜ arrow or the title.",
            subtasks: [
                { id: uid(), text: "Peek at the details page", done: true },
                { id: uid(), text: "Try editing me", done: false },
            ],
        }),
        createTask({ text: "Water the real plants too 🪴", list: "home", repeat: "weekly", due: addDays(t, 2), priority: "low" }),
        createTask({ text: "Make a list of your own on the Lists page", list: "errands", due: addDays(t, 3) }),
        createTask({ text: "Tick a task to make it bloom", list: "health", completed: true, completedAt: Date.now() }),
    ];
}
