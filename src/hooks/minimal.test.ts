import "@testing-library/jest-dom/extend-expect";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";

const useSimpleHook = () => {
  return { value: "Hello Vitest" };
};

describe("useSimpleHook", () => {
  it("should return the correct value", () => {
    const { result } = renderHook(() => useSimpleHook(), {
      wrapper: ({ children }) => <div>{children}</div>,
    });
    expect(result.current.value).toBe("Hello Vitest");
  });
});
