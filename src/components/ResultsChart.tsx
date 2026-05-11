import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

import type { AnalyzeResponse } from "../types";

type Props = {
  result: AnalyzeResponse | null;
};

const COLORS = ["#20808D", "#A84B2F", "#1B474D", "#944454", "#DA7101"];

export function ResultsChart({ result }: Props) {
  const { t } = useTranslation();
  if (!result) return null;

  const rows = Object.entries(result.series)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, rates]) => ({ day, ...rates }));

  return (
    <section className="panel">
      <h2>{t("results.chartHeading")}</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {result.stats.map((stat, index) => (
              <Line
                key={stat.code}
                type="monotone"
                dataKey={stat.code}
                stroke={COLORS[index % COLORS.length]}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}