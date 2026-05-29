# BUILD PROMPT — *El Secreto de Montjuïc* (Episodio 1)

> Paste this whole file into Claude Code as the task brief. It is the complete spec for a
> playable mini point‑and‑click adventure: a LucasArts‑style homage set in pirate‑era
> Barcelona, built in the visual and interface style of **Monkey Island 2: LeChuck's Revenge**.
> Build it incrementally, verifying each milestone in the browser before moving on.

---

## 0. Mission (read this first)

Build **Episode 1** of *El Secreto de Montjuïc*: a complete, self‑contained, browser‑playable
SCUMM‑style point‑and‑click adventure game. It must look and feel like **Monkey Island 2 (1991)**
— the VGA 256‑colour painterly era — **not** the older, blockier EGA look of MI1 or Maniac Mansion.
Pixel art, yes; crude and ancient, no. Think hand‑painted backgrounds, warm light, a 9‑verb
interface, an icon inventory, dialogue trees, and a lazy island‑groove soundtrack that adapts as
you move around.

The whole game is **code‑drawn** (no external image/audio files) so it runs offline and is trivial
to iterate, **but** every background sits behind a swap seam so AI‑painted scenes can replace the
programmatic art later, room by room, without touching game logic (see §4 and §11).

**This is a personal homage / fan project.** Use the Monkey Island characters and vibe for the
private build. Write **original** code, **original** art, and **original** music *in the style of*
— do not copy or embed any actual LucasArts assets, sprites, MIDI, or audio. (If this is ever
shared publicly, plan to rename the characters and file the serial numbers off — leave a
`CHARACTERS_canonical_vs_public.md` note for that, but ship Episode 1 with the MI names.)

---

## 1. What we are building

- **Genre:** 2D point‑and‑click graphic adventure (SCUMM/LucasArts lineage).
- **Platform:** Web. Runs in a desktop browser. `npm install && npm run dev` → playable.
- **Target feel:** *Monkey Island 2*. Comedy, puns, anachronisms, absurd inventory logic, and a
  signature insult‑duel set‑piece (here: a Catalan **glosat** — improvised insult verses).
- **Language of all in‑game text:** **Spanish (Castilian) with Catalan touches** — Barcelona
  in‑jokes, Catalan words and expressions sprinkled in (bon dia, nano, això rai, déu‑n'hi‑do,
  els castellers). The *verbs* stay in clear Spanish for usability; the *flavour* lives in the
  dialogue. (This brief is written in English on purpose — it's instructions for you, the coding
  agent. Keep code comments in English; keep player‑facing strings in es/ca.)
- **Scope:** ONE episode. ~4–5 rooms, ~6 NPCs, one clean puzzle chain, one insult‑duel mini‑game,
  an adaptive soundtrack, title + save/load. Roughly 20–30 min of play. Built so Episode 2+ can be
  added as data, not rewrites.

---

## 2. Tech stack & project structure

- **TypeScript + Vite** (fast HMR, simple `npm run dev`), **HTML5 Canvas 2D**, **Web Audio API**.
- **No game engine and no art/audio asset files.** Keep it lean, readable, and fully understandable
  — everything is drawn and synthesised in code. This is deliberate; it's what makes iteration and
  the later AI‑art swap clean.
- **Data‑driven rooms:** a room is a data object (background draw fn, hotspots, walk area, exits,
  per‑verb scripts), so adding rooms/episodes is content, not engine work.

```
montjuic-game/
  index.html
  package.json
  vite.config.ts
  src/
    main.ts                 # boot: title screen → game loop
    engine/
      loop.ts               # fixed‑timestep game loop + rendering pipeline
      renderer.ts           # offscreen 320×200 canvas, nearest‑neighbour upscale
      input.ts              # mouse → world coords, click routing
      scene.ts              # current room, transitions, fade
      state.ts              # GameState: flags, inventory, currentRoom; save/load (localStorage)
      pathfind.ts           # walkable‑polygon clamp + simple path
    art/
      palette.ts            # curated VGA‑ish palette (Barcelona warm Mediterranean)
      dither.ts             # ordered (Bayer) dithering helpers for gradients
      draw.ts               # primitives: gradientSky, sea, stoneWall, woodPlank, torchGlow…
      actor.ts              # character rig: parts + walk/talk/idle frames
    scumm/
      verbs.ts              # the 9 verbs, sentence line, default‑verb logic
      cursor.ts             # cursor + hotspot highlight
      inventory.ts          # icon inventory grid + scroll
      dialogue.ts           # dialogue trees, coloured speech, numbered choices
      ui.ts                 # bottom verb panel layout & rendering (MI2 style)
    rooms/
      port.ts               # Room 1: El Port (docks, Stan, customs gate)
      taberna.ts            # Room 2: La Taverna del Pop (insult duel)
      gotic.ts              # Room 3: El Barri Gòtic (La Vidente, casteller)
      mercat.ts             # Room 4: El Mercat (churrero, chocolatera)
      montjuic_gate.ts      # Room 5: La Porta de Montjuïc (the goal / cliffhanger)
      index.ts             # room registry
    minigames/
      glosat.ts             # insult‑duel mini‑game (verse → correct comeback)
    audio/
      engine.ts             # Web Audio scheduler (lookahead), master bus, crossfades
      instruments.ts        # synth voices: nylon guitar (Karplus‑Strong), marimba, bass, perc
      music.ts              # per‑room compositions as data; iMUSE‑lite section logic
      sfx.ts                # footsteps, pickup, door, UI, duel stingers
    content/
      strings.ts            # all player‑facing es/ca text in one place (easy to proof/translate)
      items.ts              # inventory item defs (id, name, icon draw fn, combine rules)
      insults.ts            # glosat insult/comeback pairs
    types.ts
```

If a one‑file‑per‑room split feels heavy mid‑build, collapse sensibly — but keep rooms data‑driven
and keep `content/strings.ts` as the single source of player‑facing text.

---

## 3. Visual style — the *Monkey Island 2* VGA look

This is the thing the user cares about most. Get the **look** right.

- **Internal resolution: 320×200.** Draw the whole game to an offscreen canvas at 320×200, then
  upscale to the window with **nearest‑neighbour** (`ctx.imageSmoothingEnabled = false`,
  `image-rendering: pixelated`) at an integer scale (×3 or ×4). Crisp chunky pixels — never blurry,
  never sub‑pixel. (320×200 is MI2's actual resolution; honour it.)
- **Palette:** a curated, warm **Mediterranean VGA** palette in `palette.ts` (~32–48 named colours).
  Terracotta roofs, golden sandstone, sea blues/teals, sunset orange, deep night indigo, torch
  amber. Pick from the palette — do not use arbitrary 24‑bit colours — to keep the cohesive
  painted‑VGA feel.
- **Dithering:** use **ordered (Bayer 4×4) dithering** for all gradients — skies, sea, torch glow,
  wall shading. This is the single most important trick for the MI2 painted look. Provide
  `ditherGradient(ctx, rect, colorTop, colorBottom)` in `dither.ts`.
- **Backgrounds are "painted" programmatically:** each room background is a `drawBackground(ctx)`
  built from layered shapes + gradients + dithering + a little hand‑placed texture/noise (cracks in
  stone, planks, cobbles, reflections on water). Aim for *depth and warmth*, not flat fills. Add a
  subtle vignette / directional light per scene for mood.
- **Time‑of‑day variety:** Port & Mercat = warm daylight; Barri Gòtic = golden dusk; Taverna
  interior = candle/torch warm‑dark. MI2 was moody — lean into lighting contrast between rooms.
- **Characters (`art/actor.ts`):** sprite height ≈ ⅓ of screen height (MI proportions). Build each
  actor as a small **rigged figure** (head, torso, two arms, two legs, simple hands) drawn in the
  palette, with:
  - **idle** (subtle breathing / occasional blink),
  - **walk cycle** (4–8 frames, left/right + toward/away facings),
  - **talk** (mouth flap while a line is on screen).
  Guybrush: light shirt, scruffy look, the iconic "mighty pirate" silhouette (original art, not
  copied). Give each NPC a distinct silhouette and palette so they read instantly at 320×200.
- **No anti‑aliased text.** Use a bitmap/pixel font (draw a simple 1‑bit pixel font, or use a
  pixel webfont bundled as code/Base64 — but prefer a tiny hand‑drawn bitmap font for authenticity).
  SCUMM speech text is **outlined** (1px dark outline) so it reads over any background.

---

## 4. The interface — SCUMM / *Monkey Island 2*

Recreate the MI2 control scheme faithfully.

- **Bottom verb panel** (a fixed band across the lower ~⅓ of the screen), MI2 layout:
  - **9 verbs** in a 3×3‑ish grid, in Spanish:
    `Abrir · Cerrar · Dar` / `Coger · Mirar · Hablar con` / `Usar · Empujar · Tirar de`
    (Open, Close, Give / Pick up, Look at, Talk to / Use, Push, Pull). These are MI2's nine verbs.
  - **Icon inventory** on the right side of the panel: a grid of drawn item icons with up/down
    scroll arrows (MI2 used graphical inventory, not text).
- **Sentence line:** one line just above the verb panel showing the sentence being built —
  e.g. `Usar llave oxidada con la puerta`, `Mirar la estatua de Colón`. Hovering a hotspot shows
  its name; a sensible **default verb** activates on hover (Mirar for scenery, Hablar con for
  people, Coger for takeable items) so single‑clicks feel good.
- **Cursor & hotspots:** custom pixel cursor; on hover over a hotspot, highlight it (brighten /
  name in sentence line). Left‑click = perform current verb on target; clicking the floor = walk.
- **Walk:** click a walkable point → actor pathfinds within the room's **walkable polygon** (clamp
  to polygon edges; a simple straight‑line‑with‑edge‑clamp is fine, A* optional). Actor scales
  slightly smaller toward the back of the room for fake depth (MI did this).
- **Dialogue trees (`dialogue.ts`):** when you `Hablar con` an NPC, show **numbered response
  options** at the bottom; spoken lines appear as **coloured outlined text above the speaker's head**
  (each character gets a fixed text colour, SCUMM‑style). Support branching, one‑time lines, and
  flag‑gated options.
- **Title screen:** "EL SECRETO DE MONTJUÏC" logo (drawn, painterly, with a Barcelona skyline
  silhouette — Montjuïc hill, the sea, a galleon), an MI‑style theme playing, menu: *Jugar ·
  Continuar · Créditos*. End‑of‑episode: a "Continuarà…" card.
- **Save/Load:** serialise `GameState` to `localStorage`; auto‑save on room change + manual save.

**The AI‑art swap seam (important):** each room exposes either a `drawBackground(ctx)` **or** an
optional `backgroundImage` field. The renderer prefers `backgroundImage` when present, else calls
`drawBackground`. Hotspots, walk polygon, and scripts are defined in *320×200 coordinates*
independent of how the background is produced. That single indirection is what lets a future pass
drop AI‑painted 320×200 (or higher‑res, downsampled) scene art into any room without touching logic.
Document this seam in the README.

---

## 5. Story & setting — Episode 1

**The pun the whole thing hangs on:** *The Secret of Monkey Island* → ***El Secreto de Montjuïc***.
(Montjuïc, the hill over Barcelona's port, reads as "Mont‑juïc" ≈ "Monkey." Lean into it.)

**Setting:** an anachronistic, late‑1600s **pirate‑era Barcelona** — a sun‑baked Mediterranean port
town. The old port and wharves, the Barri Gòtic's narrow sandstone streets, a market, and the
fortified hill of **Montjuïc** looming over it all. MI‑style anachronisms are encouraged and funny:
characters reference castellers, pa amb tomàquet, a "futbol club que aún no existe," an architect
"que tardará dos siglos en llegar," the metro, tourists, etc.

**Premise:** **Guybrush Threepwood**, self‑proclaimed *pirata temible*, sails into the Port of
Barcelona chasing a legend: a secret treasure sealed inside the castle atop **Montjuïc**. The
castle gate is guarded and the city's bureaucracy is impassable. To climb the hill, Guybrush must
talk, scheme, trade, and out‑insult half of Barcelona to get a single stamped pass. As he finally
steps through the gate at the top — a familiar ghostly laugh echoes from inside the hill.
**Continuarà…** (LeChuck is the looming antagonist for later episodes; keep him to a teaser here.)

### Rooms

1. **El Port** (daylight) — wharves, moored boats, the sea, **Stan's used‑boat stand** ("Embarcacions
   de Segona Mà"), and the **Aduana** (customs desk + the city gate). The grumpy **Aduanero** and the
   manic salesman **Stan** live here. Arrival cutscene starts here.
2. **La Taverna del Pop** (warm torch‑dark) — the pirate bar (the Scumm‑Bar role). A gruff
   **Tabernero**, a brazier with hot coals, and three **mariners de poca fibra moral**, including the
   house **glosador** (insult‑duel champion). The duel happens here.
3. **El Barri Gòtic** (golden dusk) — medieval streets, a cathedral, a well, laundry on a balcony.
   **La Vidente del Born** (the Voodoo‑Lady role — cryptic, mystical, faintly scammy) has her shop
   here, and a proud **Casteller** is rehearsing a human tower that keeps collapsing.
4. **El Mercat** (daylight, bustling) — La Boqueria‑style stalls: a **Churrero** whose fryer fire has
   died, a **Chocolatera** selling chocolate a la taza, a fishmonger, flowers, hanging jamón.
5. **La Porta de Montjuïc** (late afternoon, dramatic) — the path up the hill ends at a guarded gate.
   A **Guàrdia** blocks the way. This is the episode's destination and cliffhanger.

---

## 6. Puzzle design — Episode 1 dependency chain

Classic MI absurd‑logic chain. Each step gates the next. The **insult duel** is the centrepiece.

**GOAL:** get past the **Guàrdia** at the Montjuïc gate.

1. **Guàrdia** won't pass anyone without a **salvoconducto sellado** (a stamped pass).
2. **Aduanero** (Port) is the only one who can stamp it. A **blank salvoconducto** form sits on his
   desk (takeable once he's distracted/appeased). But he's asleep and *hangry* — he refuses to stamp
   anything until he's had his breakfast: **xurros amb xocolata desfeta**.
3. **Xurros** come from the **Churrero** (Mercat) — but his **fogó (fryer) is apagado**. He needs a
   live **brasa (ember)** to relight it.
4. **Brasa** lives in the **Taverna**'s brazier. The **Tabernero** won't hand one over to a stranger.
   He'll respect you — and give you the ember — only after you **win the Duel de Glosas** against the
   house **glosador**.
5. **Duel de Glosas (insult duel):** to win, Guybrush must first **learn enough pullas + respostes**
   (insults + comebacks) by talking to townsfolk — **La Vidente**, the **Casteller**, and the
   **Pescador** at the port each teach him verses. Then he challenges the glosador and wins by firing
   the **correct comeback** to each insult (see §8 mechanic).
6. **Xocolata a la taza** comes from the **Chocolatera** (Mercat), who wants **3 rals**. Guybrush
   earns them by helping the **Casteller**: he volunteers as the **enxaneta** (the kid who tops the
   human tower) — comedic, since he's a grown pirate — and the grateful colla pays him. *(If scope is
   tight, you may simplify this sub‑puzzle: e.g. the chocolate is free once the duel is won, or a coin
   is fished out of the well with an item. Keep the main spine — duel → ember → churros → breakfast →
   stamp → gate — intact.)*
7. Combine **xurros + xocolata** → **esmorzar** → **Dar** to the **Aduanero**. He devours it, mellows,
   and **stamps the salvoconducto**.
8. **Dar** the **salvoconducto sellado** to the **Guàrdia** → the gate creaks open → Guybrush steps
   through → ghostly laugh → **"Continuarà…"** → credits.

Provide a **puzzle dependency chart** as an ASCII diagram in the README so the solution is auditable,
and make sure the game is **always solvable** (no dead ends; items respawn or persist correctly).
Add generous, in‑character **hint dialogue** (the Vidente can nudge the player toward the next step).

---

## 7. Characters & voice

Write all lines in Castilian with Catalan flavour. Keep them short, punchy, and funny. Each gets a
fixed speech colour.

| Character | Role (MI analogue) | Voice in one line |
|---|---|---|
| **Guybrush Threepwood** | Hero | Earnest, naïve, over‑confident. Catchphrase: *"¡Soy Guybrush Threepwood, un pirata temible!"* Running gag: can hold his breath exactly 10 minutes. |
| **Aduanero** | Bureaucratic gatekeeper | Grumpy, hangry, rule‑bound. *"Sense esmorzar no segello res. Na‑da."* |
| **Stan** | Used‑boat salesman | Rapid‑fire huckster, never stops talking, gestures wildly. *"¡Mira, mira, mira esta góndola seminueva!"* |
| **Tabernero** | Bartender | Gruff, deadpan, protective of his brasa. |
| **El Glosador** | Insult‑duel champion (Carla/Sword‑Master role) | Cocky local poet‑bully; respects only a sharper tongue. |
| **La Vidente del Born** | Voodoo Lady | Mystical, cryptic, faintly running a scam. Gives the real hints. |
| **El Casteller** | Comic side‑quest | Proud, obsessed with his tower, desperate for an enxaneta. |
| **El Pescador** | Old salt | Barceloneta fisherman; teaches a saltier insult or two. |
| **La Chocolatera** | Vendor | Brisk, wants her 3 rals, no rals no chocolate. |
| **La Guàrdia** | Final gate | Bored, by‑the‑book, secretly wants the day to end. |

Put a few seed lines per character in `content/strings.ts`; expand to full trees during the dialogue
milestone. Keep the humour warm and silly, never mean.

---

## 8. The insult duel — *Duel de Glosas* (signature mini‑game)

MI's insult sword‑fighting, reimagined as a Catalan **glosat** (improvised sung insult‑verses — a
real tradition, which makes the joke land).

**Mechanic (faithful to MI):**
- A pool of **insult → correct‑comeback** pairs. Each insult is defeated by **exactly one** comeback;
  the comeback cleverly turns the insult's own words back on the attacker.
- Guybrush **learns** insults/comebacks by hearing the opponent use them and by talking to townsfolk
  (Vidente, Casteller, Pescador). Learned lines populate his menu.
- During the duel, the opponent throws an insult; the player picks a comeback from the menu. Right
  comeback → Guybrush gains ground (and the crowd "olé!"s); wrong → he loses ground. Win N exchanges
  to win the duel. The opponent's insults you haven't learned yet are the ones to *listen and learn*.
- Add a music intensity bump and crowd SFX during the duel (see §9).

**Seed pairs (write more in this spirit — keep the comeback echoing the insult):**

| Insult | Correct comeback |
|---|---|
| "Luchas como un casteller sin equilibrio." | "Y tú caerás igual de rápido cuando te empuje." |
| "Tu espada está más oxidada que las vías del tranvía." | "Pero aún corta mejor que tus chistes." |
| "Hueles peor que el puerto en marea baja." | "Normal: acabo de pasar por tu camarote." |
| "He visto sirenas con mejor puntería que tú." | "¿Sirenas? Con razón te dejaron por un atún." |
| "Tens la cara més dura que el pa de tres dies." | "I tu l'alè més fort que un allioli amb ressaca." |
| "Mi loro insulta mejor que tú." | "Será porque aprendió de tu suegra." |

Store these in `content/insults.ts` with a `learnedByPlayer` flag and a `theme` tag so the duel can
draw a balanced set. Aim for ~10–12 pairs total so the duel isn't trivially memorised.

---

## 9. Music & audio — iMUSE‑lite

The user specifically wants the MI "beat"/groove style: adaptive, **not repetitive**, and long enough
that it never gets boring. Reproduce the *spirit* of iMUSE with the Web Audio API — original
compositions, no copied melodies.

**Style:** the MI lazy‑island groove, relocated to the Mediterranean — **nylon Spanish guitar +
marimba/steel‑drum + soft upright bass + light hand‑percussion** with a touch of **rumba catalana**
(palmas/claves). Mid‑tempo, warm, jaunty, a little mischievous.

**Engine (`audio/engine.ts`):**
- Web Audio **lookahead scheduler** (the standard "two clocks" pattern: a `setTimeout` loop that
  schedules notes slightly ahead on the precise `audioContext.currentTime`). Sample‑accurate timing.
- **Synth voices (`instruments.ts`):**
  - **Nylon guitar** via **Karplus‑Strong** plucked‑string synthesis (gives an authentic guitar
    pluck — worth the small effort).
  - **Marimba/steel‑drum**: sine/triangle + fast exponential decay + a little inharmonic shimmer.
  - **Bass**: filtered triangle/sine.
  - **Percussion**: filtered noise bursts for claves/palmas/shaker.
- **Master bus** with gentle reverb (a small convolver with a code‑generated impulse, or a simple
  feedback‑delay) and a limiter.

**Non‑repetitive structure (this is the key requirement):**
- Compose each room theme as **multiple sections** (A, B, C, bridge) stored as note data in
  `music.ts`, **plus** optional **variation layers** (counter‑melody, extra percussion, ornaments).
- The player **recombines sections non‑linearly** (e.g. A A B A C B …) and **varies each pass**:
  rotate which variation layers are active, add occasional fills/ornaments, nudge instrumentation.
  Target a perceived loop of **several minutes** before any exact repeat. Vary deterministically
  from a seed advanced per bar (do **not** rely on `Math.random` at module scope; seed a small PRNG)
  so it's reproducible but feels alive.
- **iMUSE‑lite adaptivity:**
  - Each room has its own theme; **crossfade at the next bar boundary** when changing rooms (no
    abrupt cuts) — that smooth musical transition is the iMUSE signature.
  - **Intensity layers:** during the **insult duel**, add percussion + a tension counter‑line; on
    winning, resolve to a triumphant cadence. Quiet rooms (Gòtic dusk) drop to guitar + bass only.
- Keep a global **mute / volume** control and respect the browser autoplay policy (start audio on
  first user gesture — the title‑screen *Jugar* click).

**SFX (`sfx.ts`, all synthesised):** footsteps (per surface: wood dock vs stone vs cobbles),
item pick‑up, inventory open, door/gate creak, UI click/hover, coin, the duel "hit/miss" stingers
and crowd "olé!". Keep them short and characterful.

---

## 10. Build order (milestones — verify each in the browser before moving on)

Build incrementally and **run the dev server + screenshot after each milestone** to confirm the look
and behaviour. Don't build the whole thing blind.

1. **Scaffold:** Vite + TS, 320×200 offscreen canvas, integer nearest‑neighbour upscale. Render a
   dithered VGA sky+sea gradient as a smoke test. *Verify the pixel look is crisp and warm.*
2. **Art kit:** `palette.ts`, `dither.ts`, `draw.ts` primitives. Paint **Room 1 (El Port)** fully as
   a static background. *Verify it reads like an MI2 painting.*
3. **SCUMM UI shell:** verb panel (9 verbs), sentence line, custom cursor, hotspot hover + default
   verb. Static room. *Verify hovering names hotspots and builds sentences.*
4. **Actor + walking:** Guybrush rig, idle/walk/talk, click‑to‑walk inside the Port's walk polygon,
   depth scaling. *Verify movement and animation.*
5. **Inventory + basic verbs:** icon inventory, Coger/Mirar/Usar on a couple of test items, item
   combine. *Verify pick‑up → inventory → use.*
6. **Rooms + transitions:** paint Rooms 2–5, wire exits, fade transitions, per‑room walk polygons.
   *Verify you can walk the whole city.*
7. **Dialogue system + NPCs:** trees, coloured speech, numbered choices; seed all NPC conversations.
   *Verify talking and branching.*
8. **Puzzle logic + game state:** flags, the full §6 chain, save/load, hint dialogue, no dead ends.
   *Verify the episode is solvable start→finish.*
9. **Insult duel:** the `glosat` mini‑game per §8. *Verify it's winnable by learning lines.*
10. **Audio:** music engine, per‑room themes, duel intensity, crossfades, SFX. *Verify it adapts and
    doesn't obviously loop within a few minutes.*
11. **Front & back matter:** title screen + logo + theme, *Continuarà* card, credits, polish pass
    (lighting, animation easing, text timing). *Verify the full first‑run experience.*

Commit after each milestone with a clear message.

---

## 11. Acceptance criteria (Episode 1 is "done" when…)

- [ ] `npm install && npm run dev` launches a playable game in the browser.
- [ ] Renders at **320×200 internal**, integer‑upscaled, **crisp pixels**, warm dithered VGA palette
      — reads as *Monkey Island 2*, not EGA‑era.
- [ ] **9‑verb** SCUMM panel + sentence line + default verbs + **icon inventory** all work.
- [ ] **5 rooms** with painted code‑drawn backgrounds, click‑to‑walk, depth scaling, fade transitions.
- [ ] **≥6 NPCs** with branching dialogue trees and coloured outlined speech.
- [ ] The **§6 puzzle chain** is completable start→finish with **no dead ends**; hints exist.
- [ ] The **insult duel** is winnable by learning lines around town.
- [ ] **Adaptive soundtrack:** per‑room themes, bar‑boundary crossfades, duel intensity layer, and
      audibly **non‑repetitive for several minutes**; synthesised SFX present.
- [ ] All player‑facing text is **Castilian + Catalan flavour**, centralised in `content/strings.ts`.
- [ ] **Title screen**, **save/load** (localStorage), and a **"Continuarà…"** ending.
- [ ] **AI‑art swap seam** implemented (`backgroundImage` overrides `drawBackground`) and documented
      in `README.md`, with the puzzle dependency chart.

---

## 12. Out of scope for now (later episodes)

- Montjuïc castle interior, LeChuck confrontation, Elaine, Murray the talking skull, more islands/
  districts, full voice acting, mobile/touch controls, higher‑res or AI‑painted backgrounds (the seam
  is built now; the art pass comes later).

---

## 13. Guardrails & notes

- **Original assets only.** No LucasArts art, sprites, fonts, MIDI, or audio. Everything drawn/
  synthesised in code, *in the style of*. Compose original melodies.
- **Fan‑project IP note.** Ship Episode 1 with the MI character names for personal use. Add
  `CHARACTERS_canonical_vs_public.md` mapping each MI name to an original rename, so the game can be
  made shareable later by flipping `content/strings.ts` to the public names. Don't publish/distribute
  with the MI names.
- **Honesty about the art ceiling.** Code‑drawn VGA art evokes MI2 but won't equal hand‑painted
  scenes — that's expected, and the swap seam (§4) is the upgrade path. Make the code‑art genuinely
  good within its means (composition, light, dithering) rather than apologetic placeholders.
- **Determinism:** seed any randomness (music variation, crowd reactions) with a small PRNG; avoid
  bare `Math.random()`/`Date.now()` in module init.
- **README.md** must include: how to run, controls, the puzzle dependency chart, the AI‑art swap
  seam, and where to add a new room/episode.

---

### TL;DR for the agent
Build a browser, TypeScript+Canvas, *Monkey Island 2*‑style point‑and‑click: **El Secreto de
Montjuïc, Episodio 1**. Pirate‑era Barcelona, 5 rooms, 9‑verb SCUMM UI, icon inventory, dialogue
trees, an absurd inventory puzzle chain capped by a **Catalan insult‑duel**, and an adaptive,
non‑repetitive Mediterranean‑groove soundtrack via Web Audio. All art/audio code‑drawn, all text in
Castilian with Catalan flavour, every background behind an AI‑art swap seam. Build it milestone by
milestone, verifying the look in the browser as you go. ¡Bon viatge, pirata!
