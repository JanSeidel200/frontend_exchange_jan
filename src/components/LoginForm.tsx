import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { login } from "../api/client";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = {
  onLoggedIn: () => void;
};

export function LoginForm({ onLoggedIn }: Props) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      onLoggedIn();
    } catch {
      setError(t("login.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card login-card">
      <div className="card__header">
        <h1>{t("login.title")}</h1>
        <LanguageSwitcher />
      </div>
      <p className="muted">{t("login.subtitle")}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">{t("login.username")}</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <label htmlFor="password">{t("login.password")}</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? t("login.submitting") : t("login.submit")}
        </button>
      </form>
    </section>
  );
}