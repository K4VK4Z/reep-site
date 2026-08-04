import * as THREE from 'three';

/**
 * Fond 3D : le disque olympique 20 kg de reep, en filaire « mode plan ».
 *
 * Au repos il tourne lentement de face ; au scroll il se divise en vue éclatée,
 * chaque pièce glissant le long de l'axe z pendant que la caméra bascule en 3/4.
 * Les rayons sont normalisés sur le viewBox du SVG officiel du disque (/239).
 */

/** Rayon de référence du SVG officiel (viewBox 239). */
const REF = 239;

/** Pièce de l'éclaté : le groupe, son décalage z final, sa sur-rotation. */
interface Piece {
  group: THREE.Group;
  offset: number;
  spin: number;
}

/** Points d'un cercle de rayon `r` dans le plan z = `z`. */
function circlePoints(r: number, z: number, segments = 140): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z));
  }
  return points;
}

function polyline(points: THREE.Vector3[], material: THREE.LineBasicMaterial): THREE.Line {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

/**
 * Anneau extrudé : les cercles `radii` dupliqués à ±`halfZ`, reliés par
 * `connectors` segments répartis sur le rayon `connectorRadius`.
 */
function ringPart(
  radii: number[],
  halfZ: number,
  material: THREE.LineBasicMaterial,
  connectors = 16,
  connectorRadius?: number,
): THREE.Group {
  const group = new THREE.Group();
  for (const r of radii) {
    group.add(polyline(circlePoints(r, halfZ), material));
    group.add(polyline(circlePoints(r, -halfZ), material));
  }

  const cr = connectorRadius ?? Math.max(...radii);
  const segments: THREE.Vector3[] = [];
  for (let i = 0; i < connectors; i++) {
    const a = (i / connectors) * Math.PI * 2;
    const x = Math.cos(a) * cr;
    const y = Math.sin(a) * cr;
    segments.push(new THREE.Vector3(x, y, halfZ), new THREE.Vector3(x, y, -halfZ));
  }
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segments), material));
  return group;
}

/** Lumière oblongue (forme stade) de la face du disque, dans le plan z. */
function slotPoints(z: number): THREE.Vector3[] {
  const cx = 0;
  const cy = -(339 - 240) / REF;
  const halfW = 52 / REF;
  const radius = 21 / REF;
  const points: THREE.Vector3[] = [];

  const arc = (acx: number, acy: number, a0: number, a1: number) => {
    for (let i = 0; i <= 24; i++) {
      const a = a0 + ((a1 - a0) * i) / 24;
      points.push(new THREE.Vector3(acx + Math.cos(a) * radius, acy + Math.sin(a) * radius, z));
    }
  };

  arc(cx + halfW - radius, cy, -Math.PI / 2, Math.PI / 2);
  arc(cx - halfW + radius, cy, Math.PI / 2, Math.PI * 1.5);
  points.push(points[0]!.clone());
  return points;
}

/** Couleurs du disque par thème : traits filaires, marquage, page claire → disque sombre et vice-versa. */
const PLATE_THEME = {
  light: { filet: 0x141312, mark: 'rgba(20,19,18,0.55)' },
  dark: { filet: 0xf2f1ef, mark: 'rgba(242,241,239,0.6)' },
} as const;

type PlateTheme = keyof typeof PLATE_THEME;

function currentTheme(): PlateTheme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Marquage « 20 KG » gravé sur la face, redessiné au changement de thème et une fois les fontes prêtes. */
function markingTexture(theme: PlateTheme): { texture: THREE.CanvasTexture; setTheme: (t: PlateTheme) => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  let fill = PLATE_THEME[theme].mark;

  const draw = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = fill;
    ctx.textAlign = 'center';
    ctx.font = '600 88px "Space Grotesk", sans-serif';
    ctx.fillText('2 0', 128, 104);
    ctx.font = '600 44px "Space Grotesk", sans-serif';
    ctx.fillText('K G', 128, 178);
  };

  draw();
  const texture = new THREE.CanvasTexture(canvas);
  document.fonts.ready.then(() => {
    draw();
    texture.needsUpdate = true;
  });

  return {
    texture,
    setTheme(t) {
      fill = PLATE_THEME[t].mark;
      draw();
      texture.needsUpdate = true;
    },
  };
}

/** Smoothstep clampé sur [0,1]. */
function ease(t: number): number {
  if (t < 0) return 0;
  if (t > 1) return 1;
  return t * t * (3 - 2 * t);
}

export function initPlate(canvas: HTMLCanvasElement): void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 20);
  camera.position.set(0, 0.1, 3.1);

  const group = new THREE.Group();
  scene.add(group);

  // Matériaux filaires : contours dans la teinte du texte (thème clair → disque
  // sombre, thème sombre → disque clair), trou central en signal (constant),
  // guides pointillés. Recolorés en direct via l'événement « reep:theme ».
  const theme = currentTheme();
  const filet = new THREE.LineBasicMaterial({
    color: PLATE_THEME[theme].filet,
    transparent: true,
    opacity: 0.3,
  });
  const signal = new THREE.LineBasicMaterial({ color: 0xe8412c, transparent: true, opacity: 0.9 });
  const guide = new THREE.LineDashedMaterial({
    color: 0x6e6c68,
    transparent: true,
    opacity: 0.4,
    dashSize: 0.045,
    gapSize: 0.035,
  });

  const jante = ringPart([1, 230 / REF], 0.1, filet, 20);

  // Face : anneau + les 3 lumières oblongues et leur marquage à 0/120/240°.
  const face = new THREE.Group();
  face.add(ringPart([178 / REF], 0.062, filet, 12));
  const marking = markingTexture(theme);
  for (const angle of [0, 120, 240]) {
    const slot = new THREE.Group();
    slot.add(polyline(slotPoints(0.062), filet));
    slot.add(polyline(slotPoints(-0.062), filet));

    const mark = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.36),
      new THREE.MeshBasicMaterial({ map: marking.texture, transparent: true, depthWrite: false }),
    );
    mark.position.set(0, (240 - 128) / REF, 0.068);
    slot.add(mark);

    slot.rotation.z = (angle * Math.PI) / 180;
    face.add(slot);
  }

  const moyeu = ringPart([64 / REF], 0.115, filet, 10);
  const collerette = ringPart([38 / REF], 0.145, filet, 8);
  const trou = ringPart([30 / REF], 0.145, signal, 10);

  const pieces: Piece[] = [
    { group: jante, offset: -0.85, spin: -0.12 },
    { group: face, offset: -0.3, spin: 0.1 },
    { group: moyeu, offset: 0.28, spin: -0.08 },
    { group: collerette, offset: 0.62, spin: 0.14 },
    { group: trou, offset: 1.0, spin: 0 },
  ];
  for (const piece of pieces) group.add(piece.group);

  // Guides de plan : cercle coté, axe de révolution, repères en croix.
  const cote = polyline(circlePoints(1.22, 0), guide);
  cote.computeLineDistances();
  group.add(cote);

  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -1.5),
      new THREE.Vector3(0, 0, 1.5),
    ]),
    guide.clone(),
  );
  axis.computeLineDistances();
  group.add(axis);

  const crossPoints: THREE.Vector3[] = [];
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const) {
    crossPoints.push(new THREE.Vector3(dx * 1.12, dy * 1.12, 0), new THREE.Vector3(dx * 1.32, dy * 1.32, 0));
  }
  // Repères trop courts pour être tiretés : pas de computeLineDistances, ils
  // restent pleins — c'est le rendu validé en design.
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(crossPoints), guide.clone()));

  // Progression de scroll, lissée d'une frame à l'autre.
  let target = 0;
  let current = 0;
  const scrollProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? scrollY / max : 0;
  };
  addEventListener('scroll', () => {
    target = scrollProgress();
  }, { passive: true });

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    const m = Math.min(1, innerWidth / 900);
    group.scale.setScalar(0.62 + 0.38 * m);
  };
  addEventListener('resize', resize);
  resize();

  // Recolore le disque quand ThemeToggle bascule le thème (voir scripts/theme.ts).
  addEventListener('reep:theme', ((e: CustomEvent<{ theme: PlateTheme }>) => {
    const next = e.detail.theme;
    filet.color.setHex(PLATE_THEME[next].filet);
    marking.setTheme(next);
  }) as EventListener);

  const depart = performance.now();
  const frame = () => {
    const t = (performance.now() - depart) / 1000;
    current += (target - current) * 0.07;
    const e = ease(Math.min(1, current / 0.85));

    // Plan de face au repos → bascule en 3/4 quand le disque se divise.
    group.rotation.x = -0.08 - e * 0.42;
    group.rotation.y = Math.sin(t * 0.25) * 0.06 + e * 0.85;
    group.rotation.z = t * 0.045;
    group.position.y = 0.04 + Math.sin(t * 0.7) * 0.012;
    camera.position.z = 3.1 + e * 1.1;

    pieces.forEach((piece, i) => {
      const pe = ease((e - i * 0.06) / (1 - i * 0.06));
      piece.group.position.z = piece.offset * pe * 1.15;
      piece.group.rotation.z = piece.spin * pe;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  frame();
}
