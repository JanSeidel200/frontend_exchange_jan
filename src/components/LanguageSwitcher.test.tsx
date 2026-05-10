import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import i18n from "../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  test("changes language on select", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "en" } });
    expect(i18n.resolvedLanguage).toBe("en");
    fireEvent.change(select, { target: { value: "cs" } });
    expect(i18n.resolvedLanguage).toBe("cs");
  });
});