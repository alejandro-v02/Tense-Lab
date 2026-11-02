import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { BuildableSentence } from "@tense-lab/shared";
import { buildCanonicalSentences, matchesSentence } from "../lib/sentence";

interface TranslateExerciseProps {
  sentence: BuildableSentence;
  onNext: () => void;
  onResult?: (correct: boolean) => void;
}

export function TranslateExercise({ sentence, onNext, onResult }: TranslateExerciseProps) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">("idle");
  const [scored, setScored] = useState(false);

  const check = () => {
    if (!value.trim()) return;
    const correct = matchesSentence(value, sentence);
    setResult(correct ? "correct" : "incorrect");
    if (!scored) {
      onResult?.(correct);
      setScored(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-ink-dim)">Traducí al inglés</p>
        <p className="text-xl font-semibold">{sentence.spanish}</p>
      </div>

      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setResult("idle");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            check();
          }
        }}
        placeholder="Write the sentence in English..."
        autoFocus
        rows={2}
        className="glass rounded-ios w-full max-w-xl resize-none border-2 border-transparent px-4 py-3 text-center text-lg outline-none focus:border-(--color-accent)"
      />

      <AnimatePresence mode="wait">
        {result !== "idle" && (
          <motion.p
            key={result}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center font-semibold ${
              result === "correct" ? "text-(--color-success)" : "text-(--color-danger)"
            }`}
          >
            {result === "correct" ? "¡Correcto!" : `Casi. Una forma correcta: "${buildCanonicalSentences(sentence)[0]}${sentence.endMark}"`}
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
