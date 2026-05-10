import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { LoginForm } from "./LoginForm";

vi.mock("../api/client", () => ({ login: vi.fn() }));

describe("LoginForm", () => {
  test("renders username, password and submit", () => {
    render(<LoginForm onLoggedIn={() => undefined} />);
    expect(screen.getByLabelText(/Uživatel|Username/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heslo|Password/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Přihlásit|Log in/ }),
    ).toBeInTheDocument();
  });
});