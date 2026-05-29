import { P, css, type RGB } from '../art/palette';
import { Pixels, rampPick, ditherPick } from '../art/dither';
import { drawGuard } from '../art/actor';
import { GUARDIA_DIALOGUE } from '../content/dialogues';
import type { Room, NPC, Hotspot, Exit } from '../engine/types';

const GROUND: RGB = [112, 96, 78];
const GROUND_D: RGB = [86, 72, 58];
const DARKOPEN: RGB = [26, 22, 26];
const FLAME: RGB = [248, 196, 96];

function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

export function buildGateScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 144;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // dramatic late-afternoon sky
  const img = ctx.createImageData(320, 50);
  const px = new Pixels(img, 320, 50);
  const sky: RGB[] = [P.skyTop, P.skyUpper, P.skyMid, P.skyHorizon];
  for (let y = 0; y < 50; y++) for (let x = 0; x < 320; x++) px.set(x, y, rampPick(sky, y / 50, x, y));
  ctx.putImageData(img, 0, 0);

  // castle keep rising behind the wall (top right)
  r(ctx, 232, 12, 40, 28, P.stone);
  r(ctx, 258, 14, 14, 26, P.stoneLit);
  r(ctx, 232, 36, 40, 4, P.stoneShadow);
  for (let i = 0; i < 6; i++) r(ctx, 233 + i * 6, 8, 3, 4, P.stone);
  r(ctx, 264, 2, 4, 6, P.flagRed);

  // the great fortress wall
  r(ctx, 0, 46, 320, 60, P.stone);
  r(ctx, 0, 46, 320, 2, P.stoneLit);
  r(ctx, 0, 102, 320, 4, P.stoneShadow);
  // mortar grid
  ctx.fillStyle = css(P.stoneShadow);
  for (let y = 50; y < 102; y += 8) ctx.fillRect(0, y, 320, 1);
  for (let y = 50; y < 102; y += 8) {
    const off = ((y / 8) % 2) * 12;
    for (let x = off; x < 320; x += 24) ctx.fillRect(x, y, 1, 8);
  }
  // battlements
  for (let x = 0; x < 320; x += 16) r(ctx, x, 42, 10, 6, P.stone);

  // the gate: arch + closed wooden doors (centre)
  const gx = 128, gw = 64;
  r(ctx, gx - 4, 58, gw + 8, 48, P.stoneShadow);       // recessed frame
  r(ctx, gx, 62, gw, 44, DARKOPEN);                    // opening
  // wooden doors
  r(ctx, gx + 1, 64, gw / 2 - 1, 42, P.woodDark);
  r(ctx, gx + gw / 2, 64, gw / 2 - 1, 42, P.wood);
  for (let i = 0; i < gw; i += 6) r(ctx, gx + i, 64, 1, 42, P.woodShadow);
  r(ctx, gx + gw / 2 - 1, 64, 2, 42, P.black);         // centre seam
  r(ctx, gx + gw / 2 - 4, 82, 8, 3, P.stone);          // iron ring handles
  // arch voussoirs
  ctx.fillStyle = css(P.stoneLit);
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI - (i / 8) * Math.PI;
    const ax = gx + gw / 2 + Math.cos(a) * (gw / 2 + 2);
    const ay = 62 + Math.sin(a) * -10 + 4;
    ctx.fillRect((ax | 0) - 1, (ay | 0) - 4, 4, 5);
  }

  // flanking torches
  for (const tx of [gx - 14, gx + gw + 10]) {
    r(ctx, tx, 70, 2, 14, P.woodDark);
    r(ctx, tx - 1, 66, 4, 4, FLAME);
    r(ctx, tx, 64, 2, 3, P.sunCore);
  }

  // ground / path
  r(ctx, 0, 104, 320, 40, GROUND);
  r(ctx, 0, 104, 320, 1, [140, 124, 104]);
  for (let y = 110; y < 144; y += 6) {
    for (let x = ((y / 6) % 2) * 5; x < 320; x += 10) r(ctx, x, y, 4, 2, ((x + y) % 5 < 2) ? GROUND_D : GROUND);
  }

  return cv;
}

export function gateOverlays(ctx: CanvasRenderingContext2D, t: number) {
  // torch flicker
  for (const tx of [114, 202]) {
    const f = 0.7 + 0.3 * Math.sin(t * 11 + tx);
    const g = ctx.createRadialGradient(tx, 67, 1, tx, 67, 12);
    g.addColorStop(0, 'rgba(255,200,110,' + (0.5 * f).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,200,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(tx - 13, 54, 26, 26);
  }
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'puerta', name: 'la puerta de Montjuïc', x: 128, y: 58, w: 64, h: 48, walkTo: { x: 150, y: 134 },
    look: 'La puerta del castillo. Cerrada, enorme y muy poco impresionada por mí.',
    responses: { Abrir: 'Ni se inmuta. Necesitaré algo más que mis bíceps. Como, por ejemplo, permiso.', Empujar: 'Empujo con todo. La puerta gana. La puerta siempre gana.' },
  },
  { id: 'castillo', name: 'el castillo', x: 230, y: 6, w: 46, h: 36, walkTo: { x: 230, y: 132 }, look: 'El castell de Montjuïc. Tan cerca que casi huelo el secreto. Casi.' },
  { id: 'antorcha', name: 'la antorcha', x: 110, y: 62, w: 8, h: 20, walkTo: { x: 122, y: 136 }, look: 'Una antorcha. Cálida, peligrosa y muy del montón medieval.' },
];

const NPCS: NPC[] = [
  {
    id: 'guardia', name: 'la guardia', x: 152, y: 80, w: 28, h: 52,
    feet: { x: 166, y: 131 }, walkTo: { x: 140, y: 135 }, facing: 'left', color: [180, 200, 220],
    look: 'La guardia del castillo. Armadura reluciente, expresión de no-vas-a-pasar.',
    draw: drawGuard, dialogue: GUARDIA_DIALOGUE,
    accepts: {
      salvoconducto: {
        line: 'Sellado y en regla. Bien... adelante. Y mucha suerte ahí arriba: vas a necesitarla.',
        win: true,
      },
    },
  },
];

const EXITS: Exit[] = [
  { id: 'toMercat', name: 'el Mercat', x: 0, y: 104, w: 16, h: 38, walkTo: { x: 20, y: 135 }, to: 'mercat', entry: { x: 296, y: 135 }, arrow: 'left' },
];

export const GATE: Room = {
  id: 'gate',
  build: buildGateScene,
  overlays: gateOverlays,
  hotspots: HOTSPOTS,
  npcs: NPCS,
  exits: EXITS,
  walk: { minX: 16, maxX: 304, minY: 116, maxY: 140 },
  start: { x: 30, y: 135 },
};
