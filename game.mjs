import {chapters, endingFor, endings, outcomes} from "./scenes.mjs?v=2";

const byId = (id) => document.getElementById(id);
const game = byId("game");
const actions = byId("actions");
const title = byId("story-title");
const photo = byId("photo");
const dialogue = byId("quote");
const recap = byId("recap");
const progress = [...byId("progress").children];
let results = [];

function button(label, action, number) {
  const control = document.createElement("button");
  control.type = "button";
  control.className = number ? "choice" : "primary";
  if (number) {
    const marker = document.createElement("span");
    marker.textContent = String(number);
    marker.setAttribute("aria-hidden", "true");
    control.append(marker);
  }
  control.append(document.createTextNode(label));
  control.addEventListener("click", action, {once: true});
  return control;
}

function showFrame(frame, tag, caption) {
  byId("story-tag").textContent = tag;
  byId("story-copy").textContent = frame.copy;
  title.textContent = frame.title;
  photo.src = "./images/" + frame.image;
  photo.alt = frame.alt;
  byId("photo-caption").textContent = caption;
  dialogue.replaceChildren(...(frame.dialogue ?? []).map(([speaker, line]) => {
    const turn = document.createElement("figure");
    const name = document.createElement("figcaption");
    const speech = document.createElement("blockquote");
    name.textContent = speaker;
    speech.textContent = line;
    turn.append(name, speech);
    return turn;
  }));
  dialogue.hidden = !frame.dialogue;
  recap.hidden = true;
}

function updateProgress() {
  const current = results.length;
  const finished = current === chapters.length;
  byId("score").querySelector("b").textContent = current;
  byId("chapter-label").textContent = finished ? "최종 결과" : "CH. " + String(current + 1).padStart(2, "0");
  progress.forEach((step, index) => {
    const outcome = results[index];
    step.dataset.outcome = outcome === "loose" ? "miss" : outcome ? "clear" : "";
    step.setAttribute("aria-label", (index + 1) + "장 " + (outcomes[outcome] ?? (index === current ? "진행 중" : "대기")));
    if (index === current) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  });
}

function focusFrame() {
  game.scrollIntoView({block: "start"});
  title.focus({preventScroll: true});
}

function showScene(key) {
  const {place, scenes} = chapters[results.length];
  const scene = scenes[key];
  showFrame(scene, place, place + " · " + scene.time);
  actions.replaceChildren(...scene.choices.map((choice, index) => {
    if (choice.next) new Image().src = "./images/" + scenes[choice.next].image;
    return button(choice.text, () => {
      if (choice.next) showScene(choice.next);
      else {
        results.push(choice.result);
        updateProgress();
        if (results.length === chapters.length) showEnding();
        else showScene("open");
      }
    }, scene.choices.length > 1 ? index + 1 : undefined);
  }));
  focusFrame();
}

function showEnding() {
  const ending = endings[endingFor(results)];
  showFrame(ending, "나의 엔딩", "에필로그");
  recap.replaceChildren(...chapters.map(({place}, index) => {
    const row = document.createElement("li");
    const status = document.createElement("strong");
    status.dataset.outcome = results[index] === "loose" ? "miss" : "clear";
    status.textContent = outcomes[results[index]];
    row.append(place, status);
    return row;
  }));
  recap.hidden = false;
  actions.replaceChildren(button("다른 선택으로 다시 하기", start));
  focusFrame();
}

function start() {
  results = [];
  updateProgress();
  showScene("open");
}

byId("start").addEventListener("click", start, {once: true});
byId("start").disabled = false;
