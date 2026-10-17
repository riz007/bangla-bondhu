import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, parseSettings, shouldShowTransliteration } from "./settings-model";

describe("parseSettings", () => {
  it("uses safe defaults: Thai, sound on, drafts hidden", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.contentPreview).toBe(false);
  });

  it("falls back per field for bad values", () => {
    const parsed = parseSettings(
      JSON.stringify({
        version: 1,
        transliteration: "sometimes",
        volume: 7,
        soundMuted: "yes",
        motion: "reduce",
      }),
    );
    expect(parsed.transliteration).toBe("fade");
    expect(parsed.volume).toBe(1);
    expect(parsed.soundMuted).toBe(false);
    expect(parsed.motion).toBe("reduce");
  });

  it("keeps a valid interface language and rejects unknown ones", () => {
    expect(parseSettings(JSON.stringify({ version: 1, uiLanguage: "en" })).uiLanguage).toBe("en");
    expect(parseSettings(JSON.stringify({ version: 1, uiLanguage: "fr" })).uiLanguage).toBe("th");
  });

  it("ignores corrupt JSON and unknown versions", () => {
    expect(parseSettings("{oops")).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings(JSON.stringify({ version: 99, soundMuted: true }))).toEqual(DEFAULT_SETTINGS);
  });
});

describe("transliteration fading", () => {
  it("shows the reading aid only while an item is new or being learned", () => {
    expect(shouldShowTransliteration("fade", "new")).toBe(true);
    expect(shouldShowTransliteration("fade", "learning")).toBe(true);
    expect(shouldShowTransliteration("fade", "familiar")).toBe(false);
    expect(shouldShowTransliteration("always", "mastered")).toBe(true);
    expect(shouldShowTransliteration("hidden", "new")).toBe(false);
  });
});
