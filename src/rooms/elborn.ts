import { P, css, type RGB } from '../art/palette';
import { Pixels, rampPick } from '../art/dither';
import { drawVidente, drawFerrer } from '../art/actor';
import { VIDENTE_DIALOGUE, FERRER_DIALOGUE } from '../content/dialogues';
import type { Room, NPC, Hotspot, Exit } from '../engine/types';

const STONE: RGB = [108, 96, 90];
const STONE_D: RGB = [78, 68, 64];
const STONE_L: RGB = [136, 122, 112];
const COBBLE: RGB = [96, 84, 78];
const COBBLE_D: RGB = [72, 62, 58];
const COBBLE_L: RGB = [122, 108, 100];
const FORGE_GLOW: RGB = [248, 150, 60];
const BEAD: RGB = [180, 90, 120];

function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}
function blk(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB, o: RGB = P.black) {
  ctx.fillStyle = css(o);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  ctx.fillStyle = css(c);
  ctx.fillRect((x | 0) + 1, (y | 0) + 1, Math.max(0, (w | 0) - 2), Math.max(0, (h | 0) - 2));
}

export function buildElbornScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 144;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // dusk sky strip
  const img = ctx.createImageData(320, 30);
  const px = new Pixels(img, 320, 30);
  const sky: RGB[] = [[48, 40, 78], [120, 80, 96], [206, 146, 112]];
  for (let y = 0; y < 30; y++) for (let x = 0; x < 320; x++) px.set(x, y, rampPick(sky, y / 30, x, y));
  ctx.putImageData(img, 0, 0);

  // Santa Maria del Mar — two bell towers in the central gap (silhouette, foreshadow)
  const tower: RGB = [70, 60, 78];
  for (const tx of [142, 168]) {
    r(ctx, tx, 8, 12, 92, tower);
    r(ctx, tx + 1, 8, 2, 92, [86, 74, 92]);
    for (let i = 0; i < 3; i++) r(ctx, tx + 1 + i * 4, 4, 2, 4, tower); // crenellations
    r(ctx, tx + 2, 24, 8, 6, [30, 26, 36]); // a window
  }
  r(ctx, 138, 36, 44, 64, tower); // nave body between towers

  // tall medieval buildings framing the street (leave the centre gap for the towers)
  const drawBlock = (bx: number, bw: number, c: RGB) => {
    r(ctx, bx, 26, bw, 74, c);
    r(ctx, bx, 24, bw, 3, P.roofShadow);
    r(ctx, bx, 26, 1, 74, STONE_D);
    for (let wy = 36; wy < 92; wy += 20) for (let wx = bx + 6; wx < bx + bw - 6; wx += 16) { blk(ctx, wx, wy, 8, 11, [40, 34, 40]); r(ctx, wx, wy + 4, 8, 1, STONE_D); }
  };
  drawBlock(0, 132, STONE);
  drawBlock(188, 132, STONE_L);
  // a banner strung across
  r(ctx, 60, 30, 1, 10, P.woodDark);
  ctx.fillStyle = css(BEAD);
  ctx.beginPath(); ctx.moveTo(60, 40); ctx.lineTo(72, 40); ctx.lineTo(66, 48); ctx.closePath(); ctx.fill();

  // cobblestone street
  r(ctx, 0, 96, 320, 48, COBBLE);
  r(ctx, 0, 96, 320, 1, COBBLE_L);
  for (let y = 100; y < 144; y += 5) for (let x = ((y / 5) % 2) * 4; x < 320; x += 8) r(ctx, x, y, 3, 2, ((x + y) % 6 < 3) ? COBBLE_D : COBBLE_L);

  // --- Vidente's botiga (left) ---
  blk(ctx, 8, 58, 42, 42, STONE_D);
  r(ctx, 14, 64, 30, 30, [26, 18, 30]); // dark interior
  for (let i = 0; i < 7; i++) r(ctx, 16 + i * 4, 64, 2, 6 + (i % 3) * 3, BEAD); // hanging beads
  r(ctx, 20, 84, 4, 6, P.winLit); r(ctx, 34, 86, 4, 5, P.winLit); // candles
  r(ctx, 16, 52, 26, 7, P.woodDark);
  ctx.fillStyle = css(GEMGOLD_SIGN);
  ctx.beginPath(); ctx.arc(29, 55, 2, 0, Math.PI * 2); ctx.fill(); // an eye/star on the sign

  // --- Blacksmith forge (right) ---
  blk(ctx, 258, 60, 44, 40, STONE_D);
  r(ctx, 266, 70, 22, 20, [40, 20, 14]); // hearth opening (fire drawn live)
  r(ctx, 276, 40, 8, 22, STONE_D); // chimney
  // hanging tools
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = css([90, 90, 96]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(294, 66 + i * 7, 3, 0.2, Math.PI - 0.2); ctx.stroke(); }
  // anvil out front
  blk(ctx, 230, 104, 18, 6, STONE_D);
  r(ctx, 234, 110, 10, 6, [40, 36, 40]);
  // the key display board (the second key is drawn live so it can vanish)
  blk(ctx, 252, 80, 16, 14, P.woodDark);

  return cv;
}

const GEMGOLD_SIGN: RGB = [228, 188, 96];

export function elbornOverlays(ctx: CanvasRenderingContext2D, t: number) {
  const f = 0.7 + 0.3 * Math.sin(t * 8) + 0.08 * Math.sin(t * 19);
  const g = ctx.createRadialGradient(277, 80, 1, 277, 80, 20);
  g.addColorStop(0, 'rgba(248,150,60,' + (0.55 * f).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(248,150,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(255, 60, 44, 40);
  // candle glow in the botiga
  const cg = ctx.createRadialGradient(28, 86, 1, 28, 86, 12);
  cg.addColorStop(0, 'rgba(255,210,120,' + (0.3 * (0.8 + 0.2 * Math.sin(t * 6))).toFixed(3) + ')');
  cg.addColorStop(1, 'rgba(255,210,120,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(12, 70, 34, 30);
}

// the ornate second key on the forge display — drawn until it's taken
export function drawDisplayKey(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = css([196, 202, 212]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(257, 87, 2.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = css([196, 202, 212]);
  ctx.fillRect(259, 86, 7, 2);
  ctx.fillRect(264, 88, 2, 2);
}

// a string of garlic hanging from a little balcony on the left building —
// drawn until it's taken (gated on took_ajos). Cream bulbs on the dark
// STONE facade read clearly; this is the pickup the player must spot.
export function drawGarlic(ctx: CanvasRenderingContext2D) {
  // balcony rail + posts
  r(ctx, 102, 62, 22, 2, [70, 50, 34]);
  r(ctx, 103, 56, 2, 7, [70, 50, 34]);
  r(ctx, 121, 56, 2, 7, [70, 50, 34]);
  // braid string
  ctx.strokeStyle = css([182, 168, 128]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(112, 64); ctx.lineTo(112, 84); ctx.stroke();
  // garlic bulbs (cream, lightly shaded)
  const bulbs: [number, number][] = [[108, 68], [116, 71], [107, 75], [116, 79], [112, 83]];
  for (const [bx, by] of bulbs) {
    ctx.fillStyle = css([238, 232, 214]);
    ctx.beginPath(); ctx.ellipse(bx, by, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = css([200, 194, 170]); ctx.fillRect(bx - 1, by - 2, 1, 4);
  }
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'ajos', name: 'la ristra de ajos', x: 100, y: 52, w: 26, h: 36, walkTo: { x: 114, y: 138 },
    look: 'Una ristra de ajos colgada de un balcón. Espanta vampiros y, según dicen, a algún que otro pretendiente.',
    responses: { Coger: 'Una buena ristra de ajos. La vidente estará encantada.' },
    pickup: { id: 'ajos', name: 'la ristra de ajos' },
  },
  { id: 'botiga', name: 'la botiga de la vidente', x: 8, y: 50, w: 44, h: 50, walkTo: { x: 44, y: 136 }, look: 'La botiga de la vidente. Velas, abalorios y un olor a incienso que tira de espaldas.' },
  { id: 'forja', name: 'la fragua', x: 258, y: 60, w: 44, h: 40, walkTo: { x: 250, y: 138 }, look: 'La fragua. El fuego ruge y las herramientas cuelgan como trofeos de guerra.' },
  { id: 'clavedisplay', name: 'la segunda clave', x: 250, y: 78, w: 18, h: 16, walkTo: { x: 255, y: 138 }, look: 'La segunda clave, en su soporte. Reluce como recién forjada. El ferrer la vigila como un dragón a su oro.', responses: { Coger: 'En cuanto extiendo la mano, el ferrer gruñe sin levantar la vista. Mejor no perder los dedos.' } },
  { id: 'torres', name: 'las torres', x: 138, y: 6, w: 48, h: 50, walkTo: { x: 160, y: 138 }, look: 'Las torres de Santa Maria del Mar asoman tras los tejados. Algo me dice que esta historia acaba ahí dentro.' },
];

const NPCS: NPC[] = [
  {
    id: 'vidente', name: 'la vidente', x: 48, y: 78, w: 30, h: 54,
    feet: { x: 62, y: 130 }, walkTo: { x: 88, y: 135 }, facing: 'right', color: [206, 150, 220],
    look: 'La Vidente del Born, envuelta en chales y misterio (y un poco de teatro).',
    draw: drawVidente, dialogue: VIDENTE_DIALOGUE,
    accepts: {
      ajos: { line: '¡Ajos del bueno! El último ingrediente. (revuelve, sopla, murmura un conjuro) ...Toma: un tónico que duerme a quien lo prueba. Úsalo con cabeza. O con quien quieras dormir.', give: 'tonico', remove: ['ajos'], flag: 'has_tonico' },
    },
  },
  {
    id: 'ferrer', name: 'el ferrer', x: 228, y: 84, w: 34, h: 50,
    feet: { x: 244, y: 132 }, walkTo: { x: 214, y: 136 }, facing: 'left', color: [240, 180, 120],
    look: 'El ferrer, ancho como una puerta y sordo como un yunque por el martilleo.',
    draw: drawFerrer, dialogue: FERRER_DIALOGUE,
    accepts: {
      tonico: { line: '¿Para mí? ¡Por fin alguien con modales! (glu glu glu) Aaah, qué fresqui... *bostezo*... qué sueñ... (ZZZzzz, se desploma sobre el yunque). Con muchísimo cuidado, le quito la clave del soporte. ¡La segunda es mía!', give: 'clau2', remove: ['tonico'], flag: 'key2' },
    },
  },
];

const EXITS: Exit[] = [
  { id: 'toRambla', name: 'la Rambla', x: 0, y: 100, w: 16, h: 42, walkTo: { x: 20, y: 136 }, to: 'rambla', entry: { x: 290, y: 135 }, arrow: 'left' },
  { id: 'toSagrada', name: 'la Sagrada Família', x: 304, y: 100, w: 16, h: 42, walkTo: { x: 300, y: 136 }, to: 'sagrada', entry: { x: 30, y: 135 }, arrow: 'right' },
  { id: 'toCatedral', name: 'Santa Maria del Mar', x: 140, y: 78, w: 42, h: 24, walkTo: { x: 160, y: 138 }, to: 'santamaria', entry: { x: 40, y: 135 }, arrow: 'up' },
];

export const ELBORN: Room = {
  id: 'elborn',
  build: buildElbornScene,
  overlays: elbornOverlays,
  dynamic: (ctx, state) => {
    if (!state.flags.took_ajos) drawGarlic(ctx);
    if (!state.flags.key2) drawDisplayKey(ctx);
  },
  hotspots: HOTSPOTS,
  npcs: NPCS,
  exits: EXITS,
  walk: { minX: 16, maxX: 304, minY: 108, maxY: 140 },
  start: { x: 40, y: 135 },
};
