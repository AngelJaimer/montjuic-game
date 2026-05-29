import { P, css, type RGB } from '../art/palette';

type Draw = (ctx: CanvasRenderingContext2D, x: number, y: number) => void;

function fill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.fillRect(x, y, w, h);
}

const SCROLL: RGB = [226, 208, 168];
const CHOC: RGB = [78, 48, 32];

// Each icon draws inside a 20x20 inventory slot anchored at (x,y).
export const ITEMS: Record<string, { name: string; draw: Draw }> = {
  cuerda: {
    name: 'la cuerda',
    draw: (ctx, x, y) => {
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = css(i % 2 ? P.rope : P.woodShadow);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x + 10, y + 11, 7 - i * 2, 4 - i, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },
  moneda: {
    name: 'la moneda',
    draw: (ctx, x, y) => {
      ctx.fillStyle = css(P.stoneShadow);
      ctx.beginPath(); ctx.arc(x + 10, y + 10, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = css(P.winLit);
      ctx.beginPath(); ctx.arc(x + 10, y + 10, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = css(P.sunCore);
      ctx.fillRect(x + 8, y + 8, 2, 2);
    },
  },
  churros: {
    name: 'los churros',
    draw: (ctx, x, y) => {
      // paper cone
      ctx.fillStyle = css(SCROLL);
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 6); ctx.lineTo(x + 15, y + 6); ctx.lineTo(x + 10, y + 18);
      ctx.closePath(); ctx.fill();
      // churros poking out
      fill(ctx, x + 6, y + 2, 2, 7, P.roof);
      fill(ctx, x + 9, y + 1, 2, 8, P.roofLit);
      fill(ctx, x + 12, y + 3, 2, 6, P.roof);
      // sugar
      ctx.fillStyle = css(P.cloud);
      fill(ctx, x + 7, y + 3, 1, 1, P.cloud);
      fill(ctx, x + 12, y + 5, 1, 1, P.cloud);
    },
  },
  xocolata: {
    name: 'la xocolata',
    draw: (ctx, x, y) => {
      // steam
      fill(ctx, x + 8, y + 2, 1, 2, P.cloud);
      fill(ctx, x + 11, y + 1, 1, 2, P.cloud);
      // mug
      fill(ctx, x + 5, y + 6, 10, 11, P.wallShadow);
      fill(ctx, x + 6, y + 7, 8, 9, P.parchment);
      fill(ctx, x + 6, y + 7, 8, 4, CHOC); // chocolate
      // handle
      ctx.strokeStyle = css(P.wallShadow); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x + 15, y + 11, 3, -1, 1.4); ctx.stroke();
    },
  },
  salvoconducto: {
    name: 'el salvoconducto',
    draw: (ctx, x, y) => {
      fill(ctx, x + 3, y + 6, 14, 9, P.stoneShadow);
      fill(ctx, x + 4, y + 7, 12, 7, SCROLL);
      fill(ctx, x + 3, y + 6, 2, 9, P.stone);   // rolled ends
      fill(ctx, x + 15, y + 6, 2, 9, P.stone);
      ctx.fillStyle = css(P.flagRed);            // wax seal
      ctx.beginPath(); ctx.arc(x + 10, y + 16, 2, 0, Math.PI * 2); ctx.fill();
    },
  },
};

export function makeItem(id: string) {
  const it = ITEMS[id];
  return { id, name: it ? it.name : id, draw: it ? it.draw : undefined };
}
