// client/src/components/layout/Layout.jsx

import "../../styles/layout.css";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children }) {
    return (
        <div className="site-shell">
            <Header />
            <div className="site-content">
                { children }
            </div>
            <Footer />
        </div>
    )
}