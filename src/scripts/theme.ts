/**
 * Bascule clair/sombre : clair par défaut, préférence mémorisée dans
 * localStorage. Le flash au chargement est évité par un script inline dans
 * BaseLayout qui pose l'attribut avant le premier paint.
 *
 * Le bouton (ThemeToggle) est purement iconique : lune quand cliquer passe
 * en sombre, soleil pour revenir au clair. L'accessibilité passe par
 * aria-label, mis à jour ici à chaque bascule.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'reep-theme';

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else {
    delete document.documentElement.dataset.theme;
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Stockage indisponible (navigation privée...) : le thème ne persiste
    // juste pas d'une visite à l'autre, ce n'est pas bloquant.
  }

  const meta = document.getElementById('meta-theme-color');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#141312' : '#f7f6f4');

  window.dispatchEvent(new CustomEvent<{ theme: Theme }>('reep:theme', { detail: { theme } }));
}

export function initThemeToggle(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const sync = () => {
    const current = getTheme();
    // Le libellé annonce l'action (le thème vers lequel on bascule), pas l'état actuel.
    btn.setAttribute('aria-label', current === 'dark' ? 'passer en mode clair' : 'passer en mode sombre');
    btn.setAttribute('aria-pressed', String(current === 'dark'));
  };
  sync();

  btn.addEventListener('click', () => {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    sync();
  });
}
