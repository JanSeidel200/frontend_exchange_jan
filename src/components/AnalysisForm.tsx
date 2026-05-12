import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { analyzeRates, getCurrencies } from "../api/client";
import type { AnalyzeResponse, CurrencyOption } from "../types";

type Props = {
  onResult: (result: AnalyzeResponse) => void;
};

const DEFAULT_SYMBOLS = ["CZK", "USD", "GBP", "PLN"];

export function AnalysisForm({ onResult }: Props) {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [base, setBase] = useState("EUR");
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-01-31");
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (symbols.length === 0) {
      setError(t("form.errors.noSymbol"));
      return;
    }
    if (endDate < startDate) {
      setError(t("form.errors.dateOrder"));
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeRates({
        base,
        symbols,
        start_date: startDate,
        end_date: endDate,
      });
      onResult(result);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError(t("form.errors.rateLimit"));
      } else {
        setError(t("form.errors.computeFailed"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>{t("form.heading")}</h2>

      <label htmlFor="base">{t("form.base")}</label>
      <select id="base" value={base} onChange={(e) => setBase(e.target.value)}>
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

      <div className="date-row">
        <div>
          <label htmlFor="startDate">{t("form.startDate")}</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="endDate">{t("form.endDate")}</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? t("form.submitting") : t("form.submit")}
      </button>
    </form>
  );
}