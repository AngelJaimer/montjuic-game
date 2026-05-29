import { P, css, type RGB } from '../art/palette';
import { drawLeChuck } from '../art/actor';
import type { Room, NPC, Hotspot, Exit } from '../engine/types';

const NAVE: RGB = [30, 32, 50];
const WALL: RGB = [58, 56, 74];
const WALL_D: RGB = [44, 42, 58];
const COL: RGB = [94, 90, 104];
const COL_L: RGB = [122, 118, 134];
const FLOOR: RGB = [58, 54, 70];
const FLOOR_D: RGB = [44, 40, 56];
const GOLD: RGB = [228, 188, 96];
const GLASS = [[192, 72, 72], [72, 102, 190], [222, 182, 84], [82, 172, 112]] as RGB[];

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

function lancet(ctx: CanvasRenderingContext2D, x: number) {
  blk(ctx, x, 34, 14, 50, WALL_D);
  for (let i = 0; i < 8; i++) r(ctx, x + 2, 38 + i * 5, 10, 4, GLASS[(i + (x % 4)) % 4]);
  // pointed top
  ctx.fillStyle = css(WALL_D);
  ctx.beginPath(); ctx.moveTo(x, 34); ctx.lineTo(x + 7, 26); ctx.lineTo(x + 14, 34); ctx.closePath(); ctx.fill();
}

function gothicColumn(ctx: CanvasRenderingContext2D, x: number) {
  r(ctx, x, 24, 12, 84, COL);
  r(ctx, x + 1, 24, 3, 84, COL_L);
  r(ctx, x + 9, 24, 3, 84, WALL_D);
  r(ctx, x - 2, 22, 16, 3, COL_L); // capital
}

export function buildSantamariaScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 144;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // dim interior
  r(ctx, 0, 0, 320, 144, NAVE);
  r(ctx, 0, 18, 320, 90, WALL);     // back wall
  r(ctx, 0, 18, 320, 2, WALL_D);

  // pointed arcade arches across the back wall
  ctx.strokeStyle = css(WALL_D); ctx.lineWidth = 2;
  for (let ax = 24; ax < 300; ax += 64) {
    ctx.beginPath();
    ctx.moveTo(ax, 60); ctx.lineTo(ax + 32, 28); ctx.lineTo(ax + 64, 60);
    ctx.stroke();
  }

  // rose window (centre, stained glass)
  const rx = 160, ry = 48;
  ctx.fillStyle = css(WALL_D); ctx.beginPath(); ctx.arc(rx, ry, 24, 0, Math.PI * 2); ctx.fill();
  for (let a = 0; a < 12; a++) {
    ctx.fillStyle = css(GLASS[a % 4]);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.arc(rx, ry, 21, (a / 12) * Math.PI * 2, ((a + 1) / 12) * Math.PI * 2);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = css(GOLD); ctx.beginPath(); ctx.arc(rx, ry, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = css([20, 20, 30]); ctx.lineWidth = 1;
  for (let a = 0; a < 12; a++) { ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.cos(a / 12 * 6.283) * 23, ry + Math.sin(a / 12 * 6.283) * 23); ctx.stroke(); }

  // lancet windows flanking
  lancet(ctx, 64);
  lancet(ctx, 242);

  // columns
  gothicColumn(ctx, 40);
  gothicColumn(ctx, 100);
  gothicColumn(ctx, 208);
  gothicColumn(ctx, 268);

  // stone floor
  r(ctx, 0, 106, 320, 38, FLOOR);
  r(ctx, 0, 106, 320, 1, COL_L);
  for (let y = 110; y < 144; y += 6) for (let x = ((y / 6) % 2) * 8; x < 320; x += 16) r(ctx, x, y, 7, 1, FLOOR_D);

  // candelabra flanking the vault
  for (const cxv of [116, 204]) {
    r(ctx, cxv, 104, 2, 16, [60, 50, 40]);
    r(ctx, cxv - 2, 100, 6, 4, [80, 66, 50]);
    r(ctx, cxv - 1, 96, 4, 4, P.winLit);
  }

  // the vault — ornate chest with three keyholes
  blk(ctx, 130, 110, 60, 22, [86, 74, 60]);
  r(ctx, 132, 112, 56, 4, [120, 102, 80]);
  r(ctx, 130, 128, 60, 4, [56, 46, 36]);
  ctx.fillStyle = css(GOLD);
  for (let i = 0; i < 3; i++) { ctx.fillRect(142 + i * 18, 118, 4, 6); ctx.fillRect(143 + i * 18, 116, 2, 2); }
  r(ctx, 130, 110, 60, 2, GOLD); // gilt trim

  return cv;
}

export function santamariaOverlays(ctx: CanvasRenderingContext2D, t: number) {
  // rose window glow
  const f = 0.7 + 0.3 * Math.sin(t * 1.5);
  const g = ctx.createRadialGradient(160, 48, 4, 160, 48, 34);
  g.addColorStop(0, 'rgba(220,200,150,' + (0.22 * f).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(220,200,150,0)');
  ctx.fillStyle = g; ctx.fillRect(120, 10, 80, 80);
  // candle flicker
  for (const cxv of [117, 205]) {
    const cf = 0.7 + 0.3 * Math.sin(t * 9 + cxv);
    const cg = ctx.createRadialGradient(cxv, 97, 1, cxv, 97, 14);
    cg.addColorStop(0, 'rgba(255,210,120,' + (0.4 * cf).toFixed(3) + ')');
    cg.addColorStop(1, 'rgba(255,210,120,0)');
    ctx.fillStyle = cg; ctx.fillRect(cxv - 14, 84, 28, 28);
  }
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'arca', name: 'el arca del Consolat', x: 128, y: 108, w: 64, h: 26, walkTo: { x: 160, y: 138 },
    look: 'El arca del Tesoro del Consolat de Mar. Tres cerraduras, una por cada llave. Lo que llevo persiguiendo todo el episodio.',
    needs: ['clau1', 'clau2', 'clau3'],
    needsBlocked: 'Tres cerraduras, y aún no tengo las tres llaves. Me falta alguna.',
    responses: { Abrir: 'Meto las tres llaves. Clic. Clic. CLIC. El arca se abre con un gemido de siglos y un resplandor dorado me ciega...' },
    flag: 'vault_open',
    card: ['EPISODIO 2 COMPLETADO', '', 'El arca del Consolat de Mar se abre de par en par...', '', '"Gracias por reunir las llaves por mí, Threepwood."', 'Una risa fantasmal retumba en la catedral.', 'LeChuck.', '', 'Continuará... Episodio 3'],
  },
  { id: 'rosa', name: 'el rosetón', x: 136, y: 24, w: 48, h: 48, walkTo: { x: 160, y: 138 }, look: 'El rosetón de Santa Maria del Mar. La luz que cruza el cristal pinta el suelo de colores.' },
  { id: 'altar', name: 'la nave', x: 60, y: 30, w: 20, h: 56, walkTo: { x: 78, y: 138 }, look: 'La nave de la catedral del mar, alta y serena. Huele a piedra, cera y siglos.' },
];

const NPCS: NPC[] = [
  {
    id: 'lechuck', name: 'LeChuck', x: 196, y: 78, w: 30, h: 56,
    feet: { x: 210, y: 132 }, walkTo: { x: 186, y: 138 }, facing: 'left', color: [150, 222, 160],
    look: 'LeChuck, el pirata fantasma. Mi perdición de siempre, ahora con la sonrisa del que acaba de ganar.',
    draw: drawLeChuck, showIf: 'vault_open',
  },
];

const EXITS: Exit[] = [
  { id: 'toBorn', name: 'el Born', x: 0, y: 106, w: 16, h: 36, walkTo: { x: 20, y: 136 }, to: 'elborn', entry: { x: 160, y: 135 }, arrow: 'left' },
];

export const SANTAMARIA: Room = {
  id: 'santamaria',
  build: buildSantamariaScene,
  overlays: santamariaOverlays,
  hotspots: HOTSPOTS,
  npcs: NPCS,
  exits: EXITS,
  walk: { minX: 16, maxX: 304, minY: 110, maxY: 140 },
  start: { x: 40, y: 135 },
};
