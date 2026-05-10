import { useState } from "react";
import { useTranslation } from "react-i18next";

import { logout } from "./api/client";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoginForm } from "./components/LoginForm";
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
    <main className="center-layout">
      <section className="card">
        <div className="card__header">
          <h1>{t("app.title")}</h1>
          <LanguageSwitcher />
        </div>
        <p className="muted">{t("app.subtitle")}</p>
        <button type="button" onClick={handleLogout}>
          {t("app.logout")}
        </button>
      </section>
    </main>
  );
}

export default App;