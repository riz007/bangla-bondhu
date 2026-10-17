import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { findLesson } from "@/features/curriculum/loader";
import { __resetProgressStoreForTests, getProgressSnapshot } from "@/features/progress/progress-store";
import { createIndexedDbRepository } from "@/features/progress/repository";
import { resetSettings, updateSettings } from "@/features/settings/settings-store";
import { LessonRunner, type SessionDefinition } from "./lesson-runner";

const lesson = findLesson("bn-w0-l1")!;
const definition: SessionDefinition = {
  kind: "lesson",
  sessionId: lesson.id,
  title: { th: lesson.titleTh, en: lesson.titleEn },
  trackId: "bn",
  lessonVersion: lesson.version,
  isDraft: true,
  activities: lesson.activities,
  exitHref: "/",
};

beforeEach(async () => {
  await __resetProgressStoreForTests();
  await createIndexedDbRepository().clear();
});

describe("LessonRunner", () => {
  it("can be completed with the keyboard alone and saves progress", async () => {
    const user = userEvent.setup();
    render(<LessonRunner definition={definition} />);

    // Three introduction cards.
    for (let i = 0; i < 3; i += 1) {
      const next = await screen.findByRole("button", { name: "รู้จักแล้ว ไปต่อ" });
      next.focus();
      await user.keyboard("{Enter}");
    }

    // word-to-image: arrow keys move through the radio options; pick the mango.
    await screen.findByRole("heading", { name: "อ่านคำนี้ แล้วเลือกภาพที่ตรงกัน" });
    const mango = screen.getByRole("radio", { name: "มะม่วงสีเหลืองหนึ่งลูก" });
    mango.focus();
    await user.keyboard(" ");
    expect(mango).toBeChecked();
    screen.getByRole("button", { name: "ตรวจคำตอบ" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("ถูกต้อง!")).toBeInTheDocument();
    // The Continue button takes focus so Enter moves on.
    await waitFor(() => expect(screen.getByRole("button", { name: "ไปต่อ" })).toHaveFocus());
    await user.keyboard("{Enter}");

    // listen-and-select with no recording falls back to a written clue.
    expect(await screen.findByText("ยังไม่มีเสียงอ่านที่บันทึกและตรวจแล้ว")).toBeInTheDocument();
    expect(screen.getByText("ใช้คำใบ้นี้แทนเสียง:")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "หนังสือเปิดอยู่หนึ่งเล่ม" }));
    await user.click(screen.getByRole("button", { name: "ตรวจคำตอบ" }));
    await user.click(await screen.findByRole("button", { name: "ไปต่อ" }));

    // image-to-word: choose a wrong answer to see teaching feedback.
    await screen.findByRole("heading", { name: "ดูภาพ แล้วเลือกคำที่ตรงกับภาพ" });
    await user.click(screen.getByRole("radio", { name: /বই/ }));
    await user.click(screen.getByRole("button", { name: "ตรวจคำตอบ" }));
    expect(await screen.findByText("ยังไม่ใช่ มาดูกันว่าคำตอบคืออะไร")).toBeInTheDocument();
    expect(screen.getByText(/เดี๋ยวจะได้ลองข้อนี้อีกครั้งก่อนจบบท/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));

    // read-and-choose
    await user.click(await screen.findByRole("radio", { name: "มะม่วง" }));
    await user.click(screen.getByRole("button", { name: "ตรวจคำตอบ" }));
    await user.click(await screen.findByRole("button", { name: "ไปต่อ" }));

    // match-pairs: select a word, then its picture.
    await screen.findByRole("heading", { name: /จับคู่คำกับภาพ/ });
    const words = screen.getByRole("list", { name: "คำภาษาเป้าหมาย" });
    const pictures = screen.getByRole("list", { name: "ภาพ" });
    const pairs: [RegExp, RegExp][] = [
      [/আম/, /มะม่วง/],
      [/বই/, /หนังสือ/],
      [/মাছ/, /ปลา/],
    ];
    for (const [word, picture] of pairs) {
      const wordButton = Array.from(words.querySelectorAll("button")).find((b) =>
        word.test(b.textContent ?? ""),
      )!;
      const pictureButton = Array.from(pictures.querySelectorAll("button")).find((b) =>
        picture.test(b.textContent ?? ""),
      )!;
      await user.click(wordButton);
      await user.click(pictureButton);
    }
    expect(await screen.findByText("จับคู่ถูกครบทุกคู่ตั้งแต่ครั้งแรก!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));

    // The missed image-to-word question returns once at the end.
    await screen.findByRole("heading", { name: "ดูภาพ แล้วเลือกคำที่ตรงกับภาพ" });
    await user.click(screen.getByRole("radio", { name: /মাছ/ }));
    await user.click(screen.getByRole("button", { name: "ตรวจคำตอบ" }));
    expect(await screen.findByText("ถูกแล้ว คราวนี้ทำได้!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));

    // Summary: accuracy counts first tries only.
    expect(await screen.findByText("ฝึกครบแล้ว!")).toBeInTheDocument();
    expect(screen.getByText(/ตอบถูกตั้งแต่ครั้งแรก/)).toHaveTextContent("ตอบถูกตั้งแต่ครั้งแรก 4 จาก 5 ข้อ");

    await waitFor(() => expect(getProgressSnapshot().state.lessons[lesson.id]).toBeDefined());
    const state = getProgressSnapshot().state;
    expect(state.items["bn.word.mach"].incorrectCount).toBe(1);
    expect(state.items["bn.word.aam"].streakCorrect).toBe(1);
    expect(state.sessions[lesson.id]).toBeUndefined();
  });

  it("shows instructions, meanings and buttons in English when chosen", async () => {
    const user = userEvent.setup();
    updateSettings({ uiLanguage: "en" });
    try {
      render(<LessonRunner definition={definition} />);
      expect(await screen.findByRole("heading", { name: "Meet a new word" })).toBeInTheDocument();
      expect(screen.getByText("mango")).toBeInTheDocument();
      expect(screen.getByText("My first words")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Got it, next" }));
      expect(await screen.findByText("book")).toBeInTheDocument();
    } finally {
      resetSettings();
    }
  });
});
