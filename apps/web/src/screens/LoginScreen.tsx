import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { GlassCard } from "../components/GlassCard";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth.store";

type Mode = "login" | "register";

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = mode === "login" ? await api.login(email, password) : await api.register(email, password, name);
      setSession(response.token, response.user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <GlassCard strong className="p-8">
          <h1 className="mb-1 text-center text-2xl font-bold tracking-tight">Tense Lab</h1>
          <p className="mb-6 text-center text-sm text-(--color-ink-dim)">
            {mode === "login" ? "Entrá a tu cuenta" : "Creá tu cuenta"}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "register" && (
              <input
                type="text"
                required
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass rounded-ios-sm bg-transparent px-4 py-3 text-(--color-ink) placeholder:text-(--color-ink-dim) outline-none focus:border-(--color-fn-subject)"
              />
            )}
            <input
              type="email"
              required
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass rounded-ios-sm bg-transparent px-4 py-3 text-(--color-ink) placeholder:text-(--color-ink-dim) outline-none focus:border-(--color-fn-subject)"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass rounded-ios-sm bg-transparent px-4 py-3 text-(--color-ink) placeholder:text-(--color-ink-dim) outline-none focus:border-(--color-fn-subject)"
            />

            {error && <p className="text-sm text-(--color-fn-verb)">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-ios-pill bg-(--color-fn-subject) px-6 py-3 font-semibold text-white transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Un momento..." : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="mt-5 w-full text-center text-sm text-(--color-ink-dim) hover:text-(--color-ink)"
          >
            {mode === "login" ? "¿No tenés cuenta? Creá una" : "¿Ya tenés cuenta? Entrá"}
          </button>
        </GlassCard>
      </motion.div>
    </div>
  );
}
