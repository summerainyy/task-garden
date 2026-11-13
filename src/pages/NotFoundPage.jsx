import { Link } from "react-router-dom";
import ui from "../components/ui.module.css";
import page from "./Page.module.css";

function NotFoundPage() {
    return (
        <div className={page.page}>
            <div className={page.empty}>
                <span className={page.emptyArt} aria-hidden="true">🐌🍂</span>
                <h1 className={page.title}>Page not found</h1>
                <p>The snail wandered off the path. Let's get you back to the garden.</p>
                <Link to="/" className={ui.btn}>🏡 Go to dashboard</Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
