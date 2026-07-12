import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/lib/utils";

describe("getErrorMessage", () => {
  it("extracts message from Error", () => {
    expect(getErrorMessage(new Error("oops"))).toBe("oops");
  });
  it("returns string errors directly", () => {
    expect(getErrorMessage("bad input")).toBe("bad input");
  });
  it("returns fallback for unknown types", () => {
    expect(getErrorMessage(null)).toBe("Something went wrong");
    expect(getErrorMessage(42)).toBe("Something went wrong");
    expect(getErrorMessage({ foo: "bar" })).toBe("Something went wrong");
  });
});
