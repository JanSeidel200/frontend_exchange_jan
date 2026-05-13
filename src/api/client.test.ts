import { beforeEach, describe, expect, test, vi } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();
const requestInterceptorUse = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: () => ({
      get: getMock,
      post: postMock,
      put: putMock,
      interceptors: {
        request: { use: requestInterceptorUse },
        response: { use: vi.fn() },
      },
    }),
    isAxiosError: vi.fn(),
  },
}));

describe("api client", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    localStorage.clear();
  });

  test("checkHealth returns response data", async () => {
    getMock.mockResolvedValueOnce({ data: { status: "ok" } });

    const { checkHealth } = await import("./client");

    await expect(checkHealth()).resolves.toEqual({ status: "ok" });
  });

  test("login posts credentials and returns response", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        username: "admin",
        message: "Logged in",
        access_token: "tok-123",
      },
    });

    const { login } = await import("./client");
    const result = await login("admin", "secret");

    expect(postMock).toHaveBeenCalledWith("/auth/login", {
      username: "admin",
      password: "secret",
    });
    expect(result.access_token).toBe("tok-123");
  });

  test("login stores access_token in localStorage", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        username: "admin",
        message: "Logged in",
        access_token: "tok-456",
      },
    });

    const { login } = await import("./client");
    await login("admin", "secret");

    expect(localStorage.getItem("exchange_auth_token")).toBe("tok-456");
  });

  test("login does not store token when missing", async () => {
    postMock.mockResolvedValueOnce({
      data: { username: "admin", message: "Logged in" },
    });

    const { login } = await import("./client");
    await login("admin", "secret");

    expect(localStorage.getItem("exchange_auth_token")).toBeNull();
  });

  test("logout posts to logout endpoint and clears token", async () => {
    localStorage.setItem("exchange_auth_token", "tok-789");
    postMock.mockResolvedValueOnce({ data: { message: "Logged out" } });

    const { logout } = await import("./client");
    await logout();

    expect(postMock).toHaveBeenCalledWith("/auth/logout");
    expect(localStorage.getItem("exchange_auth_token")).toBeNull();
  });

  test("logout clears token even when request fails", async () => {
    localStorage.setItem("exchange_auth_token", "tok-fail");
    postMock.mockRejectedValueOnce(new Error("Network error"));

    const { logout } = await import("./client");
    await expect(logout()).rejects.toThrow("Network error");

    expect(localStorage.getItem("exchange_auth_token")).toBeNull();
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

  test("getSettings returns settings", async () => {
    getMock.mockResolvedValueOnce({
      data: { base: "USD", symbols: ["CZK", "EUR"] },
    });

    const { getSettings } = await import("./client");

    await expect(getSettings()).resolves.toEqual({
      base: "USD",
      symbols: ["CZK", "EUR"],
    });
    expect(getMock).toHaveBeenCalledWith("/settings");
  });

  test("saveSettings sends PUT request with payload", async () => {
    const payload = { base: "GBP", symbols: ["USD", "JPY"] };
    putMock.mockResolvedValueOnce({ data: payload });

    const { saveSettings } = await import("./client");
    const result = await saveSettings(payload);

    expect(putMock).toHaveBeenCalledWith("/settings", payload);
    expect(result).toEqual(payload);
  });

  test("request interceptor adds Authorization header when token exists", async () => {
    await import("./client");

    expect(requestInterceptorUse).toHaveBeenCalled();
    const interceptor = requestInterceptorUse.mock.calls[0][0];

    localStorage.setItem("exchange_auth_token", "tok-interceptor");
    const config = { headers: {} as Record<string, string> };
    const result = interceptor(config);

    expect(result.headers.Authorization).toBe("Bearer tok-interceptor");
  });

  test("request interceptor does nothing when no token", async () => {
    await import("./client");

    expect(requestInterceptorUse).toHaveBeenCalled();
    const interceptor = requestInterceptorUse.mock.calls[0][0];

    const config = { headers: {} as Record<string, string> };
    const result = interceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});