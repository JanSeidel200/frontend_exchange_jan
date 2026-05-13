import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import axios from "axios";

import { AnalysisForm } from "./AnalysisForm";

vi.mock("../api/client", () => ({
  getCurrencies: vi.fn(() =>
    Promise.resolve([
      { code: "EUR", name: "Euro" },
      { code: "CZK", name: "Czech koruna" },
      { code: "USD", name: "US Dollar" },
      { code: "GBP", name: "British pound" },
      { code: "PLN", name: "Polish zloty" },
    ]),
  ),
  analyzeRates: vi.fn(() =>
    Promise.resolve({
      base: "EUR",
      start_date: "2025-01-01",
      end_date: "2025-01-02",
      strongest_currency: "CZK",
      weakest_currency: "USD",
      stats: [],
      series: {},
    }),
  ),
}));

describe("AnalysisForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders form heading and base selector", async () => {
    render(<AnalysisForm onResult={() => undefined} />);

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /EUR - Euro/ }),
      ).toBeInTheDocument();
    });
  });

  test("submit calls onResult on success", async () => {
    const onResult = vi.fn();

    render(<AnalysisForm onResult={onResult} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Spočítat|Compute/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Spočítat|Compute/ }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalled();
    });
  });

  test("shows translated error when no symbols are selected", async () => {
    render(<AnalysisForm onResult={() => undefined} />);

    await waitFor(() => {
      expect(screen.getByLabelText("PLN")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("CZK"));
    fireEvent.click(screen.getByLabelText("USD"));
    fireEvent.click(screen.getByLabelText("GBP"));
    fireEvent.click(screen.getByLabelText("PLN"));

    fireEvent.click(screen.getByRole("button", { name: /Spočítat|Compute/ }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Vyber alespoň jednu porovnávanou měnu\.|Select at least one currency to compare\./,
        ),
      ).toBeInTheDocument();
    });
  });

  test("shows translated error when end date is before start date", async () => {
    render(<AnalysisForm onResult={() => undefined} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Od|From/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Od|From/), {
      target: { value: "2025-02-01" },
    });
    fireEvent.change(screen.getByLabelText(/Do|To/), {
      target: { value: "2025-01-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Spočítat|Compute/ }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Koncové datum musí být po počátečním datu\.|End date must be after start date\./,
        ),
      ).toBeInTheDocument();
    });
  });

  test("shows translated rate limit error on 429", async () => {
    const { analyzeRates } = await import("../api/client");
    vi.mocked(analyzeRates).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 429 },
    });
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    render(<AnalysisForm onResult={() => undefined} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Spočítat|Compute/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Spočítat|Compute/ }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Příliš mnoho požadavků\. Počkej minutu a zkus to znovu\.|Too many requests\. Please wait a minute and try again\./,
        ),
      ).toBeInTheDocument();
    });
  });

  test("shows translated generic error on non-429 failure", async () => {
    const { analyzeRates } = await import("../api/client");
    vi.mocked(analyzeRates).mockRejectedValueOnce(new Error("boom"));
    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);

    render(<AnalysisForm onResult={() => undefined} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Spočítat|Compute/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Spočítat|Compute/ }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Výpočet selhal\. Zkontroluj vstupy nebo dostupnost API\.|Computation failed\. Check inputs or API availability\./,
        ),
      ).toBeInTheDocument();
    });
  });
});