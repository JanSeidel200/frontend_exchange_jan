import { useState } from "react";
import { useTranslation } from "react-i18next";

import { logout } from "./api/client";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoginForm } from "./components/LoginForm";
import { AnalysisForm } from "./components/AnalysisForm";
import "./index.css";

function App() {
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return (
      <main className="center-layout">
        <LoginForm onLoggedIn={() => setLoggedIn(true)} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>{t("app.title")}</h1>
          <p className="muted">{t("app.subtitle")}</p>
        </div>
        <div className="topbar__actions">
          <LanguageSwitcher />
          <button type="button" onClick={handleLogout}>
            {t("app.logout")}
          </button>
        </div>
      </header>
      <section className="content-grid">
        <AnalysisForm />
        <div /> {/* Placeholder pro výsledky */}
      </section>
    </main>
  );
}

export default App;