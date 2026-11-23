import { webcrypto } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "./auth-store";

describe("auth store", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", webcrypto as unknown as Crypto);
    localStorage.removeItem("shopsphere-auth");
    useAuthStore.setState({ session: null });
  });

  it("creates a customer session for valid demo credentials", async () => {
    const user = await useAuthStore.getState().login("customer@shopsphere.demo", "Customer@123");
    expect(user.role).toBe("CUSTOMER");
    expect(useAuthStore.getState().session?.userId).toBe(user.id);
    expect(useAuthStore.getState().session?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects invalid credentials without creating a session", async () => {
    await expect(useAuthStore.getState().login("customer@shopsphere.demo", "incorrect")).rejects.toThrow(/email or password/i);
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("registers a customer and clears the session on logout", async () => {
    const user = await useAuthStore.getState().register("Test Shopper", "shopper-test@example.com", "shopperPass123");
    expect(user.email).toBe("shopper-test@example.com");
    expect(user.role).toBe("CUSTOMER");
    expect(useAuthStore.getState().session?.userId).toBe(user.id);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
