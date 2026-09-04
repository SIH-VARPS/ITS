import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider, useTranslation } from "../i18n";

function Probe() {
  const { t, language, setLanguage, currentLanguageInfo } = useTranslation();
  return (
    <div>
      <p data-testid="title">{t("home.heroTitle")}</p>
      <p data-testid="badge">{t("home.liveTrainsBadge", { count: 12 })}</p>
      <p data-testid="lang">{language}</p>
      <p data-testid="native">{currentLanguageInfo.nativeName}</p>
      <button type="button" onClick={() => setLanguage("hi")}>
        hi
      </button>
    </div>
  );
}

describe("i18n", () => {
  it("throws when used outside a provider", () => {
    expect(() => render(<Probe />)).toThrow(/LanguageProvider/);
  });

  it("translates keys, interpolates params, and switches language", async () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("title").textContent).toMatch(/train/i);
    expect(screen.getByTestId("badge").textContent).toContain("12");
    screen.getByRole("button", { name: "hi" }).click();
    expect(await screen.findByTestId("lang")).toHaveTextContent("hi");
    expect(screen.getByTestId("title").textContent?.length).toBeGreaterThan(0);
  });

  it("returns the key path when a translation is missing", () => {
    function Missing() {
      const { t } = useTranslation();
      return <span data-testid="missing">{t("does.not.exist")}</span>;
    }
    render(
      <LanguageProvider>
        <Missing />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("missing")).toHaveTextContent("does.not.exist");
  });
});
