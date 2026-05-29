import type { RGB } from './palette';

// Ordered (Bayer 4x4) dithering — the single most important trick for the MI2 painted look.
export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function bayer(x: number, y: number): number {
  return (BAYER4[((y % 4) + 4) % 4][((x % 4) + 4) % 4] + 0.5) / 16;
}

// Pick colour a or b for pixel (x,y) so that, on average, `frac` of pixels become b.
export function ditherPick(a: RGB, b: RGB, frac: number, x: number, y: number): RGB {
  return frac > bayer(x, y) ? b : a;
}

// Multi-stop ramp: t in [0,1] across the stops, dithering between the two adjacent stops.
export function rampPick(ramp: RGB[], t: number, x: number, y: number): RGB {
  const n = ramp.length;
  if (n === 1) return ramp[0];
  const c = t < 0 ? 0 : t > 0.999999 ? 0.999999 : t;
  const f = c * (n - 1);
  const i = Math.floor(f);
  return ditherPick(ramp[i], ramp[i + 1], f - i, x, y);
}

// Thin wrapper over an ImageData buffer for fast per-pixel writes.
export class Pixels {
  data: Uint8ClampedArray;
  constructor(public img: ImageData, public w: number, public h: number) {
    this.data = img.data;
  }
  set(x: number, y: number, c: RGB, a = 255) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
    this.data[i + 3] = a;
  }
}
