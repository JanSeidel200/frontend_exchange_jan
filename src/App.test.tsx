import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import App from "./App";

vi.mock("./api/client", () => ({
  logout: vi.fn(() => Promise.resolve({ message: "Logged out" })),
  getSettings: vi.fn(() =>
    Promise.resolve({
      base: "EUR",
      symbols: ["CZK", "USD", "GBP", "PLN"],
    }),
  ),
  saveSettings: vi.fn(() =>
    Promise.resolve({ base: "EUR", symbols: ["CZK", "USD", "GBP", "PLN"] }),
  ),
  getCurrencies: vi.fn(() =>
    Promise.resolve([
      { code: "EUR", name: "Euro" },
      { code: "USD", name: "US Dollar" },
      { code: "CZK", name: "Czech koruna" },
      { code: "GBP", name: "British pound" },
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
  getLogs: vi.fn(() =>
    Promise.resolve([
      "2025-01-15 | INFO | app.main | Application started",
    ]),
  ),
  login: vi.fn(),
}));

vi.mock("./components/LoginForm", () => ({
  LoginForm: ({ onLoggedIn }: { onLoggedIn: () => void }) => (
    <button onClick={onLoggedIn}>Mock login</button>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders login screen when not logged in", () => {
    render(<App />);
    expect(screen.getByText("Mock login")).toBeInTheDocument();
  });

  test("switches to dashboard after login", async () => {
    const { getSettings } = await import("./api/client");

    render(<App />);
    fireEvent.click(screen.getByText("Mock login"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Odhlásit|Log out/ }),
      ).toBeInTheDocument();
    });

    expect(vi.mocked(getSettings)).toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /Logy|Logs/ }),
    ).toBeInTheDocument();
  });

  test("switches to logs view and back to dashboard", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("Mock login"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Logy|Logs/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Logy|Logs/ }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /Zpět na analýzu|Back to analysis/,
        }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Application started/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Zpět na analýzu|Back to analysis/,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Logy|Logs/ }),
      ).toBeInTheDocument();
    });
  });

  test("logout returns user to login screen", async () => {
    const { logout } = await import("./api/client");

    render(<App />);
    fireEvent.click(screen.getByText("Mock login"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Odhlásit|Log out/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Odhlásit|Log out/ }));

    await waitFor(() => {
      expect(screen.getByText("Mock login")).toBeInTheDocument();
    });

    expect(vi.mocked(logout)).toHaveBeenCalled();
  });

  test("logs error when settings hydration fails", async () => {
    const { getSettings } = await import("./api/client");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(getSettings).mockRejectedValueOnce(new Error("Settings unavailable"));

    render(<App />);
    fireEvent.click(screen.getByText("Mock login"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Settings hydration failed:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  test("logs error when settings save fails", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { saveSettings } = await import("./api/client");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(saveSettings).mockRejectedValueOnce(new Error("Save failed"));

    render(<App />);
    fireEvent.click(screen.getByText("Mock login"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Odhlásit|Log out/ }),
      ).toBeInTheDocument();
    });

    await vi.advanceTimersByTimeAsync(1000);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Settings save failed:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
    vi.useRealTimers();
  });
});