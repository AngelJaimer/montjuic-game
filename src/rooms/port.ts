import { P, css, mix, type RGB } from '../art/palette';
import { Pixels, rampPick, ditherPick } from '../art/dither';
import { drawAduanero, drawStan } from '../art/actor';
import { ADUANERO_DIALOGUE, STAN_DIALOGUE, type Dialogue } from '../content/dialogues';
import { tr } from '../i18n';

// Play-area dimensions (the painted scene; the verb panel lives below it).
export const PLAY_W = 320;
export const PLAY_H = 144;
export const HORIZON = 80;
const SEA_BOTTOM = 112; // top edge of the wooden quay
const SUN_X = 238;
const SUN_Y = 58;

// --- tiny draw helpers (all palette-pure) ---
function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}
// outlined block: 1px black border + colour fill (the SCUMM "drawn object" look)
function blk(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB, o: RGB = P.black) {
  ctx.fillStyle = css(o);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  ctx.fillStyle = css(c);
  ctx.fillRect((x | 0) + 1, (y | 0) + 1, Math.max(0, (w | 0) - 2), Math.max(0, (h | 0) - 2));
}
function tri(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
  ctx.closePath(); ctx.fill();
}
function label(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, c: RGB, size = 6) {
  ctx.font = 'bold ' + size + 'px "Courier New", monospace';
  ctx.textBaseline = 'top';
  ctx.fillStyle = css(P.black);
  ctx.fillText(s, x + 1, y + 1);
  ctx.fillStyle = css(c);
  ctx.fillText(s, x, y);
}
function ellipseCov(x: number, y: number, cx: number, cy: number, rx: number, ry: number): number {
  const dx = (x - cx) / rx, dy = (y - cy) / ry;
  const d = dx * dx + dy * dy;
  return d < 1 ? 1 - d : 0;
}

export function buildPortScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = PLAY_W;
  cv.height = PLAY_H;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // ---------- 1) Sky + sea, dithered, via ImageData ----------
  const img = ctx.createImageData(PLAY_W, PLAY_H);
  const px = new Pixels(img, PLAY_W, PLAY_H);
  const skyRamp = [P.skyTop, P.skyUpper, P.skyMid, mix(P.skyMid, P.skyLow, 0.5), P.skyLow, P.skyHorizon];
  const seaRamp = [P.seaFar, P.seaMid, P.seaNear, P.seaDeep];
  const crest = mix(P.seaFar, P.seaGlint, 0.4);

  for (let y = 0; y < PLAY_H; y++) {
    for (let x = 0; x < PLAY_W; x++) {
      if (y < HORIZON) {
        let c = rampPick(skyRamp, y / HORIZON, x, y);
        // soft clouds
        const cov = Math.max(
          ellipseCov(x, y, 64, 24, 36, 7),
          ellipseCov(x, y, 150, 16, 26, 5) * 0.9,
          ellipseCov(x, y, 116, 32, 20, 4.5) * 0.8,
        );
        if (cov > 0) c = ditherPick(c, P.cloud, cov, x, y);
        // sun glow + core
        const dx = x - SUN_X, dy = (y - SUN_Y) * 1.5;
        const d = Math.sqrt(dx * dx + dy * dy);
        const g = 1 - d / 72; if (g > 0) c = ditherPick(c, P.sunGlow, g, x, y);
        const g2 = 1 - d / 24; if (g2 > 0) c = ditherPick(c, P.sunCore, g2, x, y);
        px.set(x, y, c);
      } else {
        const t = (y - HORIZON) / (PLAY_H - HORIZON);
        let c = rampPick(seaRamp, t, x, y);
        // shimmering sun reflection pillar
        const reflW = 4 + (y - HORIZON) * 0.6;
        const adx = Math.abs(x - SUN_X);
        if (adx < reflW) {
          const shimmer = Math.sin(y * 0.8 + x * 0.4) * 0.5 + 0.5;
          c = ditherPick(c, P.seaGlint, shimmer * (1 - adx / reflW) * 0.5, x, y);
        }
        // wave crest bands
        if (y % 4 === 0) {
          const rip = (Math.sin(x * 0.22 + y * 0.5) * 0.5 + 0.5) * 0.3;
          c = ditherPick(c, crest, rip, x, y);
        }
        px.set(x, y, c);
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // ---------- 2) Distant hazy skyline (left) ----------
  const haze = mix(P.wall, P.skyHorizon, 0.4);
  const hazeDk = mix(P.wallShadow, P.skyHorizon, 0.28);
  const hazeRoof = mix(P.roof, P.skyHorizon, 0.34);
  const heights = [10, 14, 8, 12, 9, 15, 11, 8, 13];
  for (let i = 0; i < heights.length; i++) {
    const bx = 2 + i * 15;
    const bh = heights[i];
    r(ctx, bx, HORIZON - bh, 12, bh, i % 2 ? haze : hazeDk);
    if (i % 3 === 0) {
      r(ctx, bx - 1, HORIZON - bh - 2, 14, 2, hazeDk); // flat roof
    } else {
      tri(ctx, bx - 1, HORIZON - bh, bx + 13, HORIZON - bh, bx + 6, HORIZON - bh - 4, hazeRoof);
    }
  }
  // a cathedral with two spires (the tallest landmark)
  r(ctx, 54, HORIZON - 24, 17, 24, hazeDk);
  tri(ctx, 54, HORIZON - 24, 62, HORIZON - 34, 71, HORIZON - 24, hazeRoof);
  r(ctx, 57, HORIZON - 32, 2, 9, hazeDk);
  r(ctx, 66, HORIZON - 30, 2, 7, hazeDk);
  tri(ctx, 56, HORIZON - 32, 58, HORIZON - 36, 60, HORIZON - 32, hazeDk);

  // ---------- 3) Montjuïc hill + castle (right) ----------
  ctx.fillStyle = css(P.hillMid);
  ctx.beginPath();
  ctx.moveTo(192, HORIZON);
  ctx.lineTo(230, 52);
  ctx.lineTo(268, 34);
  ctx.lineTo(300, 30);
  ctx.lineTo(320, 42);
  ctx.lineTo(320, HORIZON);
  ctx.closePath();
  ctx.fill();
  // shadowed left flank
  tri(ctx, 192, HORIZON, 230, 52, 256, HORIZON, P.hillDark);
  // sun-lit ridge
  ctx.fillStyle = css(P.hillLit);
  ctx.beginPath();
  ctx.moveTo(268, 34); ctx.lineTo(300, 30); ctx.lineTo(300, 35); ctx.lineTo(270, 39);
  ctx.closePath(); ctx.fill();
  // castle on the peak
  blk(ctx, 274, 20, 24, 14, P.stone);
  r(ctx, 287, 21, 10, 12, P.stoneLit);
  r(ctx, 275, 30, 22, 3, P.stoneShadow);
  for (let i = 0; i < 6; i++) r(ctx, 275 + i * 4, 17, 2, 3, P.stone);
  blk(ctx, 292, 11, 8, 11, P.stone);
  r(ctx, 296, 12, 3, 9, P.stoneLit);
  for (let i = 0; i < 2; i++) r(ctx, 292 + i * 4, 9, 2, 2, P.stone);
  r(ctx, 298, 6, 4, 2, P.flagRed); // castle pennant

  // ---------- 4) Aduana (customs house, left foreground) ----------
  const byTop = 46, byBot = 116, bw = 74;
  blk(ctx, -1, byTop, bw + 1, byBot - byTop, P.wall);
  r(ctx, bw - 12, byTop + 1, 11, byBot - byTop - 2, P.wallLit); // sun-lit right face
  r(ctx, 0, byTop + 1, 7, byBot - byTop - 2, P.wallShadow);     // shadowed left
  // tiled roof overhang
  blk(ctx, -3, byTop - 11, bw + 7, 13, P.roof);
  r(ctx, -3, byTop - 11, bw + 7, 3, P.roofLit);
  r(ctx, -3, byTop - 1, bw + 7, 2, P.roofShadow);
  for (let i = 0; i < bw + 7; i += 4) r(ctx, -3 + i, byTop - 9, 1, 9, P.roofShadow);
  // windows (one lit)
  const win = (wx: number, wy: number, lit: boolean) => {
    blk(ctx, wx, wy, 11, 13, lit ? P.winLit : P.winDark);
    r(ctx, wx + 5, wy, 1, 13, P.wallShadow);
    r(ctx, wx, wy + 6, 11, 1, P.wallShadow);
    r(ctx, wx - 1, wy + 13, 13, 2, P.wallShadow); // sill
  };
  win(12, 58, false);
  win(46, 58, true);
  win(12, 86, false);
  // arched door
  blk(ctx, 44, 92, 18, 24, P.woodDark);
  r(ctx, 46, 95, 14, 21, P.wood);
  r(ctx, 52, 96, 1, 18, P.woodDark);
  tri(ctx, 44, 94, 53, 88, 62, 94, P.woodDark);
  // hanging sign
  blk(ctx, 20, 74, 30, 9, P.parchment);
  label(ctx, tr('ADUANA'), 24, 75, P.woodShadow, 6);
  r(ctx, 34, 71, 1, 3, P.woodDark);

  // lantern post (right of the Aduana)
  r(ctx, 81, 92, 2, 22, P.woodDark);
  blk(ctx, 77, 84, 10, 9, P.woodDark);
  r(ctx, 79, 86, 6, 5, P.winLit); // lit pane (glow added live in main.ts)
  tri(ctx, 77, 84, 82, 80, 87, 84, P.woodDark);

  // ---------- 5) Boats ----------
  // galleon, moored mid-right
  const gx = 150;
  ctx.fillStyle = css(P.woodDark);
  ctx.beginPath();
  ctx.moveTo(gx, 100); ctx.lineTo(gx + 64, 100); ctx.lineTo(gx + 56, 111); ctx.lineTo(gx + 8, 111);
  ctx.closePath(); ctx.fill();
  r(ctx, gx, 98, 64, 3, P.wood);
  r(ctx, gx + 2, 99, 60, 1, P.woodLit);
  for (let i = 0; i < 5; i++) r(ctx, gx + 8 + i * 11, 103, 4, 4, P.woodShadow); // gunports
  // masts
  r(ctx, gx + 18, 40, 2, 60, P.woodDark);
  r(ctx, gx + 42, 50, 2, 50, P.woodDark);
  // yards + furled sails
  r(ctx, gx + 6, 54, 26, 2, P.woodDark);
  blk(ctx, gx + 8, 56, 22, 13, P.sail);
  r(ctx, gx + 9, 63, 20, 5, P.sailShadow);
  r(ctx, gx + 30, 62, 26, 2, P.woodDark);
  blk(ctx, gx + 33, 64, 20, 11, P.sail);
  r(ctx, gx + 34, 70, 18, 4, P.sailShadow);
  // rigging
  ctx.strokeStyle = css(P.rope);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx + 19, 41); ctx.lineTo(gx + 2, 99);
  ctx.moveTo(gx + 19, 41); ctx.lineTo(gx + 62, 99);
  ctx.moveTo(gx + 43, 51); ctx.lineTo(gx + 19, 41);
  ctx.stroke();

  // small rowboat near the quay
  ctx.fillStyle = css(P.wood);
  ctx.beginPath();
  ctx.moveTo(96, 106); ctx.lineTo(124, 106); ctx.lineTo(119, 113); ctx.lineTo(101, 113);
  ctx.closePath(); ctx.fill();
  r(ctx, 96, 105, 28, 2, P.woodLit);
  r(ctx, 108, 106, 1, 7, P.woodDark);
  r(ctx, 109, 100, 2, 6, P.woodDark); // little oar/post

  // ---------- 6) The wooden quay (foreground) ----------
  r(ctx, 0, SEA_BOTTOM - 2, 320, 3, P.woodDark); // edge beam
  r(ctx, 0, SEA_BOTTOM - 2, 320, 1, P.woodLit);
  r(ctx, 0, SEA_BOTTOM + 1, 320, PLAY_H - SEA_BOTTOM - 1, P.wood);
  // plank seams (run toward viewer) + per-plank highlight
  for (let x = 0; x <= 320; x += 13) {
    r(ctx, x, SEA_BOTTOM + 1, 1, PLAY_H - SEA_BOTTOM, P.woodShadow);
    r(ctx, x + 1, SEA_BOTTOM + 1, 1, PLAY_H - SEA_BOTTOM, P.woodLit);
  }
  // subtle darkening toward the very front
  for (let y = SEA_BOTTOM + 1; y < PLAY_H; y++) {
    const f = (y - SEA_BOTTOM) / (PLAY_H - SEA_BOTTOM);
    if (((y * 7) % 16) / 16 < f * 0.5) r(ctx, 0, y, 320, 1, P.woodShadow);
  }
  // pilings poking up through the quay front
  for (const pxp of [16, 150, 252, 306]) {
    r(ctx, pxp, SEA_BOTTOM - 8, 5, 10, P.woodDark);
    r(ctx, pxp + 3, SEA_BOTTOM - 8, 2, 10, P.woodShadow);
    r(ctx, pxp, SEA_BOTTOM - 9, 5, 2, P.woodLit);
  }

  // ---------- 7) Props ----------
  // barrel
  blk(ctx, 146, 120, 15, 16, P.wood);
  r(ctx, 148, 120, 11, 16, P.woodLit);
  r(ctx, 146, 123, 15, 2, P.woodDark);
  r(ctx, 146, 131, 15, 2, P.woodDark);
  r(ctx, 152, 120, 2, 16, P.woodShadow);
  // crate
  blk(ctx, 250, 118, 20, 18, P.wood);
  r(ctx, 252, 120, 16, 14, P.woodLit);
  ctx.strokeStyle = css(P.woodDark);
  ctx.beginPath();
  ctx.moveTo(252, 120); ctx.lineTo(268, 134);
  ctx.moveTo(268, 120); ctx.lineTo(252, 134);
  ctx.stroke();
  // (the coil of rope is drawn dynamically in drawRope so it can be picked up)
  // bollard with rope to a piling
  blk(ctx, 304, SEA_BOTTOM + 2, 7, 9, P.woodDark);
  r(ctx, 306, SEA_BOTTOM + 2, 3, 9, P.wood);

  return cv;
}

// The coil of rope, drawn each frame so it can disappear when picked up.
export function drawRope(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = css(i % 2 ? P.rope : P.woodShadow);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(46, 130, 9 - i * 2, 4 - i, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function ropeIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = css(i % 2 ? P.rope : P.woodShadow);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 11, 7 - i * 2, 4 - i, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
export const ITEM_ICONS: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void> = {
  cuerda: ropeIcon,
};

// ---------- interaction data ----------
export interface Hotspot {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number;
  walkTo: { x: number; y: number };
  look: string;
  responses?: Record<string, string>;
  pickup?: { id: string; name: string };
}

export const PORT_WALK = { minX: 14, maxX: 306, minY: 122, maxY: 140 };
export const PORT_START = { x: 100, y: 138 };

// Ordered foreground-first so small props win the hit-test over big backdrops.
export const PORT_HOTSPOTS: Hotspot[] = [
  {
    id: 'cuerda', name: 'la cuerda', x: 34, y: 124, w: 24, h: 14, walkTo: { x: 50, y: 138 },
    look: 'Una cuerda bien enrollada. Muy de fiar, a diferencia de los piratas de por aquí.',
    responses: { Coger: 'Una buena cuerda. En esta vida nunca se sabe cuándo tendrás que atar a alguien.' },
    pickup: { id: 'cuerda', name: 'la cuerda' },
  },
  {
    id: 'barril', name: 'el barril', x: 145, y: 119, w: 17, h: 18, walkTo: { x: 138, y: 139 },
    look: 'Un barril. Podría contener ron, agua... o lágrimas de marinero.',
    responses: { Empujar: 'Rueda un poco y vuelve a su sitio. Como mis ex.', Coger: 'Pesa más que mis problemas, y mira que es difícil.' },
  },
  {
    id: 'caja', name: 'la caja', x: 249, y: 117, w: 21, h: 19, walkTo: { x: 238, y: 139 },
    look: "Una caja de embalaje. Pone 'FRÁGIL'. La trataré como trato a mi ego.",
  },
  {
    id: 'barca', name: 'la barca', x: 96, y: 100, w: 30, h: 15, walkTo: { x: 112, y: 136 },
    look: 'Una barquita de remos. Mi yate, en una vida paralela más afortunada.',
  },
  {
    id: 'puerta', name: 'la puerta', x: 44, y: 88, w: 18, h: 28, walkTo: { x: 53, y: 135 },
    look: 'La puerta de la Aduana. Tras ella, el funcionario más temido del Mediterráneo.',
    responses: { Abrir: 'Cerrada a cal y canto. Como el corazón de un casero.', 'Hablar con': 'Es una puerta. Hasta yo tengo mis límites.' },
  },
  {
    id: 'cartel', name: 'el cartel', x: 20, y: 71, w: 30, h: 12, walkTo: { x: 38, y: 135 },
    look: "'ADUANA'. Aquí sellan salvoconductos y aplastan sueños, no siempre en ese orden.",
  },
  {
    id: 'farol', name: 'el farol', x: 75, y: 80, w: 14, h: 34, walkTo: { x: 82, y: 136 },
    look: 'Un farol. Da una luz cálida y melancólica, como un fado a medianoche.',
  },
  {
    id: 'aduana', name: 'la Aduana', x: 0, y: 34, w: 74, h: 82, walkTo: { x: 60, y: 134 },
    look: 'La Aduana del Port. Para subir a Montjuïc necesito un salvoconducto sellado ahí dentro.',
  },
  {
    id: 'galeon', name: 'el galeón', x: 150, y: 36, w: 66, h: 76, walkTo: { x: 182, y: 134 },
    look: 'Un galeón precioso. Me pregunto si aceptan polizones con buena conversación.',
    responses: { Coger: 'No me cabe en el bolsillo. Y créeme, lo he intentado con cosas más grandes.' },
  },
  {
    id: 'montjuic', name: 'Montjuïc', x: 255, y: 14, w: 65, h: 66, walkTo: { x: 280, y: 132 },
    look: 'El castell de Montjuïc, allá arriba. Dicen que guarda un secreto. Por eso he cruzado medio mar.',
  },
  {
    id: 'mar', name: 'el mar', x: 110, y: 84, w: 120, h: 24, walkTo: { x: 160, y: 132 },
    look: 'El Mediterráneo. Huele a sal, a aventura y a calamares a la romana.',
  },
];

export function hitHotspot(mx: number, my: number): Hotspot | null {
  for (const h of PORT_HOTSPOTS) {
    if (mx >= h.x && mx < h.x + h.w && my >= h.y && my < h.y + h.h) return h;
  }
  return null;
}
export function isWalkable(mx: number, my: number): boolean {
  return mx >= PORT_WALK.minX && mx <= PORT_WALK.maxX && my >= PORT_WALK.minY && my <= PORT_WALK.maxY;
}
export function clampWalk(mx: number, my: number) {
  return {
    x: Math.max(PORT_WALK.minX, Math.min(PORT_WALK.maxX, mx)),
    y: Math.max(PORT_WALK.minY, Math.min(PORT_WALK.maxY, my)),
  };
}

// ---------- NPCs ----------
export interface NPC {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number; // click area
  feet: { x: number; y: number };
  walkTo: { x: number; y: number };
  facing: 'left' | 'right';
  color: RGB;
  look: string;
  draw: (ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right', t: number) => void;
  dialogue: Dialogue;
  accepts?: Record<string, { needAlso?: string; missing?: string; line: string; give?: string; remove?: string[]; flag?: string; win?: boolean; card?: string[]; goto?: string }>;
  hideIf?: string;
  showIf?: string;
}

export const PORT_NPCS: NPC[] = [
  {
    id: 'aduanero', name: 'el aduanero', x: 55, y: 82, w: 28, h: 47,
    feet: { x: 68, y: 128 }, walkTo: { x: 90, y: 134 }, facing: 'right', color: [230, 170, 120],
    look: 'El Oficial de Aduanas. No sonríe desde tiempos del rey Jaume I, y no piensa empezar hoy.',
    draw: drawAduanero, dialogue: ADUANERO_DIALOGUE,
    accepts: {
      churros: {
        needAlso: 'xocolata',
        missing: '¿Churros sin chocolate? Un churro solo es un palo triste. Trae las dos cosas.',
        line: '¡Aaah, esmorzar! Por fin alguien que entiende la burocracia. Mojo, sello... y aquí tienes tu salvoconducto. Ahora desaparece.',
        give: 'salvoconducto', remove: ['churros', 'xocolata'], flag: 'has_pass',
      },
      xocolata: {
        needAlso: 'churros',
        missing: '¿Chocolate sin churros? ¿Qué clase de salvaje eres? Trae las dos cosas.',
        line: '¡Aaah, esmorzar! Por fin alguien que entiende la burocracia. Mojo, sello... y aquí tienes tu salvoconducto. Ahora desaparece.',
        give: 'salvoconducto', remove: ['churros', 'xocolata'], flag: 'has_pass',
      },
    },
  },
  {
    id: 'stan', name: 'Stan', x: 197, y: 84, w: 28, h: 52,
    feet: { x: 210, y: 136 }, walkTo: { x: 190, y: 136 }, facing: 'left', color: [150, 210, 150],
    look: 'Stan, vendedor de barcos. Su chaqueta podría guiar navíos en la niebla.',
    draw: drawStan, dialogue: STAN_DIALOGUE,
  },
];

export function hitNPC(mx: number, my: number): NPC | null {
  for (const n of PORT_NPCS) {
    if (mx >= n.x && mx < n.x + n.w && my >= n.y && my < n.y + n.h) return n;
  }
  return null;
}

// Animated background for the Port (sea shimmer, gulls, the galleon pennant, lantern glow).
export function portOverlays(ctx: CanvasRenderingContext2D, t: number) {
  ctx.fillStyle = css(P.seaGlint);
  for (let i = 0; i < 46; i++) {
    const x = (i * 53) % 300 + 10;
    const y = HORIZON + 3 + (i * 23) % 26;
    if (Math.sin(t * 3 + i * 1.3) * 0.5 + 0.5 > 0.62) ctx.fillRect(x, y, 2, 1);
  }
  ctx.fillStyle = css(P.black);
  for (const [bx, by, sp] of [[40, 24, 7], [120, 16, 5], [206, 30, 6], [284, 14, 4]]) {
    const x = Math.round(((bx + t * sp) % 360) - 20);
    const y = Math.round(by + Math.sin(t * 1.5 + bx) * 3);
    const flap = Math.sin(t * 6 + bx) > 0 ? 0 : 1;
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x - 2, y - 1 + flap, 2, 1);
    ctx.fillRect(x + 1, y - 1 + flap, 2, 1);
  }
  ctx.fillStyle = css(P.flagRed);
  for (let s = 0; s < 6; s++) {
    const off = Math.round(Math.sin(t * 5 - s * 0.6) * 1.3);
    ctx.fillRect(170 + s, 39 + off, 1, 3 - (s > 4 ? 1 : 0));
  }
  const flick = 0.78 + 0.18 * Math.sin(t * 9) + 0.06 * Math.sin(t * 23);
  const g = ctx.createRadialGradient(82, 89, 1, 82, 89, 17);
  g.addColorStop(0, 'rgba(255,210,120,' + (0.5 * flick).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(255,210,120,0)');
  ctx.fillStyle = g;
  ctx.fillRect(64, 71, 36, 36);
}
