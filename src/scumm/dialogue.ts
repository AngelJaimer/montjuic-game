import { P, css } from '../art/palette';
import { drawText } from '../art/font';
import { PANEL_Y, PANEL_H } from './ui';
import type { Dialogue, Opt } from '../content/dialogues';

const OPT_X = 8;
const OPT_Y = PANEL_Y + 6;
const OPT_H = 10;

// Visible options at the current node, filtered by flags and one-time use.
// Each carries a stable `key` (nodeId:index) so `once` survives re-filtering.
export function currentOptions(dlg: Dialogue, node: string, flags: any, used: Set<string>, id = ''): Array<Opt & { key: string }> {
  // key is namespaced by the speaker `id` so a `once` option on one NPC never
  // collides with the same node:index on another NPC (which would wrongly hide it).
  return dlg[node].options
    .map((o, i) => ({ ...o, key: id + ':' + node + ':' + i }))
    .filter((o) => (!o.if || flags[o.if]) && (!o.ifNot || !flags[o.ifNot]) && (!o.once || !used.has(o.key)));
}

export function drawDialoguePanel(ctx: CanvasRenderingContext2D, options: Array<Opt & { key: string }>, hoverIdx: number) {
  ctx.fillStyle = css(P.panelWood);
  ctx.fillRect(0, PANEL_Y, 320, PANEL_H);
  ctx.fillStyle = css(P.panelWoodLit);
  ctx.fillRect(0, PANEL_Y, 320, 1);
  ctx.fillStyle = css(P.panelWoodDark);
  ctx.fillRect(0, 199, 320, 1);

  for (let i = 0; i < options.length; i++) {
    const hot = i === hoverIdx;
    drawText(ctx, (i + 1) + '. ' + options[i].text, OPT_X, OPT_Y + i * OPT_H, hot ? P.verbHot : P.verbIdle, 1, P.black, 1);
  }
}

export function hitDialogueOption(mx: number, my: number, count: number): number {
  if (mx < 4 || mx > 316) return -1;
  for (let i = 0; i < count; i++) {
    const y = OPT_Y + i * OPT_H;
    if (my >= y - 1 && my < y + OPT_H - 1) return i;
  }
  return -1;
}
