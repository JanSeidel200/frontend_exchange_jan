import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { LogsPanel } from "./LogsPanel";

vi.mock("../api/client", () => ({
  getLogs: vi.fn(),
}));

describe("LogsPanel", () => {
  test("shows logs after loading", async () => {
    const { getLogs } = await import("../api/client");
    vi.mocked(getLogs).mockResolvedValueOnce([
      "2025-01-15 | INFO | app.main | Application started",
      "2025-01-15 | WARNING | client | Cache miss",
    ]);

    render(<LogsPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Application started/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Cache miss/)).toBeInTheDocument();
  });

  test("shows error on load failure", async () => {
    const { getLogs } = await import("../api/client");
    vi.mocked(getLogs).mockRejectedValueOnce(new Error("Server error"));

    render(<LogsPanel />);
    await waitFor(() => {
      expect(
        screen.getByText(/Nepodařilo se|Failed to load/),
      ).toBeInTheDocument();
    });
  });

  test("renders refresh button", async () => {
    const { getLogs } = await import("../api/client");
    vi.mocked(getLogs).mockResolvedValueOnce([]);

    render(<LogsPanel />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Obnovit|Refresh/ }),
      ).toBeInTheDocument();
    });
  });
});