$(function () {
  "use strict";

  const PAD_KEYS = ["q", "w", "a", "s"];
  const PAD_NOTES = [329.63, 261.63, 220.0, 164.81]; // E4, C4, A3, E3 — the classic four-tone set
  const STORAGE_KEY = "echo-pulse-best";

  const $pads = $(".pad");
  const $status = $("#status");
  const $level = $("#level");
  const $startBtn = $("#startBtn");
  const $strict = $("#strict");
  const $sound = $("#sound");

  const game = {
    sequence: [],
    inputIndex: 0,
    acceptingInput: false,
    running: false,
    best: loadBest(),
  };

  let audioCtx = null;

  function loadBest() {
    try {
      return { normal: 0, strict: 0, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
    } catch {
      return { normal: 0, strict: 0 };
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game.best));
    } catch {
      // Best scores just won't persist.
    }
  }

  function renderBest() {
    $("#best-normal").text(game.best.normal);
    $("#best-strict").text(game.best.strict);
  }

  function beep(frequency, durationMs, type = "sine") {
    if (!$sound.is(":checked")) return;
    audioCtx ??= new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.05);
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Playback gets faster as levels climb, but never below 220 ms per note. */
  const stepDuration = () => Math.max(220, 600 - game.sequence.length * 25);

  async function flash(index, duration) {
    const $pad = $pads.eq(index);
    $pad.addClass("lit");
    beep(PAD_NOTES[index], duration);
    await wait(duration);
    $pad.removeClass("lit");
  }

  function setStatus(text) {
    $status.text(text);
  }

  async function playSequence() {
    game.acceptingInput = false;
    $(".board").addClass("listening");
    setStatus("Watch…");
    await wait(600);
    const duration = stepDuration();
    for (const index of game.sequence) {
      if (!game.running) return;
      await flash(index, duration);
      await wait(duration * 0.35);
    }
    $(".board").removeClass("listening");
    game.inputIndex = 0;
    game.acceptingInput = true;
    setStatus("Your turn");
  }

  function nextRound() {
    game.sequence.push(Math.floor(Math.random() * 4));
    $level.text(game.sequence.length);
    playSequence();
  }

  function startGame() {
    game.sequence = [];
    game.running = true;
    $startBtn.text("RESTART");
    $("body").removeClass("game-over");
    $strict.prop("disabled", true);
    nextRound();
  }

  async function handleMistake() {
    game.acceptingInput = false;
    beep(110, 500, "sawtooth");
    $("body").addClass("game-over");
    if ($strict.is(":checked")) {
      const reached = game.sequence.length - 1;
      const mode = "strict";
      if (reached > game.best[mode]) {
        game.best[mode] = reached;
        saveBest();
        renderBest();
      }
      game.running = false;
      $strict.prop("disabled", false);
      $startBtn.text("START");
      setStatus(`Game over at level ${game.sequence.length}. Press Enter to try again.`);
      return;
    }
    setStatus("Oops! Watch again…");
    await wait(900);
    $("body").removeClass("game-over");
    playSequence();
  }

  async function handleInput(index) {
    if (!game.running || !game.acceptingInput) return;
    flash(index, 180);
    if (index !== game.sequence[game.inputIndex]) {
      handleMistake();
      return;
    }
    game.inputIndex += 1;
    if (game.inputIndex === game.sequence.length) {
      game.acceptingInput = false;
      const mode = $strict.is(":checked") ? "strict" : "normal";
      if (game.sequence.length > game.best[mode]) {
        game.best[mode] = game.sequence.length;
        saveBest();
        renderBest();
        setStatus("New best! 🔥");
      } else {
        setStatus("Nice!");
      }
      await wait(700);
      if (game.running) nextRound();
    }
  }

  $pads.on("pointerdown", function (event) {
    event.preventDefault();
    handleInput(Number($(this).data("pad")));
  });

  // Keyboard activation for focused pads (Enter / Space).
  $pads.on("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      handleInput(Number($(this).data("pad")));
    }
  });

  $startBtn.on("click", startGame);

  $(document).on("keydown", function (event) {
    if (event.repeat || $(event.target).is("input")) return;
    const key = event.key.toLowerCase();
    if (key === "enter" && !$(event.target).is("button")) {
      startGame();
      return;
    }
    const index = PAD_KEYS.indexOf(key);
    if (index !== -1) handleInput(index);
  });

  renderBest();
});
