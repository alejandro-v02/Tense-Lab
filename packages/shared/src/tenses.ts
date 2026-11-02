export const TENSE_GROUPS = ["simple", "continuous", "perfect", "perfect_continuous"] as const;
export type TenseGroup = (typeof TENSE_GROUPS)[number];

export const TENSE_TIMEFRAMES = ["present", "past", "future"] as const;
export type TenseTimeframe = (typeof TENSE_TIMEFRAMES)[number];

export const TENSES = [
  "present_simple",
  "present_continuous",
  "present_perfect",
  "present_perfect_continuous",
  "past_simple",
  "past_continuous",
  "past_perfect",
  "past_perfect_continuous",
  "future_simple",
  "future_continuous",
  "future_perfect",
  "future_perfect_continuous",
] as const;

export type Tense = (typeof TENSES)[number];

export interface TenseInfo {
  id: Tense;
  timeframe: TenseTimeframe;
  group: TenseGroup;
  label: string;
}

export const TENSE_INFO: Record<Tense, TenseInfo> = {
  present_simple: { id: "present_simple", timeframe: "present", group: "simple", label: "Present Simple" },
  present_continuous: { id: "present_continuous", timeframe: "present", group: "continuous", label: "Present Continuous" },
  present_perfect: { id: "present_perfect", timeframe: "present", group: "perfect", label: "Present Perfect" },
  present_perfect_continuous: {
    id: "present_perfect_continuous",
    timeframe: "present",
    group: "perfect_continuous",
    label: "Present Perfect Continuous",
  },
  past_simple: { id: "past_simple", timeframe: "past", group: "simple", label: "Past Simple" },
  past_continuous: { id: "past_continuous", timeframe: "past", group: "continuous", label: "Past Continuous" },
  past_perfect: { id: "past_perfect", timeframe: "past", group: "perfect", label: "Past Perfect" },
  past_perfect_continuous: {
    id: "past_perfect_continuous",
    timeframe: "past",
    group: "perfect_continuous",
    label: "Past Perfect Continuous",
  },
  future_simple: { id: "future_simple", timeframe: "future", group: "simple", label: "Future Simple" },
  future_continuous: { id: "future_continuous", timeframe: "future", group: "continuous", label: "Future Continuous" },
  future_perfect: { id: "future_perfect", timeframe: "future", group: "perfect", label: "Future Perfect" },
  future_perfect_continuous: {
    id: "future_perfect_continuous",
    timeframe: "future",
    group: "perfect_continuous",
    label: "Future Perfect Continuous",
  },
};

export function isTense(value: string): value is Tense {
  return (TENSES as readonly string[]).includes(value);
}
