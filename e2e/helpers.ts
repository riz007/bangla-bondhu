import { expect, type Page } from "@playwright/test";
import { findActivity, findLesson } from "../src/features/curriculum/loader";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type Settings,
} from "../src/features/settings/settings-model";

export async function presetSettings(page: Page, patch: Partial<Settings>) {
  const value = JSON.stringify({ ...DEFAULT_SETTINGS, ...patch });
  await page.addInitScript(
    ([key, settings]) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, settings);
    },
    [SETTINGS_STORAGE_KEY, value] as const,
  );
}

export const enableDraftPreview = (page: Page) => presetSettings(page, { contentPreview: true });

async function currentActivityId(page: Page): Promise<string | null> {
  const container = page.locator("[data-activity-id]");
  if ((await container.count()) === 0) return null;
  return container.getAttribute("data-activity-id");
}

export async function answerCurrent(page: Page, { wrong = false } = {}) {
  const id = await currentActivityId(page);
  if (!id) throw new Error("No activity on screen");
  const activity = findActivity(id);
  if (!activity) throw new Error(`Unknown activity ${id}`);
  const check = () => page.getByRole("button", { name: "ตรวจคำตอบ" }).click();

  switch (activity.type) {
    case "introduce":
      await page.getByRole("button", { name: "รู้จักแล้ว ไปต่อ" }).click();
      return;
    case "listen-and-select":
    case "image-to-word":
    case "word-to-image":
    case "read-and-choose":
    case "recall": {
      const choice = wrong
        ? activity.optionItemIds.find((o) => o !== activity.answerItemId)!
        : activity.answerItemId;
      await page.locator(`input[value="${choice}"] + label`).click();
      await check();
      break;
    }
    case "missing-character":
      await page.locator(`input[value="${activity.answerOptionId}"] + label`).click();
      await check();
      break;
    case "build-syllable":
    case "build-word":
    case "listen-and-order":
      for (const tileId of activity.answerTileIds) {
        await page.locator(`[data-tile-id="${tileId}"]`).click();
      }
      await check();
      break;
    case "match-pairs":
      for (const itemId of activity.itemIds) {
        const buttons = page.locator(`button[data-item-id="${itemId}"]`);
        await buttons.nth(0).click();
        await buttons.nth(1).click();
      }
      break;
  }
  await page.getByRole("button", { name: "ไปต่อ", exact: true }).click();
}

export async function completeLesson(page: Page, options: { wrongOnce?: string } = {}) {
  let steps = 0;
  const missed = new Set<string>();
  while (steps < 40) {
    const done = page.getByText("ฝึกครบแล้ว!");
    await expect(page.locator("[data-activity-id]").or(done).first()).toBeVisible();
    if (await done.isVisible()) return steps;
    const id = await currentActivityId(page);
    const wrong = Boolean(id && id === options.wrongOnce && !missed.has(id));
    if (wrong && id) missed.add(id);
    await answerCurrent(page, { wrong });
    steps += 1;
  }
  throw new Error("Lesson did not finish");
}

export function lessonTitle(id: string): string {
  const lesson = findLesson(id);
  if (!lesson) throw new Error(`Unknown lesson ${id}`);
  return lesson.titleTh;
}
