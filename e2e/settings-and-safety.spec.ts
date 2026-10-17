import { expect, test } from "@playwright/test";
import { answerCurrent, completeLesson, enableDraftPreview } from "./helpers";

test.describe("settings", () => {
  test.beforeEach(async ({ page }) => {
    await enableDraftPreview(page);
  });

  test("transliteration and sound settings change the lesson", async ({ page }) => {
    await page.goto("/lesson/bn-w0-l1");
    await expect(page.getByText("aam", { exact: true })).toBeVisible();
    await expect(page.getByText("ยังไม่มีเสียงอ่านที่บันทึกและตรวจแล้ว")).toBeVisible();

    await page.goto("/settings");
    await page.getByLabel("ไม่แสดง").check();
    await page.getByLabel("ปิดเสียงทั้งหมด").check();

    await page.goto("/lesson/bn-w0-l1");
    await expect(page.getByRole("heading", { name: "มารู้จักคำใหม่กัน" })).toBeVisible();
    await expect(page.getByText("aam", { exact: true })).toHaveCount(0);
    await expect(page.getByText("ปิดเสียงไว้อยู่ เปิดได้ที่หน้าตั้งค่า")).toBeVisible();
  });

  test("reset asks for confirmation, then clears progress", async ({ page }) => {
    await page.goto("/lesson/bn-w0-l1");
    await completeLesson(page);
    await page.goto("/settings");

    await page.getByRole("button", { name: "ล้างความคืบหน้าทั้งหมด" }).click();
    const dialog = page.getByRole("dialog", { name: "ล้างความคืบหน้าทั้งหมด?" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "ยกเลิก" }).click();
    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: "บทที่เรียนจบแล้ว (1)" })).toBeVisible();

    await page.goto("/settings");
    await page.getByRole("button", { name: "ล้างความคืบหน้าทั้งหมด" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ล้างความคืบหน้า" }).click();
    await expect(page.getByText("ล้างความคืบหน้าแล้ว")).toBeVisible();
    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: "สมุดยังว่างอยู่" })).toBeVisible();
  });

  test("export then import restores progress, and bad files are refused", async ({ page }) => {
    await page.goto("/lesson/bn-w0-l1");
    await completeLesson(page);
    await page.goto("/settings");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "บันทึกไฟล์สำรอง" }).click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(download.suggestedFilename()).toMatch(/^bangla-bondhu-progress-\d{4}-\d{2}-\d{2}\.json$/);

    await page.getByRole("button", { name: "ล้างความคืบหน้าทั้งหมด" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ล้างความคืบหน้า" }).click();
    await expect(page.getByText("ล้างความคืบหน้าแล้ว")).toBeVisible();

    const fileInput = page.getByLabel("เลือกไฟล์สำรองความคืบหน้า");
    await fileInput.setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"hello":1}'),
    });
    await expect(page.getByText("ไฟล์นี้ไม่ใช่ไฟล์สำรองของ Bangla Bondhu")).toBeVisible();

    await fileInput.setInputFiles(path);
    const dialog = page.getByRole("dialog", { name: "ใช้ความคืบหน้าจากไฟล์นี้?" });
    await expect(dialog).toContainText("บทที่เรียนจบ 1 บท");
    await dialog.getByRole("button", { name: "นำเข้าและแทนที่" }).click();
    await expect(page.getByText("นำเข้าความคืบหน้าเรียบร้อยแล้ว")).toBeVisible();
    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: "บทที่เรียนจบแล้ว (1)" })).toBeVisible();
  });

  test("the language button switches the whole interface to English and back", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Let's make friends with Bengali")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start the first lesson" })).toBeVisible();

    await page.goto("/lesson/bn-w0-l1");
    await expect(page.getByRole("heading", { name: "Meet a new word" })).toBeVisible();
    await expect(page.getByText("mango", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "เปลี่ยนเป็นภาษาไทย" }).click();
    await expect(page.getByRole("heading", { name: "มารู้จักคำใหม่กัน" })).toBeVisible();
  });

  test("hiding the optional tracks removes them from the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /อักษรอาหรับ/ })).toBeVisible();
    await page.goto("/settings");
    await page.getByLabel("แสดงอักษรอาหรับเบื้องต้น").uncheck();
    await page.getByLabel("แสดงความรู้อิสลามเบื้องต้น").uncheck();
    await page.goto("/");
    await expect(page.getByRole("link", { name: /อักษรอาหรับ/ })).toHaveCount(0);
  });
});

test.describe("accessibility and layout", () => {
  test.beforeEach(async ({ page }) => {
    await enableDraftPreview(page);
  });

  test("a lesson works with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/lesson/bn-w0-l1");
    const card = page.locator("article.animate-rise");
    const duration = await card.evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.01);
    await completeLesson(page);
    await expect(page.getByText("ฝึกครบแล้ว!")).toBeVisible();
  });

  for (const viewport of [
    { width: 320, height: 640 },
    { width: 768, height: 1024 },
  ]) {
    test(`no horizontal scrolling at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const path of ["/", "/settings", "/progress", "/islamic-learning", "/lesson/bn-w0-l1"]) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} overflows`).toBeLessThanOrEqual(0);
      }
      // Step past the introductions into the image-choice grid as well.
      await page.goto("/lesson/bn-w0-l1");
      for (let i = 0; i < 3; i += 1) await answerCurrent(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("Arabic renders right-to-left in its own direction context", async ({ page }) => {
    await page.goto("/islamic-learning");
    const sample = page.locator('p[lang="ar"]');
    await expect(sample).toHaveAttribute("dir", "rtl");
    await expect(page.getByText("เนื้อหากำลังรอการตรวจทาน")).toBeVisible();

    await page.goto("/lesson/ar-w0-l1");
    const glyph = page.locator('[data-activity-id] span[lang="ar"]').first();
    await expect(glyph).toHaveAttribute("dir", "rtl");
    await expect(glyph).toHaveText("ا");
    const direction = await glyph.evaluate((el) => getComputedStyle(el).direction);
    expect(direction).toBe("rtl");
  });
});

test("no request sends progress or personal data anywhere", async ({ page, baseURL }) => {
  await enableDraftPreview(page);
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on("request", (request) => {
    requests.push({ url: request.url(), method: request.method(), body: request.postData() });
  });

  await page.goto("/");
  await page.goto("/lesson/bn-w0-l1");
  await completeLesson(page, { wrongOnce: "bn-w0-l1-a4" });
  await page.goto("/review");
  await page.goto("/settings");

  const origin = new URL(baseURL!).origin;
  const external = requests.filter(
    (r) => !r.url.startsWith(origin) && !r.url.startsWith("data:") && !r.url.startsWith("blob:"),
  );
  expect(external).toEqual([]);
  const withBody = requests.filter((r) => r.method !== "GET" && r.method !== "HEAD");
  // Next.js may POST internal router requests; none may carry progress data.
  for (const request of withBody) {
    expect(request.body ?? "").not.toMatch(/bn\.word|streakCorrect|nextReviewAt/);
  }
});
