import { drawText, textWidth } from '../art/font';
import type { RGB } from '../art/palette';
import { tr, LANG } from '../i18n';

// Build the SCUMM sentence line from the current verb and what's under the
// cursor. Each token is translated; English verb phrases ("Look at", "Give")
// already carry their preposition, so `${verb} ${object}` reads correctly.
export function buildSentence(state: any): string {
  const h = state.hover;
  if (state.selectedItem) {
    const base = `${tr('Dar')} ${tr(state.selectedItem.name)}`;
    if (h && h.hotspot) {
      const to = LANG === 'en' ? 'to' : 'a';
      return `${base} ${to} ${tr(h.hotspot.name)}`;
    }
    return base;
  }
  if (!h) return tr(state.verb);
  if (h.exit) return `${tr('Ir a')} ${tr(h.exit.name)}`;
  if (h.hotspot) return `${tr(state.verb)} ${tr(h.hotspot.name)}`;
  if (h.panelVerb) return tr(h.panelVerb);
  if (h.walkable) return tr('Caminar a');
  return tr(state.verb);
}

export function wrapText(s: string, maxW: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (textWidth(t, 1, 1) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

const SPEECH_SHADOW: RGB = [10, 8, 10];

// Wrapped, outlined text floating above a point (a speaker's head).
export function drawSpeechLines(ctx: CanvasRenderingContext2D, lines: string[], cx: number, headY: number, color: RGB, W: number) {
  const lineH = 9;
  let top = headY - lines.length * lineH;
  if (top < 2) top = 2;
  // position each line, then draw a subtle dark backing so speech stays legible
  // on busy or same-tone backgrounds (e.g. tan text over tan buildings).
  const xs: number[] = [];
  let minX = W, maxX = 0;
  for (let i = 0; i < lines.length; i++) {
    const w = textWidth(lines[i], 1, 1);
    let x = Math.round(cx - w / 2);
    if (x < 4) x = 4;
    if (x + w > W - 4) x = W - 4 - w;
    xs.push(x);
    if (x < minX) minX = x;
    if (x + w > maxX) maxX = x + w;
  }
  ctx.fillStyle = 'rgba(8,6,12,0.5)';
  ctx.fillRect(minX - 3, top - 2, (maxX - minX) + 6, lines.length * lineH + 3);
  for (let i = 0; i < lines.length; i++) {
    drawText(ctx, lines[i], xs[i], top + i * lineH, color, 1, SPEECH_SHADOW, 1);
  }
}

// Guybrush's own speech (ambient look responses + dialogue echoes).
export function drawSpeech(ctx: CanvasRenderingContext2D, state: any, W: number) {
  const sp = state.speech;
  if (!sp || state.now > sp.until) return;
  drawSpeechLines(ctx, sp.lines, sp.x, state.guy.y - 52, sp.color, W);
}
