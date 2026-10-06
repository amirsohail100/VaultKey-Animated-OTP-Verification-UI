# VaultKey — Animated OTP Verification UI

VaultKey is a lightweight, animated one-time-password (OTP) verification interface built with **pure HTML, CSS, and JavaScript**. It walks the user through three polished states — code entry, verification, and success — with smooth transitions, micro-interactions, and no external dependencies.

> **Note:** This is a front-end UI project. It does not include a backend, and the verification step is simulated. See [Integrating a Real Backend](#integrating-a-real-backend).

---

## Table of Contents

- [Features](#features)
- [Interface States](#interface-states)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [Customization](#customization)
- [Integrating a Real Backend](#integrating-a-real-backend)
- [Browser Support](#browser-support)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## Features

- **Four-digit code entry** with automatic focus advancement between fields.
- **Smart keyboard handling** — Backspace moves to the previous field; Left/Right arrow keys navigate between fields.
- **Paste support** — paste a complete code into any field and it is distributed across all inputs.
- **Numeric-only input** — non-digit characters are filtered out automatically.
- **Animated verification state** — a circular progress ring with a live 0–100 percentage counter.
- **Success state** — animated checkmark, glowing card border, particle burst, and a "Verified" badge.
- **Cursor-reactive background glow** that smoothly follows the pointer.
- **Subtle noise texture and soft gradient blobs** for visual depth.
- **Resend action** that clears the inputs with a shake animation.
- **Zero dependencies** — no frameworks, build tools, or libraries.
- **Responsive layout** that adapts to small screens.

---

## Interface States

The card switches between states using a single `data-state` attribute on the `#card` element:

| State      | `data-state` value | Description                                                         |
| ---------- | ------------------ | ------------------------------------------------------------------- |
| Code entry | `input`            | "Enter Access Code" — four input boxes and a Resend link.           |
| Verifying  | `verifying`        | "Verifying..." — animated progress ring with a percentage counter.  |
| Success    | `success`          | "Access Granted" — checkmark, particle burst, and "Verified" badge. |

State transitions are driven entirely by CSS (opacity, transform, and visibility), while JavaScript only sets the attribute and runs the counter and particle logic.

---

## Tech Stack

| Layer    | Technology                                                                 |
| -------- | -------------------------------------------------------------------------- |
| Markup   | HTML5 (semantic structure, inline SVG for the progress ring and checkmark) |
| Styling  | CSS3 (custom properties, keyframe animations, transitions, flexbox, grid)  |
| Behavior | Vanilla JavaScript (ES6+, `requestAnimationFrame`, DOM events)             |

---

## Project Structure

```
vaultkey/
├── index.html    # Page structure and the three UI states
├── style.css     # Design tokens, layout, transitions, and animations
├── script.js     # Input handling, verification flow, and particle effects
├── README.md     # Project documentation
└── LICENSE       # MIT License
```

---

## Getting Started

No installation or build step is required.

### Option 1 — Open directly

Open `index.html` in any modern browser.

### Option 2 — Serve locally

Serving the files over HTTP is recommended when you plan to integrate an API.

```bash
# Using Python 3
python -m http.server 3000

# Or using Node.js
npx serve -l 3000
```

Then visit `http://127.0.0.1:3000/index.html`.

### Try it out

The demo accepts **any four digits**. Type or paste a code, and the interface will move through the verification and success states automatically. Double-click the success card to reset the demo.

---

## How It Works

1. **Input handling** — Each of the four inputs accepts a single digit. On every `input` event, non-numeric characters are stripped, the field is marked as filled, and focus moves to the next field.
2. **Auto-submit** — As soon as all four digits are present, `startVerifying()` is called.
3. **Verification animation** — A `requestAnimationFrame` loop eases a counter from 0 to 100 over `VERIFY_DURATION` milliseconds, updating both the percentage text and the SVG ring's `stroke-dashoffset`.
4. **Success** — When the counter completes, the card state changes to `success`, the checkmark path is drawn via `stroke-dashoffset`, and `burstParticles()` generates randomized particles using CSS custom properties (`--x`, `--y`, `--s`, `--c`, `--rot`, `--d`).
5. **Pointer glow** — A `pointermove` listener updates the transform of a radial-gradient element so it follows the cursor.

---

## Customization

### Design tokens (`style.css`)

Colors, radius, and easing are defined as CSS custom properties in `:root`:

```css
:root {
  --bg: #f6f7fb;
  --ink: #12162b;
  --accent: #7c6fd6; /* primary / focus color */
  --success: #22c58b; /* success state color */
  --radius: 26px; /* card corner radius */
}
```

### Behavior constants (`script.js`)

```js
const VERIFY_DURATION = 2200; // verification animation length (ms)
const PARTICLE_COUNT = 26; // particles in the success burst
const PARTICLE_COLORS = [
  "#7c6fd6",
  "#22c58b",
  "#f6c453",
  "#ff8fa3",
  "#6ec8ff",
  "#b9a8ff",
];
```

### Changing the code length

1. Add or remove `<input class="otp-box">` elements in `index.html`.
2. No JavaScript change is required — the script derives the length from the number of inputs.

---

## Integrating a Real Backend

The verification step is currently simulated by the progress animation. To connect a real service, request verification when the code is complete and branch on the result.

```js
async function verifyCode(code) {
  const response = await fetch("/api/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return response.ok;
}
```

A suggested approach inside `startVerifying()`:

1. Call `verifyCode(getCode())` and keep the returned promise.
2. Let the progress animation run as usual.
3. When the animation finishes, wait for the promise:
   - **Success** → call `showSuccess()`.
   - **Failure** → call `setState("input")`, set `busy = false`, and call `resetForm()` to clear the fields and trigger the shake animation.

> **Security note:** OTP validation must always be performed server-side. Never validate codes in client-side JavaScript in a production environment, and apply rate limiting and expiry on the server.

---

## Browser Support

VaultKey targets current versions of evergreen browsers (Chrome, Edge, Firefox, Safari). It relies on CSS custom properties, CSS animations, inline SVG, and `requestAnimationFrame`.

---

## Known Limitations

- The demo accepts any four-digit code; there is no real validation.
- The Resend action only resets the form; it does not send a new code.
- The interface does not currently include an error state for invalid codes, a resend cooldown timer, or a reduced-motion mode.

---

## Roadmap

- [ ] Error state for invalid or expired codes
- [ ] Resend cooldown timer
- [ ] `prefers-reduced-motion` support
- [ ] Configurable code length via a data attribute
- [ ] Dark theme
- [ ] Packaging as a reusable component

---

## Acknowledgements

The visual concept was inspired by an OTP verification UI demonstrated in a public YouTube Short. This project is an independent, from-scratch recreation of that concept, built for **learning and portfolio purposes only**. All code in this repository was written independently, and no assets from the original were used.

---

## License

Distributed under the MIT License. See the `LICENSE` file for details.
