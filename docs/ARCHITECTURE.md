# Architecture

Every route is prerendered at build time. Lessons, progress and preferences
all run in the browser. There's no backend and no account, and learner data
never leaves the device.

```
src/
  app/                      Routes (thin server components)
    (main)/                 Pages with the header and tab bar
    lesson/[lessonId]/      Full-screen lesson
    review-session/         Full-screen mixed review
  content/                  Curriculum data (bn, ar, islam) and asset attributions
  features/
    curriculum/             Schema, loader, validation, Thai/English field helpers
    lessons/                Lesson engine, scoring, answer checks, activity components
    progress/               Progress model, review scheduler, IndexedDB storage
    review/                 Picks activities for due words
    settings/               Preferences in localStorage, useT() for UI text
    audio/                  Playback and the listen button
  components/               Screens and shared UI
  lib/                      i18n messages, script/direction helpers
e2e/                        Playwright tests
```

## How a lesson works

1. Lesson content is plain TypeScript data in `src/content`. `npm run validate:content`
   (also run before every build) checks IDs, answer keys, assets, translations and
   review status.
2. `lesson-engine.ts` is a small state machine. A question answered wrongly comes
   back once at the end of the lesson, and only first attempts count toward the score.
3. The runner saves the engine state after every answer, so closing the tab loses
   at most the current question.
4. When a lesson ends, each word gets one outcome and goes to the scheduler.
5. The scheduler spaces reviews at 1, 3, 7, 14 and 30 days (local calendar days).
   A word only moves up when it was actually due, and a missed word is due again
   straight away.

## Languages

Thai is the default interface language and English can be switched on from the
header button or Settings. UI strings live in `src/lib/i18n/messages.ts`; the
English object has the same type as the Thai one, so a missing translation is a
type error. Curriculum items and lessons carry `meaningTh`/`meaningEn`,
`titleTh`/`titleEn` and so on, and validation fails if a note or alt text exists
in only one language.

## Decisions

- **Unreviewed content is hidden from children.** A parent can turn on draft
  preview in Settings; draft lessons are labelled on every screen.
- **Missing audio is shown honestly.** Listening questions fall back to a written
  clue. The device's computer voice is offered only when one exists for the
  language, and it is labelled as such.
- **Introduction cards** (`introduce`) are unscored steps that teach a word before
  it is tested.
- **No component library.** Radio cards, a native `<dialog>` and a few buttons
  were simpler to build directly and keep the bundle small.
- **Service worker** (`public/sw.js`): network-first pages with an offline page,
  cache-first hashed assets. Audio isn't cached yet.
- **CSP** (`next.config.ts`) allows inline scripts because Next's bootstrap needs
  them unless every page is rendered dynamically with nonces.

## Bundle size (production build, gzip, October 2026)

| Route | Initial JS |
| --- | --- |
| Empty Next 16.4 app | 176 KB |
| `/` | ~208 KB |
| `/lesson/[id]` | ~222 KB |

Progress validation uses `zod/mini` in the browser; the full Zod build only runs
in tests and the content check.
