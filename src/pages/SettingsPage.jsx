import { useRef, useState } from "react";
import { useStore } from "../store/context";
import Modal from "../components/Modal";
import { SORTS } from "../lib/filters";
import ui from "../components/ui.module.css";
import page from "./Page.module.css";
import styles from "./SettingsPage.module.css";

function SettingsPage() {
    const { settings, setSettings, tasks, lists, exportData, importData, clearCompleted, resetAll, notify } = useStore();
    const [name, setName] = useState(settings.name);
    const [confirmReset, setConfirmReset] = useState(false);
    const fileRef = useRef(null);
    const done = tasks.filter((t) => t.completed).length;

    const saveName = (e) => {
        e.preventDefault();
        const clean = name.trim();
        if (!clean) return;
        setSettings({ name: clean });
        notify(`👋 Hello, ${clean}!`);
    };

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        try {
            importData(JSON.parse(await file.text()));
        } catch {
            notify("⚠️ That file isn't a Task Garden backup");
        }
    };

    return (
        <div className={page.page}>
            <div className={page.head}>
                <div>
                    <h1 className={page.title}>⚙️ Settings</h1>
                    <p className={page.sub}>Make the garden feel like yours.</p>
                </div>
            </div>

            <div className={styles.stack}>
                <section className={`${page.card} ${styles.you}`} aria-labelledby="s-you">
                    <h2 id="s-you" className={page.cardTitle}>👤 You</h2>
                    <form className={styles.inline} onSubmit={saveName}>
                        <label className={ui.field}>
                            <span className={ui.label}>Your name (used in the greeting)</span>
                            <input className={ui.input} value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
                        </label>
                        <button className={ui.btn} type="submit" disabled={!name.trim() || name.trim() === settings.name}>
                            Save
                        </button>
                    </form>
                </section>

                <section className={`${page.card} ${styles.look}`} aria-labelledby="s-look">
                    <h2 id="s-look" className={page.cardTitle}>🎨 Look & feel</h2>
                    <div className={styles.rows}>
                        <div className={styles.row}>
                            <span>
                                <strong>Theme</strong>
                                <small>Sunny day or firefly night.</small>
                            </span>
                            <div className={ui.segmented}>
                                {[
                                    ["light", "☀️ Day"],
                                    ["dark", "🌙 Night"],
                                ].map(([k, l]) => (
                                    <button key={k} type="button" aria-pressed={settings.theme === k} onClick={() => setSettings({ theme: k })}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className={styles.row}>
                            <span>
                                <strong>Default sort</strong>
                                <small>How the Tasks page is ordered.</small>
                            </span>
                            <select className={`${ui.input} ${styles.select}`} value={settings.sort} onChange={(e) => setSettings({ sort: e.target.value })}>
                                {Object.entries(SORTS).map(([k, l]) => (
                                    <option key={k} value={k}>{l}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </section>

                <section className={`${page.card} ${styles.data}`} aria-labelledby="s-data">
                    <h2 id="s-data" className={page.cardTitle}>💾 Your data</h2>
                    <p className={styles.note}>
                        Everything is saved in this browser: {tasks.length} tasks in {lists.length} lists.
                    </p>
                    <div className={styles.rows}>
                        <div className={styles.row}>
                            <span>
                                <strong>Back up</strong>
                                <small>Download everything as a file.</small>
                            </span>
                            <button className={`${ui.btn} ${ui.soft}`} onClick={exportData}>⬇ Download</button>
                        </div>
                        <div className={styles.row}>
                            <span>
                                <strong>Restore</strong>
                                <small>Load a backup file (you can undo).</small>
                            </span>
                            <button className={`${ui.btn} ${ui.soft}`} onClick={() => fileRef.current?.click()}>⬆ Upload</button>
                            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
                        </div>
                        <div className={styles.row}>
                            <span>
                                <strong>Clear finished</strong>
                                <small>{done} task{done === 1 ? "" : "s"} in bloom.</small>
                            </span>
                            <button className={`${ui.btn} ${ui.soft}`} onClick={clearCompleted} disabled={!done}>🧺 Harvest</button>
                        </div>
                        <div className={styles.row}>
                            <span>
                                <strong>Start over</strong>
                                <small>Replace everything with the starter garden.</small>
                            </span>
                            <button className={`${ui.btn} ${styles.danger}`} onClick={() => setConfirmReset(true)}>Reset</button>
                        </div>
                    </div>
                </section>
            </div>

            {confirmReset && (
                <Modal
                    title="Reset your garden?"
                    icon="🌪️"
                    onClose={() => setConfirmReset(false)}
                    actions={
                        <>
                            <button className={`${ui.btn} ${ui.soft}`} onClick={() => setConfirmReset(false)} autoFocus>
                                Cancel
                            </button>
                            <button
                                className={`${ui.btn} ${styles.danger}`}
                                onClick={() => {
                                    resetAll();
                                    setConfirmReset(false);
                                }}
                            >
                                Yes, reset
                            </button>
                        </>
                    }
                >
                    <p>All {tasks.length} tasks and your custom lists will be replaced. This can't be undone — download a backup first if you want to keep them.</p>
                </Modal>
            )}
        </div>
    );
}

export default SettingsPage;
