import { P, css, type RGB } from '../art/palette';
import { Pixels, rampPick } from '../art/dither';
import { drawChurrero, drawChocolatera } from '../art/actor';
import { CHURRERO_DIALOGUE, CHOCOLATERA_DIALOGUE } from '../content/dialogues';
import type { Room, NPC, Hotspot, Exit } from '../engine/types';

const WALL_B: RGB = [212, 182, 134];
const COBBLE: RGB = [126, 112, 98];
const COBBLE_D: RGB = [96, 84, 74];
const COBBLE_L: RGB = [150, 136, 120];
const AWNING: RGB = [186, 78, 70];
const DARK: RGB = [40, 34, 40];

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

function stall(ctx: CanvasRenderingContext2D, x: number, potColor: RGB) {
  // striped awning
  for (let i = 0; i < 11; i++) r(ctx, x + i * 5, 96, 5, 7, i % 2 ? AWNING : P.parchment);
  r(ctx, x, 103, 55, 2, P.woodDark);
  // counter
  blk(ctx, x + 4, 116, 47, 14, P.wood);
  r(ctx, x + 5, 117, 45, 3, P.woodLit);
  // a pot on the counter
  blk(ctx, x + 18, 109, 16, 9, potColor);
  r(ctx, x + 18, 109, 16, 2, P.black);
  // posts
  r(ctx, x + 2, 103, 2, 13, P.woodDark);
  r(ctx, x + 50, 103, 2, 13, P.woodDark);
}

export function buildMercatScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 144;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // sky (bright midday)
  const img = ctx.createImageData(320, 40);
  const px = new Pixels(img, 320, 40);
  const sky: RGB[] = [[100, 138, 172], [156, 186, 208], [204, 222, 232]];
  for (let y = 0; y < 40; y++) for (let x = 0; x < 320; x++) px.set(x, y, rampPick(sky, y / 40, x, y));
  ctx.putImageData(img, 0, 0);

  // facades
  for (let bx = 0; bx < 320; bx += 44) {
    const wc = ((bx / 44) | 0) % 2 ? P.wall : WALL_B;
    r(ctx, bx, 34, 44, 70, wc);
    r(ctx, bx, 31, 44, 4, P.roofShadow);
    r(ctx, bx, 34, 1, 70, P.wallShadow);
    // windows
    for (let wy = 44; wy < 96; wy += 24) {
      for (let wx = bx + 8; wx < bx + 40; wx += 18) {
        blk(ctx, wx, wy, 10, 13, P.winDark);
        r(ctx, wx - 1, wy + 13, 12, 1, P.wallShadow);
        r(ctx, wx, wy + 14, 11, 2, ((wx + wy) % 3) ? P.roof : P.wallLit); // shutters/flowerbox
      }
    }
  }
  // alley openings (the exits)
  r(ctx, 0, 40, 14, 64, DARK);
  r(ctx, 13, 40, 1, 64, P.wallShadow);
  r(ctx, 306, 40, 14, 64, DARK);
  r(ctx, 306, 40, 1, 64, P.wallShadow);

  // bunting across the top
  for (let x = 4; x < 316; x += 14) {
    const c: RGB = (x / 14) % 2 ? AWNING : [70, 120, 150];
    ctx.fillStyle = css(c);
    ctx.beginPath();
    ctx.moveTo(x, 34); ctx.lineTo(x + 10, 34); ctx.lineTo(x + 5, 41);
    ctx.closePath(); ctx.fill();
  }
  r(ctx, 0, 33, 320, 1, P.woodDark);

  // hanging jamón on a facade
  r(ctx, 150, 44, 3, 9, P.roof);
  ctx.fillStyle = css([198, 150, 120]);
  ctx.beginPath(); ctx.moveTo(149, 52); ctx.lineTo(155, 52); ctx.lineTo(152, 64); ctx.closePath(); ctx.fill();
  r(ctx, 151, 62, 2, 2, P.cloud); // the little white tip

  // cobblestone street
  r(ctx, 0, 102, 320, 42, COBBLE);
  r(ctx, 0, 102, 320, 1, COBBLE_L);
  for (let y = 106; y < 144; y += 5) {
    for (let x = ((y / 5) % 2) * 4; x < 320; x += 8) {
      r(ctx, x, y, 3, 2, ((x + y) % 7 < 3) ? COBBLE_D : COBBLE_L);
    }
  }

  // the two stalls
  stall(ctx, 48, [120, 80, 50]);   // churrero (oil pot)
  stall(ctx, 208, [78, 48, 32]);   // chocolatera (chocolate pot)

  return cv;
}

// dropped coin, drawn each frame so it vanishes when picked up
export function drawCoin(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = css(P.stoneShadow);
  ctx.beginPath(); ctx.arc(150, 128, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = css(P.winLit);
  ctx.beginPath(); ctx.arc(150, 128, 2, 0, Math.PI * 2); ctx.fill();
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'moneda', name: 'la moneda', x: 144, y: 123, w: 14, h: 12, walkTo: { x: 150, y: 138 },
    look: 'Una moneda en el suelo. Brilla con un descaro casi insultante.',
    responses: { Coger: '¡Una moneda! El destino me sonríe. O alguien muy torpe acaba de pasar.' },
    pickup: { id: 'moneda', name: 'la moneda' },
  },
  { id: 'jamon', name: 'el jamón', x: 147, y: 44, w: 10, h: 22, walkTo: { x: 152, y: 138 }, look: 'Un jamón colgado. Me observa. O eso me parece.' },
  { id: 'puesto1', name: 'el puesto de xurros', x: 48, y: 96, w: 56, h: 20, walkTo: { x: 96, y: 136 }, look: 'El puesto del churrero. Huele a gloria frita.' },
  { id: 'puesto2', name: 'el puesto de xocolata', x: 208, y: 96, w: 56, h: 20, walkTo: { x: 200, y: 136 }, look: 'El puesto de la chocolatera. El aroma me abraza el alma.' },
];

const NPCS: NPC[] = [
  {
    id: 'churrero', name: 'el churrero', x: 64, y: 80, w: 28, h: 50,
    feet: { x: 78, y: 128 }, walkTo: { x: 100, y: 134 }, facing: 'left', color: [240, 200, 120],
    look: 'El churrero, sujetando su toldo con cara de mártir.',
    draw: drawChurrero, dialogue: CHURRERO_DIALOGUE,
    accepts: {
      cuerda: { line: '¡Maravilla! Sujeta esto y... ¡listo! Toma, un cucurucho de los buenos, recién hechos.', give: 'churros', remove: ['cuerda'] },
    },
  },
  {
    id: 'chocolatera', name: 'la chocolatera', x: 222, y: 84, w: 28, h: 48,
    feet: { x: 236, y: 130 }, walkTo: { x: 214, y: 134 }, facing: 'right', color: [230, 150, 150],
    look: 'La chocolatera, removiendo un pozo de chocolate negro como la noche.',
    draw: drawChocolatera, dialogue: CHOCOLATERA_DIALOGUE,
    accepts: {
      moneda: { line: 'Una moneda, una tacita. Cuidado, que quema más que la lengua de mi suegra.', give: 'xocolata', remove: ['moneda'] },
    },
  },
];

const EXITS: Exit[] = [
  { id: 'toPort', name: 'el puerto', x: 0, y: 100, w: 16, h: 42, walkTo: { x: 20, y: 135 }, to: 'port', entry: { x: 296, y: 136 }, arrow: 'left' },
  { id: 'toGate', name: 'el camino a Montjuïc', x: 304, y: 96, w: 16, h: 46, walkTo: { x: 300, y: 135 }, to: 'gate', entry: { x: 30, y: 135 }, arrow: 'right' },
];

export const MERCAT: Room = {
  id: 'mercat',
  build: buildMercatScene,
  dynamic: (ctx, state) => { if (!state.flags.took_moneda) drawCoin(ctx); },
  hotspots: HOTSPOTS,
  npcs: NPCS,
  exits: EXITS,
  walk: { minX: 16, maxX: 302, minY: 114, maxY: 140 },
  start: { x: 30, y: 135 },
};
