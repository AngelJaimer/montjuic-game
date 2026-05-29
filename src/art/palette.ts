// Curated warm-Mediterranean VGA-ish palette for the MI2 look.
// Every colour in the game is picked from here to keep the painted-VGA cohesion.
export type RGB = [number, number, number];

export const P = {
  // --- sky (warm late afternoon) ---
  skyTop:     [38, 60, 96]   as RGB,
  skyUpper:   [66, 92, 122]  as RGB,
  skyMid:     [126, 144, 158] as RGB,
  skyLow:     [200, 176, 150] as RGB,
  skyHorizon: [242, 202, 150] as RGB,
  sunGlow:    [255, 230, 172] as RGB,
  sunCore:    [255, 246, 216] as RGB,

  // --- sea ---
  seaFar:   [150, 170, 170] as RGB,
  seaMid:   [84, 126, 136]  as RGB,
  seaNear:  [46, 92, 104]   as RGB,
  seaDeep:  [28, 62, 76]    as RGB,
  seaGlint: [212, 228, 216] as RGB,

  // --- hill / Montjuïc ---
  hillHaze: [98, 122, 124] as RGB,
  hillMid:  [64, 92, 86]   as RGB,
  hillDark: [42, 64, 58]   as RGB,
  hillLit:  [112, 130, 102] as RGB,

  // --- castle stone ---
  stoneLit:    [214, 196, 152] as RGB,
  stone:       [178, 158, 122] as RGB,
  stoneShadow: [126, 108, 80]  as RGB,

  // --- buildings ---
  wallLit:    [226, 196, 150] as RGB,
  wall:       [198, 164, 118] as RGB,
  wallShadow: [150, 120, 82]  as RGB,
  roofLit:    [200, 114, 76]  as RGB,
  roof:       [170, 88, 56]   as RGB,
  roofShadow: [126, 60, 40]   as RGB,
  winDark:    [54, 44, 42]    as RGB,
  winLit:     [242, 196, 96]  as RGB,

  // --- wood / dock / boats ---
  woodLit:    [170, 118, 74] as RGB,
  wood:       [138, 90, 56]  as RGB,
  woodDark:   [96, 60, 36]   as RGB,
  woodShadow: [62, 38, 22]   as RGB,

  // --- cloth / rope ---
  sail:       [228, 214, 182] as RGB,
  sailShadow: [186, 168, 136] as RGB,
  rope:       [198, 170, 122] as RGB,
  flagRed:    [192, 64, 56]   as RGB,

  // --- misc ---
  cloud:       [244, 230, 208] as RGB,
  black:       [26, 20, 24]    as RGB,

  // --- panel / UI ---
  panelWood:     [80, 54, 38]   as RGB,
  panelWoodLit:  [114, 80, 56]  as RGB,
  panelWoodDark: [48, 30, 20]   as RGB,
  parchment:     [226, 208, 170] as RGB,
  inkLight:      [244, 226, 170] as RGB,
  verbIdle:      [208, 182, 132] as RGB,
  verbHot:       [250, 228, 152] as RGB,

  // --- Guybrush ---
  skin:       [234, 186, 146] as RGB,
  skinShadow: [198, 146, 106] as RGB,
  hair:       [208, 164, 90]  as RGB,
  hairShadow: [168, 124, 60]  as RGB,
  shirt:      [230, 224, 208] as RGB,
  shirtShadow:[184, 176, 158] as RGB,
  pants:      [74, 80, 98]    as RGB,
  pantsShadow:[52, 56, 72]    as RGB,
  boots:      [80, 52, 34]    as RGB,
  belt:       [122, 80, 48]   as RGB,
};

export function css(c: RGB): string {
  return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
