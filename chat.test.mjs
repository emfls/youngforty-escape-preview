import assert from "node:assert/strict";
import test from "node:test";
import * as rules from "./chat-rules.mjs";
import {situations, endings, roundOpenings} from "./chat.mjs";

function start(opening = 0) {
  return rules.ready(rules.newRound(opening));
}

function pick(round, id) {
  assert.equal(typeof rules.repliesFor, "function", "Context must change the playable replies.");
  const index = rules.repliesFor(round).findIndex((option) => option.id === id);
  assert(index >= 0, `${round.situation} must offer ${id}`);
  return rules.ready(rules.advance(rules.choose(round, index)));
}

function path(opening, choices) {
  return choices.reduce((round, id) => pick(round, id), start(opening));
}

test("the old five-rejection shortcut no longer drains 60 points", () => {
  let round = start();
  for (let i = 0; i < 5 && !round.ending; i++) {
    round = rules.ready(rules.advance(rules.choose(round, 0)));
  }
  assert(round.score > 0);
  assert.notEqual(round.ending?.id, "cool");
});

test("earlier song-source information changes the compliment replies and the next scene", () => {
  const informed = path(0, ["names", "source"]);
  const uninformed = path(0, ["names", "groupList"]);
  assert.equal(informed.situation, "compliment");
  assert.equal(uninformed.situation, "compliment");
  assert(rules.intro(informed).join(" ").includes("선곡"));
  assert(rules.repliesFor(informed).some((reply) => reply.id === "quoteSource"));
  assert(!rules.repliesFor(uninformed).some((reply) => reply.id === "quoteSource"));
  assert.equal(pick(informed, "quoteSource").situation, "claimCheck");
  assert.equal(pick(uninformed, "creditGroup").situation, "meal");
});

test("a small booking question opens a later exposure path", () => {
  const before = path(1, ["recognize", "criterion"]);
  const locked = rules.choose(before, rules.repliesFor(before).findIndex((reply) => reply.id === "booking"));
  assert.equal(locked.score, before.score - 2);
  assert(locked.pending.reaction.join(" ").includes("공개"));
  const meal = rules.ready(rules.advance(locked));
  assert.equal(meal.context.booking, "public");
  assert.equal(meal.situation, "meal");
  assert.equal(pick(meal, "quoteBooking").situation, "claimCheck");
});

test("gift preparation learned earlier changes the gift route", () => {
  const gift = path(1, ["preparation"]);
  assert.equal(gift.context.giftEffort, "drafts");
  assert.equal(gift.situation, "gift");
  assert(rules.repliesFor(gift).some((reply) => reply.id === "drafts"));
  const receipt = pick(gift, "drafts");
  assert.equal(receipt.situation, "status");
  assert.equal(receipt.context.gift, "declined");
  const ended = pick(receipt, "withdraw");
  assert.equal(ended.ending.id, "settled");
  assert(ended.score > 0);
  assert(ended.ending.copy.includes(String(ended.score)));
});

test("a previously agreed reply time changes the reminder options", () => {
  const timed = path(0, ["afterNine", "groupList", "creditGroup", "decline", "plainThanks"]);
  const untimed = path(0, ["names", "groupList", "creditGroup", "decline", "plainThanks"]);
  assert.equal(timed.situation, "reminder");
  assert.equal(untimed.situation, "reminder");
  assert(rules.repliesFor(timed).some((reply) => reply.id === "agreedTime"));
  assert(!rules.repliesFor(untimed).some((reply) => reply.id === "agreedTime"));
  assert.equal(pick(timed, "agreedTime").ending.id, "settled");
});

test("a final group agreement succeeds even when interest remains high", () => {
  const round = path(0, ["names", "swap", "creditGroup", "groupMeal", "askQuorum"]);
  assert.equal(round.situation, "last");
  const ended = pick(round, "groupOnly");
  assert.equal(ended.score, 51);
  assert.equal(ended.ending.id, "group");
  assert(ended.score > 20);
  assert(ended.ending.copy.includes("단톡"));
  assert(ended.ending.copy.includes(String(ended.score)));
  assert(!ended.ending.copy.includes("애매"));
});

test("the same boundary remains effective after a gift was accepted", () => {
  const round = {...start(), situation: "last", score: 93, context: {gift: "accepted", meal: "open"}};
  const ended = pick(round, "privateEnd");
  assert.equal(ended.ending.id, "quiet");
  assert.equal(ended.ending.reason, "request");
  assert.equal(ended.context.scope, "closed");
});

test("a clear dinner refusal lowers interest and is remembered", () => {
  const meal = path(0, ["names", "groupList", "creditGroup"]);
  const next = pick(meal, "decline");
  assert(next.score < meal.score);
  assert.equal(next.context.meal, "declined");
  assert(rules.intro(next).join(" ").includes("밥 약속"));
});

test("duplicate input, blocking and a fresh round preserve their lifecycle guarantees", () => {
  const round = start();
  const locked = rules.choose(round, 0);
  assert.strictEqual(rules.choose(locked, 1), locked);
  assert.equal(locked.decisions.length, 1);
  const ended = rules.block(locked);
  assert.equal(ended.ending.id, "quiet");
  assert.equal(ended.ending.reason, "block");
  assert.strictEqual(rules.advance(ended), ended);
  assert.strictEqual(rules.choose(ended, 0), ended);
  assert.deepEqual(start().decisions, []);
  assert.deepEqual(start().context, {});
  assert.deepEqual(start().messages, []);
});

test("exposure, group, withdrawal and private endings have distinct actual paths", () => {
  const exposed = path(0, ["names", "source", "quoteSource", "letAppCredit"]);
  const grouped = path(0, ["names", "groupList", "creditGroup", "groupMeal", "putOnPoll"]);
  const quiet = path(0, ["names", "groupList", "creditGroup", "decline", "plainThanks", "privateEnd"]);
  assert.equal(exposed.ending.id, "bluff");
  assert.equal(grouped.ending.id, "group");
  assert.equal(quiet.ending.id, "quiet");
});

test("all routes use three meaningful replies and terminate within eight turns", () => {
  const reached = new Set();
  const visited = new Set();
  const visit = (round, trail) => {
    assert(round.decisions.length <= 8);
    assert(round.score >= 0 && round.score <= 100);
    if (round.ending) {
      reached.add(round.ending.id);
      if (round.ending.id === "bluff") {
        assert(round.context.proofUsed);
        const used = round.decisions.findIndex(({uses}) => uses === round.context.proofUsed);
        const learned = round.decisions.findIndex(({evidence}) => evidence === round.context.proofUsed);
        assert(learned >= 0 && used > learned, "A special exposure requires learning and using its clue.");
      }
      assert.equal(typeof round.ending.copy, "string");
      assert(!round.ending.copy.includes("{score}"));
      if (round.context.scope === "group") assert.equal(round.ending.id, "group");
      return;
    }
    assert(!trail.includes(round.situation), "The conversation must not loop.");
    visited.add(round.situation);
    const intro = rules.intro(round);
    assert(intro.length > 0 && intro.length <= 3);
    assert(intro.every((line) => typeof line === "string" && line.trim()));
    const replies = rules.repliesFor(round);
    assert.equal(replies.length, 3);
    assert.equal(new Set(replies.map((reply) => reply.text)).size, 3);
    for (let index = 0; index < 3; index++) {
      const locked = rules.choose(round, index);
      assert(locked.pending.reaction.length <= 3);
      assert(locked.pending.reaction.every((line) => typeof line === "string" && line.trim()));
      visit(rules.ready(rules.advance(locked)), [...trail, round.situation]);
    }
  };
  for (let opening = 0; opening < roundOpenings.length; opening++) visit(start(opening), []);
  reached.add(rules.block(start()).ending.id);
  assert.deepEqual(visited, new Set(Object.keys(situations)));
  assert.deepEqual(reached, new Set(Object.keys(endings)));
});

test("replays change the opening and reject unsupported saved values", () => {
  assert.deepEqual([0,1,2,3].map((index) => rules.newRound(index).situation), ["nickname","profile","story","nickname"]);
  for (const value of [-1, 0.5, "1", NaN, Infinity]) assert.equal(rules.newRound(value).situation, "nickname");
});

test("a cafe clue resolves as an unreserved window seat, not a restaurant reservation", () => {
  const proof = path(1, ["recognize", "criterion", "splitRoles", "menu", "plainThanks", "groupNotice", "quoteBooking"]);
  assert.equal(proof.situation, "claimCheck");
  assert(proof.context.invitation === "coffee");
  assert(rules.intro(proof).join(" ").includes("창가"));
  assert(!rules.intro(proof).join(" ").includes("예약 이름"));
  const ended = pick(proof, "checkName");
  assert.equal(ended.decisions.length, 8);
  assert(ended.ending.copy.includes("창가"));
});
