import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { checkHealth } from "./api/client";
import "./index.css";

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
        <h1>{t("app.title")}</h1>
        <p>{t("app.backendStatus")}: <strong>{status}</strong></p>
      </section>
    </main>
  );
}

export default App;