import assert from "node:assert/strict";
import test from "node:test";
import {existsSync} from "node:fs";

const rulesFile = new URL("./chat-rules.mjs", import.meta.url);
const rules = existsSync(rulesFile) ? await import(rulesFile) : {};
const {situations, endings, roundOpenings} = await import("./chat.mjs");

function start() {
  assert.equal(typeof rules.newRound, "function", "The eight-turn state machine is required.");
  return rules.ready(rules.newRound());
}

function choose(state, index) {
  return rules.ready(rules.advance(rules.choose(state, index)));
}

function finish(state, indices) {
  for (const index of indices) {
    if (state.ending) return state;
    state = choose(state, index);
  }
  return state;
}

test("sixteen distinct situations each offer three meaningful replies and reactions", () => {
  assert.equal(Object.keys(situations ?? {}).length, 16);
  for (const situation of Object.values(situations)) {
    assert.equal(situation.options.length, 3);
    assert.equal(new Set(situation.options.map((reply) => reply.text)).size, 3);
    assert.equal(new Set(situation.options.map((reply) => JSON.stringify(reply.reaction))).size, 3);
    assert(situation.options.every((reply) => reply.reaction.length && reply.why));
  }
});

test("a clear answer lowers interest and duplicate input cannot change it twice", () => {
  const state = start();
  assert.equal(state.score, 60);
  assert.equal(state.situation, "nickname");
  const locked = rules.choose(state, 0);
  assert.equal(locked.score, 46);
  assert.equal(locked.phase, "reply");
  assert.strictEqual(rules.choose(locked, 1), locked);
  assert.equal(locked.decisions.length, 1);
});

test("a direct compliment boundary changes the order and a refused gift stays refused", () => {
  const state = finish(start(), [0, 1, 0]);
  assert.equal(state.situation, "gift");
  const next = choose(state, 1);
  assert.equal(next.situation, "meal");
  assert.equal(next.context.gift, "declined");
  assert(rules.intro(next).join(" ").includes("쿠폰은 안"));
});

test("a declined meal is acknowledged, and an ambiguous reply leaves it open", () => {
  const meal = finish(start(), [1, 1, 2]);
  assert.equal(meal.situation, "meal");
  const declined = choose(meal, 1);
  assert.equal(declined.context.meal, "declined");
  assert(rules.intro(declined).join(" ").includes("밥 약속 얘기는 접었고"));
  const ambiguous = choose(meal, 0);
  assert.equal(ambiguous.context.meal, "open");
  assert.equal(ambiguous.score, meal.score + 10);
});

test("0 and 100 clamp the score and terminate before eight replies", () => {
  const low = finish(start(), [0, 2, 0, 1, 1]);
  assert.equal(low.ending.id, "cool");
  assert.equal(low.score, 0);
  assert(low.decisions.length < 8);
  const high = finish(start(), [2, 0, 1, 0, 0]);
  assert.equal(high.ending.id, "crush");
  assert.equal(high.score, 100);
  assert(high.decisions.length < 8);
  assert.strictEqual(rules.choose(low, 1), low);
});

test("the eighth turn uses a threshold of 20 and both endings are reachable", () => {
  const distance = finish(start(), [0, 0, 0, 2, 1, 0, 0, 2]);
  assert.equal(distance.decisions.length, 8);
  assert.equal(distance.ending.id, "group");
  assert.equal(distance.score, 20);
  const failed = finish(start(), [0, 0, 2, 1, 2, 0, 2, 2]);
  assert.equal(failed.decisions.length, 8);
  assert.equal(failed.ending.id, "crush");
  assert.equal(failed.score, 21);
});

test("contact termination takes priority even if the previous tone was friendly", () => {
  const reminder = finish(start(), [1, 1, 2, 0, 1]);
  assert.equal(reminder.situation, "reminder");
  const finished = choose(reminder, 2);
  assert.equal(finished.ending.id, "quiet");
  assert.equal(finished.ending.reason, "request");
  assert.equal(finished.decisions.length, 6);
});

test("blocking during playback cancels progression and a new round starts clean", () => {
  const locked = rules.choose(start(), 2);
  const stopped = rules.block(locked);
  assert.equal(stopped.ending.id, "quiet");
  assert.equal(stopped.ending.reason, "block");
  assert.equal(stopped.score, 68);
  assert.strictEqual(rules.advance(stopped), stopped);
  const fresh = start();
  assert.deepEqual(fresh.context, {});
  assert.deepEqual(fresh.decisions, []);
  assert.deepEqual(fresh.messages, []);
});

test("all possible routes end within eight turns and collect all four endings", () => {
  const seen = new Set();
  const visited = new Set();
  const visit = (round) => {
    assert(round.decisions.length <= 8);
    if (round.ending) {
      seen.add(round.ending.id);
      return;
    }
    assert(round.decisions.length < 8);
    visited.add(round.situation);
    const lines = rules.intro(round);
    assert(lines.length >= 1 && lines.length <= 3);
    assert(lines.every((line) => typeof line === "string" && line.trim()));
    for (const index of [0, 1, 2]) {
      const reply = rules.choose(round, index);
      assert(reply.pending.reaction.length <= 3);
      assert(reply.pending.reaction.every((line) => typeof line === "string" && line.trim()));
      visit(rules.ready(rules.advance(reply)));
    }
  };
  for (const opening of [0, 1, 2]) visit(rules.ready(rules.newRound(opening)));
  seen.add(rules.block(start()).ending.id);
  assert.deepEqual(seen, new Set(Object.keys(endings)));
  assert.deepEqual(visited, new Set(Object.keys(situations)));
});

test("replays rotate three authored openings without changing reply scoring", () => {
  assert.deepEqual(roundOpenings, ["nickname", "profile", "story"]);
  const openings = [0, 1, 2, 3].map((replay) => rules.ready(rules.newRound(replay)));
  assert.deepEqual(openings.map((round) => round.situation), ["nickname", "profile", "story", "nickname"]);
  assert.equal(new Set(openings.slice(0,3).map((round) => rules.intro(round).join(" "))).size, 3);
  for (const round of openings) {
    assert.equal(rules.choose(round, 0).score, 46);
    assert.equal(rules.choose(round, 1).score, 54);
    assert.equal(rules.choose(round, 2).score, 68);
  }
});

test("cafe and snack refusals remain true in the next conversation", () => {
  const cafe = finish(rules.ready(rules.newRound(1)), [1, 1, 1]);
  assert.equal(cafe.situation, "coffee");
  const snack = choose(cafe, 1);
  assert.equal(snack.context.meal, "declined");
  assert(rules.intro(snack).join(" ").includes("커피 약속은"));
  const reminder = choose(snack, 1);
  assert.equal(reminder.context.gift, "declined");
  assert(rules.intro(reminder).join(" ").includes("디저트"));
});

test("reassurance and a reply-time boundary lead to different later situations", () => {
  const reminder = finish(start(), [1, 1, 2, 0, 1]);
  assert.equal(choose(reminder,0).situation, "status");
  assert.equal(choose(reminder,1).situation, "dating");
});


test("unsupported replay values fall back to the first opening", () => {
  for (const value of [-1, 0.5, "1", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(rules.newRound(value).situation, "nickname");
  }
});

test("late replies do not reopen a refused meal", () => {
  const beforeLast = finish(start(), [1, 1, 2, 1, 2, 0, 0]);
  assert.equal(beforeLast.context.meal, "declined");
  assert.equal(beforeLast.situation, "last");
  const reply = rules.choose(beforeLast, 0);
  assert(reply.pending.reaction[0].includes("만나는 얘기는 접고"));
});

test("the final clear boundary is acknowledged even after earlier flirty replies", () => {
  const last = finish(start(), [2, 0, 1, 1, 0, 0, 1]);
  assert.equal(last.situation, "last");
  const reply = rules.choose(last, 1);
  assert(reply.pending.reaction.at(-1).includes("따로 연락은 안 할게요"));
  assert(reply.score < last.score);
});
