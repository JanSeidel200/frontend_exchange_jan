import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getSettings, logout, saveSettings } from "./api/client";
import { AnalysisForm } from "./components/AnalysisForm";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoginForm } from "./components/LoginForm";
import { LogsPanel } from "./components/LogsPanel";
import { ResultsChart } from "./components/ResultsChart";
import { ResultsTable } from "./components/ResultsTable";
import type { AnalyzeResponse } from "./types";
import "./index.css";

type View = "dashboard" | "logs";

const DEFAULT_SYMBOLS = ["CZK", "USD", "GBP", "PLN"];

function App() {
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [view, setView] = useState<View>("dashboard");

  const [base, setBase] = useState("EUR");
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-01-31");

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;

    let ignore = false;

    getSettings()
      .then((s) => {
        if (ignore) return;
        if (s.base) setBase(s.base);
        if (s.symbols.length > 0) setSymbols(s.symbols);
      })
      .catch((err) => {
        if (!ignore) console.error("Settings hydration failed:", err);
      })
      .finally(() => {
        if (!ignore) setHydrated(true);
      });

    return () => {
      ignore = true;
    };
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn || !hydrated) return;

    const handle = setTimeout(() => {
      saveSettings({ base, symbols }).catch((err) => {
        console.error("Settings save failed:", err);
      });
    }, 800);

    return () => clearTimeout(handle);
  }, [base, symbols, loggedIn, hydrated]);

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
          <AnalysisForm
            base={base}
            symbols={symbols}
            startDate={startDate}
            endDate={endDate}
            onBaseChange={setBase}
            onSymbolsChange={setSymbols}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onResult={setResult}
          />
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