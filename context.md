# XTS Sorting Hat Quiz — Full Developer Handover Context
**Project:** The Sorting Hat's Verdict — XTS Official Merch Campaign  
**Project Location:** `c:\XTS26Quiz`  
**Dev Server:** Run `npm run dev` → `http://127.0.0.1:5173/`  
**Tech Stack:** Vite 8 + React 19 + TypeScript + Tailwind CSS v4  
**Last Session:** 2026-10-04 ~23:52 IST  

---

## SECTION 1: WHAT THE APP IS

A viral theatrical quiz for **Xaverian Theatrical Society (XTS)**. The user goes through a 10-question "Hogwarts Sorting"-style personality quiz. The TWIST (bait-and-switch): no matter what you answer, the Sorting Hat always declares:

> *"YOU NEED TO REGISTER FOR XTS T-SHIRTS!"*

Then it reveals a pop culture "alter ego" and lets you personalize the official XTS polo with your name.

### Screen Flow:
```
[Velvet Curtains Entry] → [Landing Page] → [10 Quiz Questions] → [3s Thinking Ceremony] → [Result Page]
```
- On Result: sticky bottom bar always says "Claim Your T-Shirt & Personalize Name" → Google Form
- Google Form URL: `https://forms.gle/cY4nFLNgLZXTUFts6`

---

## SECTION 2: FULL FILE STRUCTURE

```
c:\XTS26Quiz
├── public/
│   ├── assets/
│   │   ├── hat/
│   │   │   ├── hat_1.png          ← Confident smirk (used for idle + Archetype C)
│   │   │   ├── hat_2.png          ← Speaking face (not heavily used currently)
│   │   │   ├── hat_3.png          ← Wide calculating eyes (Archetype A hover/select)
│   │   │   ├── hat_4.png          ← Knowing smile (Archetype B hover/select + verdict)
│   │   │   ├── hat_5.png          ← Joyful toothy grin (Archetype D hover/select)
│   │   │   └── hat_surprised.png  ← RARE astonished face (use very sparingly)
│   │   ├── shirt_back.png         ← XTS polo back view (has the blue ribbon banner)
│   │   ├── shirt_front.png        ← XTS polo front view
│   │   ├── xts_logo.png           ← Official XTS logo (used in header + curtains)
│   │   └── xts_logo_original.png  ← Backup copy
│   ├── audio/                     ← Folder exists; audio is ALL synthesized in code
│   └── favicon.svg
│
└── src/
    ├── components/
    │   ├── FloatingCandles.tsx    ← Background floating candles (OVERHAULED: now 17 candles)
    │   ├── Navbar.tsx             ← EXISTS but NOT USED (App.tsx has its own inline header)
    │   ├── SortingHat.tsx         ← Hat image, speech bubble, glow aura, all animations
    │   ├── SpotlightDust.tsx      ← Canvas cursor glow + gold dust particle system
    │   ├── StickyCTA.tsx          ← Fixed bottom "Claim Your T-Shirt" bar on result screen
    │   ├── StoryShareModal.tsx    ← 9:16 Instagram Story share modal
    │   ├── TShirtCustomizer.tsx   ← Polo front/back preview + live name text overlay
    │   └── TheatreCurtains.tsx    ← Opening velvet curtains + audio ON/OFF pre-selection
    │
    ├── data/
    │   └── quizData.ts            ← All 10 questions, 4 CHARACTER_RESULTS, phrases, URLs
    │
    ├── types/
    │   └── quiz.ts                ← TypeScript types: Question, Option, CharacterResult, QuizState
    │
    ├── utils/
    │   └── audio.ts               ← Procedural Web Audio synthesizer (Hedwig's Theme + SFX)
    │
    ├── App.tsx                    ← Main app — ALL 4 screens, all state, all logic
    ├── App.css                    ← Minor extra styles
    ├── index.css                  ← Global CSS, all keyframes, animation utility classes
    └── main.tsx                   ← React entry point
```

---

## SECTION 3: CHARACTER ARCHETYPES

| Archetype | Character | Personality Title | Accent Color |
|-----------|-----------|-------------------|-------------|
| A | Sherlock Holmes | The Mastermind | `#d4af37` Gold |
| B | Wednesday Addams | The Dramatic Rebel | `#a855f7` Purple |
| C | Hermione Granger | The Golden Idealist | `#e11d48` Crimson |
| D | Captain Jack Sparrow | The Scene Stealer | `#f59e0b` Amber |

**Edit characters:** `src/data/quizData.ts` → `CHARACTER_RESULTS` object (lines 266–323)

### How to Add Character Portrait Images (NOT YET DONE):
1. Put images in `public/assets/characters/` (e.g. `sherlock.png`, `wednesday.png`)
2. In `src/data/quizData.ts` → `CHARACTER_RESULTS`, add `imageSrc: '/assets/characters/sherlock.png'` to each character
3. `imageSrc?: string` already exists in `src/types/quiz.ts` line 28 (already prepared)
4. In `src/App.tsx` lines ~576–586, the card currently shows an emoji. Replace with:
   ```tsx
   <div className="w-44 h-60 sm:w-52 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-2xl shrink-0">
     {activeResult.imageSrc
       ? <img src={activeResult.imageSrc} alt={activeResult.character} className="w-full h-full object-cover" />
       : <span className="text-5xl">🕵️‍♂️</span>}
   </div>
   ```

---

## SECTION 4: SORTING HAT EXPRESSION SYSTEM

**File:** `src/components/SortingHat.tsx`

The hat is rendered as a **CSS background-image div** (intentionally — this prevents right-click "Save Image As").

Expression → Image mapping (function `getHatImage()`, lines ~44–64):
- `idle` → `hat_1.png` (default smirk)
- `thinking` → `hat_3.png` (deliberating)
- `verdict` → `hat_4.png` (knowing smile)
- hover/select Archetype `A` → `hat_3.png`
- hover/select Archetype `B` → `hat_4.png`
- hover/select Archetype `C` → `hat_1.png`
- hover/select Archetype `D` → `hat_5.png`
- `surprised` → `hat_surprised.png` — **USE SPARINGLY**

### Priority of expressions on quiz screen:
```
hoveredArchetype > pendingSelection > hatState
```
So hovering overrides selection, selection overrides base state.

### Hat Size Classes (lines ~69–74):
```tsx
sm: 'w-36 h-36 sm:w-44 sm:h-44'
md: 'w-52 h-52 sm:w-64 sm:h-64'
lg: 'w-72 h-72 sm:w-84 sm:h-84 lg:w-96 lg:h-96'   ← quiz screen uses this
xl: 'w-80 h-80 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px]'  ← landing + thinking use this
```

### Speech bubble gap to hat crown:
Line 84: `-mb-6 sm:-mb-8 lg:-mb-10`  
(Increase the negative margin e.g. `-mb-12` to bring bubble even closer)

---

## SECTION 5: T-SHIRT NAME OVERLAY POSITIONING

**File:** `src/components/TShirtCustomizer.tsx` lines **88–101**

```tsx
style={{ top: '64.6%', left: '47.5%' }}
```
- `top: '64.6%'` → vertical placement inside the ribbon banner (move up = smaller %, down = larger %)
- `left: '47.5%'` → the ribbon center in `shirt_back.png` is NOT at 50% — it's at ~47.5%
- `tracking-[0.05em]` → letter spacing (wider = `tracking-[0.12em]`, tighter = `tracking-normal`)
- `text-sm sm:text-base lg:text-lg` → font size
- `text-[#e2c974]` → aged gold thread color

---

## SECTION 6: KEY APP.TSX LOGIC

### State Variables:
| Variable | Type | Purpose |
|----------|------|---------|
| `screen` | `'landing'\|'quiz'\|'thinking'\|'result'` | Which page is shown |
| `currentQIndex` | number | Current question 0–9 |
| `userAnswers` | `Record<number, Archetype>` | All confirmed answers |
| `pendingSelection` | `Archetype\|null` | Clicked but not confirmed |
| `hatState` | `HatExpression` | Base hat expression |
| `hoveredArchetype` | `Archetype\|null` | Mouse-over preview |
| `winningArchetype` | `Archetype` | Final calculated result |
| `customName` | string | Personalized name for shirt |
| `isMuted` | boolean | Audio mute state |

### Option Click Flow:
1. Click option → `handleOptionClick()` → sets `pendingSelection`, hat face changes, speech bubble updates
2. Click "Confirm Choice →" (OR click same option twice) → `handleConfirmSelection()` → advances to next question
3. After Q10 confirmed → `handleFinishQuiz()` → 3-second thinking ceremony → confetti → result screen

### Dev Skip Shortcut (MUST REMOVE BEFORE LAUNCH):
- **Keyboard:** `Shift + V` anywhere → jumps to Result with Archetype A
- **Button:** `⚡ Fast Verdict` in top-right header
- **Location:** App.tsx lines ~64–84 (function + keyboard listener) and ~288–298 (button JSX)
- **To remove for launch:** Delete the `handleDevSkipToResult` function, the `useEffect` keyboard listener, and the button JSX block

---

## SECTION 7: AUDIO SYSTEM

**File:** `src/utils/audio.ts`

ALL audio is **synthesized via Web Audio API** — zero copyright risk, zero external files.

- **Background music:** Procedural celesta/music-box Hedwig's Theme loop
- **Curtain creak:** On "Enter the Stage" button
- **Enter chime:** Arpeggiated chord when curtains open
- **Click pop:** On landing hat click
- **Select chime:** On option confirm, pitch varies by question index
- **Fanfare:** On result reveal

Audio initializes lazily (after user gesture) to comply with browser autoplay policies.

---

## SECTION 8: COLOR SYSTEM

### Current Applied Palette:
| Element | Color |
|---------|-------|
| Body background | `radial-gradient(ellipse at 50% 15%, #240c14 0%, #17080e 40%, #0d0508 75%, #060204 100%)` |
| Primary gold | `#d4af37` |
| Bright gold glow text | `#ffd700` |
| Crimson red (buttons, accents) | `#7a1c1c` |
| Dark card bg | `#1e1715` / `#201917` |
| Body text | `#f4eae1` |
| Secondary/italic text | `#fce8d5` |

### User Feedback: "It feels bland, no prestige, no wow"
The user explicitly said the current color + design feels too plain. They want it to feel premium and theatrical. The following options were discussed but **NOT YET IMPLEMENTED**:

**Option A — Royal Velvet (least disruptive, recommended):**
- Add `text-shadow: 0 0 20px rgba(255,200,0,0.6)` to key headlines
- Add subtle grain/noise background texture via CSS pseudo-element
- Bump borders from `#7a1c1c` to `#c41230` (more vivid scarlet)
- Make card borders glow: `box-shadow: 0 0 40px rgba(212,175,55,0.25)`

**Option B — Midnight Emerald:** BG `#0a1a0e`, accent emerald `#10b981` + gold

**Option C — Gothic Purple Crypt:** BG `#13001f`, accent `#a855f7` + gold

**Option D — Baroque Crimson Stage (most theatrical):** BG `#1a0006`, accent `#dc2626` + antique gold `#b8962e`

---

## SECTION 9: HISTORY OF FAILURES & ISSUES (Chronological)

This section documents every major failure, bug, and user complaint from the build sessions so the next dev knows what NOT to repeat.

### ❌ FAILURE 1: Landing Page Initial Layout
**What went wrong:** The initial landing page had the Sorting Hat image crammed poorly, the word "Hat" was visually merging with a candle behind it, no proper text separation. The layout was generally cramped and unreadable.  
**Status:** Fixed. Now uses proper 12-column grid: hat on left (col-span-6), text on right (col-span-6).

### ❌ FAILURE 2: Hat Had to Scroll to See on Landing
**What went wrong:** The "Put on the hat" / Enter Quiz button required scrolling to be visible.  
**Status:** Fixed. All screens except Result use `h-screen overflow-hidden` to prevent any scroll.

### ❌ FAILURE 3: Result Page "Not Loading" / Broken
**What went wrong:** The final Result page was rendering incorrectly and appeared to not load properly.  
**Status:** Fixed. The issue was with conditional rendering logic. Now all 4 screens render correctly.

### ❌ FAILURE 4: T-Shirt Text Alignment (Repeated Failure)
**What went wrong:** The name overlay text on the shirt back was consistently misaligned from the ribbon banner. Multiple failed attempts:
- Initially positioned at `left: 50%` → visually drifted to the right of the ribbon
- The ribbon center in `shirt_back.png` is at pixel x=389 out of 819px total = **47.5%**, not 50%
**Status:** Fixed. `left: '47.5%'` and `top: '64.6%'` now align correctly with ribbon.

### ❌ FAILURE 5: Text Box Had Ugly Floating Dots
**What went wrong:** The speech bubble above the Sorting Hat had multiple SVG circle "thought bubble" dots floating below it (like a cartoon thought bubble). User called it "worst possible." Had to iterate multiple times.  
**Status:** Fixed. All dots removed. Now uses a clean tapered downward diamond/beak pointer (CSS rotated square with border).

### ❌ FAILURE 6: The Sorting Hat Showed Astonished Face Constantly
**What went wrong:** `hat_surprised.png` was being used too liberally — appeared on almost every interaction. User: "If I have to see the astonished face after every click, that is bullshit."  
**Status:** Fixed. `hat_surprised.png` is now a rare `'surprised'` state only. Landing hat clicks cycle through `['idle', 'A', 'B', 'D']` (subtle expressions only).

### ❌ FAILURE 7: Hover Sound Was Unpleasant Noise
**What went wrong:** There was a sound playing on every option hover that sounded like "the most unpleasant noise ever" — described as "noise, not even sound."  
**Status:** Fixed. Hover sounds removed entirely. Sound plays only on: curtain open, answer confirm, quiz finish, result reveal.

### ❌ FAILURE 8: Sorting Hat Shadow on Landing Text
**What went wrong:** The hat's large CSS drop-shadow (`drop-shadow[0_18px_28px_rgba(0,0,0,0.95)]`) created a visible dark blob that fell over the "10 fast-paced questions" text below the hat.  
**Status:** Partially fixed this session. Shadow reduced from `blur-md h-5 -bottom-3` to `blur-sm h-3 bottom-1`. The excessive outer drop-shadow was also reduced. May still need visual verification.

### ❌ FAILURE 9: XTS Header Text Interfering with Layout
**What went wrong:** "Xaverian Theatrical Society" header text in the top-left (positioned `absolute top-4 left-6`) clashes/overlaps with the main content at certain viewport sizes. User: "The flexbox is interfering with the Xaverian Theatrical Society text."  
**Status: NOT YET FIXED.** See Section 10 for the fix.

### ❌ FAILURE 10: Only 4 Candles, Badly Placed
**What went wrong:** There were only 4 floating candles on the far left and right edges. User: "Those four candles look so bad, man."  
**Status:** Fixed this session. Now 17 candles scattered across the full screen at varying depths (smaller + more transparent for mid-screen ones, larger + more opaque on the edges).

### ❌ FAILURE 11: "Enter Quiz" Button Too Big
**What went wrong:** The Enter Quiz button on the landing page is visually oversized relative to the surrounding layout. User flagged this explicitly.  
**Status: NOT YET FIXED.** See Section 10 for the fix.

### ❌ FAILURE 12: Character Alter Ego Card Design
**What went wrong:** The Sherlock Holmes / alter ego card on the result page was described as using the "ugliest text box of all time" at one point. The layout showed a boxed card with too much padding and poor visual hierarchy.  
**Status:** Partially improved. Now uses a compact horizontal flex card. But user said they want a proper **Hero Stage Poster** or **Admit-One Ticket** redesign. **NOT YET FULLY REDESIGNED.**

### ❌ FAILURE 13: Body Background Too Bland
**What went wrong:** The all-over `#120f0e` dark brown background felt flat and lifeless. User: "It seems too bland, man. There's no prestige."  
**Status:** Partially fixed this session — background upgraded to a `radial-gradient` deep burgundy/red centre fading to near-black. But full "wow factor" design work has NOT been done yet.

### ❌ FAILURE 14: Thinking Screen Text Box Duplication
**What went wrong:** On the Thinking screen (3-second ceremony), the deliberation text appeared BOTH in the hat's speech bubble AND in a second card below it, causing visual redundancy.  
**Status:** Still exists — in App.tsx lines ~522–529, a `<div>` card below the SortingHat also renders `{deliberationText}`. Can safely remove this duplicate card.

### ❌ FAILURE 15: Percentage Sorting Not Correct at Start
**What went wrong:** User noted "The percentage of sorting is not correct." On Q1, 0 questions are answered, but the progress bar showed an incorrect value.  
**Status:** Fixed. Now uses `confirmedCount * 10` where `confirmedCount = Object.keys(userAnswers).length`. Starts at 0%, hits 100% after Q10 is confirmed.

---

## SECTION 10: STATUS OF TASKS (Completed & Verified)

All tasks from Section 10 have been executed, tested, visually inspected via browser subagent, and verified with 0 TypeScript/build errors.

### 🔴 HIGH PRIORITY — COMPLETED:
- [x] **1. Convert Header to a Fixed Top Bar**: Replaced absolute corner divs with fixed header (`header.fixed top-0 left-0 right-0 z-40 h-14`). Added `pt-16` / `pt-20` spacing to ensure zero overlap.
- [x] **2. Make "Enter Quiz" Button Smaller**: Updated to `px-7 py-3 text-sm sm:text-base rounded-xl` with glowing gold border.
- [x] **3. Remove Fast Verdict Button Before Launch**: Removed the `⚡ Fast Verdict` header button JSX and cleaned up dev skip shortcuts from `App.tsx` for production readiness.

### 🟡 MEDIUM PRIORITY — COMPLETED:
- [x] **4. Add Candle Horizontal Sway (Harry Potter Great Hall)**: Upgraded `candleFloat` in `src/index.css` with 5-point keyframes including horizontal sway (`translateX(-5px)` to `translateX(6px)`) and subtle rotation.
- [x] **5. Make Cursor Effects More Excessive**: Increased `particleCount` to `150` and `spotlightRadius` to `380` in `SpotlightDust.tsx`.
- [x] **6. Remove Duplicate Deliberation Text Card on Thinking Screen**: Removed duplicate text box under Sorting Hat.
- [x] **7. Thinking Screen Layout**: Centered the Sorting Hat and speech bubble with a pulsing "Ceremony of the Stool" status badge.
- [x] **8. Alter Ego Card — Hero Stage Poster Redesign**: Generated and wired 4 high-res theatrical character portrait posters (`sherlock.jpg`, `wednesday.jpg`, `hermione.jpg`, `jack_sparrow.jpg`) in `public/assets/characters/`. Redesigned the result card into a framed theatrical playbill poster with gold border, badge overlay, quote callout, and trait tags.
- [x] **9. Color Theme "Wow Factor" Upgrade**: Implemented Royal Velvet enhancements: vivid scarlet (`#c41230`) underlines, text shadows, card glow (`theatrical-card-glow`), and gold ambient lighting.
- [x] **10. Add Animated Gradient Text to Key Headlines**: Added `@keyframes shimmerGold` and `.text-shimmer-gold` class to landing ("Theatrical Verdict") and result ("XTS T-SHIRTS!") headlines.
- [x] **11. 30-Character Roster & 3-Act Temporal Matrix**: Implemented the complete 10-archetype × 3-temporal-band roster (30 characters total) from the PDF specification.
- [x] **12. Python Batch Character Acquisition**: Acquired and saved all 30 authentic movie stills / character portraits into `public/characters/{char_id}.jpg`.
- [x] **13. 3-Act Quiz Questions with Dual Hat Commentary**: Implemented 10 Act-structured theatrical questions in `src/data/quizQuestions.ts` with dual witty commentary per option.
- [x] **14. LCM = 12 Scoring Engine**: Implemented `src/utils/scoringEngine.ts` and `src/hooks/useQuizEngine.ts` resolving winning archetypes and normalizing temporal bands (Band 1 × 4, Band 2 × 3, Band 3 × 4).
- [x] **15. Speech Bubble Sizing & Orientation Stability**: Hardened `SortingHat.tsx` speech bubble with responsive max-width (`max-w-md`) and stable vertical constraints so 80–90 character comments fit without displacing or tilting the hat.
- [x] **16. 3-Stage Result Screen Hierarchy**: Restructured Result page into Stage 1 (Alter Ego Reveal Hero First) → Stage 2 (Sorting Hat Mandate & tailored merch pitch) → Stage 3 (Interactive 3D Polo Customizer).
- [x] **17. 30-Character Fast-Track Selector**: Added an interactive quick-select menu to preview any of the 30 characters in 1 click.
- [x] **18. Instagram Story 9:16 Canvas Overhaul**: Redesigned canvas with centered portrait, clean margins, zero text cutoffs, and society crest branding.
- [x] **19. Full Codebase Audit & Vercel/GitHub Cleanup**: Removed 13 unused files and 4 directories (~12+ MB saved), eliminated unused audio files, deleted scrap scripts, and created a dedicated `constants.ts` file.

---

## SECTION 11: WHAT WORKS WELL (Do Not Break)

- ✅ Curtain opening animation + audio flow
- ✅ Landing page no-scroll layout (Hat left, text right)
- ✅ Quiz page no-scroll layout (Hat left, Q&A right)
- ✅ Hat expression changes on hover/select
- ✅ Confirm-on-second-click behavior for options
- ✅ Progress bar (0% → 100% over 10 questions)
- ✅ 3-second Sorting Ceremony with deliberation phrases
- ✅ Confetti on result reveal
- ✅ T-shirt front/back toggle with live name overlay (lowered to 72.5%)
- ✅ Sticky bottom CTA bar → Google Form link
- ✅ Right-click protection on hat image (CSS background-image)
- ✅ Sound synthesizer (Web Audio API, no external mp3s needed)
- ✅ Instagram Story 9:16 share modal with 30-character canvas rendering
- ✅ 30-character Fast-Track selector dropdown
- ✅ 3-stage Result hierarchy (Stage 1 Alter Ego -> Stage 2 Mandate -> Stage 3 Customizer)

---

## SECTION 12: BUILD & COMMANDS

```bash
cd c:\XTS26Quiz
npm run dev        # Start dev server → http://127.0.0.1:5173/
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview built output
```

Last verified build: **0 TypeScript errors, 0 Vite errors** (704ms build time).

---

## SECTION 13: CONSTANTS & EXTERNAL LINKS

| Constant | Value | File |
|----------|-------|------|
| `ORDER_FORM_URL` | `https://forms.gle/cY4nFLNgLZXTUFts6` | `src/constants.ts` |
| `SOCIETY_INSTAGRAM_HANDLE` | `@xts_official` | `src/constants.ts` |

Google Form pre-order link is embedded in:
1. `StickyCTA.tsx` (imports `ORDER_FORM_URL` from quizData)
2. The "Claim your T-shirt" anchor `<a>` on result screen (App.tsx ~line 619)

---

## SECTION 14: HOW TO CONTINUE IN A NEW SESSION

Paste the following as your opening message (along with this file):

> "I'm continuing work on the XTS Sorting Hat Quiz app located at `c:\XTS26Quiz`. The dev server runs with `npm run dev`. Here is the full context doc. Please read it carefully, especially Section 9 (failures) and Section 10 (unexecuted tasks). Start by fixing the unexecuted tasks in priority order."
