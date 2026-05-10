import { useEffect, useState } from "react";

import { checkHealth } from "./api/client";
import "./index.css";

function App() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    checkHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <main className="center-layout">
      <section className="card">
        <h1>Exchange Rate Analyzer</h1>
        <p>Backend status: <strong>{status}</strong></p>
      </section>
    </main>
  );
}

export default App;