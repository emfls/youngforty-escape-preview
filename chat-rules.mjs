import {endings, situations, roundOpenings} from "./chat.mjs?v=7";

export const initialInterest = 60;
export const maxTurns = 8;

export function newRound(replay = 0) {
  const index = Number.isSafeInteger(replay) && replay >= 0 ? replay % roundOpenings.length : 0;
  return {situation: roundOpenings[index], score: initialInterest, phase: "intro", messages: [], decisions: [], context: {}, pending: null, ending: null};
}

function matches(when, context) {
  return !when || Object.entries(when).every(([key, value]) => context[key] === value);
}

function resolveLines(lines, context) {
  if (!lines.length || typeof lines[0] === "string") return lines;
  return lines.find(({when}) => matches(when, context)).lines;
}

function activeSituation(round) {
  const situation = situations[round.situation];
  const variant = situation.variants?.find(({when}) => matches(when, round.context));
  return variant ? {...situation, ...variant} : situation;
}

export function intro(round) {
  const situation = activeSituation(round);
  return [...resolveLines(situation.intro, round.context), ...(situation.tail ?? [])];
}

export function repliesFor(round) {
  return activeSituation(round).options;
}

export function ready(round) {
  return round.phase === "intro" ? {...round, phase: "ready"} : round;
}

export function choose(round, index) {
  if (round.phase !== "ready") return round;
  const situation = activeSituation(round);
  const option = situation.options[index];
  if (!Number.isInteger(index) || !option) return round;
  const score = Math.min(100, Math.max(0, round.score + option.delta));
  const choice = {
    situation: round.situation, text: option.text, delta: score - round.score, why: option.why,
    evidence: option.evidence, uses: option.uses,
  };
  const decisions = [...round.decisions, choice];
  const context = {...round.context, ...option.remember};
  const reaction = resolveLines(option.reaction, context);
  let next = option.next ?? situation.next;
  if (typeof next === "object") {
    next = round.decisions.some(({situation}) => situation === next.ifSeen) ? next.then : next.otherwise;
  }
  const ending = option.end ?? (context.scope === "group" ? "group" : context.scope === "closed" ? "settled"
    : score === 0 ? "settled" : score === 100 ? "crush"
    : decisions.length >= maxTurns || !next ? "crush" : null);
  return {
    ...round, score, phase: "reply", decisions, context,
    pending: {
      reaction: ending ? [...reaction, ...resolveLines(endings[ending].reaction, context)] : reaction,
      next, ending, reason: ending === "quiet" ? "request" : null,
    },
  };
}

export function advance(round) {
  if (round.phase !== "reply") return round;
  const {ending, reason, next} = round.pending;
  return ending ? end(round, ending, reason) : {...round, situation: next, phase: "intro", pending: null};
}

export function block(round) {
  return round.ending ? round : end(round, "quiet", "block");
}

function end(round, id, reason) {
  const template = endings[id];
  const copy = typeof template.copy === "string" ? template.copy : resolveLines(template.copy, round.context).join(" ");
  return {...round, phase: "ended", pending: null, ending: {...template, id, reason, copy: copy.replace("{score}", String(round.score))}};
}
