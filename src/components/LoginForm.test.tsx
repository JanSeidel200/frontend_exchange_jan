import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { LoginForm } from "./LoginForm";

vi.mock("../api/client", () => ({
  login: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders username, password and submit", () => {
    render(<LoginForm onLoggedIn={() => undefined} />);

    expect(screen.getByLabelText(/Uživatel|Username/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heslo|Password/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Přihlásit|Log in/ }),
    ).toBeInTheDocument();
  });

  test("calls onLoggedIn after successful login", async () => {
    const { login } = await import("../api/client");
    vi.mocked(login).mockResolvedValueOnce({ username: "admin" });

    const onLoggedIn = vi.fn();
    render(<LoginForm onLoggedIn={onLoggedIn} />);

    fireEvent.change(screen.getByLabelText(/Heslo|Password/), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Přihlásit|Log in/ }));

    await waitFor(() => {
      expect(onLoggedIn).toHaveBeenCalled();
    });

    expect(vi.mocked(login)).toHaveBeenCalledWith("admin", "secret123");
  });

  test("shows translated error after failed login", async () => {
    const { login } = await import("../api/client");
    vi.mocked(login).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginForm onLoggedIn={() => undefined} />);

    fireEvent.change(screen.getByLabelText(/Heslo|Password/), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Přihlásit|Log in/ }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Neplatné přihlašovací údaje\.|Invalid credentials\./,
        ),
      ).toBeInTheDocument();
    });
  });
});