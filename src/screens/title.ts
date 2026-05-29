import { P, css, type RGB } from '../art/palette';
import { Pixels, rampPick, ditherPick } from '../art/dither';

const HOR = 132;
const SUN_X = 150, SUN_Y = 112;

function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

// A full-screen 320x200 sunset over Montjuïc, with the harbour in silhouette.
export function buildTitleScene(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 200;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const img = ctx.createImageData(320, 168);
  const px = new Pixels(img, 320, 168);
  const sky: RGB[] = [[34, 26, 64], [78, 44, 84], [148, 70, 82], [226, 128, 84], [250, 198, 128]];
  const sea: RGB[] = [[206, 152, 112], [122, 96, 108], [70, 64, 92], [42, 46, 70]];
  const glow: RGB = [255, 224, 150], core: RGB = [255, 246, 214];
  for (let y = 0; y < 168; y++) {
    for (let x = 0; x < 320; x++) {
      if (y < HOR) {
        let c = rampPick(sky, y / HOR, x, y);
        const dx = x - SUN_X, dy = (y - SUN_Y) * 1.4;
        const d = Math.sqrt(dx * dx + dy * dy);
        const g1 = 1 - d / 78; if (g1 > 0) c = ditherPick(c, glow, g1, x, y);
        const g2 = 1 - d / 26; if (g2 > 0) c = ditherPick(c, core, g2, x, y);
        px.set(x, y, c);
      } else {
        const t = (y - HOR) / (168 - HOR);
        let c = rampPick(sea, t, x, y);
        const adx = Math.abs(x - SUN_X), w = 8 + (y - HOR) * 1.4;
        if (adx < w) {
          const sh = Math.sin(y * 0.7 + x * 0.3) * 0.5 + 0.5;
          c = ditherPick(c, glow, sh * (1 - adx / w) * 0.7, x, y);
        }
        px.set(x, y, c);
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // Montjuïc hill (right) in silhouette + castle
  const hill: RGB = [44, 38, 58], hillLit: RGB = [66, 54, 70];
  ctx.fillStyle = css(hill);
  ctx.beginPath();
  ctx.moveTo(214, HOR); ctx.lineTo(252, 84); ctx.lineTo(290, 60); ctx.lineTo(320, 70); ctx.lineTo(320, HOR);
  ctx.closePath(); ctx.fill();
  r(ctx, 276, 44, 26, 18, hillLit);
  for (let i = 0; i < 6; i++) r(ctx, 277 + i * 4, 40, 2, 4, hillLit);
  r(ctx, 296, 30, 8, 14, hillLit);
  r(ctx, 300, 24, 3, 6, P.flagRed);

  // galleon silhouette on the sea (centre-left)
  const dk: RGB = [28, 26, 42];
  ctx.fillStyle = css(dk);
  ctx.beginPath();
  ctx.moveTo(96, 150); ctx.lineTo(168, 150); ctx.lineTo(158, 162); ctx.lineTo(106, 162);
  ctx.closePath(); ctx.fill();
  r(ctx, 116, 96, 2, 54, dk);
  r(ctx, 142, 104, 2, 46, dk);
  r(ctx, 104, 110, 26, 2, dk);
  r(ctx, 132, 116, 24, 2, dk);
  ctx.strokeStyle = css(dk); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(117, 96); ctx.lineTo(98, 150); ctx.moveTo(117, 96); ctx.lineTo(160, 150); ctx.stroke();

  // foreground quay silhouette + a lantern
  r(ctx, 0, 168, 320, 32, [22, 20, 32]);
  r(ctx, 0, 166, 320, 3, [34, 30, 42]);
  r(ctx, 34, 150, 2, 18, [22, 20, 32]);
  r(ctx, 31, 144, 8, 7, [40, 34, 40]);
  r(ctx, 33, 146, 4, 4, P.winLit);

  return cv;
}
