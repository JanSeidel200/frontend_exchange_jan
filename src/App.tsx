import { useState } from "react";
import { useTranslation } from "react-i18next";

import { logout } from "./api/client";
import { AnalysisForm } from "./components/AnalysisForm";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoginForm } from "./components/LoginForm";
import { LogsPanel } from "./components/LogsPanel";
import { ResultsChart } from "./components/ResultsChart";
import { ResultsTable } from "./components/ResultsTable";
import type { AnalyzeResponse } from "./types";
import "./index.css";

type View = "dashboard" | "logs";

function App() {
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [view, setView] = useState<View>("dashboard");

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
    setResult(null);
    setView("dashboard");
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
          <button
            type="button"
            className="ghost-button"
            onClick={() => setView(view === "dashboard" ? "logs" : "dashboard")}
          >
            {view === "dashboard" ? t("app.showLogs") : t("app.showDashboard")}
          </button>
          <button type="button" onClick={handleLogout}>
            {t("app.logout")}
          </button>
        </div>
      </header>

      {view === "dashboard" ? (
        <section className="content-grid">
          <AnalysisForm onResult={setResult} />
          <div className="results-column">
            <ResultsTable result={result} />
            <ResultsChart result={result} />
          </div>
        </section>
      ) : (
        <LogsPanel />
      )}
    </main>
  );
}

export default App;