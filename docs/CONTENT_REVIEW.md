# Content review guide

All curriculum lives in `src/content/` as typed data. Reviewers can check and
change content without touching UI code. Run `npm run validate:content` after
any change: it fails on broken answer keys, missing assets, wrong language
tags, unreviewed content in a published lesson, and more
(`src/features/curriculum/validation.ts`).

## Current status (October 2026)

| Track | Lessons | Status | What is missing |
| --- | --- | --- | --- |
| Bengali (`bn`) | 8 | **draft** | Native-speaker review of every word, meaning and transliteration; reviewed audio recordings |
| Arabic letters (`ar`) | 1 | **draft** | Teacher review of Thai letter names; recordings of letter names |
| Islamic knowledge (`islam`) | 0 | planned topics only | A qualified reviewer, sources, and authored lessons |

Draft lessons are hidden from children. A parent can turn on
**Settings → บทเรียนฉบับร่าง** to preview them; every draft screen shows a
"ฉบับร่าง รอผู้ตรวจภาษา" badge.

## How content moves from draft to published

1. **Draft:** written, passes `npm run validate:content`, and is not shown to children.
2. **Reviewed:** a qualified reviewer has checked it against the checklist below.
   Set `contentStatus: "reviewed"`, `reviewedAt: "YYYY-MM-DD"` and a
   `reviewerNote` (a role or initials, never contact details) on each item and
   lesson.
3. **Published:** shipped to children. Validation refuses a non-draft lesson
   that uses a draft item, has no `reviewedAt`, or has an item without
   `audioSrc`.

## Bengali editorial checklist (per item)

- [ ] `targetText` is standard Bangladeshi spelling (e.g. পানি, not জল, for water).
- [ ] The word is common, everyday, and suitable for an 8–9-year-old.
- [ ] `meaningTh` is a natural, child-friendly Thai meaning, and `meaningEn` says the same thing in English.
- [ ] `transliteration` follows the scheme below and is marked as a reading aid only.
- [ ] `noteTh`/`noteEn`, if present, are accurate and don't overclaim about pronunciation.
- [ ] Image (if any) is unambiguous and culturally appropriate, and `altTh`/`altEn` describe it.
- [ ] Audio recorded by a fluent Bangladesh Bengali speaker, then checked by a second listener.
- [ ] Distractors in each activity are clearly wrong for a child who knows the answer, and are not confusable before explicit teaching.

### Per lesson

- [ ] `objectiveTh`/`objectiveEn` match what the activities actually practise.
- [ ] New items are introduced (`introduce`) before they are tested.
- [ ] 4–10 practice activities, at least two activity types.
- [ ] Prerequisites point to the lessons that teach every item it relies on.

## Audio requirements

- Format: `.mp3` or `.m4a`, mono, 44.1 kHz, peak about −3 dBFS, silence trimmed to ~150 ms either side.
- Path: `public/audio/bn/<item-id-with-dashes>.mp3`, set as `audioSrc` on the item.
- Add an entry to `src/content/assets.ts` with speaker role (no full name needed),
  dialect, recording date, licence or permission, and review status in `notes`.
- Never use text-to-speech output as a recording. The app can offer the
  device's own synthetic voice as a clearly labelled fallback; that isn't
  curriculum content.

## Transliteration scheme `bb-simple-latin-v1`

A temporary reading aid for Thai children who know basic Latin letters. It is
not ISO 15919 and not an exact pronunciation guide.

| Bengali | Latin | Notes |
| --- | --- | --- |
| অ (inherent vowel) | o | ক = ko |
| আ / া | a | long *aa* written as *a*, except *aam* to keep আম distinct from অম |
| ই / ি, ঈ / ী | i | |
| উ / ু, ঊ / ূ | u | |
| এ / ে | e | |
| ও / ো | o | |
| ভ | bh | aspirated consonants add *h* |
| ছ | chh | |
| ড় | r | as in বিড়াল = biral, বাড়ি = bari |

Reviewers may refine spellings; keep them consistent within a lesson.

## Arabic letters

- Isolated forms only in the sample; positional forms come later.
- Thai letter names (อะลิฟ, บาอ์, ตาอ์, ษาอ์) follow common Thai Muslim usage and need teacher confirmation.
- Always render Arabic through `TargetText`/`ItemText` so it gets `lang="ar"` and `dir="rtl"`.

## Islamic content rules

Nothing ships in this track until all of the following are true for a lesson:

- [ ] Written for the introductory level, with a respectful, non-coercive tone.
- [ ] Every claim has a source in `sourceNote` (collection and reference number for any hadith; surah and ayah for Qur'anic text).
- [ ] Arabic text, diacritics, transliteration, translation and recitation were verified by a qualified reviewer.
- [ ] Disputed points are avoided or presented as differences of opinion.
- [ ] No depictions of prophets; sacred text is never used as decoration or as a reward.
- [ ] `reviewerNote` and `reviewedAt` are set, and `contentStatus` is `reviewed` or `published`.

The validation test rejects any Islamic lesson that's missing these fields.
