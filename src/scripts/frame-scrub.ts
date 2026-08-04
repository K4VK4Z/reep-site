/**
 * iPhones des sections features : chaque section a sa séquence d'images
 * (alpha réelle, pas de fond) dessinée sur un <canvas>, pilotée par le
 * scroll — avance vers le bas, recule vers le haut.
 *
 * La rotation ne doit pas être jouée pendant que la section n'est encore
 * qu'à moitié visible (sinon elle tourne « trop tôt » et est déjà terminée
 * quand la section est bien à l'écran). On calcule donc une progression
 * brute sur toute la traversée, puis on la recadre sur une fenêtre plus
 * étroite (WINDOW_START → WINDOW_END) centrée sur le moment où la section
 * est réellement visible à l'écran.
 *
 * La progression est en plus lissée d'une frame à l'autre (comme le disque
 * de plate.ts) : le téléphone « rattrape » le scroll avec un léger retard
 * amorti au lieu de sauter d'une frame à l'autre — même sur un coup de
 * molette sec, la rotation reste fluide.
 */
const WINDOW_START = 0.22;
const WINDOW_END = 0.82;

/** Part du chemin restant rattrapée à chaque frame (1 = aucun lissage). */
const SMOOTHING = 0.11;

function initOne(canvas: HTMLCanvasElement): void {
  const section = canvas.closest<HTMLElement>('.feature');
  if (!section) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const base = canvas.dataset.frameBase ?? '';
  const count = Number(canvas.dataset.frameCount ?? 0);
  if (!base || !count) return;

  const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
  let loadedOnce = false;

  const draw = (index: number) => {
    // Si la frame demandée n'est pas encore chargée, on affiche la plus
    // proche déjà disponible plutôt que de laisser le canvas vide.
    let i = index;
    let steps = 0;
    while (!images[i] && steps < count) {
      i = i > 0 ? i - 1 : i + 1;
      steps++;
      if (i < 0 || i >= count) break;
    }
    const img = images[i];
    if (!img) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    loadedOnce = true;
  };

  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.decoding = 'async';
    img.src = `${base}${String(i + 1).padStart(3, '0')}.webp`;
    img.onload = () => {
      images[i] = img;
      if (!loadedOnce && i === 0) draw(0);
    };
  }

  let current = 0;
  let drawn = -1;

  const frame = () => {
    const vh = innerHeight;
    const rect = section.getBoundingClientRect();
    const raw = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
    const target = Math.max(0, Math.min(1, (raw - WINDOW_START) / (WINDOW_END - WINDOW_START)));

    current += (target - current) * SMOOTHING;
    // En dessous d'une demi-frame d'écart, on colle à la cible pour que la
    // rotation s'arrête net au lieu de ramper indéfiniment.
    if (Math.abs(target - current) < 0.5 / count) current = target;

    const index = Math.round(current * (count - 1));
    if (index !== drawn) {
      draw(index);
      drawn = index;
    }
    requestAnimationFrame(frame);
  };
  frame();
}

export function initFrameScrub(): void {
  document
    .querySelectorAll<HTMLCanvasElement>('[data-scrub-canvas]')
    .forEach(initOne);
}
