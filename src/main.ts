import { ROOMS, START_ROOM } from './rooms';
import { drawActor } from './art/actor';
import { drawPanel, hitPanel, PANEL_Y } from './scumm/ui';
import { buildSentence, wrapText, drawSpeech, drawSpeechLines } from './scumm/interact';
import { currentOptions, drawDialoguePanel, hitDialogueOption } from './scumm/dialogue';
import { DEFAULT_RESPONSES } from './scumm/verbs';
import { makeItem } from './content/items';
import { drawText, textWidth } from './art/font';
import { P, css, type RGB } from './art/palette';
import * as audio from './audio/engine';
import { buildTitleScene } from './screens/title';

const W = 320, H = 200, PLAY_H = 144;

const display = document.getElementById('game') as HTMLCanvasElement;
display.width = W;
display.height = H;
const dctx = display.getContext('2d')!;
dctx.imageSmoothingEnabled = false;

// Responsive: scale the canvas ELEMENT to fit the viewport (CSS image-rendering keeps
// the pixels crisp); show a rotate prompt on portrait mobile.
const rotateEl = document.getElementById('rotate')!;
const isMobile = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
function updateRotate() {
  rotateEl.classList.toggle('show', isMobile && window.innerHeight > window.innerWidth);
}
function fit() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  display.style.width = Math.max(1, Math.round(W * s)) + 'px';
  display.style.height = Math.max(1, Math.round(H * s)) + 'px';
  updateRotate();
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);
document.addEventListener('fullscreenchange', fit);
fit();

// iOS "Add to Home Screen" hint — shown only on Safari when not already standalone.
const pwahint = document.getElementById('pwahint');
{
  const standalone = (navigator as any).standalone === true || matchMedia('(display-mode: standalone)').matches;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  let dismissed = false;
  try { dismissed = localStorage.getItem('montjuic_pwahint') === '1'; } catch (e) { /* ignore */ }
  if (pwahint && ios && !standalone && !dismissed) {
    pwahint.classList.add('show');
    document.getElementById('pwahintx')?.addEventListener('click', (e) => {
      e.stopPropagation();
      pwahint.classList.remove('show');
      try { localStorage.setItem('montjuic_pwahint', '1'); } catch (er) { /* ignore */ }
    });
  }
}

const internal = document.createElement('canvas');
internal.width = W;
internal.height = H;
const ictx = internal.getContext('2d')!;
ictx.imageSmoothingEnabled = false;

const titleBg = buildTitleScene();
// Each scene gets its own default music (overridable via the song selector).
const ROOM_THEME: Record<string, 'town' | 'gate' | 'sardana' | 'medieval'> = {
  port: 'town', mercat: 'town', gate: 'gate',
  rambla: 'sardana', elborn: 'medieval', sagrada: 'town', santamaria: 'medieval',
};
function themeFor(id: string) { return ROOM_THEME[id] || 'town'; }

const bgCache: Record<string, HTMLCanvasElement> = {};
function applyBgImage(room: any) {
  if (!room.bgImage) return;
  const img = new Image();
  img.onload = () => {
    const c = bgCache[room.id];
    if (!c) return;
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = false;
    cx.drawImage(img, 0, 0, 320, 144);
  };
  img.src = room.bgImage;
}
let currentRoom = ROOMS[START_ROOM];
bgCache[currentRoom.id] = currentRoom.build();
applyBgImage(currentRoom);

const state: any = {
  verb: 'Mirar',
  guy: { x: currentRoom.start.x, y: currentRoom.start.y, facing: 'right', moving: false },
  target: null,
  pending: null,
  inventory: [],
  speech: null,
  npcSpeech: null,
  hover: null,
  hoverOpt: -1,
  flags: {},
  used: new Set<string>(),
  dialogue: null,
  selectedItem: null,
  ending: null,
  now: 0,
  screen: 'title',
  settings: false,
  settingsHover: -1,
  showSaveInfo: false,
  saveMsg: '',
  saveMsgUntil: 0,
  about: false,
};

// ---------------- generic room hit-tests ----------------
function inRect(mx: number, my: number, o: any) { return mx >= o.x && mx < o.x + o.w && my >= o.y && my < o.y + o.h; }
function hitHotspotR(mx: number, my: number) { return currentRoom.hotspots.find((h) => inRect(mx, my, h)) || null; }
function hitNPCR(mx: number, my: number) { return currentRoom.npcs.find((n) => inRect(mx, my, n)) || null; }
function hitExitR(mx: number, my: number) { return currentRoom.exits.find((e) => inRect(mx, my, e)) || null; }
function isWalkableR(mx: number, my: number) { const w = currentRoom.walk; return mx >= w.minX && mx <= w.maxX && my >= w.minY && my <= w.maxY; }
function clampWalkR(mx: number, my: number) { const w = currentRoom.walk; return { x: Math.max(w.minX, Math.min(w.maxX, mx)), y: Math.max(w.minY, Math.min(w.maxY, my)) }; }

// ---------------- input ----------------
function toInternal(e: MouseEvent) {
  const rc = display.getBoundingClientRect();
  return { mx: (e.clientX - rc.left) * (W / rc.width), my: (e.clientY - rc.top) * (H / rc.height) };
}

display.addEventListener('pointermove', (e) => {
  if (state.screen === 'title') return;
  const { mx, my } = toInternal(e);
  if (state.about) return;
  if (state.settings) { settingsHoverAt(mx, my); return; }
  if (state.ending) return;
  if (state.dialogue) {
    state.hoverOpt = my >= PANEL_Y ? hitDialogueOption(mx, my, dlgOptions().length) : -1;
    return;
  }
  if (my >= PANEL_Y) {
    const hp = hitPanel(mx, my);
    state.hover = { panelVerb: hp && hp.type === 'verb' ? hp.verb : null };
  } else {
    const ex = hitExitR(mx, my);
    if (ex) { state.hover = { exit: ex }; return; }
    const npc = hitNPCR(mx, my);
    const hs = npc || hitHotspotR(mx, my);
    state.hover = { hotspot: hs, walkable: !hs && isWalkableR(mx, my) };
  }
});

display.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (state.screen === 'title') { startGame(); return; }
  const { mx, my } = toInternal(e);
  if (state.ending) return;
  if (state.dialogue) {
    if (my >= PANEL_Y) {
      const idx = hitDialogueOption(mx, my, dlgOptions().length);
      if (idx >= 0) selectOption(idx);
    }
    return;
  }
  onClick(mx, my);
});

function startGame() {
  if (pwahint) pwahint.classList.remove('show');
  try { audio.start(); audio.setTheme(themeFor(currentRoom.id)); } catch (e) { /* ignore */ }
  if (isMobile) {
    const el: any = document.documentElement;
    try { (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {}); } catch (e) { /* ignore */ }
    try { (screen.orientation as any)?.lock?.('landscape'); } catch (e) { /* ignore */ }
  }
  state.screen = 'game';
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') audio.toggleMute();
  else if (e.key === 'Escape') { if (state.about) state.about = false; else state.settings = false; }
  else if ((e.key === 'Enter' || e.key === ' ') && state.screen === 'title') startGame();
});

function onClick(mx: number, my: number) {
  if (state.about) { handleAboutClick(mx, my); return; }
  if (state.settings) { handleSettingsClick(mx, my); return; }
  if (mx < 16 && my < 16) { audio.toggleMute(); audio.sfx('ui'); return; }
  if (mx >= 17 && mx < 31 && my < 16) { state.settings = true; audio.sfx('ui'); return; }
  if (my >= PANEL_Y) {
    const hp = hitPanel(mx, my);
    if (hp && hp.type === 'verb') { state.verb = hp.verb; state.selectedItem = null; }
    else if (hp && hp.type === 'inv') {
      const it = state.inventory[hp.index];
      if (it) state.selectedItem = state.selectedItem && state.selectedItem.id === it.id ? null : it;
    }
    return;
  }
  const ex = hitExitR(mx, my);
  if (ex) { goTo(ex.walkTo, { kind: 'exit', exit: ex }); return; }
  const npc = hitNPCR(mx, my);
  if (npc) { goTo(npc.walkTo, state.selectedItem ? { kind: 'give', npc, item: state.selectedItem } : { kind: 'npc', verb: state.verb, npc }); return; }
  const hs = hitHotspotR(mx, my);
  if (hs) { state.selectedItem = null; goTo(hs.walkTo, { kind: 'hs', verb: state.verb, hs }); return; }
  state.selectedItem = null;
  goTo(clampWalkR(mx, my), null);
}

function goTo(pt: any, pending: any) {
  state.target = { ...pt };
  state.pending = pending;
  state.guy.moving = true;
  faceTo(pt.x);
}
function faceTo(tx: number) { if (Math.abs(tx - state.guy.x) > 1) state.guy.facing = tx < state.guy.x ? 'left' : 'right'; }

// ---------------- inventory ----------------
function addItem(id: string) { if (!state.inventory.find((it: any) => it.id === id)) state.inventory.push(makeItem(id)); }
function removeItem(id: string) { state.inventory = state.inventory.filter((it: any) => it.id !== id); }
function hasItem(id: string) { return !!state.inventory.find((it: any) => it.id === id); }

// ---------------- actions ----------------
function say(text: string) {
  state.speech = { lines: wrapText(text, 180), until: state.now + Math.max(1500, text.length * 55), color: [238, 238, 224], x: state.guy.x };
}
function npcSays(npc: any, text: string) {
  state.npcSpeech = { lines: wrapText(text, 190), until: state.now + Math.max(1800, text.length * 55), color: npc.color, x: npc.feet.x, headY: npc.feet.y - 52 };
}

function runAction(verb: string, hs: any) {
  state.guy.facing = hs.x + hs.w / 2 < state.guy.x ? 'left' : 'right';
  let text: string;
  if (verb === 'Coger' && hs.pickup) {
    addItem(hs.pickup.id);
    audio.sfx('pickup');
    state.flags['took_' + hs.pickup.id] = true;
    const idx = currentRoom.hotspots.indexOf(hs);
    if (idx >= 0) currentRoom.hotspots.splice(idx, 1);
    text = hs.responses?.Coger || 'Cogido.';
  } else if (verb === 'Mirar') {
    text = hs.look || DEFAULT_RESPONSES.Mirar;
  } else {
    text = hs.responses?.[verb] || DEFAULT_RESPONSES[verb] || 'Mmm.';
  }
  say(text);
}

function handleNPC(verb: string, npc: any) {
  state.guy.facing = npc.feet.x < state.guy.x ? 'left' : 'right';
  if (verb === 'Hablar con' && npc.dialogue) openDialogue(npc);
  else if (verb === 'Mirar') say(npc.look);
  else say(DEFAULT_RESPONSES[verb] || 'No parece buena idea.');
}

function giveItem(npc: any, item: any) {
  state.guy.facing = npc.feet.x < state.guy.x ? 'left' : 'right';
  state.selectedItem = null;
  const rule = npc.accepts?.[item.id];
  if (!rule) { npcSays(npc, 'No, gracias. No me hace ninguna falta.'); return; }
  if (rule.needAlso && !hasItem(rule.needAlso)) { npcSays(npc, rule.missing || 'Te falta algo.'); return; }
  npcSays(npc, rule.line);
  audio.sfx(rule.win ? 'win' : 'give');
  (rule.remove || [item.id]).forEach(removeItem);
  if (rule.give) addItem(rule.give);
  if (rule.flag) state.flags[rule.flag] = true;
  if (rule.win) state.ending = { since: state.now };
}

// ---------------- dialogue ----------------
function dlgOptions() {
  const d = state.dialogue;
  return d ? currentOptions(d.npc.dialogue, d.node, state.flags, state.used) : [];
}
function openDialogue(npc: any) {
  state.dialogue = { npc, node: 'start', lines: wrapText(npc.dialogue.start.npc, 190) };
  state.speech = null; state.npcSpeech = null;
}
function selectOption(i: number) {
  const d = state.dialogue;
  if (!d) return;
  const o = dlgOptions()[i];
  if (!o) return;
  if (o.set) state.flags[o.set] = true;
  if (o.give) addItem(o.give);
  if (o.once) state.used.add(o.key);
  state.speech = { lines: wrapText(o.text, 180), until: state.now + Math.max(1200, o.text.length * 45), color: [238, 238, 224], x: state.guy.x };
  if (o.to === 'end') { state.dialogue = null; return; }
  d.node = o.to;
  d.lines = wrapText(d.npc.dialogue[o.to].npc, 190);
}

// ---------------- rooms ----------------
function switchRoom(toId: string, entry: any) {
  currentRoom = ROOMS[toId];
  if (!bgCache[toId]) bgCache[toId] = currentRoom.build();
  applyBgImage(currentRoom);
  audio.setTheme(themeFor(toId));
  audio.sfx('door');
  state.guy.x = entry.x; state.guy.y = entry.y;
  state.guy.moving = false; state.target = null; state.pending = null;
  state.dialogue = null; state.speech = null; state.npcSpeech = null; state.selectedItem = null;
  saveGame(true);
}

// ---------------- save / load (localStorage) ----------------
const SAVE_KEY = 'montjuic_save_v1';
function flashSave(msg: string) { state.saveMsg = msg; state.saveMsgUntil = state.now + 1900; }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function saveGame(silent = false) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      room: currentRoom.id,
      guy: { x: Math.round(state.guy.x), y: Math.round(state.guy.y), facing: state.guy.facing },
      verb: state.verb,
      inv: state.inventory.map((i: any) => i.id),
      flags: state.flags,
      used: Array.from(state.used),
      song: audio.getSong(),
    }));
    if (!silent) flashSave('Partida guardada');
  } catch (e) { if (!silent) flashSave('No se pudo guardar'); }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { flashSave('No hay partida'); return; }
    const d = JSON.parse(raw);
    state.flags = d.flags || {};
    state.used = new Set(d.used || []);
    state.inventory = (d.inv || []).map((id: string) => makeItem(id));
    state.verb = d.verb || 'Mirar';
    state.screen = 'game';
    switchRoom(d.room || 'port', d.guy || ROOMS[d.room || 'port'].start);
    if (d.guy) state.guy.facing = d.guy.facing || 'right';
    if (d.song) { audio.setSong(d.song); if (d.song === 'auto') audio.setTheme(themeFor(currentRoom.id)); }
    state.settings = false;
    flashSave('Partida cargada');
  } catch (e) { flashSave('No se pudo cargar'); }
}
function eraseGame() { try { localStorage.removeItem(SAVE_KEY); flashSave('Partida borrada'); } catch (e) { /* ignore */ } }

// ---------------- render bits ----------------
function drawExitArrows(ctx: CanvasRenderingContext2D, t: number) {
  const pulse = (0.55 + 0.45 * Math.sin(t * 3)).toFixed(2);
  for (const ex of currentRoom.exits) {
    const cx = ex.x + ex.w / 2, cy = ex.y + ex.h / 2;
    ctx.fillStyle = `rgba(250,228,152,${pulse})`;
    ctx.beginPath();
    if (ex.arrow === 'left') { ctx.moveTo(cx + 3, cy - 4); ctx.lineTo(cx - 3, cy); ctx.lineTo(cx + 3, cy + 4); }
    else if (ex.arrow === 'right') { ctx.moveTo(cx - 3, cy - 4); ctx.lineTo(cx + 3, cy); ctx.lineTo(cx - 3, cy + 4); }
    else { ctx.moveTo(cx - 4, cy + 3); ctx.lineTo(cx, cy - 3); ctx.lineTo(cx + 4, cy + 3); }
    ctx.closePath(); ctx.fill();
  }
}
function vignette(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(160, 64, 64, 160, 76, 210);
  g.addColorStop(0, 'rgba(16,10,14,0)');
  g.addColorStop(1, 'rgba(16,10,14,0.26)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, PLAY_H);
}
function drawEnding(ctx: CanvasRenderingContext2D) {
  const dt = state.now - state.ending.since;
  const a = Math.min(0.82, (dt / 1600) * 0.82);
  ctx.fillStyle = `rgba(8,6,12,${a.toFixed(2)})`;
  ctx.fillRect(0, 0, W, H);
  if (dt < 950) return;
  const lines = ['EPISODIO 1 COMPLETADO', '', 'El Secreto de Montjuïc', '', 'Guybrush cruza la puerta del castillo,', 'y una risa fantasmal resuena en la piedra...', '', 'Continuarà...'];
  let y = 44;
  for (const ln of lines) {
    if (ln) {
      const w = textWidth(ln, 1, 1);
      const hot = ln.includes('COMPLETADO') || ln.includes('Continuarà');
      drawText(ctx, ln, Math.round(W / 2 - w / 2), y, hot ? P.verbHot : P.inkLight, 1, P.black, 1);
    }
    y += 12;
  }
}

const titleGulls = [[60, 40, 8], [200, 30, 6], [120, 22, 5]];
function centerText(s: string, y: number, scale: number, color: RGB) {
  const w = textWidth(s, scale, 1);
  drawText(ictx, s, Math.round(160 - w / 2), y, color, scale, P.black, 1);
}
function drawTitle(t: number) {
  ictx.drawImage(titleBg, 0, 0);
  ictx.fillStyle = css(P.black);
  for (const [bx, by, sp] of titleGulls) {
    const x = Math.round(((bx + t * sp) % 360) - 20);
    const y = Math.round(by + Math.sin(t * 1.3 + bx) * 3);
    const flap = Math.sin(t * 5 + bx) > 0 ? 0 : 1;
    ictx.fillRect(x, y, 1, 1); ictx.fillRect(x - 2, y - 1 + flap, 2, 1); ictx.fillRect(x + 1, y - 1 + flap, 2, 1);
  }
  centerText('EL SECRETO DE', 26, 2, P.inkLight);
  centerText('MONTJUÏC', 50, 4, P.verbHot);
  centerText('Episodio 1: El Puerto', 98, 1, P.inkLight);
  if (Math.sin(t * 3) > 0) centerText('Haz clic para empezar', 172, 1, P.verbHot);
  centerText('un spin-off de Monkey Island · por Angel Jaime', 190, 1, P.verbIdle);
}
function drawMusicIcon(ctx: CanvasRenderingContext2D) {
  const on = !audio.isMuted();
  const col: RGB = on ? [236, 224, 184] : [120, 112, 104];
  ctx.fillStyle = 'rgba(20,14,18,0.55)';
  ctx.fillRect(2, 3, 14, 12);
  ctx.fillStyle = css(col);
  ctx.fillRect(5, 8, 2, 3);
  ctx.beginPath(); ctx.moveTo(7, 6); ctx.lineTo(7, 13); ctx.lineTo(10, 9); ctx.closePath(); ctx.fill();
  if (on) { ctx.fillRect(12, 8, 1, 3); ctx.fillRect(13, 7, 1, 5); }
  else { ctx.fillRect(12, 7, 1, 1); ctx.fillRect(14, 7, 1, 1); ctx.fillRect(13, 8, 1, 1); ctx.fillRect(12, 9, 1, 1); ctx.fillRect(14, 9, 1, 1); }
}

// ---------------- settings: songs + save ----------------
const SETT = { x: 66, y: 22, w: 188, h: 168 };
const songY = (i: number) => SETT.y + 30 + i * 11;
const SOUND_Y = () => SETT.y + 78;
const SAVE_Y = () => SETT.y + 108;
const CLOSE_Y = () => SETT.y + SETT.h - 13;
function drawGearIcon(ctx: CanvasRenderingContext2D) {
  const col: RGB = state.settings ? [250, 228, 152] : [212, 198, 162];
  ctx.fillStyle = 'rgba(20,14,18,0.55)';
  ctx.fillRect(17, 3, 14, 12);
  ctx.fillStyle = css(col);
  for (let a = 0; a < 8; a++) {
    const an = a * Math.PI / 4;
    ctx.fillRect(Math.round(24 + Math.cos(an) * 5) - 1, Math.round(9 + Math.sin(an) * 5) - 1, 2, 2);
  }
  ctx.beginPath(); ctx.arc(24, 9, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = css(P.panelWood);
  ctx.beginPath(); ctx.arc(24, 9, 1.6, 0, Math.PI * 2); ctx.fill();
}
function selectSong(key: string) {
  audio.setSong(key);
  if (key === 'auto') audio.setTheme(themeFor(currentRoom.id));
  audio.sfx('ui');
}
function settingsHoverAt(mx: number, my: number) {
  state.settingsHover = -1;
  if (mx < SETT.x || mx > SETT.x + SETT.w) return;
  for (let i = 0; i < audio.SONGS.length; i++) if (my >= songY(i) - 2 && my < songY(i) + 9) state.settingsHover = i;
}
function handleSettingsClick(mx: number, my: number) {
  if (mx < SETT.x || mx > SETT.x + SETT.w || my < SETT.y || my > SETT.y + SETT.h) { state.settings = false; return; }
  for (let i = 0; i < audio.SONGS.length; i++) if (my >= songY(i) - 2 && my < songY(i) + 9) { selectSong(audio.SONGS[i].key); return; }
  if (my >= SOUND_Y() - 2 && my < SOUND_Y() + 9) { audio.toggleMute(); return; }
  if (my >= SAVE_Y() - 2 && my < SAVE_Y() + 10) {
    if (mx < SETT.x + 56) saveGame();
    else if (mx < SETT.x + 100) loadGame();
    else if (mx < SETT.x + 146) eraseGame();
    else state.showSaveInfo = !state.showSaveInfo;
    return;
  }
  if (my >= CLOSE_Y() - 2) {
    if (mx < SETT.x + 64) state.about = true;
    else if (mx >= SETT.x + SETT.w - 50) state.settings = false;
  }
}
function drawSettings(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(8,6,12,0.6)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = css(P.panelWood); ctx.fillRect(SETT.x, SETT.y, SETT.w, SETT.h);
  ctx.fillStyle = css(P.panelWoodLit); ctx.fillRect(SETT.x, SETT.y, SETT.w, 1); ctx.fillRect(SETT.x, SETT.y, 1, SETT.h);
  ctx.fillStyle = css(P.black); ctx.fillRect(SETT.x, SETT.y + SETT.h - 1, SETT.w, 1); ctx.fillRect(SETT.x + SETT.w - 1, SETT.y, 1, SETT.h);
  const ctr = (s: string, y: number, col: RGB) => { const w = textWidth(s, 1, 1); drawText(ctx, s, Math.round(SETT.x + SETT.w / 2 - w / 2), y, col, 1, P.black, 1); };
  ctr('AJUSTES', SETT.y + 5, P.verbHot);
  drawText(ctx, 'Música', SETT.x + 8, SETT.y + 18, P.inkLight, 1, P.black, 1);
  for (let i = 0; i < audio.SONGS.length; i++) {
    const cur = audio.getSong() === audio.SONGS[i].key;
    const col = cur ? P.verbHot : (state.settingsHover === i ? P.inkLight : P.verbIdle);
    drawText(ctx, (cur ? '· ' : '  ') + audio.SONGS[i].label, SETT.x + 14, songY(i), col, 1, P.black, 1);
  }
  drawText(ctx, 'Sonido: ' + (audio.isMuted() ? 'Off' : 'On'), SETT.x + 8, SOUND_Y(), P.inkLight, 1, P.black, 1);
  drawText(ctx, 'Partida', SETT.x + 8, SETT.y + 94, P.inkLight, 1, P.black, 1);
  drawText(ctx, 'Guardar', SETT.x + 8, SAVE_Y(), P.verbIdle, 1, P.black, 1);
  drawText(ctx, 'Cargar', SETT.x + 58, SAVE_Y(), hasSave() ? P.verbIdle : P.panelWoodLit, 1, P.black, 1);
  drawText(ctx, 'Borrar', SETT.x + 102, SAVE_Y(), P.verbIdle, 1, P.black, 1);
  drawText(ctx, '(i)', SETT.x + 150, SAVE_Y(), state.showSaveInfo ? P.verbHot : P.verbIdle, 1, P.black, 1);
  if (state.showSaveInfo) {
    const info = ['Tu progreso se guarda solo en', 'este navegador. Sobrevive al', 'refrescar: pulsa Cargar para', 'seguir. Borrar lo elimina.'];
    for (let i = 0; i < info.length; i++) drawText(ctx, info[i], SETT.x + 8, SETT.y + 120 + i * 9, P.skin, 1, P.black, 1);
  } else if (state.saveMsg && state.now < state.saveMsgUntil) {
    ctr(state.saveMsg, SETT.y + 126, P.verbHot);
  }
  drawText(ctx, 'Acerca de', SETT.x + 8, CLOSE_Y(), P.verbIdle, 1, P.black, 1);
  drawText(ctx, 'Cerrar', SETT.x + SETT.w - 44, CLOSE_Y(), P.verbIdle, 1, P.black, 1);
}

// ---------------- about / legal ----------------
const ABOUT = { x: 28, y: 14, w: 264, h: 178 };
const ABOUT_LINES = [
  'Un spin-off de fans de Monkey Island.',
  '',
  '(c) 2026 Angel Jaime Ruiz.',
  'Todos los derechos reservados sobre el',
  'código, el arte y la música originales.',
  '',
  'Juego de fans, por afición y sin ánimo',
  'de lucro. NO es un producto oficial.',
  '"Monkey Island", sus personajes y marcas',
  'son propiedad de sus titulares',
  '(Lucasfilm / Disney). Este juego no está',
  'afiliado ni respaldado por ellos: es un',
  'homenaje inspirado en su estilo.',
];
function handleAboutClick(mx: number, my: number) {
  if (mx < ABOUT.x || mx > ABOUT.x + ABOUT.w || my < ABOUT.y || my > ABOUT.y + ABOUT.h) { state.about = false; return; }
  if (my >= ABOUT.y + ABOUT.h - 15) state.about = false; // "Volver"
}
function drawAbout(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(8,6,12,0.72)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = css(P.panelWood); ctx.fillRect(ABOUT.x, ABOUT.y, ABOUT.w, ABOUT.h);
  ctx.fillStyle = css(P.panelWoodLit); ctx.fillRect(ABOUT.x, ABOUT.y, ABOUT.w, 1); ctx.fillRect(ABOUT.x, ABOUT.y, 1, ABOUT.h);
  ctx.fillStyle = css(P.black); ctx.fillRect(ABOUT.x, ABOUT.y + ABOUT.h - 1, ABOUT.w, 1); ctx.fillRect(ABOUT.x + ABOUT.w - 1, ABOUT.y, 1, ABOUT.h);
  const ctrA = (s: string, y: number, col: RGB) => { const w = textWidth(s, 1, 1); drawText(ctx, s, Math.round(ABOUT.x + ABOUT.w / 2 - w / 2), y, col, 1, P.black, 1); };
  ctrA('EL SECRETO DE MONTJUÏC', ABOUT.y + 6, P.verbHot);
  for (let i = 0; i < ABOUT_LINES.length; i++) {
    const col = ABOUT_LINES[i].startsWith('(c)') ? P.inkLight : P.skin;
    drawText(ctx, ABOUT_LINES[i], ABOUT.x + 9, ABOUT.y + 20 + i * 9, col, 1, P.black, 1);
  }
  ctrA('Volver', ABOUT.y + ABOUT.h - 11, P.verbHot);
}

// ---------------- loop ----------------
const SPEED = 64;
let last = 0, start = 0;

function update(dt: number) {
  if (state.guy.moving && state.target) {
    const dx = state.target.x - state.guy.x, dy = state.target.y - state.guy.y;
    const dist = Math.hypot(dx, dy);
    const step = SPEED * dt;
    if (dist <= step) {
      state.guy.x = state.target.x; state.guy.y = state.target.y;
      state.guy.moving = false; state.target = null;
      const p = state.pending; state.pending = null;
      if (p) {
        if (p.kind === 'exit') switchRoom(p.exit.to, p.exit.entry);
        else if (p.kind === 'give') giveItem(p.npc, p.item);
        else if (p.kind === 'npc') handleNPC(p.verb, p.npc);
        else runAction(p.verb, p.hs);
      }
    } else {
      state.guy.x += (dx / dist) * step;
      state.guy.y += (dy / dist) * step;
    }
  }
}

function frame(ts: number) {
  if (!start) { start = ts; last = ts; }
  const dt = Math.min(0.05, (ts - last) / 1000);
  last = ts;
  state.now = ts;
  const t = (ts - start) / 1000;

  if (state.screen === 'title') {
    drawTitle(t);
    dctx.drawImage(internal, 0, 0);
    requestAnimationFrame(frame);
    return;
  }

  if (!state.ending && !state.settings) update(dt);

  ictx.drawImage(bgCache[currentRoom.id], 0, 0);
  if (!currentRoom.bgImage) currentRoom.overlays?.(ictx, t);
  currentRoom.dynamic?.(ictx, state, t);
  for (const npc of currentRoom.npcs) {
    npc.draw(ictx, npc.feet.x, npc.feet.y, state.guy.x < npc.feet.x ? 'left' : 'right', t);
  }
  drawExitArrows(ictx, t);
  drawActor(ictx, state.guy.x, state.guy.y, state.guy.facing, state.guy.moving, t, Math.sin(t * 2.2) * 1.2);
  if (state.dialogue) {
    const d = state.dialogue;
    drawSpeechLines(ictx, d.lines, d.npc.feet.x, d.npc.feet.y - 52, d.npc.color, W);
  }
  if (state.npcSpeech && state.now < state.npcSpeech.until) {
    const s = state.npcSpeech;
    drawSpeechLines(ictx, s.lines, s.x, s.headY, s.color, W);
  }
  drawSpeech(ictx, state, W);
  vignette(ictx);
  if (state.dialogue) drawDialoguePanel(ictx, dlgOptions(), state.hoverOpt);
  else drawPanel(ictx, buildSentence(state), state.verb, state.inventory, state.selectedItem ? state.selectedItem.id : null);
  drawMusicIcon(ictx);
  drawGearIcon(ictx);
  if (state.settings) drawSettings(ictx);
  if (state.about) drawAbout(ictx);
  if (state.ending) drawEnding(ictx);

  dctx.drawImage(internal, 0, 0);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Debug hook for headless verification.
(window as any).__game = {
  state,
  get room() { return currentRoom.id; },
  onClick,
  selectOption,
  dlgOptions,
  switchRoom,
  settle() {
    if (state.target) { state.guy.x = state.target.x; state.guy.y = state.target.y; }
    state.guy.moving = false; state.target = null;
    const p = state.pending; state.pending = null;
    if (p) {
      if (p.kind === 'exit') switchRoom(p.exit.to, p.exit.entry);
      else if (p.kind === 'give') giveItem(p.npc, p.item);
      else if (p.kind === 'npc') handleNPC(p.verb, p.npc);
      else runAction(p.verb, p.hs);
    }
  },
};
