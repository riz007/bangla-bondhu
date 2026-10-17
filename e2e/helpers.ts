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
    case "tip":
      await page.getByRole("button", { name: "รู้จักแล้ว ไปต่อ" }).click();
      return;
    case "make-sentence": {
      const choices = activity.slots.map((slot) => slot.options[0]);
      for (const rule of activity.agreement) choices[rule.slot] = rule.pairs[choices[rule.dependsOn]];
      for (const [slot, itemId] of choices.entries()) {
        if (activity.slots[slot].options.length > 1) {
          await page.locator(`button[data-slot="${slot}"][data-item-id="${itemId}"]`).click();
        }
      }
      await page.getByRole("button", { name: "ตรวจประโยค" }).click();
      await page.getByRole("button", { name: "เก็บในสมุดประโยค แล้วไปต่อ" }).click();
      return;
    }
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

// Marks lessons as finished in IndexedDB so a test can open a later chapter directly.
export async function seedCompletedLessons(page: Page, lessonIds: string[]) {
  await page.goto("/");
  await page.evaluate(async (ids) => {
    const now = new Date().toISOString();
    const lessons = Object.fromEntries(
      ids.map((id) => [
        id,
        {
          lessonId: id,
          trackId: "bn",
          lessonVersion: 1,
          completedCount: 1,
          firstCompletedAt: now,
          lastCompletedAt: now,
          bestAccuracy: 1,
          lastAccuracy: 1,
        },
      ]),
    );
    const state = { schemaVersion: 2, items: {}, lessons, sessions: {}, sentences: [] };
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open("bangla-bondhu", 1);
      open.onupgradeneeded = () => open.result.createObjectStore("progress");
      open.onsuccess = () => {
        const tx = open.result.transaction("progress", "readwrite");
        tx.objectStore("progress").put(state, "state");
        tx.oncomplete = () => {
          open.result.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      open.onerror = () => reject(open.error);
    });
  }, lessonIds);
}
