import {chapters} from "./scenes.mjs?v=3";
import {chatTurns, chatEndings, changeInterest, initialInterest} from "./chat.mjs?v=3";

const byId = (id) => document.getElementById(id);
const menu = byId("episode-menu");
const game = byId("game");
const storyScreen = byId("story-screen");
const chatScreen = byId("chat-screen");
const title = byId("story-title");
const actions = byId("actions");
const photo = byId("photo");
const progress = byId("story-progress");
const quote = byId("quote");
const reaction = byId("story-reaction");
const log = byId("chat-log");
const chatPrompt = byId("chat-prompt");
const chatResult = byId("chat-result");
const chatActions = byId("chat-actions");

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

function openGame(mode, label) {
  menu.hidden = true;
  game.hidden = false;
  storyScreen.hidden = mode !== "story";
  chatScreen.hidden = mode !== "chat";
  byId("chapter-label").textContent = label;
  progress.hidden = mode === "chat";
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
  openGame("story", episode.place);
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

function addMessage(text, side) {
  const message = document.createElement("li");
  const speaker = document.createElement("span");
  const bubble = document.createElement("p");
  message.className = "message " + side;
  speaker.className = "message-name";
  speaker.textContent = side === "sent" ? "나" : "정호";
  bubble.textContent = text;
  message.append(speaker, bubble);
  log.append(message);
  log.scrollTop = log.scrollHeight;
}

function playChat() {
  openGame("chat", "카톡풍 채팅");
  let interest = initialInterest;
  let index = 0;
  log.replaceChildren();
  chatResult.hidden = true;
  byId("interest-change").textContent = "";
  updateInterest();

  function updateInterest() {
    byId("interest-value").textContent = interest;
    byId("interest-meter").value = interest;
  }

  function showTurn() {
    const [incoming, choices] = chatTurns[index];
    addMessage(incoming, "received");
    chatPrompt.textContent = "뭐라고 답할까요?";
    chatActions.replaceChildren(...choices.map(([label, reply, delta], choiceIndex) => button(label, () => {
      addMessage(label, "sent");
      addMessage(reply, "received");
      const previous = interest;
      interest = changeInterest(interest, delta);
      updateInterest();
      const difference = interest - previous;
      byId("interest-change").textContent = "호감도 " + (difference > 0 ? "+" : "") + difference;
      const ending = chatEndings[interest];
      if (ending) {
        chatPrompt.textContent = ending.title;
        chatResult.textContent = ending.copy;
        chatResult.hidden = false;
        chatActions.replaceChildren(button("채팅 다시 하기", playChat), button("다른 상황 고르기", showMenu, "←"));
      } else {
        index += 1;
        showTurn();
      }
      chatPrompt.focus({preventScroll: true});
    }, choiceIndex + 1)));
  }

  showTurn();
  chatPrompt.focus({preventScroll: true});
}

for (const [label, description, cover, start] of [
  ...chapters.map((episode) => [episode.place, episode.description, episode.acts.opening.image, () => playEpisode(episode)]),
  ["카톡풍 채팅", "둘만 남은 메시지 창. 답장으로 호감도를 0점까지 낮춰 보세요.", null, playChat],
]) {
  const item = document.createElement("li");
  const card = document.createElement("button");
  card.type = "button";
  card.className = "episode-card";
  card.addEventListener("click", start);
  if (cover) {
    const image = document.createElement("img");
    image.src = "./images/" + cover;
    image.alt = "";
    image.width = 760;
    image.height = 332;
    card.append(image);
  } else {
    const art = document.createElement("span");
    art.className = "chat-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = "정호님이 메시지를 보냈습니다.";
    card.append(art);
  }
  const content = document.createElement("span");
  content.className = "episode-content";
  const name = document.createElement("strong");
  name.textContent = label;
  const subtitle = document.createElement("span");
  subtitle.textContent = description;
  content.append(name, subtitle);
  card.append(content);
  item.append(card);
  byId("episode-list").append(item);
}

byId("back-to-menu").addEventListener("click", showMenu);
