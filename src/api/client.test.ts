import { beforeEach, describe, expect, test, vi } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: () => ({
      get: getMock,
      post: postMock,
      put: putMock,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }),
    isAxiosError: vi.fn(),
  },
}));

describe("api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("checkHealth returns response data", async () => {
    getMock.mockResolvedValueOnce({ data: { status: "ok" } });

    const { checkHealth } = await import("./client");

    await expect(checkHealth()).resolves.toEqual({ status: "ok" });
  });

  test("login posts credentials", async () => {
    postMock.mockResolvedValueOnce({ data: { username: "admin" } });

    const { login } = await import("./client");
    await login("admin", "secret");

    expect(postMock).toHaveBeenCalledWith("/auth/login", {
      username: "admin",
      password: "secret",
    });
  });

  test("logout posts to logout endpoint", async () => {
    postMock.mockResolvedValueOnce({ data: { message: "Logged out" } });

    const { logout } = await import("./client");
    await logout();

    expect(postMock).toHaveBeenCalledWith("/auth/logout");
  });

  test("getCurrencies returns data", async () => {
    getMock.mockResolvedValueOnce({
      data: [{ code: "EUR", name: "Euro" }],
    });

    const { getCurrencies } = await import("./client");

    await expect(getCurrencies()).resolves.toEqual([
      { code: "EUR", name: "Euro" },
    ]);
  });

  test("analyzeRates posts payload", async () => {
    const payload = {
      base: "EUR",
      symbols: ["USD"],
      start_date: "2025-01-01",
      end_date: "2025-01-02",
    };

    postMock.mockResolvedValueOnce({ data: { ok: true } });

    const { analyzeRates } = await import("./client");
    await analyzeRates(payload);

    expect(postMock).toHaveBeenCalledWith("/currency/analyze", payload);
  });

  test("getLogs returns logs array", async () => {
    getMock.mockResolvedValueOnce({ data: { logs: ["one", "two"] } });

    const { getLogs } = await import("./client");

    await expect(getLogs()).resolves.toEqual(["one", "two"]);
  });
});