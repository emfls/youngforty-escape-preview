import {endings, situations} from "./chat.mjs";

export const initialInterest = 60;
export const maxTurns = 8;

export function newRound() {
  return {situation: "nickname", score: initialInterest, phase: "intro", messages: [], decisions: [], context: {}, pending: null, ending: null};
}

export function intro(round) {
  const situation = situations[round.situation];
  if (typeof situation.intro[0] === "string") return situation.intro;
  const version = situation.intro.find(({when}) => !when || Object.entries(when).every(
    ([key, value]) => round.context[key] === value
  ));
  return [...version.lines, ...(situation.tail ?? [])];
}

export function ready(round) {
  return round.phase === "intro" ? {...round, phase: "ready"} : round;
}

export function choose(round, index) {
  if (round.phase !== "ready") return round;
  const situation = situations[round.situation];
  const option = situation.options[index];
  if (!Number.isInteger(index) || !option) return round;
  const score = Math.min(100, Math.max(0, round.score + option.delta));
  const choice = {situation: round.situation, text: option.text, delta: score - round.score, why: option.why};
  const decisions = [...round.decisions, choice];
  let next = option.next ?? situation.next;
  if (typeof next === "object") {
    next = round.decisions.some(({situation}) => situation === next.ifSeen) ? next.then : next.otherwise;
  }
  const ending = option.end ?? (score === 0 ? "cool" : score === 100 ? "crush"
    : decisions.length === maxTurns || !next ? (score <= 20 ? "group" : "crush") : null);
  return {
    ...round,
    score,
    phase: "reply",
    decisions,
    context: {...round.context, ...option.remember},
    pending: {
      reaction: ending ? [...option.reaction, ...endings[ending].reaction] : option.reaction,
      next,
      ending,
      reason: option.end ? "request" : null,
    },
  };
}

export function advance(round) {
  if (round.phase !== "reply") return round;
  const {ending, reason, next} = round.pending;
  if (ending) return end(round, ending, reason);
  return {...round, situation: next, phase: "intro", pending: null};
}

export function block(round) {
  return round.ending ? round : end(round, "quiet", "block");
}

function end(round, id, reason) {
  return {...round, phase: "ended", pending: null, ending: {id, reason, ...endings[id]}};
}
