# 🔊 Echo Pulse

> A neon Simon-style memory game built with **jQuery**. Watch the pattern, repeat it and see how far you can go. It has synthesised tones, speed that ramps up with each level, a strict mode and saved high scores.

**🔗 Play it:** https://himanshuuem.github.io/echo-pulse/

![jQuery](https://img.shields.io/badge/jQuery-3.7-0769AD?logo=jquery&logoColor=white)
![Web Audio](https://img.shields.io/badge/Web_Audio_API-ff2bd6)

## ✨ Features

- **Classic Simon rules** with a twist: playback speeds up every level, from 600 ms per note down to 220 ms.
- **Strict mode:** one mistake ends the game. In normal mode the sequence replays so you can try again.
- **Separate high scores** for normal and strict, kept in `localStorage`.
- **Synthesised tones** (E4, C4, A3, E3) through the Web Audio API, a buzzer for mistakes and a sound toggle.
- **Async/await game loop:** sequence playback is a readable `for…of` over `await flash()` instead of nested `setTimeout`s.
- **Three ways to play:** tap or click pads, press <kbd>Q</kbd> <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd>, or Tab to a pad and press Enter. <kbd>Enter</kbd> starts a game.
- Status updates are announced through `aria-live`, there's a shake on game over, and motion is reduced when requested.

## 🛠 Tech Stack

jQuery 3.7 (events, DOM, `.eq()`, `.prop()`) · Web Audio API · CSS (`color-mix()`, custom properties, neon glow) · Google Fonts (Orbitron, Rajdhani)

## 🚀 Run Locally

```bash
git clone https://github.com/himanshuuem/echo-pulse.git
cd echo-pulse
npx serve .
```

## 📚 Origin

This is a reimagined **Simon Game** capstone from the jQuery section of [The Complete Web Development Bootcamp](https://www.udemy.com/course/the-complete-web-development-bootcamp/).

---

Made by [Himanshu](https://github.com/himanshuuem)
