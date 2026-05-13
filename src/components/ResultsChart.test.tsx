import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ResultsChart } from "./ResultsChart";

describe("ResultsChart", () => {
  test("renders nothing when no result", () => {
    const { container } = render(<ResultsChart result={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders chart when result provided", () => {
    const { container } = render(
      <ResultsChart
        result={{
          base: "EUR",
          start_date: "2025-01-01",
          end_date: "2025-01-02",
          strongest_currency: "CZK",
          weakest_currency: "USD",
          stats: [
            {
              code: "CZK",
              latest_rate: 25,
              average_rate: 25,
              min_rate: 24,
              max_rate: 26,
              data_points: 2,
            },
          ],
          series: {
            "2025-01-01": { CZK: 24 },
            "2025-01-02": { CZK: 26 },
          },
        }}
      />,
    );
    expect(container.querySelector(".chart-wrap")).toBeInTheDocument();
  });
});