import type { Unit } from "@tense-lab/shared";
import { motion } from "motion/react";

export type UnitNodeStatus = "locked" | "in_progress" | "completed";

const STATUS_RING: Record<UnitNodeStatus, string> = {
  locked: "border-(--color-border)",
  in_progress: "border-(--color-accent)",
  completed: "border-(--color-success)",
};

interface UnitNodeProps {
  unit: Unit;
  status: UnitNodeStatus;
  onSelect: (unit: Unit) => void;
}

export function UnitNode({ unit, status, onSelect }: UnitNodeProps) {
  const locked = status === "locked";

  return (
    <motion.button
      type="button"
      disabled={locked}
      onClick={() => onSelect(unit)}
      whileTap={locked ? undefined : { scale: 0.96 }}
      whileHover={locked ? undefined : { y: -4 }}
      className={`glass rounded-ios flex flex-col items-start gap-2 border p-4 text-left transition ${STATUS_RING[status]} ${
        locked ? "opacity-40" : ""
      }`}
    >
      <span className="text-xs uppercase tracking-wide text-(--color-ink-dim)">{unit.group.replace("_", " ")}</span>
      <span className="text-base font-semibold">{unit.title}</span>
      {status === "completed" && <span className="text-xs text-(--color-success)">Completada</span>}
      {status === "in_progress" && <span className="text-xs text-(--color-accent)">En curso</span>}
      {locked && <span className="text-xs text-(--color-ink-dim)">Bloqueada</span>}
    </motion.button>
  );
}
