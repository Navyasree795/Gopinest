import "@testing-library/jest-dom/extend-expect";
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn function", () => {
  it("should combine class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional class names", () => {
    expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
  });

  it("should merge Tailwind CSS classes correctly", () => {
    expect(cn("px-2 py-1", "p-3")).toBe("p-3"); // p-3 overrides px-2 py-1
  });

  it("should merge complex Tailwind CSS classes", () => {
    expect(cn("text-red-500 bg-blue-500", "text-green-500")).toBe(
      "bg-blue-500 text-green-500"
    );
  });

  it("should handle mixed class values", () => {
    expect(
      cn("text-lg", { "font-bold": true, "font-light": false }, ["bg-white", "p-4"])
    ).toBe("text-lg font-bold bg-white p-4");
  });

  it("should return an empty string if no inputs are provided", () => {
    expect(cn()).toBe("");
  });
});
