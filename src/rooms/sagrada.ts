import { P, css, type RGB } from '../art/palette';
import { Pixels, rampPick } from '../art/dither';
import { drawArquitecto, drawMason } from '../art/actor';
import { ARQUITECTO_DIALOGUE, MASON_DIALOGUE } from '../content/dialogues';
import type { Room, NPC, Hotspot, Exit } from '../engine/types';

const STONE: RGB = [196, 176, 138];
const STONE_D: RGB = [156, 138, 104];
const STONE_L: RGB = [220, 200, 160];
const WOOD: RGB = [140, 96, 56];
const WOOD_D: RGB = [96, 62, 36];
const DIRT: RGB = [134, 112, 84];
const DIRT_D: RGB = [108, 88, 64];

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

function column(ctx: CanvasRenderingContext2D, x: number, top: number) {
  r(ctx, x, top, 16, 100 - top, STONE);
  r(ctx, x + 1, top, 3, 100 - top, STONE_L);
  r(ctx, x + 12, top, 3, 100 - top, STONE_D);
  for (let y = top + 6; y < 100; y += 9) r(ctx, x, y, 16, 1, STONE_D); // courses
  r(ctx, x - 2, top - 4, 20, 5, STONE_D); // rough unfinished top
}

export function buildSagradaScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 144;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // base fill so there are NEVER transparent gaps behind the columns/scaffold
  r(ctx, 0, 0, 320, 144, [150, 182, 208]);

  // bright work-day sky
  const img = ctx.createImageData(320, 44);
  const px = new Pixels(img, 320, 44);
  const sky: RGB[] = [[96, 134, 176], [150, 182, 208], [206, 224, 232]];
  for (let y = 0; y < 44; y++) for (let x = 0; x < 320; x++) px.set(x, y, rampPick(sky, y / 44, x, y));
  ctx.putImageData(img, 0, 0);

  // rising columns of the future temple
  column(ctx, 118, 30);
  column(ctx, 196, 24);
  // a half-built arch springing between them
  r(ctx, 134, 30, 62, 6, STONE_D);
  r(ctx, 134, 28, 62, 2, STONE_L);

  // scaffolding around the right column
  for (const sx of [190, 218]) r(ctx, sx, 26, 2, 74, WOOD_D);
  for (let y = 36; y < 100; y += 16) r(ctx, 190, y, 30, 2, WOOD);
  r(ctx, 188, 24, 34, 2, WOOD); // top plank (planos pinned here)

  // a timber crane with a hanging block (right)
  r(ctx, 272, 20, 3, 80, WOOD_D);
  r(ctx, 250, 20, 25, 2, WOOD_D);
  ctx.strokeStyle = css(P.woodShadow); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(252, 21); ctx.lineTo(252, 52); ctx.stroke();
  blk(ctx, 246, 52, 14, 10, STONE); // hanging block

  // ground / rubble
  r(ctx, 0, 100, 320, 44, DIRT);
  r(ctx, 0, 100, 320, 1, [156, 132, 100]);
  for (let y = 106; y < 144; y += 6) for (let x = ((y / 6) % 2) * 5; x < 320; x += 11) r(ctx, x, y, 3, 2, ((x + y) % 5 < 2) ? DIRT_D : DIRT);

  // stacked stone blocks (left)
  for (let i = 0; i < 3; i++) blk(ctx, 40 + (i % 2) * 4, 100 - i * 9, 26, 9, STONE);

  // the architect's easel showing the finished temple (anachronism gag)
  r(ctx, 12, 96, 2, 14, WOOD_D); r(ctx, 30, 96, 2, 14, WOOD_D);
  blk(ctx, 8, 72, 28, 26, [232, 224, 200]);
  ctx.fillStyle = css([70, 60, 90]);
  for (const sx of [13, 18, 23, 28]) { ctx.beginPath(); ctx.moveTo(sx, 94); ctx.lineTo(sx - 2, 78); ctx.lineTo(sx + 2, 78); ctx.closePath(); ctx.fill(); } // sketched spires

  // the first stone (front-centre); the ceremonial key is drawn live until taken
  blk(ctx, 128, 108, 34, 18, STONE_L);
  r(ctx, 130, 110, 30, 2, STONE_L);
  r(ctx, 128, 122, 34, 4, STONE_D);
  r(ctx, 144, 108, 8, 1, P.flagRed); // a little ceremony ribbon

  return cv;
}

export function drawCeremonyKey(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = css([232, 202, 112]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(141, 104, 2.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = css([232, 202, 112]);
  ctx.fillRect(143, 103, 7, 2); ctx.fillRect(148, 105, 2, 2);
  ctx.fillStyle = css([255, 240, 184]); ctx.fillRect(140, 102, 1, 1);
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'piedra', name: 'la primera piedra', x: 126, y: 102, w: 38, h: 24, walkTo: { x: 144, y: 138 },
    look: 'La primera piedra del templo, con una llave ceremonial encima. Reluce, recién colocada para la ocasión.',
    pickup: { id: 'clau3', name: 'la tercera clave' },
    pickupIf: 'architect_gone',
    pickupBlocked: 'En cuanto alargo la mano, el arquitecto me espanta agitando los brazos como un molino. Habrá que quitarlo de en medio.',
    responses: { Coger: 'Con el arquitecto distraído en su rincón, levanto la llave de la primera piedra. ¡La tercera es mía!' },
  },
  {
    id: 'planos', name: 'los planos', x: 196, y: 42, w: 18, h: 14, walkTo: { x: 206, y: 138 },
    look: 'Unos planos enrollados, enganchados en lo alto del andamio. Deben de ser los del arquitecto.',
    responses: { Coger: 'Rescato los planos del andamio. El arquitecto va a llorar de alegría.' },
    pickup: { id: 'planos', name: 'los planos' },
  },
  { id: 'cartel', name: 'el dibujo del templo', x: 8, y: 70, w: 30, h: 28, walkTo: { x: 28, y: 138 }, look: 'Un dibujo del templo acabado: una selva de torres apuntando al cielo. Una nota dice "estreno: dentro de unos 150 años". Optimista, el hombre.' },
  { id: 'grua', name: 'la grúa', x: 246, y: 18, w: 30, h: 46, walkTo: { x: 262, y: 138 }, look: 'Una grúa de madera con un sillar colgando. Pienso no pasar por debajo.' },
  { id: 'andamio', name: 'el andamio', x: 188, y: 24, w: 34, h: 76, walkTo: { x: 200, y: 138 }, look: 'Andamios de madera trepando por la piedra. El futuro, a cámara muy lenta.' },
];

const NPCS: NPC[] = [
  {
    id: 'arquitecto', name: 'el arquitecto', x: 172, y: 80, w: 30, h: 50,
    feet: { x: 186, y: 128 }, walkTo: { x: 166, y: 135 }, facing: 'left', color: [220, 210, 240],
    look: 'El arquitecto, barba al viento y mirada de iluminado, montando guardia ante la primera piedra.',
    draw: drawArquitecto, dialogue: ARQUITECTO_DIALOGUE,
    hideIf: 'architect_gone',
    accepts: {
      planos: { line: '¡MIS PLANOS! ¡Bendito pirata! Disculpa, debo replantear la nave central AHORA MISMO, antes de que se me escape la curvatura de la cabeza...', flag: 'architect_gone', remove: ['planos'] },
    },
  },
  {
    id: 'mason', name: 'el cantero', x: 80, y: 84, w: 28, h: 48,
    feet: { x: 94, y: 132 }, walkTo: { x: 112, y: 136 }, facing: 'right', color: [200, 190, 160],
    look: 'Un cantero cubierto de polvo, tallando un sillar sin demasiada prisa.',
    draw: drawMason, dialogue: MASON_DIALOGUE,
  },
];

const EXITS: Exit[] = [
  { id: 'toBorn', name: 'el Born', x: 0, y: 100, w: 16, h: 42, walkTo: { x: 20, y: 136 }, to: 'elborn', entry: { x: 286, y: 135 }, arrow: 'left' },
];

export const SAGRADA: Room = {
  id: 'sagrada',
  build: buildSagradaScene,
  dynamic: (ctx, state) => { if (!state.flags.took_clau3) drawCeremonyKey(ctx); },
  hotspots: HOTSPOTS,
  npcs: NPCS,
  exits: EXITS,
  walk: { minX: 16, maxX: 304, minY: 108, maxY: 140 },
  start: { x: 30, y: 135 },
};
