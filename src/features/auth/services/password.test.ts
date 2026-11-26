import { webcrypto } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("local password helpers", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("hashes the same password consistently for a given salt", async () => {
    vi.stubGlobal("crypto", webcrypto as unknown as Crypto);
    expect(await hashPassword("sample-pass-123", "test-salt")).toBe(
      await hashPassword("sample-pass-123", "test-salt"),
    );
  });
  it("verifies a password and rejects an incorrect password", async () => {
    vi.stubGlobal("crypto", webcrypto as unknown as Crypto);
    const hash = await hashPassword("sample-pass-123", "test-salt");
    await expect(
      verifyPassword("new@example.com", "sample-pass-123", "test-salt", hash),
    ).resolves.toBe(true);
    await expect(
      verifyPassword("new@example.com", "wrong-pass", "test-salt", hash),
    ).resolves.toBe(false);
  });
});
