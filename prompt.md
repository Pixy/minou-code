# Prompt Claude Code — Minou Code

Create a web-based programming game for a 6-year-old child called **"Minou Code"**.
A cute cat character must reach its food bowl by executing a sequence of instruction
cards the child builds via drag & drop.

---

## Tech stack

- Vanilla HTML / CSS / JS (single file or minimal files)
- No framework
- Must work on iPad via local network (touch-friendly drag & drop)
- Serve with a simple local server (e.g. `python -m http.server` or equivalent)

---

## Language

**100% French.** Every single word visible on screen must be in French:
button labels, instructions, success/failure messages, level names, tooltips, everything.
The target user is a 6-year-old French-speaking child who is learning to read.
Use simple, short words. No English anywhere in the UI.

---

## Core gameplay

- A grid (starts 4×4, grows with levels)
- A cat character moves case by case with animation when the child hits **"C'est parti !"**
- Goal: reach the food bowl 🐟 (or yarn ball 🧶 depending on level)
- Big colorful **"C'est parti !"** button and a **"Recommencer"** button to clear the sequence

---

## Instruction cards (drag & drop)

- Arrow cards: ⬆️ ⬇️ ⬅️ ➡️
- A special **"Répète"** card 🔁 with a number selector (1–5) that accepts nested cards dropped inside it
- Cards live in a tray, child drags them into a **"Mon programme"** zone to build the sequence
- **Touch support is mandatory** (pointer events or touch events) — must work on iPad

---

## Progression — 8 levels minimum

- **Niveaux 1–3 :** 4×4 grid, straight path, arrows only
- **Niveaux 4–6 :** 4×4 or 5×5 grid, obstacles (walls), less obvious path
- **Niveaux 7–8 :** repeat card needed to solve efficiently, optional bonus yarn balls 🧶 to collect
- Each level has a hardcoded optimal solution but the child can solve it any valid way

---

## Feedback & humor — THIS IS CRITICAL

The game must be **genuinely funny and joyful**, not just "correct/incorrect".
Invest heavily in the feedback moments — they are the heart of the experience.

### 🎉 On success

- Full-screen confetti explosion
- The cat does a ridiculous happy dance (animated CSS)
- A different funny message each time, examples:
  - _"OUIIIII ! Minou est trop fort !! 🐱🎉"_
  - _"Le poisson n'avait aucune chance ! 🐟💨"_
  - _"Génie absolu détecté ! 🧠✨"_
  - _"Minou te dit MIAOU DU TONNERRE ! ⚡🐱"_
- Play a funny "miaou" sound effect (use Web Audio API to generate a simple beep-miaou, or embed a base64 audio if possible)
- Stars rating (1–3 ⭐) based on number of cards used

### 😹 On failure

- The cat slams into the wall and bounces back comically (CSS animation)
- A different funny/encouraging message each time, examples:
  - _"Aïe aïe aïe ! Le mur a gagné cette fois 😹"_
  - _"Minou est un peu perdu... mais il ne lâche pas ! 💪"_
  - _"Oups ! Le poisson rigole là 🐟😂"_
  - _"Essaie encore, Minou croit en toi ! 🐱❤️"_
  - _"Ce mur est vraiment mal élevé ! 😤"_
- Wobble/shake animation on the cat
- Never frustrating — always warm and encouraging

---

## Visual style

- Cute, colorful, rounded UI — kawaii / friendly
- Large tap targets **(minimum 60px)** for small fingers on iPad
- Cat can be emoji-based (🐱) or a simple CSS/SVG sprite
- Responsive layout that works on both MacBook and iPad (landscape)
- Bright pastel colors, big readable fonts (minimum 18px), high contrast

---

## Notes

- If a design or implementation choice is unclear, make a pragmatic decision and move forward
- Prioritize fun and tactile feel over technical complexity
- The drag & drop must feel satisfying — cards should snap into place visually
