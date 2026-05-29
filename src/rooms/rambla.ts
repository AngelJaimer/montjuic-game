import { P, css, type RGB } from '../art/palette';
import { Pixels, rampPick } from '../art/dither';
import { drawStatue, drawOcellaire, drawFlorista } from '../art/actor';
import { ESTATUA_DIALOGUE, OCELLAIRE_DIALOGUE, FLORISTA_DIALOGUE } from '../content/dialogues';
import type { Room, NPC, Hotspot, Exit } from '../engine/types';

const LEAF_D: RGB = [52, 84, 44];
const LEAF: RGB = [88, 126, 58];
const LEAF_L: RGB = [130, 162, 86];
const TILE: RGB = [150, 132, 110];
const TILE_D: RGB = [122, 106, 88];
const TILE_L: RGB = [176, 158, 134];
const KIOSK: RGB = [58, 96, 84];

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
function disc(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
}

function tree(ctx: CanvasRenderingContext2D, x: number) {
  r(ctx, x - 2, 70, 4, 32, P.woodDark);
  r(ctx, x - 1, 70, 1, 32, P.wood);
  const blobs = [[x - 11, 52], [x + 9, 50], [x - 2, 43], [x + 1, 58]];
  for (const [bx, by] of blobs) disc(ctx, bx, by, 12, LEAF_D);
  for (const [bx, by] of blobs) disc(ctx, bx, by - 2, 10, LEAF);
  for (const [bx, by] of blobs) disc(ctx, bx - 2, by - 4, 6, LEAF_L);
}

function flowerStall(ctx: CanvasRenderingContext2D, x: number) {
  for (let i = 0; i < 9; i++) r(ctx, x + i * 4, 96, 4, 6, i % 2 ? [200, 90, 80] : P.parchment); // awning
  blk(ctx, x + 3, 104, 32, 12, P.wood);
  const cols: RGB[] = [P.flagRed, P.winLit, [222, 130, 170], [120, 200, 120], [120, 150, 220]];
  for (let i = 0; i < 14; i++) { ctx.fillStyle = css(cols[i % 5]); ctx.fillRect(x + 4 + (i % 7) * 4, 100 + Math.floor(i / 7) * 2, 2, 2); }
}

export function buildRamblaScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 144;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // bright sky
  const img = ctx.createImageData(320, 36);
  const px = new Pixels(img, 320, 36);
  const sky: RGB[] = [[110, 146, 178], [162, 190, 210], [206, 224, 232]];
  for (let y = 0; y < 36; y++) for (let x = 0; x < 320; x++) px.set(x, y, rampPick(sky, y / 36, x, y));
  ctx.putImageData(img, 0, 0);

  // facades along the back
  for (let bx = 0; bx < 320; bx += 40) {
    const wc = ((bx / 40) | 0) % 2 ? P.wall : [212, 182, 134] as RGB;
    r(ctx, bx, 30, 40, 64, wc);
    r(ctx, bx, 28, 40, 3, P.roofShadow);
    r(ctx, bx, 30, 1, 64, P.wallShadow);
    for (let wy = 40; wy < 88; wy += 22) {
      blk(ctx, bx + 7, wy, 9, 12, P.winDark);
      blk(ctx, bx + 24, wy, 9, 12, P.winDark);
      r(ctx, bx + 5, wy + 12, 13, 1, P.wallShadow); // balcony ledge
    }
  }

  // promenade pavement
  r(ctx, 0, 96, 320, 48, TILE);
  r(ctx, 0, 96, 320, 1, TILE_L);
  for (let y = 100; y < 144; y += 5) for (let x = ((y / 5) % 2) * 4; x < 320; x += 8) r(ctx, x, y, 3, 2, ((x + y) % 6 < 3) ? TILE_D : TILE_L);
  r(ctx, 150, 96, 20, 48, TILE_D); // a central runner stripe
  for (let i = 0; i < 18; i++) r(ctx, (i * 71) % 314 + 3, 108 + (i * 13) % 30, 2, 1, LEAF_D); // fallen leaves

  // a modernista kiosk (left)
  blk(ctx, 14, 70, 22, 26, KIOSK);
  r(ctx, 16, 72, 18, 10, [180, 200, 190]); // glass
  r(ctx, 12, 66, 26, 5, KIOSK);            // roof
  r(ctx, 12, 66, 26, 1, [120, 170, 150]);
  r(ctx, 24, 60, 2, 6, KIOSK);             // finial

  // flower stalls + the plane trees that line the promenade
  flowerStall(ctx, 96);
  flowerStall(ctx, 250);
  tree(ctx, 60);
  tree(ctx, 120);
  tree(ctx, 210);
  tree(ctx, 286);

  return cv;
}

const HOTSPOTS: Hotspot[] = [
  { id: 'arbol', name: 'el plátano', x: 108, y: 36, w: 24, h: 40, walkTo: { x: 120, y: 138 }, look: 'Un plátano de la Rambla. Da sombra, hojas en otoño y, todo el año, palomas.' },
  { id: 'kiosko', name: 'el quiosco', x: 12, y: 60, w: 26, h: 36, walkTo: { x: 40, y: 136 }, look: 'Un quiosco modernista. Venden prensa, horchata y rumores a partes iguales.' },
  { id: 'flores', name: 'el puesto de flores', x: 96, y: 96, w: 40, h: 20, walkTo: { x: 116, y: 138 }, look: 'La Rambla de les Flors en todo su esplendor. Huele mejor que el resto del puerto.' },
  { id: 'suelo', name: 'el empedrado', x: 120, y: 120, w: 90, h: 20, walkTo: { x: 165, y: 138 }, look: 'El empedrado de la Rambla, pulido por un millón de paseantes y algún que otro pirata.' },
];

const NPCS: NPC[] = [
  {
    id: 'estatua', name: 'la estatua humana', x: 148, y: 74, w: 26, h: 54,
    feet: { x: 160, y: 126 }, walkTo: { x: 138, y: 136 }, facing: 'right', color: [200, 204, 214],
    look: 'Una estatua humana, pintada de plata, congelada en pose heroica. Sostiene una llave en alto. No se mueve ni con un terremoto.',
    draw: drawStatue, dialogue: ESTATUA_DIALOGUE,
    accepts: {
      alpiste: {
        line: 'Esparzo el alpiste a sus pies. En segundos, una nube de palomas se le echa encima. El "invencible" aguanta... aguanta... ¡y estalla espantándolas a manotazos! La llave cae rodando. ¡Mía!',
        give: 'clau1', remove: ['alpiste'], flag: 'key1',
      },
    },
  },
  {
    id: 'ocellaire', name: 'el pajarero', x: 234, y: 88, w: 32, h: 48,
    feet: { x: 250, y: 134 }, walkTo: { x: 228, y: 136 }, facing: 'left', color: [150, 210, 150],
    look: 'El pajarero, rodeado de jaulas. Sus canarios cantan; sus palomas conspiran.',
    draw: drawOcellaire, dialogue: OCELLAIRE_DIALOGUE,
  },
  {
    id: 'florista', name: 'la florista', x: 54, y: 88, w: 32, h: 48,
    feet: { x: 70, y: 134 }, walkTo: { x: 92, y: 136 }, facing: 'right', color: [230, 150, 170],
    look: 'La florista, con una bandeja de flores más colorida que una fiesta mayor.',
    draw: drawFlorista, dialogue: FLORISTA_DIALOGUE,
  },
];

const EXITS: Exit[] = [
  { id: 'toBorn', name: 'el Born', x: 304, y: 96, w: 16, h: 46, walkTo: { x: 300, y: 135 }, to: 'elborn', entry: { x: 30, y: 135 }, arrow: 'right' },
];

export const RAMBLA: Room = {
  id: 'rambla',
  build: buildRamblaScene,
  hotspots: HOTSPOTS,
  npcs: NPCS,
  exits: EXITS,
  walk: { minX: 16, maxX: 304, minY: 108, maxY: 140 },
  start: { x: 60, y: 135 },
};
