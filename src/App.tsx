import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { checkHealth } from "./api/client";
import "./index.css";

import { LanguageSwitcher } from "./components/LanguageSwitcher";


function App() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    checkHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <main className="center-layout">
      <section className="card">
        <div className="card__header">
          <h1>{t("app.title")}</h1>
          <LanguageSwitcher />
        </div>
        <p>{t("app.backendStatus")}: <strong>{status}</strong></p>
      </section>
    </main>
  );
}

export default App;