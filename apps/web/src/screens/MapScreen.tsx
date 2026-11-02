import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TENSE_TIMEFRAMES, TENSE_GROUPS, type Unit, type TenseTimeframe, type TenseGroup } from "@tense-lab/shared";
import { GlassCard } from "../components/GlassCard";
import { UnitNode, type UnitNodeStatus } from "../components/UnitNode";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth.store";

const TIMEFRAME_LABEL: Record<TenseTimeframe, string> = {
  present: "Presente",
  past: "Pasado",
  future: "Futuro",
};

export function MapScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data: units, isLoading, error } = useQuery({ queryKey: ["units"], queryFn: api.getUnits });

  const byTimeframeAndGroup = (timeframe: TenseTimeframe, group: TenseGroup) =>
    units?.find((u) => u.timeframe === timeframe && u.group === group);

  // Unit 1 (present_simple) is always unlocked per spec; the rest wait on the
  // /progress endpoint, which doesn't exist yet, so everything else is locked for now.
  const statusFor = (unit: Unit | undefined): UnitNodeStatus => {
    if (!unit) return "locked";
    return unit.id === "present_simple" ? "in_progress" : "locked";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <GlassCard className="mb-8 flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-lg font-bold">Tense Lab</p>
          <p className="text-sm text-(--color-ink-dim)">{user?.name ?? "Invitado"}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-ios-pill glass px-4 py-2 text-sm font-semibold text-(--color-fn-time)">
            {user?.xp ?? 0} XP
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-ios-pill glass px-4 py-2 text-sm text-(--color-ink-dim) hover:text-(--color-ink)"
          >
            Salir
          </button>
        </div>
      </GlassCard>

      {isLoading && <p className="text-center text-(--color-ink-dim)">Cargando unidades...</p>}
      {error && <p className="text-center text-(--color-fn-verb)">No se pudieron cargar las unidades.</p>}

      {units && (
        <div className="flex flex-col gap-6">
          {TENSE_TIMEFRAMES.map((timeframe) => (
            <section key={timeframe}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-(--color-ink-dim)">
                {TIMEFRAME_LABEL[timeframe]}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TENSE_GROUPS.map((group) => {
                  const unit = byTimeframeAndGroup(timeframe, group);
                  if (!unit) return null;
                  return (
                    <UnitNode
                      key={unit.id}
                      unit={unit}
                      status={statusFor(unit)}
                      onSelect={(selected) => navigate(`/unit/${selected.id}`)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
