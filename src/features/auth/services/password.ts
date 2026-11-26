const DEMO_SALT = "shopsphere-demo-salt";
const DEMO_HASHES: Record<string, string> = {
  "customer@shopsphere.demo":
    "c0285161c8a27fb1a60013d7d95da19f2a7e9abf8fb0e445b3fbaa2386a35f84",
  "admin@shopsphere.demo":
    "7518c4d96dc5d498078a4c9032ed62ae9527fabc74b22b6c2bddf613d776827f",
};
const PBKDF2_ITERATIONS = 120_000;

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function verifyPassword(
  email: string,
  password: string,
  salt: string,
  hash: string,
): Promise<boolean> {
  if (DEMO_HASHES[email.toLowerCase()] && salt === DEMO_SALT) {
    return (
      hash === DEMO_HASHES[email.toLowerCase()] &&
      hash === (await hashPassword(password, salt))
    );
  }
  return hash === (await hashPassword(password, salt));
}

export const demoPasswordSalt = DEMO_SALT;
