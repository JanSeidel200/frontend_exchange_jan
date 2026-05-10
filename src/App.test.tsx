import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import App from "./App";

vi.mock("./api/client", () => ({
  checkHealth: vi.fn(() => Promise.resolve({ status: "ok" })),
}));

describe("App", () => {
  test("renders title", () => {
    render(<App />);
    expect(
        screen.getByText(/Exchange Rate Analyzer|Analýza měnových kurzů/),
    ).toBeInTheDocument();
  });
});