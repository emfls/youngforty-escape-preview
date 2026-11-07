import {roundOpenings} from "./chat.mjs?v=7";
import {advance, block, choose, initialInterest, intro, maxTurns, newRound, ready, repliesFor} from "./chat-rules.mjs?v=7";

const $ = (id) => document.getElementById(id);
const conversation = $("conversation");
const log = $("chat-log");
const menu = $("room-options");
const replies = $("replies");
const skip = $("skip");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const clock = new Intl.DateTimeFormat("ko-KR", {hour: "numeric", minute: "2-digit"});
const storageKey = "youngforty-messenger-settings-v1";

let round = null;
let timer = null;
let generation = 0;
let skipPlayback = null;
let unread = null;
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
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Browser storage can be disabled.
  }
}

function enableAudio() {
  if (!settings.sound) return;
  const Audio = window.AudioContext ?? window.webkitAudioContext;
  if (!Audio) return;
  try {
    audio ??= new Audio();
    if (audio.state === "suspended") audio.resume().catch(() => {});
  } catch {
    audio = null;
  }
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

function scrollDown() {
  conversation.scrollTop = conversation.scrollHeight;
}

function message(text, side, showUnread = false) {
  const time = clock.format(new Date());
  round.messages.push({text, side, time});
  const item = document.createElement("li");
  item.className = "message " + side;
  if (side === "system") {
    item.textContent = text;
  } else {
    const content = document.createElement("div");
    content.className = "message-content";
    if (side === "received") {
      const avatar = document.createElement("img");
      avatar.className = "message-avatar";
      avatar.src = "./images/minsu-profile-v2.jpg";
      avatar.width = avatar.height = 30;
      avatar.alt = "";
      item.append(avatar);
      const name = document.createElement("span");
      name.className = "message-name";
      name.textContent = "민수";
      content.append(name);
    }
    const bubble = document.createElement("p");
    bubble.className = "bubble";
    bubble.textContent = text;
    content.append(bubble);
    const stamp = document.createElement("div");
    stamp.className = "stamp";
    if (showUnread) {
      unread = document.createElement("span");
      unread.className = "unread";
      unread.textContent = "1";
      unread.setAttribute("aria-label", "읽지 않음");
      stamp.append(unread);
    }
    const when = document.createElement("span");
    when.textContent = time;
    stamp.append(when);
    item.append(content, stamp);
  }
  log.append(item);
  scrollDown();
}

function markRead() {
  unread?.remove();
  unread = null;
}

function stopPlayback() {
  generation += 1;
  clearTimeout(timer);
  timer = null;
  skipPlayback = null;
  $("typing").hidden = true;
  skip.hidden = true;
  markRead();
}

function play(lines, complete, immediate = false) {
  const token = ++generation;
  let index = 0;
  function finish() {
    stopPlayback();
    complete();
  }
  function sendNext() {
    if (token !== generation) return;
    markRead();
    message(lines[index++], "received");
    ping();
    if (index === lines.length) finish();
    else timer = setTimeout(sendNext, 270);
  }
  skipPlayback = () => {
    if (token !== generation) return;
    clearTimeout(timer);
    markRead();
    while (index < lines.length) message(lines[index++], "received");
    finish();
  };
  if (immediate || settings.fast || reducedMotion.matches || !lines.length) {
    skipPlayback();
    return;
  }
  $("typing").hidden = false;
  skip.hidden = false;
  timer = setTimeout(sendNext, 330);
  scrollDown();
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
  menu.open = false;
  log.replaceChildren();
  replies.replaceChildren();
  $("feedback").hidden = true;
  $("result").hidden = true;
  $("end-actions").hidden = true;
  $("reply-title").hidden = false;
  $("copy-fallback").hidden = true;
  $("copy-status").textContent = "";
}

function showThread() {
  $("welcome").hidden = true;
  $("thread").hidden = false;
  $("composer").hidden = false;
  $("day").textContent = new Intl.DateTimeFormat("ko-KR", {month: "long", day: "numeric", weekday: "long"}).format(new Date());
  updateScore();
}

function showWelcome() {
  resetView();
  round = null;
  updateScore();
  $("welcome").hidden = false;
  $("thread").hidden = true;
  $("composer").hidden = true;
  conversation.scrollTop = 0;
  $("welcome-title").focus({preventScroll: true});
}

function start() {
  resetView();
  round = newRound(settings.nextOpening);
  settings.nextOpening = (settings.nextOpening + 1) % roundOpenings.length;
  saveSettings();
  enableAudio();
  showThread();
  showIntro();
  if (skipPlayback) skip.focus({preventScroll: true});
}

function showIntro() {
  $("reply-title").textContent = "민수가 톡을 보내는 중";
  play(intro(round), () => {
    round = ready(round);
    const options = repliesFor(round);
    replies.replaceChildren(...options.map((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const number = document.createElement("span");
      number.textContent = String(index + 1);
      number.setAttribute("aria-hidden", "true");
      button.append(number, document.createTextNode(option.text));
      button.addEventListener("click", () => select(index));
      return button;
    }));
    $("reply-title").textContent = "답장 고르기";
    $("reply-title").focus({preventScroll: true});
    scrollDown();
  });
}

function formatDelta(delta) {
  return delta < 0 ? "−" + Math.abs(delta) : delta > 0 ? "+" + delta : "±0";
}

function select(index) {
  if (!round) return;
  const locked = choose(round, index);
  if (round === locked) return;
  round = locked;
  for (const button of replies.children) button.disabled = true;
  const decision = round.decisions.at(-1);
  message(decision.text, "sent", true);
  updateScore();
  const badge = document.createElement("strong");
  badge.textContent = "호감도 " + formatDelta(decision.delta);
  $("feedback").replaceChildren(badge, document.createTextNode(" " + decision.why));
  $("feedback").hidden = false;
  replies.replaceChildren();
  $("reply-title").textContent = "민수가 답장하는 중";
  const {reaction, reason} = round.pending;
  play(reaction, () => {
    round = advance(round);
    if (round.ending) showEnding();
    else showIntro();
  }, reason === "request");
  if (skipPlayback) skip.focus({preventScroll: true});
}

function showEnding() {
  stopPlayback();
  menu.open = false;
  updateScore();
  replies.replaceChildren();
  $("reply-title").hidden = true;
  const ending = round.ending;
  const blocked = ending.reason === "block";
  message(blocked ? "민수를 차단했어요." : "대화가 종료됐어요.", "system");
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
  $("end-actions").hidden = false;
  $("view-result").focus({preventScroll: true});
  scrollDown();
}

function showResult() {
  $("result").hidden = false;
  $("ending-title").focus({preventScroll: true});
  conversation.scrollTop = $("result").offsetTop - 10;
}

async function copyResult() {
  const current = round;
  if (!current?.ending) return;
  showResult();
  const text = "영포티 피하기 · " + current.ending.title + "\n"
    + current.decisions.length + "턴 · 호감도 " + initialInterest + " → " + current.score;
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
  scrollDown();
}

$("start").addEventListener("click", start);
$("restart").addEventListener("click", start);
$("view-result").addEventListener("click", showResult);
$("share").addEventListener("click", copyResult);
skip.addEventListener("click", () => skipPlayback?.());
$("back").addEventListener("click", (event) => {
  if (!round || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  showWelcome();
});
$("block").addEventListener("click", () => {
  if (round?.ending) return;
  if (!round) {
    resetView();
    round = newRound();
    showThread();
  }
  round = block(round);
  showEnding();
});
for (const key of ["fast", "sound"]) {
  $(key).checked = settings[key];
  $(key).addEventListener("change", (event) => {
    settings[key] = event.target.checked;
    saveSettings();
    if (key === "fast" && settings.fast) skipPlayback?.();
    if (key === "sound" && settings.sound) enableAudio();
  });
}
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) skipPlayback?.();
});
document.addEventListener("click", (event) => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
});
document.addEventListener("keydown", (event) => {
  if (menu.open && event.key === "Escape") {
    menu.open = false;
    menu.querySelector("summary").focus();
  }
  if (menu.open || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (round?.phase === "ready" && /^[123]$/.test(event.key)) {
    event.preventDefault();
    select(Number(event.key) - 1);
  }
});
