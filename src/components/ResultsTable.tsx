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

  return (
    <section className="panel">
      <h2>
        {t("results.headingPrefix")} {result.base}
      </h2>
      <div className="summary">
        <div>
          <span>{t("results.strongest")}</span>
          <strong>{result.strongest_currency ?? "-"}</strong>
        </div>
        <div>
          <span>{t("results.weakest")}</span>
          <strong>{result.weakest_currency ?? "-"}</strong>
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