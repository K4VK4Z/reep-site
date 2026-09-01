/**
 * Plan du site, dérivé de ROUTES pour ne jamais se désynchroniser : une page
 * ajoutée à data/routes.ts apparaît ici toute seule.
 *
 * ⚠️ /salle est volontairement absent — c'est la cible du QR de l'affiche,
 * une redirection, pas une page à indexer (elle porte déjà noindex).
 */
import type { APIRoute } from 'astro';
import { ROUTES } from '../data/routes';

/** Poids relatif : l'accueil d'abord, les pages légales en fond. */
const PRIORITES: Record<string, string> = {
  [ROUTES.accueil]: '1.0',
  [ROUTES.support]: '0.6',
  [ROUTES.presse]: '0.5',
};

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://reepapp.fr');
  const urls = Object.values(ROUTES)
    .map((chemin) => {
      const loc = new URL(chemin, base).href;
      return `  <url><loc>${loc}</loc><priority>${PRIORITES[chemin] ?? '0.3'}</priority></url>`;
    })
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
