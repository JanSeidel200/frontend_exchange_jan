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

  test("shows dash when strongest/weakest currency is null", () => {
    render(
      <ResultsTable
        result={{
          base: "EUR",
          start_date: "2025-01-01",
          end_date: "2025-01-02",
          strongest_currency: null,
          weakest_currency: null,
          stats: [],
          series: {},
        }}
      />,
    );

    const strongestLabel = screen.getByText(/Strongest/);
    expect(strongestLabel.nextElementSibling).toHaveTextContent("-");

    const weakestLabel = screen.getByText(/Weakest/);
    expect(weakestLabel.nextElementSibling).toHaveTextContent("-");
  });

  test("shows dash for null rates in table cells", () => {
    render(
      <ResultsTable
        result={{
          base: "EUR",
          start_date: "2025-01-01",
          end_date: "2025-01-02",
          strongest_currency: "USD",
          weakest_currency: "USD",
          stats: [
            {
              code: "USD",
              latest_rate: null,
              average_rate: null,
              min_rate: null,
              max_rate: null,
              data_points: 0,
            },
          ],
          series: {},
        }}
      />,
    );

    const row = screen.getByRole("cell", { name: "USD" }).closest("tr");
    expect(row).not.toBeNull();
    const dashCells = row!.querySelectorAll("td");
    expect(dashCells[1]).toHaveTextContent("-");
    expect(dashCells[2]).toHaveTextContent("-");
    expect(dashCells[3]).toHaveTextContent("-");
    expect(dashCells[4]).toHaveTextContent("-");
  });

  test("summary rate is dash when stats do not contain the strongest currency", () => {
    render(
      <ResultsTable
        result={{
          base: "EUR",
          start_date: "2025-01-01",
          end_date: "2025-01-02",
          strongest_currency: "XYZ",
          weakest_currency: "ABC",
          stats: [
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

    const strongestLabel = screen.getByText(/Strongest/);
    expect(strongestLabel.nextElementSibling).toHaveTextContent("XYZ");
    expect(strongestLabel.nextElementSibling).toHaveTextContent("-");

    const weakestLabel = screen.getByText(/Weakest/);
    expect(weakestLabel.nextElementSibling).toHaveTextContent("ABC");
    expect(weakestLabel.nextElementSibling).toHaveTextContent("-");
  });

  test("renders empty table body when stats is empty", () => {
    render(
      <ResultsTable
        result={{
          base: "EUR",
          start_date: "2025-01-01",
          end_date: "2025-01-02",
          strongest_currency: null,
          weakest_currency: null,
          stats: [],
          series: {},
        }}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /Currency|Měna/ }))
      .toBeInTheDocument();
    const tbody = document.querySelector("tbody");
    expect(tbody?.children.length).toBe(0);
  });
});