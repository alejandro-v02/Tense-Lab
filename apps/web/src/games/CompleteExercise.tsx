import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { BuildableSentence } from "@tense-lab/shared";
import { FUNCTION_COLOR_VAR, normalizeAnswer, pickBlankIndex } from "../lib/sentence";

interface CompleteExerciseProps {
  sentence: BuildableSentence;
  onNext: () => void;
  onResult?: (correct: boolean) => void;
}

export function CompleteExercise({ sentence, onNext, onResult }: CompleteExerciseProps) {
  const blankIndex = pickBlankIndex(sentence);
  const blankColorVar = FUNCTION_COLOR_VAR[sentence.blocks[blankIndex].function];
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">("idle");

  const check = () => {
    if (!value.trim()) return;
    const correct = normalizeAnswer(value) === normalizeAnswer(sentence.blocks[blankIndex].text);
    setResult(correct ? "correct" : "incorrect");
    onResult?.(correct);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg text-(--color-ink-dim)">{sentence.spanish}</p>

      <div className="flex flex-wrap items-center justify-center gap-2 text-lg">
        {sentence.blocks.map((block, i) =>
          i === blankIndex ? (
            <input
              key={i}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setResult("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && check()}
              placeholder="..."
              autoFocus
              style={{ borderColor: `var(${blankColorVar})`, color: `var(${blankColorVar})` }}
              className="glass rounded-ios-sm w-32 border-2 px-3 py-1 text-center font-semibold outline-none"
            />
          ) : (
            <span key={i} className="font-medium">
              {block.text}
            </span>
          ),
        )}
        <span className="text-2xl font-bold text-(--color-ink-dim)">{sentence.endMark}</span>
      </div>

      <AnimatePresence mode="wait">
        {result !== "idle" && (
          <motion.p
            key={result}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`font-semibold ${result === "correct" ? "text-(--color-success)" : "text-(--color-danger)"}`}
          >
            {result === "correct" ? "¡Correcto!" : `Casi. La respuesta era "${sentence.blocks[blankIndex].text}".`}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={check}
          className="rounded-ios-pill bg-(--color-ink) px-6 py-3 font-semibold text-(--color-bg) transition active:scale-95"
        >
          Revisar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="glass rounded-ios-pill px-6 py-3 font-semibold text-(--color-ink) transition active:scale-95"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
