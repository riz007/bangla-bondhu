import type { CurriculumItem, Lesson, World } from "@/features/curriculum/schema";

// Optional Arabic sample: four isolated letters, no religious text.
// Draft until a teacher checks the Thai letter names and records audio.

const DRAFT_SOURCE =
  "Standard isolated forms and conventional letter names; Thai names follow common Thai Muslim usage. Awaiting teacher review.";

type ArItemInput = Pick<
  CurriculumItem,
  "id" | "targetText" | "meaningTh" | "meaningEn" | "transliteration" | "noteTh" | "noteEn"
>;

function ar(item: ArItemInput): CurriculumItem {
  return {
    trackId: "ar",
    kind: "letter",
    targetLanguage: "ar",
    transliterationScheme: "bb-simple-latin-v1",
    difficulty: 1,
    contentStatus: "draft",
    sourceNote: DRAFT_SOURCE,
    ...item,
  };
}

export const arItems: CurriculumItem[] = [
  ar({
    id: "ar.letter.alif",
    targetText: "ا",
    meaningTh: "ตัวอักษร อะลิฟ",
    meaningEn: "the letter alif",
    transliteration: "alif",
    noteTh: "เป็นเส้นตั้งตรงหนึ่งเส้น ไม่มีจุด",
    noteEn: "A single straight upright line with no dots.",
  }),
  ar({
    id: "ar.letter.ba",
    targetText: "ب",
    meaningTh: "ตัวอักษร บาอ์",
    meaningEn: "the letter baa",
    transliteration: "baa",
    noteTh: "มีจุดหนึ่งจุดอยู่ใต้ตัว",
    noteEn: "One dot underneath.",
  }),
  ar({
    id: "ar.letter.ta",
    targetText: "ت",
    meaningTh: "ตัวอักษร ตาอ์",
    meaningEn: "the letter taa",
    transliteration: "taa",
    noteTh: "รูปร่างเหมือน ب แต่มีสองจุดอยู่ด้านบน",
    noteEn: "Same shape as ب, with two dots on top.",
  }),
  ar({
    id: "ar.letter.tha",
    targetText: "ث",
    meaningTh: "ตัวอักษร ษาอ์",
    meaningEn: "the letter thaa",
    transliteration: "thaa",
    noteTh: "รูปร่างเหมือน ب แต่มีสามจุดอยู่ด้านบน",
    noteEn: "Same shape as ب, with three dots on top.",
  }),
];

export const arWorlds: World[] = [
  {
    id: "ar-w0",
    trackId: "ar",
    order: 0,
    titleTh: "รู้จักอักษรอาหรับ",
    titleEn: "Meet Arabic letters",
    descriptionTh: "อักษรอาหรับเขียนและอ่านจากขวาไปซ้าย",
    descriptionEn: "Arabic is written and read from right to left",
  },
];

export const arLessons: Lesson[] = [
  {
    id: "ar-w0-l1",
    trackId: "ar",
    worldId: "ar-w0",
    order: 1,
    titleTh: "สี่ตัวอักษรแรก",
    titleEn: "First four letters",
    objectiveTh: "แยก ا ب ت ث ออกจากกันด้วยการดูจำนวนและตำแหน่งของจุด",
    objectiveEn: "Tell ا ب ت ث apart by the number and position of their dots",
    emblem: "ب",
    prerequisites: [],
    itemIds: ["ar.letter.alif", "ar.letter.ba", "ar.letter.ta", "ar.letter.tha"],
    estimatedMinutes: 5,
    contentStatus: "draft",
    version: 1,
    activities: [
      { id: "ar-w0-l1-a1", type: "introduce", itemId: "ar.letter.alif" },
      { id: "ar-w0-l1-a2", type: "introduce", itemId: "ar.letter.ba" },
      {
        id: "ar-w0-l1-a3",
        type: "read-and-choose",
        promptItemId: "ar.letter.ba",
        optionItemIds: ["ar.letter.alif", "ar.letter.ba"],
        answerItemId: "ar.letter.ba",
      },
      { id: "ar-w0-l1-a4", type: "introduce", itemId: "ar.letter.ta" },
      { id: "ar-w0-l1-a5", type: "introduce", itemId: "ar.letter.tha" },
      {
        id: "ar-w0-l1-a6",
        type: "recall",
        promptItemId: "ar.letter.ta",
        optionItemIds: ["ar.letter.tha", "ar.letter.ta", "ar.letter.ba"],
        answerItemId: "ar.letter.ta",
      },
      {
        id: "ar-w0-l1-a7",
        type: "read-and-choose",
        promptItemId: "ar.letter.tha",
        optionItemIds: ["ar.letter.ba", "ar.letter.ta", "ar.letter.tha"],
        answerItemId: "ar.letter.tha",
      },
      {
        id: "ar-w0-l1-a8",
        type: "match-pairs",
        itemIds: ["ar.letter.alif", "ar.letter.ba", "ar.letter.ta", "ar.letter.tha"],
        matchBy: "meaning",
      },
    ],
  },
];
