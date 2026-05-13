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

  test("renders stats with rates in summary", () => {
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
            {
              code: "USD",
              latest_rate: 1.1,
              average_rate: 1.1,
              min_rate: 1.0,
              max_rate: 1.2,
              data_points: 2,
            },
          ],
          series: {},
        }}
      />,
    );
    const strongestLabel = screen.getByText("Strongest (Highest nominal value)");
    expect(strongestLabel.nextElementSibling).toHaveTextContent("CZK");
    expect(strongestLabel.nextElementSibling).toHaveTextContent("25.0000");

    const weakestLabel = screen.getByText(/Weakest/);
    expect(weakestLabel.nextElementSibling).toHaveTextContent("USD");
    expect(weakestLabel.nextElementSibling).toHaveTextContent("1.1000");

    expect(screen.getByRole("cell", { name: "CZK" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "USD" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "24.0000" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "26.0000" })).toBeInTheDocument();
  });
});