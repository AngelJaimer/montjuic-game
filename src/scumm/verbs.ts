// The MI2 nine-verb set, in Spanish.
export const VERB_GRID = [
  ['Abrir', 'Cerrar', 'Dar'],
  ['Coger', 'Mirar', 'Hablar con'],
  ['Usar', 'Empujar', 'Tirar de'],
];
export const VERBS = VERB_GRID.flat();

// Fallback lines when a verb has no specific response for an object — kept
// in-character (Guybrush is never just "you can't do that").
export const DEFAULT_RESPONSES: Record<string, string> = {
  Abrir: 'No puedo abrir eso.',
  Cerrar: 'No hay nada que cerrar ahí.',
  Dar: '¿Dárselo? ¿A quién, a las gaviotas?',
  Coger: 'Mejor lo dejo donde está.',
  Mirar: 'No veo nada del otro mundo.',
  'Hablar con': 'No me contesta. Qué maleducado.',
  Usar: 'No sabría ni por dónde empezar.',
  Empujar: 'Empujo... y no pasa absolutamente nada.',
  'Tirar de': 'No se mueve ni harto de horchata.',
};
