import { useThemeStore } from "../store/theme.store";

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className="glass rounded-ios-pill px-4 py-2 text-sm text-(--color-ink-dim) hover:text-(--color-ink)"
    >
      {theme === "dark" ? "Oscuro" : "Claro"}
    </button>
  );
}
