import { expect, test } from "@playwright/test";
import { answerCurrent, completeLesson, lessonTitle } from "./helpers";

test.describe("first visit", () => {
  test("needs no account and opens straight onto the reviewed course", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("বাংলা বন্ধু");
    // No sign-up or personal-data fields anywhere on the home page.
    await expect(page.locator('input[type="email"], input[type="password"], input[type="tel"]')).toHaveCount(
      0,
    );
    await expect(page.getByRole("link", { name: "เริ่มเรียนบทแรก" })).toBeVisible();
    await expect(page.getByText("บทเรียนกำลังรอการตรวจทาน")).toHaveCount(0);
  });
});

test.describe("learning loop", () => {
  test("start → complete → summary → refresh keeps progress → review brings the miss back", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "เริ่มเรียนบทแรก" }).click();
    await expect(page.getByText("ฉบับร่าง รอผู้ตรวจภาษา")).toHaveCount(0);

    await completeLesson(page, { wrongOnce: "bn-hello-1-6" });
    await expect(page.getByText("ฝึกครบแล้ว!")).toBeVisible();
    await expect(page.getByText(/ตอบถูกตั้งแต่ครั้งแรก/)).toContainText("4 จาก 5");
    await expect(page.getByRole("heading", { name: "จะกลับมาทบทวนอีกครั้ง" })).toBeVisible();

    await page.goto("/");
    await page.reload();
    await expect(
      page.getByRole("link", { name: new RegExp(`เรียนต่อ: ${lessonTitle("bn-hello-2")}`) }),
    ).toBeVisible();
    await expect(page.getByText("มี 1 คำรอทบทวน")).toBeVisible();

    await page.goto("/review");
    await expect(page.getByRole("heading", { name: "มี 1 คำรอทบทวน" })).toBeVisible();
    await page.getByRole("link", { name: "เริ่มทบทวน" }).click();
    await completeLesson(page);
    await page.getByRole("link", { name: "กลับหน้าทบทวน" }).click();
    await expect(page.getByRole("heading", { name: "ยังไม่มีคำที่ต้องทบทวนตอนนี้" })).toBeVisible();

    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: "บทที่เรียนจบแล้ว (1)" })).toBeVisible();
  });

  test("closing and reopening a lesson resumes where the child stopped", async ({ page }) => {
    await page.goto("/lesson/bn-hello-1");
    for (let i = 0; i < 4; i += 1) await answerCurrent(page);
    await expect(page.locator('[data-activity-id="bn-hello-1-5"]')).toBeVisible();

    await page.getByRole("link", { name: /พักไว้ก่อน/ }).click();
    await expect(page.getByRole("link", { name: /ทำต่อ: / })).toBeVisible();
    await page.goto("/lesson/bn-hello-1");
    await page.getByRole("button", { name: "ทำต่อ" }).click();
    await expect(page.locator('[data-activity-id="bn-hello-1-5"]')).toBeVisible();
  });

  test("locked lessons explain what to finish first", async ({ page }) => {
    await page.goto("/lesson/bn-kar-1");
    await expect(page.getByRole("heading", { name: "ทำบทก่อนหน้าให้จบก่อนนะ" })).toBeVisible();
    await expect(page.getByRole("link", { name: lessonTitle("bn-consonants-7") })).toBeVisible();
  });
});
