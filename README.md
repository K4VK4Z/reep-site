# reep — site vitrine « coming soon »

Implémentation du design exporté depuis Claude Design (`../project/design_handoff_reep_coming_soon/`).
Site statique **Astro**, sans backend : accueil one-page + deux pages légales.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
npm run preview  # sert dist/
npm run check    # typecheck Astro + TypeScript
```

Le build produit un `dist/` purement statique : il se dépose tel quel sur Vercel, Netlify,
Cloudflare Pages, GitHub Pages ou n'importe quel serveur de fichiers.

## Structure

```
src/
  pages/
    index.astro              accueil (hero, 3 features, finale)
    mentions-legales.astro   → /mentions-legales/
    confidentialite.astro    → /confidentialite/
  layouts/
    BaseLayout.astro         <head>, fontes, favicon, meta
    LegalLayout.astro        en-tête « ← retour » + colonne de lecture 720px
  components/
    Backdrop.astro           canvas 3D + halo + grain (accueil)
    SiteHeader.astro         en-tête fixe + bouton menu
    FullscreenMenu.astro     overlay plein écran
    FeatureSection.astro     section 01/02/03 (texte + iPhone)
    PhoneMockFrames.astro    iPhone en séquence d'images WebP sur <canvas>
    ThemeToggle.astro        bascule sombre/clair
    AppStoreButton.astro     bouton App Store barré « bientôt disponible »
    SiteFooter.astro, Wordmark.astro
  scripts/
    plate.ts                 three.js — disque 20 kg filaire et son éclaté
    frame-scrub.ts           séquences d'images des iPhones pilotées au scroll
    theme.ts                 thème sombre/clair (préférence système + toggle)
    reveal.ts                IntersectionObserver des blocs texte
    menu.ts                  ouverture/fermeture du menu
  styles/
    global.css               tokens, wordmark, bouton menu
    home.css                 rythme des sections, hero, finale
    legal.css                pages légales
  data/
    features.ts              copy + séquence de frames des 3 sections
    routes.ts                routes du site
  assets/video/              rendus .mov sources des iPhones (pas dans le build)
public/                      favicon.svg, grain-tuile-256.png
public/video/phone-frames/   séquences WebP à fond transparent (seance, accueil, masalle)
```

## Design tokens

| Token       | Valeur    | Usage                                             |
| ----------- | --------- | ------------------------------------------------- |
| `--encre`   | `#111110` | fond de l'overlay menu (97 %)                     |
| `--sombre`  | `#141312` | fond de page                                      |
| `--clair`   | `#F2F1EF` | texte principal                                   |
| `--gris`    | `#6E6C68` | texte secondaire                                  |
| `--signal`  | `#E8412C` | accent : point du wordmark, hachures, numéros     |
| `--carte`   | `#1F1E1C` | fonds translucides (`rgba(31,30,28,0.6)`)         |

Titres et wordmark en **Space Grotesk** 700, texte courant en **Inter** 400/500 (Google Fonts).

## Animations

- **Fond 3D** (`plate.ts`) : disque olympique 20 kg en filaire, 5 pièces concentriques. Au repos,
  rotation lente de face ; au scroll, vue éclatée le long de l'axe z (stagger 0.06 par pièce) avec
  bascule du groupe en 3/4 et recul de la caméra. Progression de scroll lissée à 7 % par frame.
- **iPhones** (`frame-scrub.ts`) : chaque section dessine une séquence d'images WebP à fond
  transparent (rendu 3D externe) sur un `<canvas>`, pilotée par le scroll — avance vers le bas,
  recule vers le haut. La progression est recadrée sur une fenêtre 0.2 → 0.85 de la traversée pour
  que la rotation joue quand la section est réellement visible. Pas de vidéo : Safari ne lit pas le
  canal alpha en WebM. Régénérer les frames depuis `src/assets/video/*.mov` si besoin.
- **Reveals** : `IntersectionObserver` à 35 % de visibilité, montée de 48px en 0.9s.

## Avant mise en ligne

- [ ] Remplir les placeholders `[Nom de la société]`, `[RCS]`, `[hébergeur]`, `[contact@reep.app]`…
      dans `src/pages/mentions-legales.astro` et `src/pages/confidentialite.astro`.
- [ ] Vérifier le domaine dans `astro.config.mjs` (`site`) — il alimente les URL canoniques.
- [ ] Activer le lien App Store dans `AppStoreButton.astro` le jour de la publication (retirer les
      hachures, `cursor: not-allowed` et la mention « bientôt disponible »).
