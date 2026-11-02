import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { GlassCard } from "../components/GlassCard";
import { ThemeToggle } from "../components/ThemeToggle";
import { SentenceBuilder } from "../games/SentenceBuilder";
import { CompleteExercise } from "../games/CompleteExercise";
import { TranslateExercise } from "../games/TranslateExercise";
import { useSentencePractice } from "../hooks/useSentencePractice";
import { useExerciseRotation } from "../hooks/useExerciseRotation";
import { api } from "../lib/api";

const TABS = ["understand", "build"] as const;
type Tab = (typeof TABS)[number];

function tabClass(active: boolean): string {
  return `rounded-ios-pill px-5 py-2 text-sm font-semibold transition ${
    active ? "bg-(--color-ink) text-(--color-bg)" : "glass text-(--color-ink-dim)"
  }`;
}

export function UnitScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("understand");
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const {
    data: unit,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["unit", id],
    queryFn: () => api.getUnit(id),
    enabled: Boolean(id),
  });

  const practice = useSentencePractice(id, unit?.sentences ?? []);
  const { mode, rotate } = useExerciseRotation();

  const handleNext = () => {
    rotate();
    practice.next();
  };

  const handleResult = (correct: boolean) => {
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  if (isLoading) {
    return <p className="p-8 text-center text-(--color-ink-dim)">Cargando unidad...</p>;
  }
  if (error || !unit) {
    return <p className="p-8 text-center text-(--color-danger)">No se pudo cargar la unidad.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm text-(--color-ink-dim) hover:text-(--color-ink)"
        >
          ← Mapa
        </button>
        <ThemeToggle />
      </div>

      <GlassCard strong className="mb-6 p-6">
        <h1 className="text-2xl font-bold">{unit.title}</h1>
        <p className="text-sm text-(--color-ink-dim)">
          {unit.timeframe} · {unit.group.replace("_", " ")}
        </p>
      </GlassCard>

      <div className="mb-6 flex gap-2">
        <button type="button" onClick={() => setTab("understand")} className={tabClass(tab === "understand")}>
          Entender
        </button>
        <button type="button" onClick={() => setTab("build")} className={tabClass(tab === "build")}>
          Construir
        </button>
      </div>

      {tab === "understand" && (
        <GlassCard className="flex flex-col gap-5 p-6">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-ink-dim)">Fórmula</h2>
            <div className="flex flex-col gap-1 text-sm">
              <p>
                <span className="text-(--color-ink-dim)">Afirmativa:</span> {unit.formula.affirmative}
              </p>
              <p>
                <span className="text-(--color-ink-dim)">Negativa:</span> {unit.formula.negative}
              </p>
              <p>
                <span className="text-(--color-ink-dim)">Pregunta:</span> {unit.formula.question}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-ink-dim)">Cuándo se usa</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {unit.uses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-ink-dim)">Palabras señal</h2>
            <div className="flex flex-wrap gap-2">
              {unit.signalWords.map((sw) => (
                <span key={sw.word} className="glass rounded-ios-pill px-3 py-1 text-xs">
                  {sw.word}
                  {sw.translation ? ` · ${sw.translation}` : ""}
                </span>
              ))}
            </div>
          </div>

          {unit.timeline.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-ink-dim)">Línea de tiempo</h2>
              <p className="text-sm">{unit.timeline.description}</p>
            </div>
          )}

          {unit.commonMistakes.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-ink-dim)">
                Errores comunes
              </h2>
              <div className="flex flex-col gap-3">
                {unit.commonMistakes.map((cm) => (
                  <div key={cm.mistake} className="glass rounded-ios-sm p-3 text-sm">
                    <p className="text-(--color-danger)">✗ {cm.mistake}</p>
                    <p className="text-(--color-success)">✓ {cm.correction}</p>
                    <p className="mt-1 text-(--color-ink-dim)">{cm.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {tab === "build" && (
        <GlassCard className="p-6">
          {practice.current ? (
            <>
              <div className="mb-5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-(--color-ink-dim)">
                <span>
                  {mode === "blocks" && "Ordenar bloques"}
                  {mode === "complete" && "Completar"}
                  {mode === "translate" && "Traducir"}
                </span>
                <span className="glass rounded-ios-pill px-3 py-1 text-(--color-success)">
                  {score.correct}/{score.total} aciertos
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${practice.current.id}-${mode}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {mode === "blocks" && (
                    <SentenceBuilder sentence={practice.current} onNext={handleNext} onResult={handleResult} />
                  )}
                  {mode === "complete" && (
                    <CompleteExercise sentence={practice.current} onNext={handleNext} onResult={handleResult} />
                  )}
                  {mode === "translate" && (
                    <TranslateExercise sentence={practice.current} onNext={handleNext} onResult={handleResult} />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <p className="text-center text-(--color-ink-dim)">No hay oraciones para esta unidad todavía.</p>
          )}
        </GlassCard>
      )}
    </div>
  );
}
