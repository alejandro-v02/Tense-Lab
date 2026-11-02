import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "motion/react";
import type { BuildableSentence, WordFunction } from "@tense-lab/shared";

const FUNCTION_COLOR_VAR: Record<WordFunction, string> = {
  subject: "--color-fn-subject",
  auxiliary: "--color-fn-auxiliary",
  verb: "--color-fn-verb",
  complement: "--color-fn-complement",
  time: "--color-fn-time",
  adverb: "--color-fn-adverb",
  connector: "--color-fn-connector",
};

function shuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  // A shuffle that happens to land on the correct order defeats the exercise.
  if (length > 1 && indices.every((value, i) => value === i)) {
    [indices[0], indices[1]] = [indices[1], indices[0]];
  }
  return indices;
}

function isCorrectOrder(order: number[], sentence: BuildableSentence): boolean {
  const canonical = sentence.blocks.map((_, i) => i);
  const candidates = [canonical, ...(sentence.acceptedOrders ?? [])];
  return candidates.some(
    (candidate) => candidate.length === order.length && candidate.every((value, i) => value === order[i]),
  );
}

function BlockChip({ id, text, fn }: { id: string; text: string; fn: WordFunction }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderColor: `var(${FUNCTION_COLOR_VAR[fn]})`,
    color: `var(${FUNCTION_COLOR_VAR[fn]})`,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass rounded-ios-sm cursor-grab touch-none border-2 px-4 py-2 text-sm font-semibold select-none active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {text}
    </button>
  );
}

interface SentenceBuilderProps {
  sentence: BuildableSentence;
  onNext: () => void;
  onResult?: (correct: boolean) => void;
}

export function SentenceBuilder({ sentence, onNext, onResult }: SentenceBuilderProps) {
  const [order, setOrder] = useState<number[]>(() => shuffledIndices(sentence.blocks.length));
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">("idle");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((current) => {
      const oldIndex = current.findIndex((i) => String(i) === active.id);
      const newIndex = current.findIndex((i) => String(i) === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
    setResult("idle");
  };

  const check = () => {
    const correct = isCorrectOrder(order, sentence);
    setResult(correct ? "correct" : "incorrect");
    onResult?.(correct);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg text-(--color-ink-dim)">{sentence.spanish}</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order.map(String)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {order.map((blockIndex) => {
              const block = sentence.blocks[blockIndex];
              return <BlockChip key={blockIndex} id={String(blockIndex)} text={block.text} fn={block.function} />;
            })}
            <span className="text-2xl font-bold text-(--color-ink-dim)">{sentence.endMark}</span>
          </div>
        </SortableContext>
      </DndContext>

      <AnimatePresence mode="wait">
        {result !== "idle" && (
          <motion.p
            key={result}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`font-semibold ${result === "correct" ? "text-(--color-fn-complement)" : "text-(--color-fn-verb)"}`}
          >
            {result === "correct" ? "¡Correcto!" : "Todavía no. Intentá de nuevo."}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={check}
          className="rounded-ios-pill bg-(--color-fn-subject) px-6 py-3 font-semibold text-white transition active:scale-95"
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
