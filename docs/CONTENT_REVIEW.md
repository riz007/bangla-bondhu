# Content review guide

All curriculum lives in `src/content/` as typed data, so reviewers can check and
change it without touching UI code:

- `src/content/bn/items.ts`: every letter, sign, word and sentence, with Thai and English meanings
- `src/content/bn/lessons.ts`: chapters, lessons and sentence-maker frames
- `src/content/bn/build.ts`: small helpers that turn a lesson outline into activities

Run `npm run validate:content` after any change. It fails on broken answer keys,
missing pictures, missing translations, sentence frames with gaps, and
unreviewed content in a lesson marked as reviewed.

## The course

| Chapter | Lessons | What it teaches |
| --- | --- | --- |
| Hello, Bengali | 2 | First words, greetings, the answer/feedback loop |
| Vowels (স্বরবর্ণ) | 3 | All 11 vowels; ই/ঈ and উ/ঊ sound alike |
| Consonants (ব্যঞ্জনবর্ণ) | 7 | All 39 consonants and signs, row by row; aspiration (compared with Thai ก/ข), voiced aspirates, curled-tongue vs. teeth sounds, the three “sh” letters |
| Vowel signs (কার) | 3 | All 10 কার; ি/ে/ৈ are written before the consonant; ো/ৌ wrap around it |
| Joined letters | 2 | হসন্ত, common conjuncts (স্ক স্ত ন্ত ক্ষ), র-ফলা, য-ফলা, রেফ |
| Numbers | 2 | Digits ০–১০ and number words |
| My world | 4 | Food, home and school, animals and nature, colours and family |
| Making sentences | 7 | SOV word order, verbs changing by person (no gender), -এ/-তে, এটা/ওটা and -টা, negation with না, কি vs কী questions, আমার … আছে, adjectives before nouns, and a sentence workshop |
| Read and understand | 2 | A five-sentence story, then a cumulative review |

Chapters 1–5 form the reading trail. Numbers and My world open after the
first chapter, so children can mix vocabulary with letters. Sentences open
after My world, and the story needs the vowel-sign chapter too.

Activity types: introduction cards, tip cards (grammar notes), listen and
choose, picture ↔ word, read and choose a meaning, recall, match pairs, build
a syllable/word, put words in order, fill the missing letter or word, and the
**sentence maker**, where children pick their own words. When a verb has to
agree with the subject, the maker checks it and explains the right form.
Finished sentences are saved to the child's sentence book.

## Status

Everything is `draft`: written from standard Bangladeshi usage, but not yet
checked by a fluent speaker, and no audio is recorded. Draft lessons are hidden
from children; parents can preview them in **Settings → Draft lessons**.

## Moving content out of draft

1. **Draft:** passes `npm run validate:content`; hidden from children.
2. **Reviewed:** a fluent Bangladeshi Bengali speaker has checked the item or
   lesson against the checklist below. Set `contentStatus: "reviewed"`,
   `reviewedAt: "YYYY-MM-DD"` and `reviewerNote` (a role or initials, no contact
   details). Reviewed lessons are shown to children; listening questions use a
   written clue until recordings exist.
3. **Published:** reviewed and every item has a recording (`audioSrc`).

To make a whole lesson visible, change the lesson and every item it uses
(including examples and sentence-maker words). Validation lists anything still
in draft.

## Bengali checklist (per item)

- [ ] `targetText` is standard Bangladeshi spelling (e.g. পানি for water).
- [ ] The word is common and suitable for an 8–9-year-old.
- [ ] `meaningTh` and `meaningEn` are natural and say the same thing.
- [ ] `transliteration` follows the scheme below.
- [ ] Notes are accurate and don't overclaim about pronunciation.
- [ ] Pictures are unambiguous and culturally appropriate; `altTh`/`altEn` describe them.
- [ ] Glosses (`glossTh`/`glossEn`) read naturally inside the sentence-maker translations.
- [ ] Audio recorded by a fluent Bangladeshi speaker and checked by a second listener.

### Per lesson

- [ ] The objective matches what the activities practise.
- [ ] New items are introduced before they are tested.
- [ ] Distractors are clearly wrong for a child who knows the answer.
- [ ] Prerequisites cover everything the lesson relies on.

## Audio

- `.mp3` or `.m4a`, mono, 44.1 kHz, peaks around −3 dBFS, ~150 ms of silence trimmed either side.
- Save as `public/audio/bn/<item-id-with-dashes>.mp3` and set `audioSrc` on the item.
- Add an entry to `src/content/assets.ts` with the speaker's role, dialect,
  recording date, permission, and review status in `notes`.
- Never use text-to-speech output as a recording.

## Transliteration scheme `bb-simple-latin-v1`

A temporary reading aid, not ISO 15919 and not an exact pronunciation guide.
Letter readings mark curled-tongue sounds with a dot (ṭ ḍ ṇ ṣ ṛ); word readings
stay plain so they're easy for children.

| Bengali | Latin | Notes |
| --- | --- | --- |
| অ (hidden vowel) | o / ô | ক = ko |
| আ / া | a | *aam* keeps আম distinct |
| ই ঈ / ি ী | i | |
| উ ঊ / ু ূ | u | |
| এ / ে | e | য-ফলা often sounds *æ* (ব্যাঙ = byang) |
| ও / ো | o | |
| aspirated letters | add *h* | খ kh, ভ bh, ছ chh |
| শ ষ স | sh | স is *s* in a few words (স্কুল = skul) |
| ড় ঢ় | r | বিড়াল = biral |

## Islamic content rules

Nothing ships in this track until, for each lesson:

- [ ] It's introductory, respectful and non-coercive.
- [ ] Every claim has a source in `sourceNote` (collection and number for hadith; surah and ayah for Qur'anic text).
- [ ] Arabic text, diacritics, transliteration, translation and recitation were verified by a qualified reviewer.
- [ ] Disputed points are avoided or presented as differences of opinion.
- [ ] No depictions of prophets; sacred text is never decoration or a reward.
- [ ] `reviewerNote` and `reviewedAt` are set, and the status is `reviewed` or `published`.

Validation rejects any Islamic lesson missing these.
