import { useState } from "react";

export type ExerciseMode = "blocks" | "complete" | "translate";

const MODES: ExerciseMode[] = ["blocks", "complete", "translate"];

export function pickNextMode(last: ExerciseMode | null): ExerciseMode {
  const options = last ? MODES.filter((m) => m !== last) : MODES;
  return options[Math.floor(Math.random() * options.length)];
}

/** Rotates between exercise types each round so the same interaction never repeats twice in a row. */
export function useExerciseRotation() {
  const [mode, setMode] = useState<ExerciseMode>(() => pickNextMode(null));
  const rotate = () => setMode((prev) => pickNextMode(prev));
  return { mode, rotate };
}
