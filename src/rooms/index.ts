import type { Room } from '../engine/types';
import {
  buildPortScene, portOverlays, drawRope,
  PORT_HOTSPOTS, PORT_NPCS, PORT_WALK, PORT_START,
} from './port';
import { MERCAT } from './mercat';
import { GATE } from './gate';

const PORT: Room = {
  id: 'port',
  build: buildPortScene,
  overlays: portOverlays,
  dynamic: (ctx, state) => { if (!state.flags.took_cuerda) drawRope(ctx); },
  hotspots: PORT_HOTSPOTS,
  npcs: PORT_NPCS,
  exits: [
    { id: 'toMercat', name: 'la ciudad', x: 300, y: 108, w: 20, h: 34, walkTo: { x: 302, y: 136 }, to: 'mercat', entry: { x: 30, y: 135 }, arrow: 'right' },
  ],
  walk: PORT_WALK,
  start: PORT_START,
};

export const ROOMS: Record<string, Room> = {
  port: PORT,
  mercat: MERCAT,
  gate: GATE,
};

export const START_ROOM = 'port';
