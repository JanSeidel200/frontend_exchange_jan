import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getCurrencies } from "../api/client";
import type { CurrencyOption } from "../types";

const DEFAULT_SYMBOLS = ["CZK", "USD", "GBP", "PLN"];

export function AnalysisForm() {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [base, setBase] = useState("EUR");
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrencies()
      .then(setCurrencies)
      .catch(() => setError(t("form.errors.currenciesFailed")));
  }, [t]);

  function toggleSymbol(code: string) {
    setSymbols((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  }

  return (
    <form className="panel">
      <h2>{t("form.heading")}</h2>

      <label htmlFor="base">{t("form.base")}</label>
      <select
        id="base"
        value={base}
        onChange={(e) => setBase(e.target.value)}
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} - {c.name}
          </option>
        ))}
      </select>

      <label>{t("form.symbols")}</label>
      <div className="currency-grid">
        {currencies.slice(0, 40).map((c) => (
          <label key={c.code} className="checkbox-row">
            <input
              type="checkbox"
              checked={symbols.includes(c.code)}
              disabled={c.code === base}
              onChange={() => toggleSymbol(c.code)}
            />
            <span>{c.code}</span>
          </label>
        ))}
      </div>

      {error && <div className="error">{error}</div>}
    </form>
  );
}