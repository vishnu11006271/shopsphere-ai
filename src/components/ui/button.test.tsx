import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label and supports disabled state", () => {
    render(<Button disabled>Continue</Button>);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });
});
