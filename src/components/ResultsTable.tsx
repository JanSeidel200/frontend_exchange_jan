import { useTranslation } from "react-i18next";

import type { AnalyzeResponse } from "../types";

type Props = {
  result: AnalyzeResponse | null;
};

function formatNumber(value: number | null) {
  if (value === null) return "-";
  return value.toFixed(4);
}

export function ResultsTable({ result }: Props) {
  const { t } = useTranslation();

  if (!result) {
    return (
      <section className="panel muted">
        {t("results.placeholder")}
      </section>
    );
  }

  const strongestRate =
    result.stats.find((s) => s.code === result.strongest_currency)?.latest_rate ??
    null;
  const weakestRate =
    result.stats.find((s) => s.code === result.weakest_currency)?.latest_rate ??
    null;

  return (
    <section className="panel">
      <h2>
        {t("results.headingPrefix")} {result.base}
      </h2>
      <div className="summary">
        <div className="summary__card summary__card--strongest">
          <span className="summary__label">{t("results.strongest")}</span>
          <div className="summary__value">
            <strong>{result.strongest_currency ?? "-"}</strong>
            <span className="summary__rate">{formatNumber(strongestRate)}</span>
          </div>
        </div>
        <div className="summary__card summary__card--weakest">
          <span className="summary__label">{t("results.weakest")}</span>
          <div className="summary__value">
            <strong>{result.weakest_currency ?? "-"}</strong>
            <span className="summary__rate">{formatNumber(weakestRate)}</span>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>{t("results.table.currency")}</th>
            <th>{t("results.table.latest")}</th>
            <th>{t("results.table.average")}</th>
            <th>{t("results.table.min")}</th>
            <th>{t("results.table.max")}</th>
            <th>{t("results.table.points")}</th>
          </tr>
        </thead>
        <tbody>
          {result.stats.map((stat) => (
            <tr key={stat.code}>
              <td>{stat.code}</td>
              <td>{formatNumber(stat.latest_rate)}</td>
              <td>{formatNumber(stat.average_rate)}</td>
              <td>{formatNumber(stat.min_rate)}</td>
              <td>{formatNumber(stat.max_rate)}</td>
              <td>{stat.data_points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}