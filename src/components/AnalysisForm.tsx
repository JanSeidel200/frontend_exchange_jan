import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { analyzeRates, getCurrencies } from "../api/client";
import type { AnalyzeResponse, CurrencyOption } from "../types";

type Props = {
  base: string;
  symbols: string[];
  startDate: string;
  endDate: string;
  onBaseChange: (v: string) => void;
  onSymbolsChange: (v: string[]) => void;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onResult: (result: AnalyzeResponse) => void;
};

export function AnalysisForm({
  base,
  symbols,
  startDate,
  endDate,
  onBaseChange,
  onSymbolsChange,
  onStartDateChange,
  onEndDateChange,
  onResult,
}: Props) {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrencies()
      .then(setCurrencies)
      .catch(() => setError(t("form.errors.currenciesFailed")));
  }, [t]);

  function toggleSymbol(code: string) {
    onSymbolsChange(
      symbols.includes(code)
        ? symbols.filter((item) => item !== code)
        : [...symbols, code],
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
      <select
        id="base"
        value={base}
        onChange={(e) => onBaseChange(e.target.value)}
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

      <div className="date-row">
        <div>
          <label htmlFor="startDate">{t("form.startDate")}</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="endDate">{t("form.endDate")}</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
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