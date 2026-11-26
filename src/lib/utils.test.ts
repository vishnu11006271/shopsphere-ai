import { describe, expect, it } from "vitest";
import { formatINR } from "@/lib/utils";
describe("formatINR", () => {
  it("formats values as Indian rupees", () => {
    expect(formatINR(1250)).toContain("1,250");
  });
});
