import { useState } from "react";
import { motion } from "motion/react";
import type { AnalysisResponse, Unit } from "@tense-lab/shared";
import { GlassCard } from "../components/GlassCard";
import { api } from "../lib/api";
import {
  ERROR_CATEGORY_COLOR_VAR,
  ERROR_CATEGORY_LABEL,
  ERROR_SEVERITY_LABEL,
  buildHighlightSegments,
  scoreColorVar,
} from "../lib/analysis";

function randomTopic(topics: string[]): string {
  return topics[Math.floor(Math.random() * topics.length)] ?? "";
}

interface WritingExerciseProps {
  unit: Unit;
}

export function WritingExercise({ unit }: WritingExerciseProps) {
  const [topic, setTopic] = useState(() => randomTopic(unit.writingTopics));
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newTopic = () => {
    setTopic((current) => {
      if (unit.writingTopics.length <= 1) return current;
      let next = current;
      while (next === current) next = randomTopic(unit.writingTopics);
      return next;
    });
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.analyze({ text, mode: "paragraph", unitId: unit.id, targetTense: unit.id });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-(--color-ink-dim)">
          <span className="font-semibold text-(--color-ink)">Tema: </span>
          {topic}
        </p>
        <button
          type="button"
          onClick={newTopic}
          className="glass rounded-ios-pill shrink-0 px-3 py-1 text-xs text-(--color-ink-dim) hover:text-(--color-ink)"
        >
          Otro tema
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribí unas oraciones en inglés sobre el tema..."
        rows={6}
        disabled={loading || Boolean(result)}
        className="glass rounded-ios w-full resize-none border-2 border-transparent px-4 py-3 text-base outline-none focus:border-(--color-accent) disabled:opacity-60"
      />

      {error && <p className="text-sm text-(--color-danger)">{error}</p>}

      {!result && (
        <button
          type="button"
          onClick={analyze}
          disabled={loading || !text.trim()}
          className="rounded-ios-pill self-start bg-(--color-ink) px-6 py-3 font-semibold text-(--color-bg) transition active:scale-95 disabled:opacity-50"
        >
          {loading ? "Analizando..." : "Analizar"}
        </button>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          <GlassCard className="flex items-center gap-4 p-4">
            <span
              className="text-2xl font-bold"
              style={{ color: `var(${scoreColorVar(result.score)})` }}
            >
              {result.score}
            </span>
            <p className="text-sm">{result.summary}</p>
          </GlassCard>

          <GlassCard className="p-4 text-base leading-relaxed">
            {buildHighlightSegments(text, result.errors).map((segment, i) =>
              segment.error ? (
                <span
                  key={i}
                  style={{
                    textDecorationColor: `var(${ERROR_CATEGORY_COLOR_VAR[segment.error.category]})`,
                    backgroundColor: `color-mix(in srgb, var(${ERROR_CATEGORY_COLOR_VAR[segment.error.category]}) 18%, transparent)`,
                  }}
                  className="rounded-sm underline decoration-2 underline-offset-2"
                >
                  {segment.text}
                </span>
              ) : (
                <span key={i}>{segment.text}</span>
              ),
            )}
          </GlassCard>

          {result.errors.length > 0 && (
            <GlassCard className="p-4 text-sm">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-ink-dim)">
                Versión corregida
              </h3>
              <p>{result.correctedText}</p>
            </GlassCard>
          )}

          {result.errors.length > 0 && (
            <div className="flex flex-col gap-3">
              {result.errors.map((err) => (
                <GlassCard key={err.id} className="p-4 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="rounded-ios-pill px-2 py-0.5 text-xs font-semibold"
                      style={{
                        color: `var(${ERROR_CATEGORY_COLOR_VAR[err.category]})`,
                        borderColor: `var(${ERROR_CATEGORY_COLOR_VAR[err.category]})`,
                        borderWidth: 1,
                      }}
                    >
                      {ERROR_CATEGORY_LABEL[err.category]}
                    </span>
                    <span className="text-xs text-(--color-ink-dim)">{ERROR_SEVERITY_LABEL[err.severity]}</span>
                  </div>
                  <p className="text-(--color-ink-dim)">{err.explanation}</p>
                  <p className="mt-1">
                    <span className="text-(--color-danger) line-through">{err.quote}</span>
                    {" → "}
                    <span className="text-(--color-success)">{err.correction}</span>
                  </p>
                  {err.rule && <p className="mt-1 text-xs text-(--color-ink-dim)">{err.rule}</p>}
                </GlassCard>
              ))}
            </div>
          )}

          {result.errors.length === 0 && (
            <p className="text-center text-sm text-(--color-success)">¡Sin errores! Buen trabajo.</p>
          )}

          <button
            type="button"
            onClick={retry}
            className="glass rounded-ios-pill self-start px-6 py-3 font-semibold text-(--color-ink) transition active:scale-95"
          >
            Escribir otro texto
          </button>
        </motion.div>
      )}
    </div>
  );
}
