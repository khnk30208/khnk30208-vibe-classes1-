(function () {
  "use strict";

  const MAX_NUM = 50;
  const PICK_COUNT = 6;
  const SET_COUNT = 5;
  const MAX_INCLUDE = 3;
  const MAX_EXCLUDE = 3;
  const SOUND_DURATION = 3.0; // seconds

  const includeNumbers = new Set();
  const excludeNumbers = new Set();

  const includeGrid = document.getElementById("includeGrid");
  const excludeGrid = document.getElementById("excludeGrid");
  const includeCountEl = document.getElementById("includeCount");
  const excludeCountEl = document.getElementById("excludeCount");
  const generateBtn = document.getElementById("generateBtn");
  const resetBtn = document.getElementById("resetBtn");
  const resultSection = document.getElementById("resultSection");
  const resultPlaceholder = document.getElementById("resultPlaceholder");

  // ---------- Color by number range ----------
  function getColor(num) {
    if (num <= 10) return "#f7b32b";
    if (num <= 20) return "#4098d7";
    if (num <= 30) return "#e8543e";
    if (num <= 40) return "#8e8e8e";
    return "#43b581";
  }

  // ---------- Build selection grids ----------
  function buildGrid(gridEl, type) {
    for (let n = 1; n <= MAX_NUM; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "num-ball";
      btn.textContent = n;
      btn.style.backgroundColor = getColor(n);
      btn.dataset.num = String(n);
      btn.addEventListener("click", () => toggleNumber(n, type, btn));
      gridEl.appendChild(btn);
    }
  }

  function toggleNumber(num, type, btn) {
    const ownSet = type === "include" ? includeNumbers : excludeNumbers;
    const otherSet = type === "include" ? excludeNumbers : includeNumbers;
    const max = type === "include" ? MAX_INCLUDE : MAX_EXCLUDE;

    if (otherSet.has(num)) {
      flashShake(btn);
      return;
    }

    if (ownSet.has(num)) {
      ownSet.delete(num);
    } else {
      if (ownSet.size >= max) {
        flashShake(btn);
        return;
      }
      ownSet.add(num);
    }

    renderGridStates();
  }

  function flashShake(btn) {
    btn.classList.remove("shake");
    // force reflow so the animation can restart
    void btn.offsetWidth;
    btn.classList.add("shake");
  }

  function renderGridStates() {
    updateGridEl(includeGrid, includeNumbers, excludeNumbers);
    updateGridEl(excludeGrid, excludeNumbers, includeNumbers);
    includeCountEl.textContent = String(includeNumbers.size);
    excludeCountEl.textContent = String(excludeNumbers.size);
  }

  function updateGridEl(gridEl, ownSet, otherSet) {
    gridEl.querySelectorAll(".num-ball").forEach((btn) => {
      const n = Number(btn.dataset.num);
      btn.classList.toggle("selected", ownSet.has(n));
      btn.classList.toggle("disabled", otherSet.has(n));
    });
  }

  // ---------- Lotto number generation ----------
  function generateOneSet() {
    const result = new Set(includeNumbers);
    while (result.size < PICK_COUNT) {
      const n = Math.floor(Math.random() * MAX_NUM) + 1;
      if (excludeNumbers.has(n)) continue;
      result.add(n);
    }
    return Array.from(result).sort((a, b) => a - b);
  }

  function generateAllSets() {
    const sets = [];
    for (let i = 0; i < SET_COUNT; i++) {
      sets.push(generateOneSet());
    }
    return sets;
  }

  function renderResults(sets) {
    resultSection.innerHTML = "";
    sets.forEach((set, idx) => {
      const row = document.createElement("div");
      row.className = "result-row";

      const label = document.createElement("span");
      label.className = "set-label";
      label.textContent = `추천 ${idx + 1}`;
      row.appendChild(label);

      const ballsWrap = document.createElement("div");
      ballsWrap.className = "result-balls";
      set.forEach((num, i) => {
        const ball = document.createElement("span");
        ball.className = "num-ball result-ball";
        ball.textContent = num;
        ball.style.backgroundColor = getColor(num);
        ball.style.animationDelay = `${(idx * PICK_COUNT + i) * 0.03}s`;
        ballsWrap.appendChild(ball);
      });
      row.appendChild(ballsWrap);

      resultSection.appendChild(row);
    });
  }

  function renderGeneratingPlaceholder() {
    resultSection.innerHTML = "";
    for (let i = 0; i < SET_COUNT; i++) {
      const row = document.createElement("div");
      row.className = "result-row generating";

      const label = document.createElement("span");
      label.className = "set-label";
      label.textContent = `추천 ${i + 1}`;
      row.appendChild(label);

      const ballsWrap = document.createElement("div");
      ballsWrap.className = "result-balls";
      for (let j = 0; j < PICK_COUNT; j++) {
        const ball = document.createElement("span");
        ball.className = "num-ball";
        ball.textContent = "?";
        ball.style.backgroundColor = "#c7d1db";
        ball.style.width = "38px";
        ball.style.height = "38px";
        ball.style.animationDelay = `${j * 0.05}s`;
        ballsWrap.appendChild(ball);
      }
      row.appendChild(ballsWrap);
      resultSection.appendChild(row);
    }
  }

  // ---------- Tense suspense sound (Web Audio API, ~3s) ----------
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function createNoiseBuffer(ctx, duration) {
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // low ominous drone with slow vibrato, sustained under the whole buildup
  function playDrone(ctx, dest, time, dur) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(52, time);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(5.5, time);
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.linearRampToValueAtTime(360, time + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.22, time + 0.5);
    gain.gain.setValueAtTime(0.22, time + dur - 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    lfo.start(time);
    osc.start(time);
    lfo.stop(time + dur + 0.05);
    osc.stop(time + dur + 0.05);
  }

  // sharp, slightly jittery clock-like tick
  function playTick(ctx, dest, time, freq) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 12, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.7, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  // low thumping pulse, like an accelerating heartbeat
  function playHeartbeat(ctx, dest, time) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.16);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.75, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.24);
  }

  // tonal pitch sweep leading into the reveal
  function playRiser(ctx, dest, time, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, time);
    osc.frequency.exponentialRampToValueAtTime(1200, time + dur);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.4, time + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  // filtered white-noise sweep for a cinematic riser texture
  function playNoiseRiser(ctx, dest, time, dur) {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, dur);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(500, time);
    filter.frequency.exponentialRampToValueAtTime(4200, time + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.5, time + dur * 0.85);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start(time);
    src.stop(time + dur + 0.05);
  }

  // bright resolving hit that lands the reveal
  function playFinalHit(ctx, dest, time) {
    [850, 1275, 1700].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(idx === 0 ? 0.6 : 0.3, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.65);
    });

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(120, time);
    sub.frequency.exponentialRampToValueAtTime(40, time + 0.3);
    subGain.gain.setValueAtTime(0.0001, time);
    subGain.gain.exponentialRampToValueAtTime(0.75, time + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
    sub.connect(subGain);
    subGain.connect(dest);
    sub.start(time);
    sub.stop(time + 0.4);
  }

  function playSuspenseSound() {
    const ctx = getAudioCtx();
    const startTime = ctx.currentTime + 0.02;
    const tickPhaseDuration = SOUND_DURATION - 0.55;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.38;
    masterGain.connect(ctx.destination);

    playDrone(ctx, masterGain, startTime, SOUND_DURATION - 0.1);

    let elapsed = 0;
    let pulseIndex = 0;
    const minInterval = 0.045;
    const startInterval = 0.24;

    while (elapsed < tickPhaseDuration) {
      const t = startTime + elapsed;
      const freq = Math.min(300 + pulseIndex * 8, 560);
      playTick(ctx, masterGain, t, freq);
      if (pulseIndex % 3 === 0) {
        playHeartbeat(ctx, masterGain, t);
      }

      const progress = elapsed / tickPhaseDuration;
      const eased = progress * progress;
      const interval = startInterval - (startInterval - minInterval) * eased;
      elapsed += interval;
      pulseIndex++;
    }

    const riserStart = startTime + tickPhaseDuration;
    const riserDur = SOUND_DURATION - tickPhaseDuration - 0.2;
    playRiser(ctx, masterGain, riserStart, riserDur);
    playNoiseRiser(ctx, masterGain, riserStart, riserDur);
    playFinalHit(ctx, masterGain, startTime + SOUND_DURATION - 0.15);
  }

  // ---------- Generate / Reset actions ----------
  function handleGenerate() {
    generateBtn.disabled = true;
    resetBtn.disabled = true;
    generateBtn.textContent = "생성 중...";

    if (resultPlaceholder && resultPlaceholder.parentNode) {
      resultPlaceholder.remove();
    }
    renderGeneratingPlaceholder();

    try {
      playSuspenseSound();
    } catch (e) {
      // Web Audio API unavailable; continue silently.
    }

    setTimeout(() => {
      const sets = generateAllSets();
      renderResults(sets);
      generateBtn.disabled = false;
      resetBtn.disabled = false;
      generateBtn.textContent = "번호 생성";
    }, SOUND_DURATION * 1000);
  }

  function handleReset() {
    includeNumbers.clear();
    excludeNumbers.clear();
    renderGridStates();

    resultSection.innerHTML = "";
    const p = document.createElement("p");
    p.className = "result-placeholder";
    p.id = "resultPlaceholder";
    p.textContent = "번호 생성 버튼을 누르면 추천 번호 5세트가 표시됩니다.";
    resultSection.appendChild(p);
  }

  // ---------- Init ----------
  function init() {
    buildGrid(includeGrid, "include");
    buildGrid(excludeGrid, "exclude");
    generateBtn.addEventListener("click", handleGenerate);
    resetBtn.addEventListener("click", handleReset);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
