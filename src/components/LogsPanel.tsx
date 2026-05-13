import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getLogs } from "../api/client";

function getLevelClass(line: string): string {
  if (line.includes("| ERROR ") || line.includes("| CRITICAL ")) return "log-error";
  if (line.includes("| WARNING ")) return "log-warning";
  if (line.includes("| INFO ")) return "log-info";
  return "log-default";
}

export function LogsPanel() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);
    setError(null);
    try {
      const data = await getLogs();
      setLogs(data);
    } catch {
      setError(t("logs.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  return (
    <section className="panel logs-panel">
      <div className="logs-panel__header">
        <div>
          <h2>{t("logs.title")}</h2>
          <p className="muted">{t("logs.subtitle")}</p>
        </div>
        <button type="button" onClick={() => void loadLogs()} disabled={loading}>
          {t("logs.refresh")}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {!error && logs.length === 0 && !loading && (
        <p className="muted">{t("logs.empty")}</p>
      )}

      {logs.length > 0 && (
        <div className="logs-viewer">
          {logs.map((line, idx) => (
            <div key={idx} className={`logs-line ${getLevelClass(line)}`}>
              {line}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}