import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ResultsTable } from "./ResultsTable";

describe("ResultsTable", () => {
  test("shows placeholder when no result", () => {
    render(<ResultsTable result={null} />);
    expect(
      screen.getByText(/Zadej parametry|Enter parameters/),
    ).toBeInTheDocument();
  });

  test("renders stats", () => {
    render(
      <ResultsTable
        result={{
          base: "EUR",
          start_date: "2025-01-01",
          end_date: "2025-01-02",
          strongest_currency: "CZK",
          weakest_currency: "USD",
          stats: [
            {
              code: "CZK",
              latest_rate: 25.0,
              average_rate: 25.0,
              min_rate: 24.0,
              max_rate: 26.0,
              data_points: 2,
            },
          ],
          series: {},
        }}
      />,
    );
    expect(screen.getByText("CZK")).toBeInTheDocument();
    expect(screen.getByText("25.0000")).toBeInTheDocument();
  });
});