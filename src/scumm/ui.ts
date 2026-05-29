import { P, css, type RGB } from '../art/palette';
import { drawText } from '../art/font';
import { VERB_GRID } from './verbs';

export const PANEL_Y = 144;
export const PANEL_H = 56;

// Layout geometry — shared by both the renderer and the click hit-test.
const VX = 8, VY = PANEL_Y + 17, COLW = 66, ROWH = 11;
const IX = 212, IY = PANEL_Y + 4, IW = 104, IH = PANEL_H - 7;
const SX = IX + 4, SY = IY + 4, SLOT = 20, GAP = 2;

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, c: RGB) {
  drawText(ctx, s, x, y, c, 1, P.black, 1);
}
function bevelBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: RGB) {
  ctx.fillStyle = css(fill);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = css(P.panelWoodLit);
  ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y, 1, h);
  ctx.fillStyle = css(P.black);
  ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x + w - 1, y, 1, h);
}

export function drawPanel(ctx: CanvasRenderingContext2D, sentence: string, verb: string, inventory: any[] = [], selectedId: string | null = null) {
  ctx.fillStyle = css(P.panelWood);
  ctx.fillRect(0, PANEL_Y, 320, PANEL_H);
  ctx.fillStyle = css(P.panelWoodLit);
  ctx.fillRect(0, PANEL_Y, 320, 1);
  ctx.fillStyle = css(P.panelWoodDark);
  ctx.fillRect(0, 199, 320, 1);

  // sentence line
  bevelBox(ctx, 4, PANEL_Y + 3, 312, 10, P.panelWoodDark);
  text(ctx, sentence, 8, PANEL_Y + 4, P.inkLight);

  // verb grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const v = VERB_GRID[row][col];
      text(ctx, v, VX + col * COLW, VY + row * ROWH, v === verb ? P.verbHot : P.verbIdle);
    }
  }

  // inventory box + slots
  bevelBox(ctx, IX, IY, IW, IH, P.panelWoodDark);
  for (let i = 0; i < 8; i++) {
    const col = i % 4, row = (i / 4) | 0;
    bevelBox(ctx, SX + col * (SLOT + GAP), SY + row * (SLOT + GAP), SLOT, SLOT, P.panelWood);
  }
  // item icons (+ highlight the selected one)
  for (let i = 0; i < inventory.length && i < 8; i++) {
    const col = i % 4, row = (i / 4) | 0;
    const sx = SX + col * (SLOT + GAP), sy = SY + row * (SLOT + GAP);
    inventory[i].draw?.(ctx, sx, sy);
    if (selectedId && inventory[i].id === selectedId) {
      ctx.fillStyle = css(P.verbHot);
      ctx.fillRect(sx, sy, SLOT, 1); ctx.fillRect(sx, sy + SLOT - 1, SLOT, 1);
      ctx.fillRect(sx, sy, 1, SLOT); ctx.fillRect(sx + SLOT - 1, sy, 1, SLOT);
    }
  }
  // scroll arrows
  ctx.fillStyle = css(P.verbIdle);
  ctx.beginPath(); ctx.moveTo(IX + IW - 8, IY + 6); ctx.lineTo(IX + IW - 3, IY + 6); ctx.lineTo(IX + IW - 5.5, IY + 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(IX + IW - 8, IY + IH - 6); ctx.lineTo(IX + IW - 3, IY + IH - 6); ctx.lineTo(IX + IW - 5.5, IY + IH - 2); ctx.closePath(); ctx.fill();
}

// Hit-test a click inside the panel. Returns a verb, an inventory index, or null.
export function hitPanel(mx: number, my: number): { type: 'verb'; verb: string } | { type: 'inv'; index: number } | null {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = VX + col * COLW - 2, y = VY + row * ROWH - 2;
      if (mx >= x && mx < x + COLW - 2 && my >= y && my < y + ROWH) {
        return { type: 'verb', verb: VERB_GRID[row][col] };
      }
    }
  }
  for (let i = 0; i < 8; i++) {
    const col = i % 4, row = (i / 4) | 0;
    const x = SX + col * (SLOT + GAP), y = SY + row * (SLOT + GAP);
    if (mx >= x && mx < x + SLOT && my >= y && my < y + SLOT) return { type: 'inv', index: i };
  }
  return null;
}
