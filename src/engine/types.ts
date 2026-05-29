import type { Dialogue } from '../content/dialogues';

export interface Hotspot {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number;
  walkTo: { x: number; y: number };
  look: string;
  responses?: Record<string, string>;
  pickup?: { id: string; name: string };
  pickupIf?: string;        // only collectable once this flag is set
  pickupBlocked?: string;   // line shown when trying to collect before pickupIf
  needs?: string[];         // Abrir/Usar requires all these item ids (e.g. the vault keys)
  needsBlocked?: string;    // line shown when items are missing
  flag?: string;            // flag raised when the `needs` are satisfied
  card?: string[];          // ending/transition card shown when `needs` satisfied
  goto?: string;            // room to travel to after the card (absent = terminal)
}

// What an NPC will accept when you `Dar` an item to it.
export interface NPCAccept {
  needAlso?: string;   // require this other item in inventory too
  missing?: string;    // line if needAlso is missing
  line: string;        // NPC's line on success
  give?: string;       // item id granted in return
  remove?: string[];   // item ids consumed (defaults to the given item)
  flag?: string;       // flag raised
  win?: boolean;       // triggers the ending
  card?: string[];     // ending/transition card shown on success
  goto?: string;       // room to travel to after the card (absent = terminal)
}

export interface NPC {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number; // click area
  feet: { x: number; y: number };
  facing: 'left' | 'right';
  walkTo: { x: number; y: number };
  color: [number, number, number];
  look: string;
  draw: (ctx: CanvasRenderingContext2D, fx: number, fy: number, facing: 'left' | 'right', t: number) => void;
  dialogue?: Dialogue;
  accepts?: Record<string, NPCAccept>;
  hideIf?: string;          // not drawn / not interactable once this flag is set
  showIf?: string;          // only drawn / interactable once this flag is set
}

export interface Exit {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number;
  walkTo: { x: number; y: number };
  to: string;               // destination room id
  entry: { x: number; y: number };
  arrow: 'left' | 'right' | 'up';
}

export interface Room {
  id: string;
  build: () => HTMLCanvasElement;          // paints the static background (cached)
  bgImage?: string;                        // optional painted/AI background drawn over build()
  overlays?: (ctx: CanvasRenderingContext2D, t: number) => void; // animated bg
  dynamic?: (ctx: CanvasRenderingContext2D, state: any, t: number) => void; // pickable props
  hotspots: Hotspot[];
  npcs: NPC[];
  exits: Exit[];
  walk: { minX: number; maxX: number; minY: number; maxY: number };
  start: { x: number; y: number };
}
