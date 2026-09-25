import { describe, expect, it } from "vitest";
import { BOTTOM_SHEET_STYLE } from "./bottomSheet";

describe("BOTTOM_SHEET_STYLE", () => {
  it("never grows past the visible viewport and scrolls its own content", () => {
    // Regression: the order request sheet was taller than small phones, and its top was unreachable.
    expect(BOTTOM_SHEET_STYLE.maxHeight).toBe("100dvh");
    expect(BOTTOM_SHEET_STYLE.overflowY).toBe("auto");
  });
});
