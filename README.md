# Bangla Bondhu (বাংলা বন্ধু)

Short, friendly lessons that help Thai-speaking children (about 8–9 years old)
learn Bangladeshi Bengali: the full alphabet, vowel signs and joined letters,
everyday words, and the grammar to build their own sentences.

- No sign-up. Progress is saved in the browser on this device.
- Interface in Thai or English (switch with the button in the header).
- Bengali is shown in Bangla script, with an optional Latin reading aid that
  fades as words are learned.
- 9 chapters and 31 lessons, from the first words to a short story.
- A sentence maker where children build their own sentences (it checks that the
  verb matches the subject) and keep them in a sentence book.
- Chapter stamps, a letters-met counter, and spaced review that brings missed
  and older words back at the right time.
- Works on phones, tablets and desktops, and can be installed as an app.

## Content status

The Bengali course was reviewed by the project owner, a fluent Bangladeshi
Bengali speaker. Audio hasn't been recorded yet, so listening questions show a
written clue instead. See [docs/CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md) for
how to add recordings and new lessons.

An optional Islamic section only lists planned topics until a qualified
reviewer has checked the material.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit and component tests (Vitest) |
| `npm run validate:content` | Checks the lesson data |
| `npm run build` | Content check, then a production build |
| `npm run test:e2e` | Playwright tests on a production build (run `npx playwright install chromium` once) |
| `npm run format` | Prettier |

## Deploying

Import the repository into Vercel with the default Next.js settings. No
environment variables are needed, and there's no analytics.

## Privacy

The app doesn't ask for a child's name or any personal details, and doesn't
use the microphone, camera or location. Finished lessons and review dates are
kept in IndexedDB on the device and preferences in localStorage. Nothing is
sent to a server. Clearing browser data removes progress, so Settings can save
a backup file.

## More

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the app is put together
- [docs/CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md): how to review and publish lessons
