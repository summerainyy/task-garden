import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/context";
import Modal from "../components/Modal";
import { LIST_COLORS, LIST_EMOJIS } from "../lib/tasks";
import ui from "../components/ui.module.css";
import page from "./Page.module.css";
import styles from "./ListsPage.module.css";

// Create & update form for a list
function ListForm({ initial, submitLabel, onSubmit, onCancel, wide = false }) {
    const { lists } = useStore();
    const [name, setName] = useState(initial?.name ?? "");
    const [emoji, setEmoji] = useState(initial?.emoji ?? LIST_EMOJIS[5]);
    const [color, setColor] = useState(initial?.color ?? LIST_COLORS[lists.length % LIST_COLORS.length]);
    const clean = name.trim();
    const duplicate = lists.some((l) => l.id !== initial?.id && l.name.toLowerCase() === clean.toLowerCase());

    const submit = (e) => {
        e.preventDefault();
        if (!clean || duplicate) return;
        onSubmit({ name: clean, emoji, color });
        if (!initial) setName("");
    };

    return (
        <form className={`${styles.form} ${wide ? styles.formWide : ""}`} onSubmit={submit} style={{ "--list": color }}>
            <div className={styles.preview} aria-hidden="true">{emoji}</div>
            <label className={ui.field}>
                <span className={ui.label}>Name</span>
                <input
                    className={ui.input}
                    value={name}
                    maxLength={24}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Garden club"
                    autoFocus={!!initial}
                />
                {duplicate && <span className={styles.error}>You already have a list with that name.</span>}
            </label>

            <fieldset className={styles.fieldset}>
                <legend className={ui.label}>Icon</legend>
                <div className={styles.emojis}>
                    {LIST_EMOJIS.map((e) => (
                        <button
                            key={e}
                            type="button"
                            className={styles.emojiBtn}
                            aria-pressed={emoji === e}
                            onClick={() => setEmoji(e)}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
                <legend className={ui.label}>Colour</legend>
                <div className={styles.swatches}>
                    {LIST_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className={styles.swatch}
                            style={{ background: c }}
                            aria-pressed={color === c}
                            aria-label={`Colour ${c}`}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
            </fieldset>

            <div className={styles.formActions}>
                {onCancel && (
                    <button type="button" className={`${ui.btn} ${ui.soft} ${ui.small}`} onClick={onCancel}>
                        Cancel
                    </button>
                )}
                <button type="submit" className={`${ui.btn} ${ui.small}`} disabled={!clean || duplicate}>
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

function ListsPage() {
    const { lists, tasks, addList, updateList, deleteList, notify } = useStore();
    const [editingId, setEditingId] = useState(null);
    const [deleting, setDeleting] = useState(null); // list being deleted
    const [moveTo, setMoveTo] = useState("");

    const startDelete = (list) => {
        setDeleting(list);
        setMoveTo(lists.find((l) => l.id !== list.id)?.id ?? "");
    };
    const deletingCount = deleting ? tasks.filter((t) => t.list === deleting.id).length : 0;

    return (
        <div className={page.page}>
            <div className={page.head}>
                <div>
                    <h1 className={page.title}>🧺 Lists</h1>
                    <p className={page.sub}>Little flower beds to keep your tasks tidy.</p>
                </div>
            </div>

            <section className={`${page.card} ${styles.newCard}`} aria-labelledby="new-list">
                <h2 id="new-list" className={page.cardTitle}>＋ New list</h2>
                <ListForm wide submitLabel="Create list" onSubmit={(data) => addList(data)} />
            </section>

            <h2 className={page.sectionTitle}>
                Your lists <span className={page.badge}>{lists.length}</span>
            </h2>

            <div className={styles.grid}>
                {lists.map((l) => {
                    const all = tasks.filter((t) => t.list === l.id);
                    const done = all.filter((t) => t.completed).length;
                    const pct = all.length ? Math.round((done / all.length) * 100) : 0;

                    if (editingId === l.id) {
                        return (
                            <section key={l.id} className={`${page.card} ${styles.listCard}`} style={{ "--list": l.color }}>
                                <h2 className={page.cardTitle}>✎ Edit list</h2>
                                <ListForm
                                    initial={l}
                                    submitLabel="Save"
                                    onCancel={() => setEditingId(null)}
                                    onSubmit={(data) => {
                                        updateList(l.id, data);
                                        setEditingId(null);
                                        notify(`${data.emoji} Saved “${data.name}”`);
                                    }}
                                />
                            </section>
                        );
                    }

                    return (
                        <section key={l.id} className={`${page.card} ${styles.listCard}`} style={{ "--list": l.color }}>
                            <Link to={`/tasks?list=${l.id}`} className={styles.listLink}>
                                <span className={styles.bigEmoji} aria-hidden="true">{l.emoji}</span>
                                <span className={styles.listName}>{l.name}</span>
                                <span className={styles.listMeta}>
                                    {all.length - done} growing · {done} in bloom
                                </span>
                            </Link>
                            <div className={styles.bar} aria-label={`${pct}% done`}>
                                <span style={{ width: `${pct}%` }} />
                            </div>
                            <div className={styles.cardActions}>
                                <Link to={`/tasks?list=${l.id}`} className={`${ui.btn} ${ui.soft} ${ui.small}`}>
                                    Open
                                </Link>
                                <button className={`${ui.btn} ${ui.soft} ${ui.small}`} onClick={() => setEditingId(l.id)}>
                                    ✎ Edit
                                </button>
                                <button
                                    className={`${ui.btn} ${ui.soft} ${ui.small} ${styles.del}`}
                                    onClick={() => startDelete(l)}
                                    disabled={lists.length === 1}
                                    title={lists.length === 1 ? "You need at least one list" : "Delete list"}
                                >
                                    🗑️
                                </button>
                            </div>
                        </section>
                    );
                })}
            </div>

            {deleting && (
                <Modal
                    title={`Delete “${deleting.name}”?`}
                    icon={deleting.emoji}
                    onClose={() => setDeleting(null)}
                    actions={
                        <>
                            <button className={`${ui.btn} ${ui.soft}`} onClick={() => setDeleting(null)} autoFocus>
                                Keep it
                            </button>
                            <button
                                className={ui.btn}
                                onClick={() => {
                                    deleteList(deleting.id, moveTo || null);
                                    setDeleting(null);
                                }}
                            >
                                Delete list
                            </button>
                        </>
                    }
                >
                    {deletingCount === 0 ? (
                        <p>This list is empty, so nothing else changes.</p>
                    ) : (
                        <>
                            <p>
                                It has {deletingCount} task{deletingCount === 1 ? "" : "s"}. What should happen to{" "}
                                {deletingCount === 1 ? "it" : "them"}?
                            </p>
                            <label className={styles.choice}>
                                <input type="radio" name="fate" checked={!!moveTo} onChange={() => setMoveTo(lists.find((l) => l.id !== deleting.id).id)} />
                                <span>Move to</span>
                                <select
                                    className={ui.input}
                                    value={moveTo}
                                    onChange={(e) => setMoveTo(e.target.value)}
                                    disabled={!moveTo}
                                    aria-label="Move tasks to list"
                                >
                                    {lists
                                        .filter((l) => l.id !== deleting.id)
                                        .map((l) => (
                                            <option key={l.id} value={l.id}>{l.emoji} {l.name}</option>
                                        ))}
                                </select>
                            </label>
                            <label className={styles.choice}>
                                <input type="radio" name="fate" checked={!moveTo} onChange={() => setMoveTo("")} />
                                <span>Delete the tasks too</span>
                            </label>
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
}

export default ListsPage;
