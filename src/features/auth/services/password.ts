const DEMO_SALT = "shopsphere-demo-salt";
const DEMO_HASHES: Record<string, string> = {
  "customer@shopsphere.demo": "e04754b972041759c908f4c840f585dd6aedf542f4c5ac364bae615cb7ff7987",
  "admin@shopsphere.demo": "e8e86f6829783143ab086037a9fcbae902e6ba2caae3a54cdfdf15982f41f027",
};

export async function hashPassword(password: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(email: string, password: string, salt: string, hash: string): Promise<boolean> {
  if (DEMO_HASHES[email.toLowerCase()] && salt === DEMO_SALT) {
    return hash === DEMO_HASHES[email.toLowerCase()] && hash === await hashPassword(password, salt);
  }
  return hash === await hashPassword(password, salt);
}

export const demoPasswordSalt = DEMO_SALT;
