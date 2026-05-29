import { P, css, type RGB } from './palette';

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB) {
  ctx.fillStyle = css(c);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}
function blk(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB, o: RGB = P.black) {
  ctx.fillStyle = css(o);
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  ctx.fillStyle = css(c);
  ctx.fillRect((x | 0) + 1, (y | 0) + 1, Math.max(0, (w | 0) - 2), Math.max(0, (h | 0) - 2));
}

// Guybrush, ~50px tall. (fx,fy) = feet centre. Mirrors for left-facing; legs/arms
// swing while moving; subtle idle breathing otherwise.
export function drawActor(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  facing: 'left' | 'right' = 'right',
  moving = false,
  t = 0,
  idleBob = 0,
) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  ctx.save();
  if (facing === 'left') {
    ctx.translate(cx * 2, 0);
    ctx.scale(-1, 1);
  }

  const swing = moving ? Math.round(Math.sin(t * 11) * 2) : 0;
  const aswing = moving ? Math.round(Math.sin(t * 11) * 1.5) : 0;
  const bob = moving ? (Math.sin(t * 11) > 0 ? 1 : 0) : Math.round(idleBob);

  // legs + boots
  blk(ctx, cx - 6 + swing, fyR - 20, 5, 16, P.pants);
  blk(ctx, cx + 1 - swing, fyR - 20, 5, 16, P.pants);
  px(ctx, cx - 5 + swing, fyR - 19, 2, 14, P.pantsShadow);
  px(ctx, cx + 2 - swing, fyR - 19, 2, 14, P.pantsShadow);
  blk(ctx, cx - 7 + swing, fyR - 5, 7, 5, P.boots);
  blk(ctx, cx + 0 - swing, fyR - 5, 7, 5, P.boots);

  // sword hilt
  px(ctx, cx + 6, fyR - 22 + bob, 2, 7, P.belt);
  px(ctx, cx + 5, fyR - 23 + bob, 4, 2, P.stoneShadow);

  // torso (puffy shirt)
  const ty = fyR - 38 + bob;
  blk(ctx, cx - 7, ty, 14, 19, P.shirt);
  px(ctx, cx - 6, ty + 1, 3, 17, P.shirtShadow);
  px(ctx, cx + 4, ty + 1, 2, 17, P.shirtShadow);
  px(ctx, cx - 7, ty + 16, 14, 2, P.belt);

  // arms
  blk(ctx, cx - 10, ty + 2 + aswing, 4, 13, P.shirt);
  blk(ctx, cx + 6, ty + 2 - aswing, 4, 13, P.shirt);
  px(ctx, cx - 10, ty + 13 + aswing, 4, 3, P.skin);
  px(ctx, cx + 6, ty + 13 - aswing, 4, 3, P.skin);

  // neck + head
  px(ctx, cx - 2, ty - 2, 4, 3, P.skin);
  const hy = fyR - 50 + bob;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  px(ctx, cx - 5, hy - 1, 11, 3, P.hair);
  px(ctx, cx - 6, hy, 3, 7, P.hair);
  px(ctx, cx - 6, hy - 1, 4, 2, P.hairShadow);
  px(ctx, cx + 1, hy + 4, 1, 2, P.black);
  px(ctx, cx + 4, hy + 5, 1, 2, P.skin);
  px(ctx, cx + 1, hy + 8, 3, 1, P.skinShadow);

  ctx.restore();
}

const COAT: RGB = [44, 54, 92];
const COAT_LIT: RGB = [64, 76, 120];
const TROUSER: RGB = [54, 50, 64];
const GOLD: RGB = [228, 188, 96];
const GREY: RGB = [186, 184, 172];

// El Aduanero — stout, grumpy customs officer with a tricorn and big moustache.
export function drawAduanero(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  const bob = Math.sin(t * 1.6) > 0.96 ? 1 : 0; // the odd snore
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }

  // stubby legs + shoes
  blk(ctx, cx - 7, fyR - 16, 6, 14, TROUSER);
  blk(ctx, cx + 1, fyR - 16, 6, 14, TROUSER);
  blk(ctx, cx - 8, fyR - 4, 8, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 8, 4, P.black);

  // broad coat
  const ty = fyR - 34 + bob;
  blk(ctx, cx - 9, ty, 18, 20, COAT);
  px(ctx, cx + 3, ty + 1, 5, 18, COAT_LIT);
  px(ctx, cx - 8, ty + 1, 3, 18, P.black);
  // gold buttons + trim
  for (let i = 0; i < 4; i++) px(ctx, cx - 1, ty + 3 + i * 4, 2, 2, GOLD);
  px(ctx, cx - 9, ty + 19, 18, 2, GOLD);
  // crossed arms
  px(ctx, cx - 8, ty + 7, 16, 4, COAT_LIT);
  px(ctx, cx - 8, ty + 7, 16, 1, P.black);
  px(ctx, cx - 5, ty + 9, 3, 2, P.skin);
  px(ctx, cx + 3, ty + 9, 3, 2, P.skin);

  // head
  const hy = fyR - 44 + bob;
  blk(ctx, cx - 5, hy, 11, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  // moustache + stern eyes
  px(ctx, cx - 4, hy + 7, 10, 2, GREY);
  px(ctx, cx - 3, hy + 9, 2, 1, GREY);
  px(ctx, cx + 3, hy + 9, 2, 1, GREY);
  px(ctx, cx - 2, hy + 4, 2, 1, P.black);
  px(ctx, cx + 3, hy + 4, 2, 1, P.black);
  // tricorn hat
  blk(ctx, cx - 8, hy - 3, 17, 4, P.black);
  px(ctx, cx - 3, hy - 5, 7, 3, COAT);
  px(ctx, cx - 8, hy, 17, 1, COAT_LIT);

  ctx.restore();
}

const STAN_JACKET: RGB = [60, 150, 138];
const STAN_STRIPE: RGB = [212, 168, 72];
const STAN_PANTS: RGB = [120, 60, 60];

// Stan — tall, lanky used-boat salesman in a very loud striped jacket, mid-pitch.
export function drawStan(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  const gesture = Math.round(Math.sin(t * 4) * 2); // never stops gesturing
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }

  // long legs
  blk(ctx, cx - 5, fyR - 22, 4, 18, STAN_PANTS);
  blk(ctx, cx + 1, fyR - 22, 4, 18, STAN_PANTS);
  blk(ctx, cx - 6, fyR - 5, 6, 5, P.black);
  blk(ctx, cx + 0, fyR - 5, 6, 5, P.black);

  // loud striped jacket
  const ty = fyR - 40;
  blk(ctx, cx - 7, ty, 14, 20, STAN_JACKET);
  for (let i = 0; i < 4; i++) px(ctx, cx - 6 + i * 4, ty + 1, 1, 18, STAN_STRIPE);
  // white shirt + collar
  px(ctx, cx - 2, ty + 1, 4, 12, P.shirt);
  px(ctx, cx - 2, ty, 2, 3, P.shirt);
  px(ctx, cx + 0, ty, 2, 3, P.shirt);
  // one arm raised mid-pitch, one on hip
  blk(ctx, cx + 6, ty - 4 + gesture, 4, 12, STAN_JACKET);
  px(ctx, cx + 6, ty - 5 + gesture, 4, 3, P.skin);
  blk(ctx, cx - 10, ty + 4, 4, 11, STAN_JACKET);
  px(ctx, cx - 10, ty + 13, 4, 3, P.skin);

  // head + big grin
  px(ctx, cx - 2, ty - 2, 4, 3, P.skin);
  const hy = fyR - 52;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  // slicked dark hair
  px(ctx, cx - 5, hy - 1, 11, 2, P.woodDark);
  px(ctx, cx - 5, hy, 2, 4, P.woodDark);
  // eyes + toothy grin
  px(ctx, cx + 1, hy + 4, 1, 2, P.black);
  px(ctx, cx + 4, hy + 4, 1, 2, P.black);
  px(ctx, cx + 1, hy + 8, 5, 2, P.shirt);
  px(ctx, cx + 2, hy + 8, 1, 2, P.skinShadow);
  px(ctx, cx + 4, hy + 8, 1, 2, P.skinShadow);

  ctx.restore();
}

const APRON: RGB = [222, 212, 188];
const CAP: RGB = [238, 234, 222];

// El Churrero — cook in an apron, both arms up holding his awning.
export function drawChurrero(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  const sway = Math.round(Math.sin(t * 2) * 1);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }

  blk(ctx, cx - 6, fyR - 18, 5, 16, P.woodDark);
  blk(ctx, cx + 1, fyR - 18, 5, 16, P.woodDark);
  blk(ctx, cx - 7, fyR - 4, 7, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 7, 4, P.black);

  const ty = fyR - 36;
  blk(ctx, cx - 7, ty, 14, 20, P.shirt);
  px(ctx, cx - 6, ty + 6, 12, 13, APRON);
  px(ctx, cx - 6, ty + 6, 12, 1, P.wallShadow);
  // arms raised
  blk(ctx, cx - 10, ty - 6 + sway, 4, 12, P.shirt);
  px(ctx, cx - 10, ty - 7 + sway, 4, 3, P.skin);
  blk(ctx, cx + 6, ty - 6 - sway, 4, 12, P.shirt);
  px(ctx, cx + 6, ty - 7 - sway, 4, 3, P.skin);

  const hy = fyR - 48;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  px(ctx, cx - 5, hy - 2, 11, 3, CAP);
  px(ctx, cx - 5, hy - 2, 11, 1, P.wallShadow);
  px(ctx, cx - 3, hy + 7, 8, 1, P.woodDark);
  px(ctx, cx - 2, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);

  ctx.restore();
}

const SCARF: RGB = [180, 70, 66];
const SKIRT: RGB = [120, 60, 80];
const BLOUSE: RGB = [226, 210, 180];

// La Chocolatera — vendor in headscarf and long skirt, stirring her pot.
export function drawChocolatera(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  const stir = Math.round(Math.sin(t * 5) * 2);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }

  blk(ctx, cx - 4, fyR - 4, 4, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 4, 4, P.black);
  // skirt
  ctx.fillStyle = css(SKIRT);
  ctx.beginPath();
  ctx.moveTo(cx - 5, fyR - 20); ctx.lineTo(cx + 5, fyR - 20); ctx.lineTo(cx + 8, fyR - 3); ctx.lineTo(cx - 8, fyR - 3);
  ctx.closePath(); ctx.fill();

  const ty = fyR - 34;
  blk(ctx, cx - 6, ty, 12, 16, BLOUSE);
  px(ctx, cx - 4, ty + 6, 8, 9, P.cloud); // apron
  // arms (one stirring)
  blk(ctx, cx + 5, ty + 3, 4, 11, BLOUSE);
  px(ctx, cx + 5 + stir, ty + 12, 3, 3, P.skin);
  blk(ctx, cx - 9, ty + 3, 4, 10, BLOUSE);
  px(ctx, cx - 9, ty + 12, 3, 3, P.skin);

  const hy = fyR - 44;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  px(ctx, cx - 6, hy - 2, 12, 5, SCARF);
  px(ctx, cx - 6, hy - 2, 12, 1, [140, 50, 48]);
  px(ctx, cx - 6, hy + 2, 2, 5, SCARF);
  px(ctx, cx + 4, hy + 2, 2, 5, SCARF);
  px(ctx, cx - 1, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);
  px(ctx, cx + 0, hy + 8, 3, 1, P.skinShadow);

  ctx.restore();
}

const STEEL: RGB = [150, 156, 168];
const STEEL_D: RGB = [96, 102, 116];
const STEEL_L: RGB = [200, 205, 215];
const TUNIC: RGB = [150, 60, 56];

// La Guàrdia — steel-breastplated soldier with a pike, blocking the gate.
export function drawGuard(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }

  blk(ctx, cx - 6, fyR - 18, 5, 16, STEEL_D);
  blk(ctx, cx + 1, fyR - 18, 5, 16, STEEL_D);
  blk(ctx, cx - 7, fyR - 4, 7, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 7, 4, P.black);

  const ty = fyR - 36;
  blk(ctx, cx - 7, ty, 14, 20, TUNIC);
  px(ctx, cx - 6, ty + 1, 12, 12, STEEL);
  px(ctx, cx - 6, ty + 1, 12, 1, STEEL_L);
  px(ctx, cx - 1, ty + 2, 2, 10, STEEL_D);
  // arms
  blk(ctx, cx - 10, ty + 3, 4, 13, TUNIC);
  px(ctx, cx - 10, ty + 13, 4, 3, P.skin);
  blk(ctx, cx + 6, ty + 3, 4, 13, TUNIC);
  px(ctx, cx + 6, ty + 13, 4, 3, P.skin);
  // pike
  px(ctx, cx + 9, fyR - 52, 1, 46, P.woodDark);
  px(ctx, cx + 8, fyR - 53, 3, 5, STEEL);

  const hy = fyR - 48;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  // morrión helmet (stepped peak)
  px(ctx, cx - 5, hy - 1, 11, 2, STEEL);
  px(ctx, cx - 5, hy - 1, 11, 1, STEEL_L);
  px(ctx, cx - 3, hy - 3, 7, 2, STEEL);
  px(ctx, cx - 1, hy - 5, 3, 2, STEEL);
  px(ctx, cx - 2, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);
  px(ctx, cx - 2, hy + 7, 7, 1, P.woodDark);

  ctx.restore();
}

const SILVER: RGB = [184, 188, 198];
const SILVER_D: RGB = [132, 136, 148];
const SILVER_L: RGB = [216, 220, 228];

// L'Estàtua Vivent — a silver-painted living statue, frozen heroic pose, key held aloft.
export function drawStatue(ctx: CanvasRenderingContext2D, fx: number, fy: number, _facing: 'left' | 'right' = 'right', _t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  // plinth
  blk(ctx, cx - 10, fyR, 20, 5, P.stone);
  px(ctx, cx - 9, fyR + 1, 18, 1, P.stoneLit);
  // legs + torso (monochrome silver)
  blk(ctx, cx - 5, fyR - 18, 4, 16, SILVER);
  blk(ctx, cx + 1, fyR - 18, 4, 16, SILVER);
  blk(ctx, cx - 6, fyR - 34, 12, 18, SILVER);
  px(ctx, cx - 5, fyR - 33, 3, 16, SILVER_D);
  px(ctx, cx + 3, fyR - 33, 2, 16, SILVER_L);
  // left arm down, right arm raised with the key
  blk(ctx, cx - 9, fyR - 32, 3, 14, SILVER);
  blk(ctx, cx + 6, fyR - 44, 3, 16, SILVER);
  px(ctx, cx + 6, fyR - 46, 3, 3, SILVER_L);
  px(ctx, cx + 6, fyR - 49, 3, 4, P.winLit);     // the golden key
  px(ctx, cx + 5, fyR - 50, 5, 2, P.winLit);
  px(ctx, cx + 9, fyR - 48, 2, 2, P.winLit);
  // head + laurel
  const hy = fyR - 45;
  blk(ctx, cx - 4, hy, 9, 11, SILVER);
  px(ctx, cx - 3, hy + 1, 3, 9, SILVER_D);
  px(ctx, cx - 4, hy - 1, 9, 2, SILVER_L);
  px(ctx, cx + 1, hy + 4, 1, 1, SILVER_D);
  px(ctx, cx + 3, hy + 4, 1, 1, SILVER_D);
}

const SELLER_VEST: RGB = [92, 114, 90];

// L'Ocellaire — the bird-seller, holding a little cage with a canary.
export function drawOcellaire(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
  blk(ctx, cx - 5, fyR - 18, 4, 16, P.woodDark);
  blk(ctx, cx + 1, fyR - 18, 4, 16, P.woodDark);
  blk(ctx, cx - 6, fyR - 4, 7, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 7, 4, P.black);
  const ty = fyR - 34;
  blk(ctx, cx - 6, ty, 12, 18, SELLER_VEST);
  px(ctx, cx - 2, ty + 1, 4, 12, P.shirt);
  blk(ctx, cx - 9, ty + 3, 3, 12, SELLER_VEST);
  px(ctx, cx - 9, ty + 12, 3, 3, P.skin);
  blk(ctx, cx + 6, ty + 3, 3, 9, SELLER_VEST);
  px(ctx, cx + 6, ty + 10, 3, 3, P.skin);
  // birdcage
  const gx = cx + 9;
  blk(ctx, gx, ty + 2, 9, 13, P.woodDark);
  for (let i = 1; i < 4; i++) px(ctx, gx + i * 2, ty + 3, 1, 11, [150, 116, 80]);
  px(ctx, gx + 3, ty + 7, 3, 3, P.winLit);  // canary
  px(ctx, gx + 3, ty + 1, 3, 1, P.stone);   // ring on top
  const hy = fyR - 44;
  blk(ctx, cx - 4, hy, 9, 10, P.skin);
  px(ctx, cx - 3, hy + 1, 3, 8, P.skinShadow);
  px(ctx, cx - 5, hy - 2, 11, 3, [110, 80, 50]); // cap
  px(ctx, cx + 1, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);
  px(ctx, cx - 1, hy + 7, 5, 1, P.woodDark);
  ctx.restore();
}

const SKIRT2: RGB = [120, 70, 96];
const BLOUSE2: RGB = [228, 212, 182];

// La Florista — flower-seller with a tray of colourful blooms.
export function drawFlorista(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
  blk(ctx, cx - 4, fyR - 4, 4, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 4, 4, P.black);
  ctx.fillStyle = css(SKIRT2);
  ctx.beginPath();
  ctx.moveTo(cx - 5, fyR - 20); ctx.lineTo(cx + 5, fyR - 20); ctx.lineTo(cx + 8, fyR - 3); ctx.lineTo(cx - 8, fyR - 3);
  ctx.closePath(); ctx.fill();
  const ty = fyR - 34;
  blk(ctx, cx - 6, ty, 12, 16, BLOUSE2);
  px(ctx, cx - 4, ty + 6, 8, 9, P.cloud);
  blk(ctx, cx - 9, ty + 4, 3, 10, BLOUSE2);
  blk(ctx, cx + 6, ty + 4, 3, 10, BLOUSE2);
  px(ctx, cx - 9, ty + 12, 3, 3, P.skin);
  px(ctx, cx + 6, ty + 12, 3, 3, P.skin);
  // flower tray held in front
  blk(ctx, cx - 9, fyR - 22, 18, 5, P.woodDark);
  const cols: RGB[] = [P.flagRed, P.winLit, [220, 130, 170], [120, 200, 120]];
  for (let i = 0; i < 7; i++) { ctx.fillStyle = css(cols[i % 4]); ctx.fillRect(cx - 8 + i * 2, fyR - 23, 1, 2); }
  const hy = fyR - 44;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  px(ctx, cx - 6, hy - 2, 12, 4, [150, 90, 60]);   // hair
  px(ctx, cx + 4, hy - 1, 2, 2, P.flagRed);        // flower in hair
  px(ctx, cx - 1, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);
  px(ctx, cx + 0, hy + 8, 3, 1, P.skinShadow);
  ctx.restore();
}

const ROBE: RGB = [98, 70, 132];
const ROBE_L: RGB = [126, 96, 162];
const SHAWL: RGB = [182, 80, 92];
const GEMGOLD: RGB = [228, 188, 96];

// La Vidente del Born — robed fortune-teller in a gemmed headscarf.
export function drawVidente(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'right', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
  // long robe
  ctx.fillStyle = css(ROBE);
  ctx.beginPath();
  ctx.moveTo(cx - 6, fyR - 30); ctx.lineTo(cx + 6, fyR - 30); ctx.lineTo(cx + 10, fyR - 2); ctx.lineTo(cx - 10, fyR - 2);
  ctx.closePath(); ctx.fill();
  px(ctx, cx - 4, fyR - 28, 2, 26, ROBE_L);
  px(ctx, cx + 2, fyR - 28, 2, 26, ROBE_L);
  // shawl + draped arms
  px(ctx, cx - 9, fyR - 33, 18, 7, SHAWL);
  blk(ctx, cx - 10, fyR - 28, 3, 13, ROBE);
  blk(ctx, cx + 7, fyR - 28, 3, 13, ROBE);
  px(ctx, cx - 10, fyR - 16, 3, 3, P.skin);
  px(ctx, cx + 7, fyR - 16, 3, 3, P.skin);
  // head + gemmed scarf + hoop earrings
  const hy = fyR - 45;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  px(ctx, cx - 6, hy - 2, 12, 5, SHAWL);
  px(ctx, cx - 1, hy - 1, 2, 2, GEMGOLD);
  px(ctx, cx - 6, hy + 6, 1, 3, GEMGOLD);
  px(ctx, cx + 5, hy + 6, 1, 3, GEMGOLD);
  px(ctx, cx + 1, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);
  ctx.restore();
}

const APRON2: RGB = [112, 74, 46];
const APRON2_D: RGB = [82, 52, 30];
const HAMMER: RGB = [96, 100, 110];

// El Ferrer — burly blacksmith in a leather apron, hammer swinging.
export function drawFerrer(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  const swing = Math.round((Math.sin(t * 6) * 0.5 + 0.5) * 4);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
  blk(ctx, cx - 6, fyR - 18, 5, 16, [70, 60, 52]);
  blk(ctx, cx + 1, fyR - 18, 5, 16, [70, 60, 52]);
  blk(ctx, cx - 7, fyR - 4, 7, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 7, 4, P.black);
  // broad bare torso + leather apron
  const ty = fyR - 36;
  blk(ctx, cx - 8, ty, 16, 20, P.skin);
  px(ctx, cx - 7, ty + 1, 3, 18, P.skinShadow);
  px(ctx, cx - 5, ty + 4, 11, 15, APRON2);
  px(ctx, cx - 5, ty + 4, 11, 1, APRON2_D);
  // left arm at side
  blk(ctx, cx - 11, ty + 3, 4, 12, P.skin);
  px(ctx, cx - 11, ty + 12, 4, 3, P.skin);
  // right arm raised, hammering
  blk(ctx, cx + 7, ty - 3 - swing, 4, 12, P.skin);
  px(ctx, cx + 6, ty - 7 - swing, 6, 4, HAMMER);   // hammer head
  px(ctx, cx + 8, ty - 4 - swing, 2, 5, P.woodDark); // handle
  // head + sooty hair + beard
  const hy = fyR - 46;
  blk(ctx, cx - 5, hy, 10, 11, P.skin);
  px(ctx, cx - 4, hy + 1, 3, 9, P.skinShadow);
  px(ctx, cx - 5, hy - 1, 11, 2, [80, 62, 46]);
  px(ctx, cx - 5, hy + 7, 10, 3, [92, 72, 52]);   // beard
  px(ctx, cx - 2, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);
  ctx.restore();
}

const COAT2: RGB = [88, 76, 66];
const COAT2_L: RGB = [112, 98, 84];
const BEARD: RGB = [212, 208, 198];

// El Arquitecto — a Gaudí-esque figure: frock coat, full beard, wide-brim hat, rolled plans.
export function drawArquitecto(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
  blk(ctx, cx - 5, fyR - 19, 4, 17, [64, 58, 52]);
  blk(ctx, cx + 1, fyR - 19, 4, 17, [64, 58, 52]);
  blk(ctx, cx - 6, fyR - 4, 6, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 6, 4, P.black);
  const ty = fyR - 37;
  blk(ctx, cx - 6, ty, 12, 22, COAT2);
  px(ctx, cx - 5, ty + 1, 3, 20, COAT2_L);
  px(ctx, cx - 1, ty + 2, 1, 18, [58, 50, 44]); // button line
  blk(ctx, cx - 9, ty + 3, 3, 13, COAT2);
  px(ctx, cx - 9, ty + 13, 3, 3, P.skin);
  blk(ctx, cx + 6, ty + 3, 3, 13, COAT2);
  px(ctx, cx + 6, ty + 13, 3, 3, P.skin);
  px(ctx, cx + 5, ty + 9, 3, 8, [120, 150, 200]); // rolled blue plans in hand
  const hy = fyR - 48;
  blk(ctx, cx - 4, hy, 9, 11, P.skin);
  px(ctx, cx - 3, hy + 1, 3, 9, P.skinShadow);
  px(ctx, cx - 4, hy + 7, 9, 4, BEARD);
  px(ctx, cx - 1, hy + 5, 1, 2, P.black);
  px(ctx, cx + 3, hy + 5, 1, 2, P.black);
  px(ctx, cx - 7, hy - 1, 15, 2, [50, 44, 40]); // wide brim
  px(ctx, cx - 4, hy - 5, 9, 4, [50, 44, 40]);  // crown
  ctx.restore();
}

// El Mason — a dusty stonemason with a flat cap and a trowel.
export function drawMason(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'right' | 'left' = 'right', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
  blk(ctx, cx - 5, fyR - 18, 4, 16, [92, 82, 70]);
  blk(ctx, cx + 1, fyR - 18, 4, 16, [92, 82, 70]);
  blk(ctx, cx - 6, fyR - 4, 6, 4, P.black);
  blk(ctx, cx + 0, fyR - 4, 6, 4, P.black);
  const ty = fyR - 34;
  blk(ctx, cx - 6, ty, 12, 18, [152, 140, 122]);
  px(ctx, cx - 5, ty + 1, 3, 16, [122, 110, 94]);
  blk(ctx, cx - 9, ty + 3, 3, 12, [152, 140, 122]);
  px(ctx, cx - 9, ty + 12, 3, 3, P.skin);
  blk(ctx, cx + 6, ty + 3, 3, 12, [152, 140, 122]);
  px(ctx, cx + 6, ty + 12, 3, 3, P.skin);
  px(ctx, cx + 9, ty + 12, 4, 3, [156, 156, 166]); // trowel
  const hy = fyR - 44;
  blk(ctx, cx - 4, hy, 9, 10, P.skin);
  px(ctx, cx - 3, hy + 1, 3, 8, P.skinShadow);
  px(ctx, cx - 5, hy - 2, 11, 3, [112, 92, 72]);
  px(ctx, cx + 4, hy - 1, 3, 2, [112, 92, 72]); // cap peak
  px(ctx, cx - 1, hy + 4, 1, 2, P.black);
  px(ctx, cx + 3, hy + 4, 1, 2, P.black);
  ctx.restore();
}

const LE_COAT: RGB = [84, 40, 50];
const LE_COAT_L: RGB = [112, 56, 66];
const LE_SKIN: RGB = [150, 182, 158];
const LE_SKIN_D: RGB = [110, 146, 124];
const LE_BEARD: RGB = [30, 32, 44];
const LE_EYE: RGB = [250, 224, 96];

// LeChuck — the ghostly zombie-pirate captain, hovering, glowing-eyed.
export function drawLeChuck(ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right' = 'left', t = 0) {
  const cx = Math.round(fx);
  const fyR = Math.round(fy);
  const float = Math.round(Math.sin(t * 2) * 1.4);
  ctx.save();
  if (facing === 'left') { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
  blk(ctx, cx - 6, fyR - 18 + float, 5, 16, [38, 30, 40]);
  blk(ctx, cx + 1, fyR - 18 + float, 5, 16, [38, 30, 40]);
  const ty = fyR - 42 + float;
  blk(ctx, cx - 10, ty, 20, 28, LE_COAT);
  px(ctx, cx - 9, ty + 1, 4, 26, LE_COAT_L);
  px(ctx, cx - 1, ty + 2, 2, 24, [54, 26, 34]);
  for (let i = 0; i < 4; i++) px(ctx, cx - 1, ty + 4 + i * 5, 2, 2, [228, 188, 96]);
  blk(ctx, cx - 13, ty + 3, 4, 17, LE_COAT);
  px(ctx, cx - 13, ty + 18, 4, 4, LE_SKIN);
  blk(ctx, cx + 9, ty + 3, 4, 17, LE_COAT);
  px(ctx, cx + 9, ty + 18, 4, 4, LE_SKIN);
  const hy = fyR - 50 + float;
  blk(ctx, cx - 6, hy, 13, 12, LE_SKIN);
  px(ctx, cx - 5, hy + 1, 3, 10, LE_SKIN_D);
  px(ctx, cx - 6, hy + 8, 13, 5, LE_BEARD);
  px(ctx, cx - 7, hy + 9, 2, 5, LE_BEARD);
  px(ctx, cx + 6, hy + 9, 2, 5, LE_BEARD);
  px(ctx, cx - 7, hy - 2, 14, 3, LE_BEARD);
  px(ctx, cx - 3, hy + 4, 2, 2, LE_EYE);
  px(ctx, cx + 3, hy + 4, 2, 2, LE_EYE);
  ctx.restore();
}
