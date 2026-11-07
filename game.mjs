import {chapters} from "./scenes.mjs?v=3";

const byId = (id) => document.getElementById(id);
const menu = byId("episode-menu");
const game = byId("game");
const storyScreen = byId("story-screen");
const title = byId("story-title");
const actions = byId("actions");
const photo = byId("photo");
const progress = byId("story-progress");
const quote = byId("quote");
const reaction = byId("story-reaction");

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

function showMenu() {
  game.hidden = true;
  menu.hidden = false;
  menu.scrollIntoView({block: "start"});
  byId("menu-title").focus({preventScroll: true});
}

function openGame(label) {
  menu.hidden = true;
  game.hidden = false;
  storyScreen.hidden = false;
  byId("chapter-label").textContent = label;
  game.scrollIntoView({block: "start"});
}

function showPicture(frame, caption) {
  if (photo.getAttribute("src") !== "./images/" + frame.image) photo.src = "./images/" + frame.image;
  photo.alt = frame.alt;
  byId("photo-caption").textContent = caption;
}

function showParagraphs(element, copy) {
  element.replaceChildren(...copy.split(/\n+|(?<=[.!?]) +(?=[가-힣“])/u).map((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  }));
}

function playEpisode(episode) {
  openGame(episode.place);
  let decision = 0;

  function showAct(name, stepIndex, previousReply = "") {
    const act = episode.acts[name];
    const [copy, speaker, line, choices] = act.steps[stepIndex];
    const actNumber = Math.floor(decision / act.steps.length) + 1;
    byId("story-tag").textContent = actNumber + "막";
    title.textContent = act.title;
    progress.textContent = "선택 " + (decision + 1) + " / " + (act.steps.length * 4);
    showPicture(act, episode.place + " · " + actNumber + "막");
    reaction.textContent = previousReply;
    reaction.hidden = !previousReply;
    showParagraphs(byId("story-copy"), copy);
    byId("speaker").textContent = speaker;
    showParagraphs(byId("line"), line);
    quote.hidden = false;
    actions.replaceChildren(...choices.map(([label, reply, route], index) => button(label, () => {
      decision += 1;
      if (stepIndex + 1 < act.steps.length) {
        showAct(name, stepIndex + 1, reply);
        return;
      }
      const next = route ?? act.next;
      if (!episode.endings[next]) {
        showAct(next, 0, reply);
        return;
      }
      const ending = episode.endings[next];
      byId("story-tag").textContent = "나의 엔딩";
      title.textContent = ending.title;
      progress.textContent = "엔딩";
      showPicture(ending, episode.place + " · 후일담");
      reaction.textContent = reply;
      showParagraphs(byId("story-copy"), ending.copy);
      quote.hidden = true;
      actions.replaceChildren(button("같은 이야기 다시 하기", () => playEpisode(episode)), button("다른 상황 고르기", showMenu, "←"));
      focusStory();
    }, index + 1)));
    focusStory();
  }

  showAct("opening", 0);
}

function focusStory() {
  game.scrollIntoView({block: "start"});
  title.focus({preventScroll: true});
}

for (const episode of chapters) {
  const item = document.createElement("li");
  const card = document.createElement("button");
  card.type = "button";
  card.className = "episode-card";
  card.addEventListener("click", () => playEpisode(episode));
  const image = document.createElement("img");
  image.src = "./images/" + episode.acts.opening.image;
  image.alt = "";
  image.width = 760;
  image.height = 332;
  card.append(image);
  const content = document.createElement("span");
  content.className = "episode-content";
  const name = document.createElement("strong");
  name.textContent = episode.place;
  const subtitle = document.createElement("span");
  subtitle.textContent = episode.description;
  content.append(name, subtitle);
  card.append(content);
  item.append(card);
  byId("episode-list").append(item);
}

byId("back-to-menu").addEventListener("click", showMenu);
