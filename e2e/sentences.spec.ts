import { expect, test } from "@playwright/test";
import { bnLessons } from "../src/content/bn/lessons";
import { answerCurrent, enableDraftPreview, seedCompletedLessons } from "./helpers";

test("a child builds their own sentence, fixes the verb, and finds it in the sentence book", async ({
  page,
}) => {
  await enableDraftPreview(page);
  const before = bnLessons.filter((l) => !l.id.startsWith("bn-grammar") && !l.id.startsWith("bn-reading"));
  await seedCompletedLessons(
    page,
    before.map((l) => l.id),
  );

  await page.goto("/lesson/bn-grammar-1");
  const sentenceMaker = page.locator('[data-activity-type="make-sentence"]');
  for (let step = 0; step < 20 && !(await sentenceMaker.isVisible()); step += 1) {
    await answerCurrent(page);
  }
  await expect(sentenceMaker).toBeVisible();

  await page.locator('button[data-slot="0"][data-item-id="bn.word.se"]').click();
  await page.locator('button[data-slot="1"][data-item-id="bn.word.mach"]').click();
  await page.locator('button[data-slot="2"][data-item-id="bn.word.khai"]').click();
  await page.getByRole("button", { name: "ตรวจประโยค" }).click();
  await expect(page.getByText("กับ সে ต้องใช้ খায় ลองเปลี่ยนคำกริยาดูนะ")).toBeVisible();

  await page.locator('button[data-slot="2"][data-item-id="bn.word.khay"]').click();
  await page.getByRole("button", { name: "ตรวจประโยค" }).click();
  await expect(page.getByText("ประโยคถูกต้อง!")).toBeVisible();
  await expect(page.getByText("แปลว่า “เขากินปลา”")).toBeVisible();
  await page.getByRole("button", { name: "เก็บในสมุดประโยค แล้วไปต่อ" }).click();
  await expect(page.getByText("ฝึกครบแล้ว!")).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: /สมุดประโยคของฉัน \(1\)/ })).toBeVisible();
  await expect(page.getByText("সে মাছ খায়")).toBeVisible();
  await expect(page.getByRole("heading", { name: "แสตมป์ประจำบท" })).toBeVisible();
});
