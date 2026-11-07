import {roundOpenings} from "./chat.mjs?v=7";
import {advance, block, choose, initialInterest, intro, maxTurns, newRound, ready, repliesFor} from "./chat-rules.mjs?v=7";
import {createPlayback, dialoguePages, revealCharacter, scenePhoto, stepPlayback} from "./novel-playback.mjs?v=8";

const $ = (id) => document.getElementById(id);
const game = $("game");
const panel = $("story-panel");
const menu = $("room-options");
const history = $("history-dialog");
const replies = $("replies");
const next = $("advance");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const clock = new Intl.DateTimeFormat("ko-KR", {hour: "numeric", minute: "2-digit"});
const storageKey = "youngforty-messenger-settings-v1";
let round = null;
let playback = null;
let afterPlayback = null;
let timer = null;
let generation = 0;
let photoGeneration = 0;
let audio = null;

function readSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    const nextOpening = Number.isInteger(stored?.nextOpening) && stored.nextOpening >= 0
      && stored.nextOpening < roundOpenings.length ? stored.nextOpening : 0;
    return {fast: stored?.fast === true, sound: stored?.sound === true, nextOpening};
  } catch {
    return {fast: false, sound: false, nextOpening: 0};
  }
}
const settings = readSettings();
function saveSettings() {
  try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Storage can be disabled. */ }
}
function enableAudio() {
  if (!settings.sound) return;
  const Audio = window.AudioContext ?? window.webkitAudioContext;
  if (!Audio) return;
  try {
    audio ??= new Audio();
    if (audio.state === "suspended") audio.resume().catch(() => {});
  } catch { audio = null; }
}
function ping() {
  if (!settings.sound || audio?.state !== "running") return;
  const tone = audio.createOscillator();
  const volume = audio.createGain();
  const time = audio.currentTime;
  tone.frequency.value = 660;
  volume.gain.setValueAtTime(0.045, time);
  volume.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  tone.connect(volume).connect(audio.destination);
  tone.start(time);
  tone.stop(time + 0.08);
}

const preparedPhotos = new Map();
function preparePhoto(situation) {
  const photo = scenePhoto(situation);
  if (!preparedPhotos.has(photo.src)) {
    const image = new Image();
    image.src = photo.src;
    preparedPhotos.set(photo.src, image.decode().then(() => photo).catch(() => null));
  }
  return preparedPhotos.get(photo.src);
}
function showPhoto(situation) {
  const token = ++photoGeneration;
  const photo = scenePhoto(situation);
  if ($("scene-photo").getAttribute("src") === photo.src) return;
  preparePhoto(situation).then((loaded) => {
    if (!loaded || token !== photoGeneration) return;
    $("scene-photo").src = loaded.src;
    $("scene-photo").alt = loaded.alt;
    $("scene-photo").style.objectPosition = loaded.position;
    $("photo-caption").textContent = loaded.caption;
  });
}
function cancelTimer() {
  generation += 1;
  clearTimeout(timer);
  timer = null;
}
function stopPlayback() {
  cancelTimer();
  playback = null;
  afterPlayback = null;
  next.dataset.typing = "false";
}
function recordPage(page) {
  round.messages.push({text: page.text, side: page.speaker === "나" ? "sent" : "received", time: clock.format(new Date())});
}
function renderLine() {
  const page = playback.pages[playback.index];
  const letters = Array.from(page.text);
  const typing = playback.visible < letters.length;
  $("speaker").textContent = page.speaker;
  $("dialogue-text").textContent = letters.slice(0, playback.visible).join("");
  next.dataset.typing = String(typing);
  next.setAttribute("aria-label", page.speaker + ". " + page.text + (typing ? " · 눌러서 문장 완성" : " · 눌러서 계속"));
  $("next-label").textContent = typing ? "눌러서 바로 읽기" : "다음 ▸";
  if (!typing) $("spoken-line").textContent = page.speaker + ". " + page.text;
}
function typeLine() {
  cancelTimer();
  if (!playback || playback.done || history.open || menu.open) return;
  const page = playback.pages[playback.index];
  if (settings.fast || reducedMotion.matches || page.speaker === "나") {
    if (playback.visible < Array.from(page.text).length) playback = stepPlayback(playback);
    renderLine();
    return;
  }
  const token = generation;
  function tick() {
    if (token !== generation || !playback || history.open || menu.open) return;
    playback = revealCharacter(playback);
    renderLine();
    if (next.dataset.typing === "true") timer = setTimeout(tick, 22);
    else timer = null;
  }
  renderLine();
  if (next.dataset.typing === "true") timer = setTimeout(tick, 22);
}
function play(pages, complete) {
  stopPlayback();
  playback = createPlayback(pages);
  afterPlayback = complete;
  if (playback.done) { stopPlayback(); complete(); return; }
  game.dataset.mode = "dialogue";
  $("choice-area").hidden = true;
  replies.replaceChildren();
  next.disabled = false;
  panel.scrollTop = 0;
  recordPage(playback.pages[0]);
  if (playback.pages[0].speaker === "민수") ping();
  typeLine();
}
function stepDialogue() {
  if (!playback || history.open || menu.open || round?.ending) return;
  cancelTimer();
  const previous = playback.index;
  playback = stepPlayback(playback);
  if (playback.done) {
    const complete = afterPlayback;
    stopPlayback();
    complete();
    return;
  }
  if (playback.index !== previous) {
    recordPage(playback.pages[playback.index]);
    if (playback.pages[playback.index].speaker === "민수") ping();
    panel.scrollTop = 0;
  }
  typeLine();
}
function updateScore() {
  const score = round?.score ?? initialInterest;
  $("score").value = score;
  $("score-value").textContent = score + " / 100";
  $("turn-count").textContent = (round?.decisions.length ?? 0) + " / " + maxTurns + "턴";
  $("block").disabled = Boolean(round?.ending);
}
function resetView() {
  stopPlayback();
  photoGeneration += 1;
  if (history.open) history.close();
  menu.open = false;
  replies.replaceChildren();
  $("feedback").hidden = true;
  $("result").hidden = true;
  $("choice-area").hidden = true;
  $("copy-fallback").hidden = true;
  $("copy-status").textContent = "";
  $("spoken-line").textContent = "";
  panel.hidden = false;
  panel.scrollTop = 0;
}
function showWelcome() {
  resetView();
  round = null;
  game.dataset.mode = "welcome";
  $("welcome").hidden = false;
  $("dialogue").hidden = true;
  showPhoto("nickname");
  updateScore();
  $("welcome-title").focus({preventScroll: true});
}
function start() {
  resetView();
  round = newRound(settings.nextOpening);
  settings.nextOpening = (settings.nextOpening + 1) % roundOpenings.length;
  saveSettings();
  enableAudio();
  $("welcome").hidden = true;
  $("dialogue").hidden = false;
  updateScore();
  showIntro();
  next.focus({preventScroll: true});
}
function showIntro() {
  showPhoto(round.situation);
  $("feedback").hidden = true;
  play(dialoguePages(intro(round), "민수"), () => {
    round = ready(round);
    game.dataset.mode = "choices";
    next.disabled = true;
    $("next-label").textContent = "아래에서 답장 고르기";
    $("choice-area").hidden = false;
    replies.replaceChildren(...repliesFor(round).map((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      number.setAttribute("aria-hidden", "true");
      button.append(number, document.createTextNode(option.text));
      button.addEventListener("click", (event) => { event.stopPropagation(); select(index); });
      return button;
    }));
    $("reply-title").focus({preventScroll: true});
    panel.scrollTop = 0;
  });
}
function formatDelta(delta) {
  return delta < 0 ? "−" + Math.abs(delta) : delta > 0 ? "+" + delta : "±0";
}
function select(index) {
  if (!round || playback || history.open || menu.open) return;
  const locked = choose(round, index);
  if (round === locked) return;
  round = locked;
  for (const button of replies.children) button.disabled = true;
  const decision = round.decisions.at(-1);
  updateScore();
  const badge = document.createElement("strong");
  badge.textContent = "호감도 " + formatDelta(decision.delta);
  $("feedback").replaceChildren(badge, document.createTextNode(decision.why));
  $("feedback").hidden = false;
  const {reaction, next: nextSituation} = round.pending;
  if (typeof nextSituation === "string") preparePhoto(nextSituation);
  play([...dialoguePages([decision.text], "나"), ...dialoguePages(reaction, "민수")], () => {
    round = advance(round);
    if (round.ending) showEnding();
    else showIntro();
  });
  next.focus({preventScroll: true});
}
function showEnding() {
  stopPlayback();
  menu.open = false;
  photoGeneration += 1;
  updateScore();
  replies.replaceChildren();
  game.dataset.mode = "ending";
  panel.hidden = true;
  const ending = round.ending;
  const blocked = ending.reason === "block";
  round.messages.push({text: blocked ? "민수를 차단했어요." : "대화가 종료됐어요.", side: "system"});
  $("result-status").textContent = ending.id === "crush" ? "대화 종료" : blocked ? "차단으로 대화 종료" : "대화 정리";
  $("ending-title").textContent = ending.title;
  $("ending-copy").textContent = ending.copy;
  $("result-turns").textContent = round.decisions.length + "턴";
  $("result-score").textContent = initialInterest + " → " + round.score;
  const byImpact = [...round.decisions].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const openings = ending.id === "crush" ? byImpact.filter(({delta}) => delta > 0) : [];
  const last = round.decisions.at(-1);
  const clue = last?.uses ? round.decisions.find(({evidence}) => evidence === last.uses) : null;
  const closingChoices = last ? [last, ...(clue ? [clue] : byImpact.filter((entry) => entry !== last))] : [];
  const top = openings.length ? openings : closingChoices;
  $("highlights-title").textContent = openings.length ? "민수가 여지로 읽은 답장" : clue ? "단서와 마지막 대응" : "관계를 정리한 답장";
  $("highlights").replaceChildren(...top.slice(0, 2).map((decision) => {
    const item = document.createElement("li");
    item.textContent = "“" + decision.text + "” (" + formatDelta(decision.delta) + ")";
    return item;
  }));
  $("highlights").hidden = $("highlights-title").hidden = !top.length;
  $("result").hidden = false;
  $("result").querySelector(".result-content").scrollTop = 0;
  $("ending-title").focus({preventScroll: true});
}
function openHistory() {
  menu.open = false;
  cancelTimer();
  const messages = round?.messages ?? [];
  $("history-log").replaceChildren(...messages.map(({text, side}) => {
    const item = document.createElement("li");
    item.className = side;
    const name = document.createElement("strong");
    name.textContent = side === "sent" ? "나" : side === "received" ? "민수" : "대화 기록";
    const line = document.createElement("p");
    line.textContent = text;
    item.append(name, line);
    return item;
  }));
  $("history-empty").hidden = messages.length > 0;
  history.showModal();
  $("history-log").scrollTop = $("history-log").scrollHeight;
}
async function copyResult() {
  const current = round;
  if (!current?.ending) return;
  const text = "영포티 피하기 · " + current.ending.title + "\n" + current.decisions.length + "턴 · 호감도 " + initialInterest + " → " + current.score;
  try {
    await navigator.clipboard.writeText(text);
    if (round !== current) return;
    $("copy-fallback").hidden = true;
    $("copy-status").textContent = "결과 문구를 복사했어요.";
  } catch {
    if (round !== current) return;
    $("copy-status").textContent = "선택된 결과 문구를 복사해 주세요.";
    $("copy-fallback").hidden = false;
    $("share-text").value = text;
    $("share-text").select();
  }
}
$("start").addEventListener("click", start);
$("restart").addEventListener("click", start);
$("share").addEventListener("click", copyResult);
next.addEventListener("click", stepDialogue);
$("open-history").addEventListener("click", openHistory);
$("close-history").addEventListener("click", () => history.close());
history.addEventListener("close", typeLine);
menu.addEventListener("toggle", () => { if (menu.open) cancelTimer(); else typeLine(); });
$("back").addEventListener("click", (event) => {
  if (!round || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  showWelcome();
});
$("block").addEventListener("click", () => {
  if (round?.ending) return;
  if (!round) { round = newRound(); $("welcome").hidden = true; }
  round = block(round);
  showEnding();
});
for (const key of ["fast", "sound"]) {
  $(key).checked = settings[key];
  $(key).addEventListener("change", (event) => {
    settings[key] = event.target.checked;
    saveSettings();
    if (key === "fast") typeLine();
    if (key === "sound" && settings.sound) enableAudio();
  });
}
reducedMotion.addEventListener("change", typeLine);
document.addEventListener("click", (event) => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
document.addEventListener("keydown", (event) => {
  if (event.repeat) {
    if (!history.open && /^(Enter| |[123])$/.test(event.key)) event.preventDefault();
    return;
  }
  if (event.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
  if (menu.open || history.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (round?.phase === "ready" && /^[123]$/.test(event.key)) { event.preventDefault(); select(Number(event.key) - 1); }
});
